package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.service.CartService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserContextResolver userContextResolver;

    public CartController(CartService cartService, UserContextResolver userContextResolver) {
        this.cartService = cartService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping
    public ResponseEntity<CartDtos.CartResponse> getCart() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(cartService.getCart(email));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDtos.CartResponse> addItem(@Valid @RequestBody CartDtos.AddCartItemRequest request) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(cartService.addItem(email, request));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDtos.CartResponse> updateItem(
            @PathVariable Long productId,
            @Valid @RequestBody CartDtos.UpdateCartItemRequest request
    ) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(cartService.updateItem(email, productId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartDtos.CartResponse> removeItem(
            @PathVariable Long productId,
            @RequestBody(required = false) CartDtos.RemoveCartLineRequest body
    ) {
        String email = userContextResolver.requireAuthenticatedEmail();
        Integer size = body != null ? body.size() : null;
        String color = body != null ? body.color() : null;
        return ResponseEntity.ok(cartService.removeItem(email, productId, size, color));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        String email = userContextResolver.requireAuthenticatedEmail();
        cartService.clear(email);
        return ResponseEntity.noContent().build();
    }
}
