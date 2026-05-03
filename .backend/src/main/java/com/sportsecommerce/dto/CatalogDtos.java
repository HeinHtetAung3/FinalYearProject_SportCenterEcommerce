package com.sportsecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public final class CatalogDtos {

    private CatalogDtos() {
    }

    public record CategoryResponse(Long id, String name, String slug) {
    }

    /**
     * Public product payload returned by the catalog endpoints.
     *
     * <p>Mirrors the {@link com.sportsecommerce.model.Product} record so the
     * frontend always sees the same variant + lifestyle metadata (brand, EU
     * sizes, color labels, image gallery, gender split, subcategory) that
     * Phase 4 stores in the database. Fields can be {@code null} or empty
     * when a product has not been enriched yet.</p>
     */
    public record ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            Double rating,
            Integer stock,
            Long categoryId,
            String categoryName,
            String imageUrl,
            String brand,
            List<Integer> sizes,
            List<String> colors,
            List<String> images,
            String gender,
            String subcategory,
            boolean newArrival,
            boolean bestSeller,
            BigDecimal compareAtPrice
    ) {
    }

    public record ProductListResponse(
            List<ProductResponse> items,
            long totalItems,
            int totalPages,
            int page,
            int size
    ) {
    }

    /**
     * Filter + pagination input for {@code GET /api/products}.
     *
     * <p>The trailing facets ({@code brand}, {@code eu}, {@code color},
     * {@code gender}, {@code inStock}, {@code subcategory}) back the
     * Phase 4 product filters surfaced in the frontend
     * {@code FilterSidebar}. All facets are optional; {@code null} means
     * "do not filter on this attribute".</p>
     */
    public record ProductSearchRequest(
            String search,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Double minRating,
            String sort,
            String brand,
            String eu,
            String color,
            String gender,
            Boolean inStock,
            String subcategory,
            Boolean isNewArrival,
            Boolean isBestSeller,
            Boolean onSale,
            @NotNull @Min(0) Integer page,
            @NotNull @Min(1) Integer size
    ) {
    }
}
