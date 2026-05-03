package com.sportsecommerce.service;

import com.sportsecommerce.dto.AdminDtos;
import com.sportsecommerce.dto.AuthDtos;
import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.dto.CommerceDtos;

import java.util.List;

public interface AdminService {
    List<CatalogDtos.ProductResponse> listProducts();

    CatalogDtos.ProductResponse createProduct(AdminDtos.UpsertProductRequest request);

    CatalogDtos.ProductResponse updateProduct(Long productId, AdminDtos.UpsertProductRequest request);

    void deleteProduct(Long productId);

    void deleteProducts(List<Long> productIds);

    List<CommerceDtos.OrderResponse> listOrders();

    CommerceDtos.OrderResponse updateOrderStatus(Long orderId, String status);

    List<AuthDtos.AdminUserResponse> listUsers();

    AuthDtos.AdminUserResponse updateUserRole(String email, String role);

    AuthDtos.AdminUserResponse updateUserEnabled(String email, boolean enabled);

    AdminDtos.DashboardMetricsResponse getMetrics();
}
