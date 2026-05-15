package com.sportsecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record BulkDeleteProductsRequest(@NotEmpty List<@NotNull Long> ids) {
    }

    public record UpsertProductRequest(
            @NotBlank String name,
            @NotBlank String description,
            @NotNull BigDecimal price,
            @NotNull @Min(0) Integer stock,
            @NotNull Long categoryId,
            String imageUrl,
            String brand,
            String gender,
            String subcategory,
            List<Integer> sizes,
            List<String> colors,
            List<String> images,
            Boolean storefrontVisible
    ) {
    }

    public record UpdateOrderStatusRequest(@NotBlank String status) {
    }

    public record UpdateUserRoleRequest(@NotBlank String role) {
    }

    public record UpdateUserEnabledRequest(boolean enabled) {
    }

    public record DashboardMetricsResponse(
            long totalOrders,
            long totalUsers,
            BigDecimal totalRevenue,
            Map<String, Long> ordersByStatus,
            List<CatalogDtos.ProductResponse> lowStockProducts
    ) {
    }
}
