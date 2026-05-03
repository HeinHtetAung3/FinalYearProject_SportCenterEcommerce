package com.sportsecommerce.service;

import com.sportsecommerce.dto.StorefrontDtos;

import java.util.List;

public interface StorefrontAdminService {

    List<StorefrontDtos.BannerAdminResponse> listAllBanners();

    StorefrontDtos.BannerAdminResponse createBanner(StorefrontDtos.UpsertMarketingBannerRequest request);

    StorefrontDtos.BannerAdminResponse updateBanner(Long id, StorefrontDtos.UpsertMarketingBannerRequest request);

    void deleteBanner(Long id);

    List<StorefrontDtos.EditorialAdminResponse> listAllEditorial();

    StorefrontDtos.EditorialAdminResponse createEditorial(StorefrontDtos.UpsertEditorialFeatureRequest request);

    StorefrontDtos.EditorialAdminResponse updateEditorial(Long id, StorefrontDtos.UpsertEditorialFeatureRequest request);

    void deleteEditorial(Long id);
}
