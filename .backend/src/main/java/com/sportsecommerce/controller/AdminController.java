package com.sportsecommerce.controller;

import com.sportsecommerce.dto.AdminDtos;
import com.sportsecommerce.dto.AuthDtos;
import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<CommerceDtos.OrderResponse>> listOrders() {
        return ResponseEntity.ok(adminService.listOrders());
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<CommerceDtos.OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminDtos.UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.updateOrderStatus(orderId, request.status()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AuthDtos.AdminUserResponse>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @PutMapping("/users/{email}/role")
    public ResponseEntity<AuthDtos.AdminUserResponse> updateUserRole(
            @PathVariable String email,
            @Valid @RequestBody AdminDtos.UpdateUserRoleRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUserRole(email, request.role()));
    }

    @PutMapping("/users/{email}/enabled")
    public ResponseEntity<AuthDtos.AdminUserResponse> updateUserEnabled(
            @PathVariable String email,
            @Valid @RequestBody AdminDtos.UpdateUserEnabledRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUserEnabled(email, request.enabled()));
    }

    @GetMapping("/metrics")
    public ResponseEntity<AdminDtos.DashboardMetricsResponse> metrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    /**
     * Full catalog for admin (includes hidden / disabled SKUs). Storefront uses {@code GET /api/products}.
     */
    @GetMapping("/products")
    public ResponseEntity<List<CatalogDtos.ProductResponse>> listProducts() {
        return ResponseEntity.ok(adminService.listProducts());
    }
}
