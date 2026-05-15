package com.sportsecommerce.service;

/**
 * Validates passwords against store-wide policy from {@code system_settings}.
 */
public interface PasswordPolicyService {

    void assertAcceptablePassword(String password);
}
