package com.sportsecommerce.service.impl;

import com.sportsecommerce.entity.SystemSettingsEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.service.PasswordPolicyService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PasswordPolicyServiceImpl implements PasswordPolicyService {

    private final CachedSystemSettingsProvider settingsProvider;

    public PasswordPolicyServiceImpl(CachedSystemSettingsProvider settingsProvider) {
        this.settingsProvider = settingsProvider;
    }

    @Override
    public void assertAcceptablePassword(String password) {
        if (password == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        SystemSettingsEntity s = settingsProvider.requireSettings();
        int min = s.getPasswordMinLength();
        if (password.length() < min) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least " + min + " characters");
        }
        if (s.isPasswordRequireUppercase() && password.chars().noneMatch(Character::isUpperCase)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must include an uppercase letter");
        }
        if (s.isPasswordRequireNumber() && password.chars().noneMatch(Character::isDigit)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must include a number");
        }
        if (s.isPasswordRequireSpecial() && password.chars().noneMatch(ch -> !Character.isLetterOrDigit(ch))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must include a special character");
        }
    }
}
