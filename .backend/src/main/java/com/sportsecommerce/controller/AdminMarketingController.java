package com.sportsecommerce.controller;

import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.service.StorefrontAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/marketing")
public class AdminMarketingController {

    private final StorefrontAdminService storefrontAdminService;

    public AdminMarketingController(StorefrontAdminService storefrontAdminService) {
        this.storefrontAdminService = storefrontAdminService;
    }

    @GetMapping("/banners")
    public ResponseEntity<List<StorefrontDtos.BannerAdminResponse>> listBanners() {
        return ResponseEntity.ok(storefrontAdminService.listAllBanners());
    }

    @PostMapping("/banners")
    public ResponseEntity<StorefrontDtos.BannerAdminResponse> createBanner(
            @Valid @RequestBody StorefrontDtos.UpsertMarketingBannerRequest request
    ) {
        return ResponseEntity.ok(storefrontAdminService.createBanner(request));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<StorefrontDtos.BannerAdminResponse> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody StorefrontDtos.UpsertMarketingBannerRequest request
    ) {
        return ResponseEntity.ok(storefrontAdminService.updateBanner(id, request));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        storefrontAdminService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/editorial")
    public ResponseEntity<List<StorefrontDtos.EditorialAdminResponse>> listEditorial() {
        return ResponseEntity.ok(storefrontAdminService.listAllEditorial());
    }

    @PostMapping("/editorial")
    public ResponseEntity<StorefrontDtos.EditorialAdminResponse> createEditorial(
            @Valid @RequestBody StorefrontDtos.UpsertEditorialFeatureRequest request
    ) {
        return ResponseEntity.ok(storefrontAdminService.createEditorial(request));
    }

    @PutMapping("/editorial/{id}")
    public ResponseEntity<StorefrontDtos.EditorialAdminResponse> updateEditorial(
            @PathVariable Long id,
            @Valid @RequestBody StorefrontDtos.UpsertEditorialFeatureRequest request
    ) {
        return ResponseEntity.ok(storefrontAdminService.updateEditorial(id, request));
    }

    @DeleteMapping("/editorial/{id}")
    public ResponseEntity<Void> deleteEditorial(@PathVariable Long id) {
        storefrontAdminService.deleteEditorial(id);
        return ResponseEntity.noContent().build();
    }
}
