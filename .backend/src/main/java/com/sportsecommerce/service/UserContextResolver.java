package com.sportsecommerce.service;

import com.sportsecommerce.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Resolves the authenticated user (by email) for request-scoped service
 * calls. The {@code requireAuthenticatedEmail()} variant is the
 * canonical entry point for endpoints that must be tied to a real
 * logged-in user (cart, orders); it throws {@code 401 Unauthorized}
 * when no Spring Security authentication is present, so users can
 * never accidentally share a cart or see one another's orders.
 */
@Component
public class UserContextResolver {

    private static final String DEFAULT_EMAIL = "demo@sportshub.local";

    public String resolveEmail(String headerValue) {
        if (headerValue == null || headerValue.isBlank()) {
            return DEFAULT_EMAIL;
        }
        return headerValue.trim().toLowerCase();
    }

    public String resolveAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return DEFAULT_EMAIL;
        }
        return authentication.getName().trim().toLowerCase();
    }

    /**
     * Same as {@link #resolveAuthenticatedEmail()} but throws
     * {@code 401 Unauthorized} when no authentication is present —
     * required for cart and order endpoints so we never fall back to
     * the shared demo account and accidentally leak data between users.
     */
    public String requireAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return authentication.getName().trim().toLowerCase();
    }
}
