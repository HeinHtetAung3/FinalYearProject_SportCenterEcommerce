package com.sportsecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public final class CartDtos {

    private CartDtos() {
    }

    /**
     * Add an item to the cart.
     *
     * <p>{@code size} (EU) and {@code color} are optional variant
     * selectors. Together with {@code productId} they form the composite
     * line key (see {@code makeCartLineKey} in the frontend) so the same
     * boot in two sizes lives on two distinct lines instead of being
     * silently merged.</p>
     */
    public record AddCartItemRequest(
            @NotNull Long productId,
            @NotNull @Min(1) Integer quantity,
            Integer size,
            String color
    ) {
    }

    /**
     * Update an existing cart line.
     *
     * <p>{@code size}/{@code color} disambiguate variant lines for the
     * same {@code productId} when the controller path only carries the
     * product id. They are optional for legacy / non-variant items.</p>
     */
    public record UpdateCartItemRequest(
            @NotNull @Min(1) Integer quantity,
            Integer size,
            String color
    ) {
    }

    /**
     * Optional body for {@code DELETE /api/cart/items/{productId}} so variant lines
     * are removed without affecting other sizes/colours of the same product.
     */
    public record RemoveCartLineRequest(
            Integer size,
            String color
    ) {
    }

    /**
     * Snapshot of a cart line returned to clients.
     *
     * <p>{@code id} is the persistent {@code CartItemEntity.id} and is the
     * stable identifier the frontend uses to address a specific line for
     * selective checkout (see {@code POST /api/orders}). {@code imageUrl},
     * {@code images}, {@code brand} and {@code categoryName} are joined
     * from the catalog at response time so the bag UI never falls back to
     * a generic placeholder when the user reloads the page or signs in.</p>
     */
    public record CartItemResponse(
            Long id,
            Long productId,
            String productName,
            String brand,
            String imageUrl,
            List<String> images,
            String categoryName,
            BigDecimal unitPrice,
            Integer quantity,
            Integer stock,
            BigDecimal subtotal,
            Integer size,
            String color
    ) {
    }

    public record CartResponse(
            List<CartItemResponse> items,
            Integer itemCount,
            BigDecimal total
    ) {
    }
}
