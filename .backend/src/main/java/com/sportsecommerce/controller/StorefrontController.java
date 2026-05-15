package com.sportsecommerce.controller;

import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.service.StorefrontCommerceService;
import com.sportsecommerce.service.StorefrontService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/storefront")
public class StorefrontController {

    private final StorefrontService storefrontService;
    private final StorefrontCommerceService storefrontCommerceService;

    public StorefrontController(
            StorefrontService storefrontService,
            StorefrontCommerceService storefrontCommerceService
    ) {
        this.storefrontService = storefrontService;
        this.storefrontCommerceService = storefrontCommerceService;
    }

    @GetMapping("/home")
    public ResponseEntity<StorefrontDtos.HomeResponse> home() {
        return ResponseEntity.ok(storefrontService.getHome());
    }

    @GetMapping("/commerce-config")
    public ResponseEntity<StorefrontDtos.CommerceCheckoutConfigResponse> commerceCheckoutConfig() {
        return ResponseEntity.ok(storefrontCommerceService.getCheckoutConfig());
    }
}
