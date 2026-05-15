package com.sportsecommerce.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class CommerceDtos {

    private CommerceDtos() {
    }

    /**
     * Place a new order from the authenticated user's bag.
     *
     * <p>{@code cartItemIds} drives selective checkout: only the listed
     * cart-line ids (see {@link CartDtos.CartItemResponse#id()}) are
     * included in the order and removed from the bag afterwards. The
     * list must be non-empty and every id must belong to the caller's
     * own cart.</p>
     */
    public record CreateOrderRequest(
            @NotBlank String shippingAddress,
            @NotBlank String paymentMethod,
            @NotEmpty List<@NotNull Long> cartItemIds,
            String shippingSpeedId
    ) {
    }

    public record UpdateOrderStatusRequest(@NotBlank @Size(max = 32) String status) {
    }

    public record OrderItemResponse(
            Long productId,
            String productName,
            BigDecimal unitPrice,
            Integer quantity,
            BigDecimal subtotal,
            Integer variantSize,
            String variantColor,
            String imageUrl
    ) {
    }

    public record OrderResponse(
            Long id,
            String customerEmail,
            String status,
            String shippingAddress,
            String paymentMethod,
            Instant createdAt,
            List<OrderItemResponse> items,
            BigDecimal total
    ) {
    }

    public record ReviewRequest(
            @NotNull Long productId,
            @NotBlank String comment,
            @NotNull @Min(1) @Max(5) Integer rating
    ) {
    }

    public record ReviewResponse(
            Long id,
            Long productId,
            String productName,
            String reviewerEmail,
            Integer rating,
            String comment,
            Instant createdAt
    ) {
    }

    public record AddWishlistItemRequest(@NotNull Long productId) {
    }

    public record WishlistItemResponse(
            Long productId,
            String productName,
            BigDecimal price,
            Integer stock,
            String imageUrl
    ) {
    }

    public record WishlistResponse(List<WishlistItemResponse> items, Integer itemCount) {
    }

    public record WishlistToggleResponse(boolean isWishlisted, int wishlistCount) {
    }

    public record UpdateProfileRequest(
            @NotBlank String fullName,
            @NotBlank String phoneNumber,
            @NotNull Boolean marketingEmailOptIn
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6, max = 128) String newPassword
    ) {
    }

    public record UpsertAddressRequest(
            @NotBlank String label,
            @NotBlank String fullName,
            @NotBlank String phone,
            String email,
            @NotBlank String line1,
            String line2,
            @NotBlank String city,
            String region,
            @NotBlank String postalCode,
            @NotBlank String country,
            Boolean makeDefault
    ) {
    }

    public record AddressResponse(
            Long id,
            String label,
            String fullName,
            String phone,
            String email,
            String line1,
            String line2,
            String city,
            String region,
            String postalCode,
            String country,
            @JsonProperty("isDefault") boolean defaultShipping
    ) {
    }

    public record ProfileResponse(
            String email,
            String fullName,
            String phoneNumber,
            String address,
            String profileImageUrl,
            boolean marketingEmailOptIn,
            List<AddressResponse> addresses
    ) {
    }

    public record ProfileImageResponse(
            String profileImageUrl,
            String message
    ) {
    }

    public record UserSettingsResponse(
            String language,
            String currency,
            String timezone,
            boolean darkMode,
            boolean orderUpdates,
            boolean promotions,
            boolean emailNotifications,
            boolean smsNotifications,
            String profileVisibility,
            boolean dataSharing,
            boolean personalizedAds
    ) {
    }

    public record UserSettingsUpdateRequest(
            @NotBlank @Size(max = 16) String language,
            @NotBlank @Size(max = 8) String currency,
            @NotBlank @Size(max = 64) String timezone,
            @NotNull Boolean darkMode,
            @NotNull Boolean orderUpdates,
            @NotNull Boolean promotions,
            @NotNull Boolean emailNotifications,
            @NotNull Boolean smsNotifications,
            @NotBlank @Size(max = 32) String profileVisibility,
            @NotNull Boolean dataSharing,
            @NotNull Boolean personalizedAds
    ) {
    }

    public record DeleteAccountRequest(
            @NotBlank String password
    ) {
    }
}
