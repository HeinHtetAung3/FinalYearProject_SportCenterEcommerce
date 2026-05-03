package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.model.Category;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CatalogProductQuery;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.service.CatalogService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class CatalogServiceImpl implements CatalogService {

    private final CatalogRepository catalogRepository;

    public CatalogServiceImpl(CatalogRepository catalogRepository) {
        this.catalogRepository = catalogRepository;
    }

    @Override
    @Cacheable("categories")
    public List<CatalogDtos.CategoryResponse> getCategories() {
        return catalogRepository.findAllCategories().stream()
                .map(category -> new CatalogDtos.CategoryResponse(category.id(), category.name(), category.slug()))
                .toList();
    }

    @Override
    @Cacheable(value = "products", key = "#request.toString()")
    public CatalogDtos.ProductListResponse searchProducts(CatalogDtos.ProductSearchRequest request) {
        CatalogProductQuery query = toCatalogQuery(request);
        List<Product> products = catalogRepository.findProducts(query).stream()
                .sorted(resolveSort(request.sort()))
                .toList();

        int from = request.page() * request.size();
        int to = Math.min(from + request.size(), products.size());
        List<CatalogDtos.ProductResponse> items = from >= products.size()
                ? List.of()
                : products.subList(from, to).stream().map(this::toDto).toList();

        int totalPages = products.isEmpty() ? 0 : (int) Math.ceil((double) products.size() / request.size());
        return new CatalogDtos.ProductListResponse(items, products.size(), totalPages, request.page(), request.size());
    }

    @Override
    @Cacheable(value = "productById", key = "#productId")
    public CatalogDtos.ProductResponse getProductById(Long productId) {
        return catalogRepository.findProductById(productId)
                .map(this::toDto)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    @Override
    @Cacheable(value = "relatedProducts", key = "#productId + '_' + #limit")
    public List<CatalogDtos.ProductResponse> getRelatedProducts(Long productId, int limit) {
        if (limit <= 0) {
            return List.of();
        }
        return catalogRepository.findRelatedProducts(productId, limit).stream()
                .map(this::toDto)
                .toList();
    }

    private CatalogDtos.ProductResponse toDto(Product product) {
        Map<Long, String> categoryNames = catalogRepository.findAllCategories().stream()
                .collect(java.util.stream.Collectors.toMap(Category::id, Category::name));
        return new CatalogDtos.ProductResponse(
                product.id(),
                product.name(),
                product.description(),
                product.price(),
                product.rating(),
                product.stock(),
                product.categoryId(),
                categoryNames.getOrDefault(product.categoryId(), "Unknown"),
                product.imageUrl(),
                product.brand(),
                product.sizes(),
                product.colors(),
                product.images(),
                product.gender(),
                product.subcategory(),
                product.newArrival(),
                product.bestSeller(),
                product.compareAtPrice()
        );
    }

    private CatalogProductQuery toCatalogQuery(CatalogDtos.ProductSearchRequest request) {
        return new CatalogProductQuery(
                blankToNull(request.search()),
                request.categoryId(),
                request.minPrice(),
                request.maxPrice(),
                request.minRating(),
                csvOrNull(request.brand()),
                csvOrNull(request.eu()),
                csvOrNull(request.color()),
                csvOrNull(request.gender()),
                request.inStock(),
                blankToNull(request.subcategory()),
                request.isNewArrival(),
                request.isBestSeller(),
                request.onSale()
        );
    }

    /** Treat empty / whitespace-only facet input as absent so the repository does not filter. */
    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    /** Comma-separated facet params (brand, EU sizes, colour tokens, gender) — unchanged if present. */
    private static String csvOrNull(String s) {
        return blankToNull(s);
    }

    private Comparator<Product> resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Comparator.comparing(Product::id);
        }

        return switch (sort) {
            case "priceAsc" -> Comparator.comparing(Product::price);
            case "priceDesc" -> Comparator.comparing(Product::price).reversed();
            case "ratingDesc" -> Comparator.comparing(Product::rating).reversed();
            case "nameAsc" -> Comparator.comparing(Product::name);
            default -> Comparator.comparing(Product::id);
        };
    }
}
