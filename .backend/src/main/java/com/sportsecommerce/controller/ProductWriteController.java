package com.sportsecommerce.controller;

import com.sportsecommerce.dto.AdminDtos;
import com.sportsecommerce.dto.CatalogDtos;
import com.sportsecommerce.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Mutating product operations on the canonical catalog path {@code /api/products},
 * backed by the same persistence as {@link CatalogController} reads.
 */
@RestController
@RequestMapping("/api/products")
public class ProductWriteController {

    private final AdminService adminService;

    public ProductWriteController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CatalogDtos.ProductResponse> createProduct(
            @Valid @RequestBody AdminDtos.UpsertProductRequest request
    ) {
        CatalogDtos.ProductResponse created = adminService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CatalogDtos.ProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody AdminDtos.UpsertProductRequest request
    ) {
        return ResponseEntity.ok(adminService.updateProduct(productId, request));
    }

    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductsBulk(@Valid @RequestBody AdminDtos.BulkDeleteProductsRequest request) {
        adminService.deleteProducts(request.ids());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        adminService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }
}
