package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.UserContextResolver;
import com.sportsecommerce.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserContextResolver userContextResolver;

    public WishlistController(WishlistService wishlistService, UserContextResolver userContextResolver) {
        this.wishlistService = wishlistService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping
    public ResponseEntity<CommerceDtos.WishlistResponse> get() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(wishlistService.get(email));
    }

    @PostMapping("/items")
    public ResponseEntity<CommerceDtos.WishlistResponse> add(@Valid @RequestBody CommerceDtos.AddWishlistItemRequest request) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(wishlistService.add(email, request));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<CommerceDtos.WishlistToggleResponse> toggle(@PathVariable Long productId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(wishlistService.toggle(email, productId));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CommerceDtos.WishlistResponse> remove(@PathVariable Long productId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(wishlistService.remove(email, productId));
    }

    @PostMapping("/items/{productId}/move-to-cart")
    public ResponseEntity<CommerceDtos.WishlistResponse> moveToCart(@PathVariable Long productId) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(wishlistService.moveToCart(email, productId));
    }
}
