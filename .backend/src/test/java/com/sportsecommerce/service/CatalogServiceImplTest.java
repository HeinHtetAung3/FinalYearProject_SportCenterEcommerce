package com.sportsecommerce.service;

import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.repository.impl.InMemoryCatalogRepository;
import com.sportsecommerce.service.impl.CatalogServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CatalogServiceImplTest {

    private CatalogService catalogService;

    @BeforeEach
    void setUp() {
        catalogService = new CatalogServiceImpl(new InMemoryCatalogRepository());
    }

    @Test
    void shouldFilterSortAndPaginateProducts() {
        // Running: two "Shoes" listings in the 100–200 band at rating >= 4 (need maxPrice 200 for Cloud Glide).
        CatalogDtos.ProductSearchRequest request = new CatalogDtos.ProductSearchRequest(
                "shoes",
                1L,
                new BigDecimal("100"),
                new BigDecimal("200"),
                4.0,
                "priceDesc",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                5
        );

        CatalogDtos.ProductListResponse response = catalogService.searchProducts(request);

        assertEquals(2, response.totalItems());
        assertEquals(1, response.totalPages());
        assertEquals(2, response.items().size());
        assertTrue(response.items().getFirst().price().compareTo(response.items().get(1).price()) >= 0);
    }

    @Test
    void shouldApplyBrandEuAndInStockFacets() {
        CatalogDtos.ProductSearchRequest request = new CatalogDtos.ProductSearchRequest(
                null,
                2L,
                null,
                null,
                null,
                null,
                "Adidas",
                "42",
                null,
                null,
                Boolean.TRUE,
                null,
                null,
                null,
                null,
                0,
                50
        );

        CatalogDtos.ProductListResponse response = catalogService.searchProducts(request);

        assertTrue(response.totalItems() > 0);
        for (CatalogDtos.ProductResponse item : response.items()) {
            assertEquals("Adidas", item.brand());
            assertTrue(item.stock() > 0);
            assertTrue(item.sizes() != null && item.sizes().contains(42));
        }
    }

    @Test
    void shouldTreatBlankFacetTokensAsUnfiltered() {
        CatalogDtos.ProductSearchRequest blanks = new CatalogDtos.ProductSearchRequest(
                "   ",
                null,
                null,
                null,
                null,
                null,
                "  ",
                " ",
                "   ",
                "\t",
                null,
                " ",
                null,
                null,
                null,
                0,
                12
        );
        CatalogDtos.ProductSearchRequest nulled = new CatalogDtos.ProductSearchRequest(
                null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null,
                0, 12
        );

        assertEquals(
                catalogService.searchProducts(nulled).totalItems(),
                catalogService.searchProducts(blanks).totalItems()
        );
    }

    @Test
    void shouldReturnEmptyPageWhenOutOfRange() {
        CatalogDtos.ProductSearchRequest request = new CatalogDtos.ProductSearchRequest(
                null, null, null, null, null, null,
                null, null, null, null, null, null,
                null, null, null,
                50, 5
        );

        CatalogDtos.ProductListResponse response = catalogService.searchProducts(request);
        assertTrue(response.items().isEmpty());
        assertFalse(response.totalItems() == 0);
    }
}
