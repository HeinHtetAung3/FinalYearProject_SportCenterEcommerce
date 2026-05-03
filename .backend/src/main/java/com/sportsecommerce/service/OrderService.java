package com.sportsecommerce.service;

import com.sportsecommerce.dto.CommerceDtos;

import java.util.List;

public interface OrderService {
    CommerceDtos.OrderResponse create(String email, CommerceDtos.CreateOrderRequest request);

    List<CommerceDtos.OrderResponse> listByUser(String email);

    CommerceDtos.OrderResponse getById(Long orderId);

    /**
     * Look up an order and verify it belongs to the given user. Throws
     * {@code 404 Not Found} (rather than {@code 403}) for cross-user
     * access to avoid leaking the existence of other users' orders.
     */
    CommerceDtos.OrderResponse getByIdForUser(String email, Long orderId);

    CommerceDtos.OrderResponse cancel(String email, Long orderId);

    List<CommerceDtos.OrderResponse> listAll();

    CommerceDtos.OrderResponse updateStatus(Long orderId, String status);
}
