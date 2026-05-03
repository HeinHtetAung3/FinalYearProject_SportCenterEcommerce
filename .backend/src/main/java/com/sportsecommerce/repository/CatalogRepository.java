package com.sportsecommerce.repository;

import com.sportsecommerce.model.Category;
import com.sportsecommerce.model.Product;

import java.util.List;
import java.util.Optional;

public interface CatalogRepository {

    /**
     * All products matching text, category, price, rating and Phase-4 facets
     * (brand, EU size, color slug, gender, in-stock, subcategory). Sorted by
     * id for stable ordering; callers apply sort + pagination.
     */
    List<Product> findProducts(CatalogProductQuery query);

    List<Category> findAllCategories();

    List<Product> findAllProducts();

    Optional<Product> findProductById(Long productId);

    Optional<Category> findCategoryById(Long categoryId);

    Product saveProduct(Product product);

    boolean deleteProduct(Long productId);

    Long nextProductId();

    /**
     * Same-category siblings by rating, excluding {@code productId}, then
     * top-rated products from other categories — mirrors
     * {@code findMockRelated} in the frontend mock catalog.
     */
    List<Product> findRelatedProducts(Long productId, int limit);

    /**
     * Distinct non-blank brand names from the catalog, sorted alphabetically.
     */
    List<String> findDistinctBrandNames();

    /** Total SKUs in the catalog (for storefront hero stats). */
    long countProducts();
}
