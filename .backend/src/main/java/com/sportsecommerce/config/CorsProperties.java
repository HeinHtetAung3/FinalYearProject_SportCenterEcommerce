package com.sportsecommerce.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

/**
 * Browser CORS settings. Use comma-separated {@link #allowedOriginPatterns} so a single
 * env var ({@code CORS_ALLOWED_ORIGIN_PATTERNS}) can list every SPA origin in production.
 */
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    /**
     * Comma-separated Spring CORS origin patterns, e.g.
     * {@code https://shop.example.com,https://www.shop.example.com} or
     * {@code http://localhost:*} for local Vite.
     */
    private String allowedOriginPatterns = "";

    public String getAllowedOriginPatterns() {
        return allowedOriginPatterns;
    }

    public void setAllowedOriginPatterns(String allowedOriginPatterns) {
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    public List<String> asPatternList() {
        if (allowedOriginPatterns == null || allowedOriginPatterns.isBlank()) {
            return List.of("http://localhost:*", "http://127.0.0.1:*");
        }
        return Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
