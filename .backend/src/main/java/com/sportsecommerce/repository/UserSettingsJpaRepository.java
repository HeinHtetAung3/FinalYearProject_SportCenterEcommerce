package com.sportsecommerce.repository;

import com.sportsecommerce.entity.UserSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSettingsJpaRepository extends JpaRepository<UserSettingsEntity, Long> {
}
