package com.sportsecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class StorefrontDtos {

    private StorefrontDtos() {
    }

    public record BannerResponse(
            Long id,
            String slot,
            String title,
            String subtitle,
            String ctaLabel,
            String ctaHref,
            String badge
    ) {
    }

    public record EditorialResponse(
            Long id,
            String title,
            String excerpt,
            String imageUrl,
            String href
    ) {
    }

    public record BrandResponse(
            String name,
            String href
    ) {
    }

    public record FeaturedReviewResponse(
            Long id,
            Long productId,
            String productName,
            String reviewerLabel,
            Integer rating,
            String comment,
            Instant createdAt
    ) {
    }

    /**
     * Live catalog and review figures for the home hero (no marketing fluff).
     */
    public record HomeHeroStats(
            long productCount,
            int brandCount,
            long reviewCount,
            Double averageRating
    ) {
    }

    public record HomeResponse(
            List<BannerResponse> banners,
            List<EditorialResponse> editorialFeatures,
            List<BrandResponse> brands,
            List<FeaturedReviewResponse> featuredReviews,
            HomeHeroStats heroStats
    ) {
    }

    public record NewsletterSubscribeRequest(
            @NotBlank @Email @Size(max = 120) String email
    ) {
    }

    public record NewsletterSubscribeResponse(boolean success, String message) {
    }

    /**
     * Admin list/detail shape — includes scheduling and ordering fields omitted from public {@link BannerResponse}.
     */
    public record BannerAdminResponse(
            Long id,
            String slot,
            String title,
            String subtitle,
            String ctaLabel,
            String ctaHref,
            String badge,
            int sortOrder,
            boolean active,
            Instant startsAt,
            Instant endsAt
    ) {
    }

    public record EditorialAdminResponse(
            Long id,
            String title,
            String excerpt,
            String imageUrl,
            String href,
            int sortOrder,
            boolean active
    ) {
    }

    public record UpsertMarketingBannerRequest(
            @NotBlank @Size(max = 32) String slot,
            @NotBlank @Size(max = 200) String title,
            @Size(max = 500) String subtitle,
            @Size(max = 80) String ctaLabel,
            @Size(max = 500) String ctaHref,
            @Size(max = 80) String badge,
            int sortOrder,
            boolean active,
            Instant startsAt,
            Instant endsAt
    ) {
    }

    public record UpsertEditorialFeatureRequest(
            @NotBlank @Size(max = 200) String title,
            @Size(max = 600) String excerpt,
            @Size(max = 500) String imageUrl,
            @NotBlank @Size(max = 500) String href,
            int sortOrder,
            boolean active
    ) {
    }
}
