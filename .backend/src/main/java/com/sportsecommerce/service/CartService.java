package com.sportsecommerce.service;

import com.sportsecommerce.dto.CartDtos;

import java.util.List;

/**
 * Cart operations are always scoped to a single authenticated user.
 * The {@code email} argument identifies that user; each user has their
 * own persistent cart row, so two different users can never see or
 * mutate each other's bag.
 */
public interface CartService {
    CartDtos.CartResponse getCart(String email);

    CartDtos.CartResponse addItem(String email, CartDtos.AddCartItemRequest request);

    CartDtos.CartResponse updateItem(String email, Long productId, CartDtos.UpdateCartItemRequest request);

    CartDtos.CartResponse removeItem(String email, Long productId, Integer size, String color);

    /**
     * Remove a subset of cart lines identified by their persistent ids.
     *
     * <p>Used by selective checkout so only the lines the user picked
     * are deleted from the cart after the order is created. Every id
     * must belong to the caller's own cart; foreign or unknown ids are
     * rejected so a malicious caller cannot delete someone else's
     * bag.</p>
     */
    void removeItemsByIds(String email, List<Long> cartItemIds);

    void clear(String email);
}
