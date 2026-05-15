package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.entity.EditorialFeatureEntity;
import com.sportsecommerce.entity.MarketingBannerEntity;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.repository.EditorialFeatureJpaRepository;
import com.sportsecommerce.repository.MarketingBannerJpaRepository;
import com.sportsecommerce.service.ReviewService;
import com.sportsecommerce.service.StorefrontService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.OptionalDouble;

@Service
public class StorefrontServiceImpl implements StorefrontService {

    private static final int FEATURED_REVIEW_LIMIT = 6;
    private static final int MAX_COMMENT_PREVIEW = 220;

    private final MarketingBannerJpaRepository bannerRepository;
    private final EditorialFeatureJpaRepository editorialRepository;
    private final CatalogRepository catalogRepository;
    private final ReviewService reviewService;

    public StorefrontServiceImpl(
            MarketingBannerJpaRepository bannerRepository,
            EditorialFeatureJpaRepository editorialRepository,
            CatalogRepository catalogRepository,
            ReviewService reviewService) {
        this.bannerRepository = bannerRepository;
        this.editorialRepository = editorialRepository;
        this.catalogRepository = catalogRepository;
        this.reviewService = reviewService;
    }

    @Override
    @Transactional(readOnly = true)
    public StorefrontDtos.HomeResponse getHome() {
        Instant now = Instant.now();
        List<StorefrontDtos.BannerResponse> banners = bannerRepository.findByActiveIsTrueOrderBySortOrderAsc().stream()
                .filter(b -> isVisibleNow(b, now))
                .map(this::toBannerResponse)
                .toList();

        List<StorefrontDtos.EditorialResponse> editorial = editorialRepository.findByActiveIsTrueOrderBySortOrderAsc()
                .stream()
                .map(this::toEditorialResponse)
                .toList();

        List<StorefrontDtos.BrandResponse> brands = catalogRepository.findDistinctBrandNames().stream()
                .map(name -> new StorefrontDtos.BrandResponse(
                        name,
                        "/products?brand=" + URLEncoder.encode(name, StandardCharsets.UTF_8)
                ))
                .toList();

        List<StorefrontDtos.FeaturedReviewResponse> featured = reviewService.listFeatured(FEATURED_REVIEW_LIMIT).stream()
                .map(this::toFeaturedReview)
                .toList();

        long productCount = catalogRepository.countStorefrontProducts();
        long reviewCount = reviewService.countAll();
        OptionalDouble avg = reviewService.averageRatingAll();
        Double averageRating = avg.isEmpty()
                ? null
                : BigDecimal.valueOf(avg.getAsDouble()).setScale(1, RoundingMode.HALF_UP).doubleValue();
        StorefrontDtos.HomeHeroStats heroStats = new StorefrontDtos.HomeHeroStats(
                productCount,
                brands.size(),
                reviewCount,
                averageRating
        );

        return new StorefrontDtos.HomeResponse(banners, editorial, brands, featured, heroStats);
    }

    private static boolean isVisibleNow(MarketingBannerEntity b, Instant now) {
        if (b.getStartsAt() != null && b.getStartsAt().isAfter(now)) {
            return false;
        }
        if (b.getEndsAt() != null && b.getEndsAt().isBefore(now)) {
            return false;
        }
        return true;
    }

    private StorefrontDtos.BannerResponse toBannerResponse(MarketingBannerEntity b) {
        return new StorefrontDtos.BannerResponse(
                b.getId(),
                b.getSlot().name(),
                b.getTitle(),
                b.getSubtitle(),
                b.getCtaLabel(),
                b.getCtaHref(),
                b.getBadge()
        );
    }

    private StorefrontDtos.EditorialResponse toEditorialResponse(EditorialFeatureEntity e) {
        return new StorefrontDtos.EditorialResponse(
                e.getId(),
                e.getTitle(),
                e.getExcerpt(),
                e.getImageUrl(),
                e.getHref()
        );
    }

    private StorefrontDtos.FeaturedReviewResponse toFeaturedReview(CommerceDtos.ReviewResponse r) {
        String comment = r.comment() == null ? "" : r.comment();
        if (comment.length() > MAX_COMMENT_PREVIEW) {
            comment = comment.substring(0, MAX_COMMENT_PREVIEW - 1) + "…";
        }
        return new StorefrontDtos.FeaturedReviewResponse(
                r.id(),
                r.productId(),
                r.productName(),
                r.reviewerEmail(),
                r.rating(),
                comment,
                r.createdAt()
        );
    }
}
