package com.sportsecommerce.repository;

import com.sportsecommerce.entity.SystemSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemSettingsJpaRepository extends JpaRepository<SystemSettingsEntity, Long> {
}
