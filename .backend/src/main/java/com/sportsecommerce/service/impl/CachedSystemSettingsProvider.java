package com.sportsecommerce.service.impl;

import com.sportsecommerce.entity.SystemSettingsEntity;
import com.sportsecommerce.repository.SystemSettingsJpaRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-through cache for the singleton {@code system_settings} row (id=1).
 * Invalidated whenever {@link AdminSettingsServiceImpl} persists changes.
 */
@Service
public class CachedSystemSettingsProvider {

    private final SystemSettingsJpaRepository repository;

    public CachedSystemSettingsProvider(SystemSettingsJpaRepository repository) {
        this.repository = repository;
    }

    @Cacheable(cacheNames = "systemSettings", key = "'singleton'")
    @Transactional(readOnly = true)
    public SystemSettingsEntity requireSettings() {
        return repository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("system_settings row missing; ensure Flyway migrations ran"));
    }
}
