package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.entity.EditorialFeatureEntity;
import com.sportsecommerce.entity.MarketingBannerEntity;
import com.sportsecommerce.entity.MarketingBannerSlot;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.EditorialFeatureJpaRepository;
import com.sportsecommerce.repository.MarketingBannerJpaRepository;
import com.sportsecommerce.service.StorefrontAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StorefrontAdminServiceImpl implements StorefrontAdminService {

    private final MarketingBannerJpaRepository bannerRepository;
    private final EditorialFeatureJpaRepository editorialRepository;

    public StorefrontAdminServiceImpl(
            MarketingBannerJpaRepository bannerRepository,
            EditorialFeatureJpaRepository editorialRepository) {
        this.bannerRepository = bannerRepository;
        this.editorialRepository = editorialRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorefrontDtos.BannerAdminResponse> listAllBanners() {
        return bannerRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(this::toBannerAdminResponse)
                .toList();
    }

    @Override
    @Transactional
    public StorefrontDtos.BannerAdminResponse createBanner(StorefrontDtos.UpsertMarketingBannerRequest request) {
        MarketingBannerEntity e = new MarketingBannerEntity();
        applyBanner(e, request);
        return toBannerAdminResponse(bannerRepository.save(e));
    }

    @Override
    @Transactional
    public StorefrontDtos.BannerAdminResponse updateBanner(Long id, StorefrontDtos.UpsertMarketingBannerRequest request) {
        MarketingBannerEntity e = bannerRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Banner not found"));
        applyBanner(e, request);
        return toBannerAdminResponse(bannerRepository.save(e));
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        if (!bannerRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Banner not found");
        }
        bannerRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorefrontDtos.EditorialAdminResponse> listAllEditorial() {
        return editorialRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(this::toEditorialAdminResponse)
                .toList();
    }

    @Override
    @Transactional
    public StorefrontDtos.EditorialAdminResponse createEditorial(StorefrontDtos.UpsertEditorialFeatureRequest request) {
        EditorialFeatureEntity e = new EditorialFeatureEntity();
        applyEditorial(e, request);
        return toEditorialAdminResponse(editorialRepository.save(e));
    }

    @Override
    @Transactional
    public StorefrontDtos.EditorialAdminResponse updateEditorial(Long id, StorefrontDtos.UpsertEditorialFeatureRequest request) {
        EditorialFeatureEntity e = editorialRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Editorial not found"));
        applyEditorial(e, request);
        return toEditorialAdminResponse(editorialRepository.save(e));
    }

    @Override
    @Transactional
    public void deleteEditorial(Long id) {
        if (!editorialRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Editorial not found");
        }
        editorialRepository.deleteById(id);
    }

    private void applyBanner(MarketingBannerEntity e, StorefrontDtos.UpsertMarketingBannerRequest r) {
        try {
            e.setSlot(MarketingBannerSlot.valueOf(r.slot().trim().toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid banner slot");
        }
        e.setTitle(r.title().trim());
        e.setSubtitle(blankToNull(r.subtitle()));
        e.setCtaLabel(blankToNull(r.ctaLabel()));
        e.setCtaHref(blankToNull(r.ctaHref()));
        e.setBadge(blankToNull(r.badge()));
        e.setSortOrder(r.sortOrder());
        e.setActive(r.active());
        e.setStartsAt(r.startsAt());
        e.setEndsAt(r.endsAt());
    }

    private void applyEditorial(EditorialFeatureEntity e, StorefrontDtos.UpsertEditorialFeatureRequest r) {
        e.setTitle(r.title().trim());
        e.setExcerpt(blankToNull(r.excerpt()));
        e.setImageUrl(blankToNull(r.imageUrl()));
        e.setHref(r.href().trim());
        e.setSortOrder(r.sortOrder());
        e.setActive(r.active());
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private StorefrontDtos.BannerAdminResponse toBannerAdminResponse(MarketingBannerEntity b) {
        return new StorefrontDtos.BannerAdminResponse(
                b.getId(),
                b.getSlot().name(),
                b.getTitle(),
                b.getSubtitle(),
                b.getCtaLabel(),
                b.getCtaHref(),
                b.getBadge(),
                b.getSortOrder(),
                b.isActive(),
                b.getStartsAt(),
                b.getEndsAt()
        );
    }

    private StorefrontDtos.EditorialAdminResponse toEditorialAdminResponse(EditorialFeatureEntity e) {
        return new StorefrontDtos.EditorialAdminResponse(
                e.getId(),
                e.getTitle(),
                e.getExcerpt(),
                e.getImageUrl(),
                e.getHref(),
                e.getSortOrder(),
                e.isActive()
        );
    }
}
