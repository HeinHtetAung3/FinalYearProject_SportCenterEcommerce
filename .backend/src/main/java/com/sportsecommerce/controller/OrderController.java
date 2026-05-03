package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.OrderService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final UserContextResolver userContextResolver;

    public OrderController(OrderService orderService, UserContextResolver userContextResolver) {
        this.orderService = orderService;
        this.userContextResolver = userContextResolver;
    }

    /**
     * Default order list — always scoped to the authenticated user.
     * Kept for backwards compatibility with the existing frontend; new
     * callers should prefer the explicit {@code /my-orders} endpoint.
     */
    @GetMapping
    public ResponseEntity<List<CommerceDtos.OrderResponse>> list() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(orderService.listByUser(email));
    }

    /**
     * Returns only the orders that belong to the currently logged-in
     * user. Two different users hitting this endpoint always get two
     * disjoint result sets.
     */
    @GetMapping("/my-orders")
    public ResponseEntity<List<CommerceDtos.OrderResponse>> myOrders() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(orderService.listByUser(email));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<CommerceDtos.OrderResponse> getById(@PathVariable Long orderId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(orderService.getByIdForUser(email, orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<CommerceDtos.OrderResponse> updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody CommerceDtos.UpdateOrderStatusRequest body
    ) {
        return ResponseEntity.ok(orderService.updateStatus(orderId, body.status()));
    }

    @PostMapping
    public ResponseEntity<CommerceDtos.OrderResponse> create(@Valid @RequestBody CommerceDtos.CreateOrderRequest request) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(orderService.create(email, request));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<CommerceDtos.OrderResponse> cancel(@PathVariable Long orderId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(orderService.cancel(email, orderId));
    }
}
