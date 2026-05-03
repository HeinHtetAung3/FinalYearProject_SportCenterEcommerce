package com.sportsecommerce.repository;

import java.math.BigDecimal;

/**
 * Read-model filter for catalog listing. Keeps web DTOs out of the
 * repository while mirroring the facet fields from {@code ProductSearchRequest}.
 *
 * <p>Multi-value facets ({@code brand}, {@code eu}, {@code color}, {@code gender})
 * use comma-separated tokens to match the frontend query-string shape.</p>
 */
public record CatalogProductQuery(
        String search,
        Long categoryId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Double minRating,
        String brandCsv,
        String euCsv,
        String colorCsv,
        String genderCsv,
        Boolean inStock,
        String subcategory,
        Boolean isNewArrival,
        Boolean isBestSeller,
        Boolean onSale
) {
}
