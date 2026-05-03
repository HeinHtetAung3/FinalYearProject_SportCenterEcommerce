package com.sportsecommerce.repository;

import com.sportsecommerce.entity.EditorialFeatureEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EditorialFeatureJpaRepository extends JpaRepository<EditorialFeatureEntity, Long> {

    List<EditorialFeatureEntity> findByActiveIsTrueOrderBySortOrderAsc();
}
