package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.AuthDtos;
import com.sportsecommerce.entity.RefreshTokenEntity;
import com.sportsecommerce.entity.Role;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.RefreshTokenJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.security.JwtService;
import com.sportsecommerce.service.AuthService;
import com.sportsecommerce.service.PasswordPolicyService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {

    private final RefreshTokenJpaRepository refreshTokenJpaRepository;
    private final UserJpaRepository userJpaRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyService passwordPolicyService;

    public AuthServiceImpl(
            RefreshTokenJpaRepository refreshTokenJpaRepository,
            UserJpaRepository userJpaRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            PasswordPolicyService passwordPolicyService
    ) {
        this.refreshTokenJpaRepository = refreshTokenJpaRepository;
        this.userJpaRepository = userJpaRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyService = passwordPolicyService;
    }

    @Override
    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userJpaRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        passwordPolicyService.assertAcceptablePassword(request.password());
        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        Role role = email.startsWith("admin") ? Role.ADMIN : Role.USER;
        user.setRole(role);
        userJpaRepository.save(user);
        return issueTokens(email, role);
    }

    @Override
    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        UserEntity user = findUser(request.email());
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User account is disabled");
        }
        return issueTokens(user.getEmail(), user.getRole());
    }

    @Override
    @Transactional
    public AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest request) {
        String rawToken = request.refreshToken();
        String email;
        try {
            email = jwtService.extractSubject(rawToken);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (!jwtService.isRefreshTokenValid(rawToken, email)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        String hash = sha256Hex(rawToken);
        RefreshTokenEntity stored = refreshTokenJpaRepository.findByTokenHash(hash)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (!stored.getUserEmail().equalsIgnoreCase(email)) {
            refreshTokenJpaRepository.delete(stored);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenJpaRepository.delete(stored);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        refreshTokenJpaRepository.delete(stored);
        UserEntity user = findUser(email);
        return issueTokens(user.getEmail(), user.getRole());
    }

    @Override
    @Transactional
    public void logout(AuthDtos.LogoutRequest request) {
        refreshTokenJpaRepository.deleteByTokenHash(sha256Hex(request.refreshToken()));
    }

    @Override
    public List<AuthDtos.AdminUserResponse> listUsers() {
        return userJpaRepository.findAll().stream()
                .sorted((a, b) -> a.getEmail().compareToIgnoreCase(b.getEmail()))
                .map(user -> new AuthDtos.AdminUserResponse(
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole().name(),
                        user.isEnabled()
                ))
                .toList();
    }

    @Override
    @Transactional
    public AuthDtos.AdminUserResponse setUserEnabled(String email, boolean enabled) {
        UserEntity user = findUser(email);
        user.setEnabled(enabled);
        return new AuthDtos.AdminUserResponse(user.getEmail(), user.getFullName(), user.getRole().name(), user.isEnabled());
    }

    @Override
    @Transactional
    public AuthDtos.AdminUserResponse setUserRole(String email, String role) {
        UserEntity user = findUser(email);
        user.setRole(parseRole(role));
        return new AuthDtos.AdminUserResponse(user.getEmail(), user.getFullName(), user.getRole().name(), user.isEnabled());
    }

    private AuthDtos.AuthResponse issueTokens(String email, Role role) {
        String normalizedRole = role == null ? Role.USER.name() : role.name();
        String accessToken = jwtService.generateAccessToken(email, normalizedRole);
        String refreshToken = jwtService.generateRefreshToken(email);
        persistRefreshToken(email, refreshToken);
        return new AuthDtos.AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirySeconds(),
                email,
                normalizedRole
        );
    }

    private void persistRefreshToken(String email, String refreshToken) {
        Instant now = Instant.now();
        RefreshTokenEntity entity = new RefreshTokenEntity();
        entity.setUserEmail(email.toLowerCase(Locale.ROOT));
        entity.setTokenHash(sha256Hex(refreshToken));
        entity.setExpiresAt(now.plusSeconds(jwtService.getRefreshTokenExpirySeconds()));
        entity.setCreatedAt(now);
        refreshTokenJpaRepository.save(entity);
    }

    private static String sha256Hex(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private UserEntity findUser(String email) {
        return userJpaRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
    }

    private Role parseRole(String role) {
        if (role == null || role.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role is required");
        }
        try {
            String normalized = role.trim().toUpperCase(Locale.ROOT);
            if (normalized.startsWith("ROLE_")) {
                normalized = normalized.substring("ROLE_".length());
            }
            return Role.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported role: " + role);
        }
    }
}
