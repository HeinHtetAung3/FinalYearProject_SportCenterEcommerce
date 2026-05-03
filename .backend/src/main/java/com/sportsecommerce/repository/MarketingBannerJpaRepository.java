package com.sportsecommerce.repository;

import com.sportsecommerce.entity.MarketingBannerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketingBannerJpaRepository extends JpaRepository<MarketingBannerEntity, Long> {

    List<MarketingBannerEntity> findByActiveIsTrueOrderBySortOrderAsc();
}
