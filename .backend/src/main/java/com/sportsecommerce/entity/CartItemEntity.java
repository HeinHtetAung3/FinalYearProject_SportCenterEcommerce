package com.sportsecommerce.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * One physical line in a {@link CartEntity}. The composite line key is
 * {@code (cart_id, product_id, variant_size, variant_color)} so the same
 * product in two sizes lives on two distinct cart lines, mirroring the
 * frontend's {@code makeCartLineKey} contract.
 */
@Entity
@Table(name = "cart_items", uniqueConstraints = {
        @UniqueConstraint(name = "uk_cart_items_line", columnNames = {"cart_id", "product_id", "variant_size", "variant_color"})
})
public class CartItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private CartEntity cart;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * EU shoe size or {@code 0} when the product has no size variant. The
     * column is NOT NULL with a default of 0 (see V7 migration) so the
     * unique line key is well-defined.
     */
    @Column(name = "variant_size", nullable = false)
    private Integer variantSize = 0;

    /**
     * Colour name or empty string when the product has no colour variant.
     * Stored as NOT NULL DEFAULT '' (see V7 migration) so the unique line
     * key is well-defined.
     */
    @Column(name = "variant_color", nullable = false, length = 60)
    private String variantColor = "";

    public Long getId() {
        return id;
    }

    public CartEntity getCart() {
        return cart;
    }

    public void setCart(CartEntity cart) {
        this.cart = cart;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getVariantSize() {
        return variantSize;
    }

    public void setVariantSize(Integer variantSize) {
        this.variantSize = variantSize == null ? 0 : variantSize;
    }

    public String getVariantColor() {
        return variantColor;
    }

    public void setVariantColor(String variantColor) {
        this.variantColor = variantColor == null ? "" : variantColor;
    }
}
