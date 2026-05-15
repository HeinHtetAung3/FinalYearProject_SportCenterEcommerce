package com.sportsecommerce.service;

import com.sportsecommerce.dto.CatalogDtos;

import java.util.List;

public interface CatalogService {
    List<CatalogDtos.CategoryResponse> getCategories();

    CatalogDtos.ProductListResponse searchProducts(CatalogDtos.ProductSearchRequest request);

    CatalogDtos.ProductResponse getProductById(Long productId);

    /**
     * Admin / internal: includes hidden products (storefront may still 404 them).
     */
    CatalogDtos.ProductResponse getProductByIdForAdmin(Long productId);

    /**
     * Same-category siblings by rating, then cross-category fillers — mirrors
     * the PDP related rail ({@code findMockRelated} on the frontend).
     */
    List<CatalogDtos.ProductResponse> getRelatedProducts(Long productId, int limit);
}
