package com.sportsecommerce.controller;

import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.service.StorefrontService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/storefront")
public class StorefrontController {

    private final StorefrontService storefrontService;

    public StorefrontController(StorefrontService storefrontService) {
        this.storefrontService = storefrontService;
    }

    @GetMapping("/home")
    public ResponseEntity<StorefrontDtos.HomeResponse> home() {
        return ResponseEntity.ok(storefrontService.getHome());
    }
}
