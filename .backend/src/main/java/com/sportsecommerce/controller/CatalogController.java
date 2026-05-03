package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Validated
@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CatalogDtos.CategoryResponse>> getCategories() {
        return ResponseEntity.ok(catalogService.getCategories());
    }

    @GetMapping("/products")
    public ResponseEntity<CatalogDtos.ProductListResponse> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String eu,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String isNewArrival,
            @RequestParam(required = false) String isBestSeller,
            @RequestParam(required = false) String onSale,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size
    ) {
        CatalogDtos.ProductSearchRequest request = new CatalogDtos.ProductSearchRequest(
                search, categoryId, minPrice, maxPrice, minRating, sort,
                brand, eu, color, gender, inStock, subcategory,
                parseTriStateBoolean(isNewArrival),
                parseTriStateBoolean(isBestSeller),
                parseTriStateBoolean(onSale),
                page, size
        );
        return ResponseEntity.ok(catalogService.searchProducts(request));
    }

    /**
     * Accepts true/false or 1/0 from query strings for filter flags.
     */
    private static Boolean parseTriStateBoolean(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String s = raw.trim().toLowerCase(Locale.ROOT);
        if ("1".equals(s) || "true".equals(s) || "yes".equals(s)) {
            return true;
        }
        if ("0".equals(s) || "false".equals(s) || "no".equals(s)) {
            return false;
        }
        return null;
    }

    @GetMapping("/products/{productId}/related")
    public ResponseEntity<List<CatalogDtos.ProductResponse>> getRelatedProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(catalogService.getRelatedProducts(productId, limit));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<CatalogDtos.ProductResponse> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(catalogService.getProductById(productId));
    }
}
