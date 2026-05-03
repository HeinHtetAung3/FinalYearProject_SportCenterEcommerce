package com.sportsecommerce.service;

import com.sportsecommerce.dto.CommerceDtos;

public interface WishlistService {
    CommerceDtos.WishlistResponse get(String email);

    CommerceDtos.WishlistResponse add(String email, CommerceDtos.AddWishlistItemRequest request);

    CommerceDtos.WishlistResponse remove(String email, Long productId);

    CommerceDtos.WishlistResponse moveToCart(String email, Long productId);

    CommerceDtos.WishlistToggleResponse toggle(String email, Long productId);
}
