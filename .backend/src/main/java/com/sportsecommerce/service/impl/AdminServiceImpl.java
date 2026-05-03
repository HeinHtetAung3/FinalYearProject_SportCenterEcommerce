package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.AdminDtos;
import com.sportsecommerce.dto.AuthDtos;
import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.service.AdminService;
import com.sportsecommerce.service.AuthService;
import com.sportsecommerce.service.CatalogService;
import com.sportsecommerce.service.OrderService;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final CatalogRepository catalogRepository;
    private final CatalogService catalogService;
    private final OrderService orderService;
    private final AuthService authService;
    private final CacheManager cacheManager;

    public AdminServiceImpl(
            CatalogRepository catalogRepository,
            CatalogService catalogService,
            OrderService orderService,
            AuthService authService,
            CacheManager cacheManager
    ) {
        this.catalogRepository = catalogRepository;
        this.catalogService = catalogService;
        this.orderService = orderService;
        this.authService = authService;
        this.cacheManager = cacheManager;
    }

    @Override
    public List<CatalogDtos.ProductResponse> listProducts() {
        return catalogRepository.findAllProducts().stream()
                .map(product -> catalogService.getProductById(product.id()))
                .toList();
    }

    @Override
    public CatalogDtos.ProductResponse createProduct(AdminDtos.UpsertProductRequest request) {
        validateCategory(request.categoryId());
        Product created = new Product(
                catalogRepository.nextProductId(),
                request.name(),
                request.description(),
                request.price(),
                0.0,
                request.stock(),
                request.categoryId(),
                blankToNull(request.imageUrl()),
                blankToNull(request.brand()),
                normalizeIntList(request.sizes()),
                normalizeStringList(request.colors()),
                normalizeStringList(request.images()),
                blankToNull(request.gender()),
                blankToNull(request.subcategory()),
                false,
                false,
                null
        );
        catalogRepository.saveProduct(created);
        evictCatalogCaches();
        return catalogService.getProductById(created.id());
    }

    @Override
    public CatalogDtos.ProductResponse updateProduct(Long productId, AdminDtos.UpsertProductRequest request) {
        Product current = catalogRepository.findProductById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        validateCategory(request.categoryId());
        Product updated = new Product(
                current.id(),
                request.name(),
                request.description(),
                request.price(),
                current.rating(),
                request.stock(),
                request.categoryId(),
                blankToNull(request.imageUrl()),
                blankToNull(request.brand()),
                normalizeIntList(request.sizes()),
                normalizeStringList(request.colors()),
                normalizeStringList(request.images()),
                blankToNull(request.gender()),
                blankToNull(request.subcategory()),
                current.newArrival(),
                current.bestSeller(),
                current.compareAtPrice()
        );
        catalogRepository.saveProduct(updated);
        evictCatalogCaches();
        return catalogService.getProductById(updated.id());
    }

    @Override
    public void deleteProduct(Long productId) {
        if (!catalogRepository.deleteProduct(productId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        evictCatalogCaches();
    }

    @Override
    public void deleteProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No product ids provided");
        }
        List<Long> distinct = productIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (distinct.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No product ids provided");
        }
        boolean anyRemoved = false;
        for (Long id : distinct) {
            if (catalogRepository.deleteProduct(id)) {
                anyRemoved = true;
            }
        }
        if (anyRemoved) {
            evictCatalogCaches();
        }
    }

    @Override
    public List<CommerceDtos.OrderResponse> listOrders() {
        return orderService.listAll();
    }

    @Override
    public CommerceDtos.OrderResponse updateOrderStatus(Long orderId, String status) {
        return orderService.updateStatus(orderId, status.trim().toUpperCase(Locale.ROOT));
    }

    @Override
    public List<AuthDtos.AdminUserResponse> listUsers() {
        return authService.listUsers();
    }

    @Override
    public AuthDtos.AdminUserResponse updateUserRole(String email, String role) {
        return authService.setUserRole(email, role);
    }

    @Override
    public AuthDtos.AdminUserResponse updateUserEnabled(String email, boolean enabled) {
        return authService.setUserEnabled(email, enabled);
    }

    @Override
    public AdminDtos.DashboardMetricsResponse getMetrics() {
        List<CommerceDtos.OrderResponse> orders = orderService.listAll();
        BigDecimal revenue = orders.stream()
                .filter(order -> !"CANCELLED".equalsIgnoreCase(order.status()))
                .map(CommerceDtos.OrderResponse::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Long> byStatus = orders.stream()
                .collect(Collectors.groupingBy(CommerceDtos.OrderResponse::status, Collectors.counting()));
        List<CatalogDtos.ProductResponse> lowStock = listProducts().stream()
                .filter(product -> product.stock() <= 5)
                .limit(10)
                .toList();
        return new AdminDtos.DashboardMetricsResponse(
                orders.size(),
                authService.listUsers().size(),
                revenue,
                byStatus,
                lowStock
        );
    }

    private void validateCategory(Long categoryId) {
        if (catalogRepository.findCategoryById(categoryId).isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid category id");
        }
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<Integer> normalizeIntList(List<Integer> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }
        return values.stream()
                .filter(Objects::nonNull)
                .map(Integer::intValue)
                .toList();
    }

    private static List<String> normalizeStringList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }
        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private void evictCatalogCaches() {
        clearCache("categories");
        clearCache("products");
        clearCache("productById");
        clearCache("relatedProducts");
    }

    private void clearCache(String cacheName) {
        if (cacheManager.getCache(cacheName) != null) {
            cacheManager.getCache(cacheName).clear();
        }
    }
}
