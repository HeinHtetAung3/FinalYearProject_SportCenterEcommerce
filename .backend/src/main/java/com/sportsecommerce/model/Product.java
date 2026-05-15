package com.sportsecommerce.model;

import java.math.BigDecimal;
import java.util.List;

/**
 * Catalog product aggregate.
 *
 * <p>The trailing fields ({@code brand}, {@code sizes}, {@code colors},
 * {@code images}, {@code gender}, {@code subcategory}) back the variant /
 * lifestyle facets introduced in Phase 4 (see Flyway {@code V7}). They
 * are nullable on purpose so callers that pre-date the variant work
 * (existing seed data, admin upserts) can keep building products
 * without supplying a full variant matrix; downstream filters and DTOs
 * treat {@code null} / empty lists as "not provided".</p>
 */
public record Product(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Double rating,
        Integer stock,
        Long categoryId,
        String imageUrl,
        String brand,
        List<Integer> sizes,
        List<String> colors,
        List<String> images,
        String gender,
        String subcategory,
        boolean newArrival,
        boolean bestSeller,
        BigDecimal compareAtPrice,
        boolean storefrontVisible
) {
}
