package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.service.AccountService;
import com.sportsecommerce.service.ProfileImageStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AccountServiceImpl implements AccountService {

    private final UserJpaRepository userJpaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageStorageService profileImageStorageService;

    public AccountServiceImpl(
            UserJpaRepository userJpaRepository,
            PasswordEncoder passwordEncoder,
            ProfileImageStorageService profileImageStorageService
    ) {
        this.userJpaRepository = userJpaRepository;
        this.passwordEncoder = passwordEncoder;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    @Transactional
    public void deactivateAccount(String email) {
        UserEntity user = findUser(email);
        user.setEnabled(false);
        userJpaRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteAccount(String email, CommerceDtos.DeleteAccountRequest request) {
        UserEntity user = findUser(email);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is incorrect");
        }

        String oldImageUrl = user.getProfileImageUrl();
        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            profileImageStorageService.deleteByPublicUrl(oldImageUrl);
        }

        user.setEnabled(false);
        user.setDeletedAt(Instant.now());
        user.setFullName("Deleted User");
        user.setPhoneNumber(null);
        user.setAddress(null);
        user.setProfileImageUrl(null);
        user.setMarketingEmailOptIn(false);
        userJpaRepository.save(user);
    }

    private UserEntity findUser(String email) {
        return userJpaRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
