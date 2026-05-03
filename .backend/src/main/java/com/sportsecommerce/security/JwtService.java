package com.sportsecommerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String subject) {
        return generateAccessToken(subject, "USER");
    }

    public String generateAccessToken(String subject, String role) {
        return generateToken(subject, properties.accessTokenExpirySeconds(), "access", role);
    }

    public String generateRefreshToken(String subject) {
        return generateToken(subject, properties.refreshTokenExpirySeconds(), "refresh", null);
    }

    public boolean isRefreshTokenValid(String token, String subject) {
        Claims claims = parse(token);
        return subject.equals(claims.getSubject()) && "refresh".equals(claims.get("type", String.class))
                && claims.getExpiration().after(new Date());
    }

    public boolean isAccessTokenValid(String token, String subject) {
        Claims claims = parse(token);
        return subject.equals(claims.getSubject())
                && "access".equals(claims.get("type", String.class))
                && claims.getExpiration().after(new Date());
    }

    public String extractSubject(String token) {
        return parse(token).getSubject();
    }

    public String extractRole(String token) {
        return parse(token).get("role", String.class);
    }

    public long getAccessTokenExpirySeconds() {
        return properties.accessTokenExpirySeconds();
    }

    public long getRefreshTokenExpirySeconds() {
        return properties.refreshTokenExpirySeconds();
    }

    private String generateToken(String subject, long expiresIn, String type, String role) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .issuer(properties.issuer())
                .subject(subject)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expiresIn)))
                .claim("type", type);
        if (role != null && !role.isBlank()) {
            builder.claim("role", role);
        }
        return builder.signWith(key).compact();
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
