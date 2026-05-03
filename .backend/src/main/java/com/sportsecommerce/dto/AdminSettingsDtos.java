package com.sportsecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public final class AdminSettingsDtos {

    private AdminSettingsDtos() {
    }

    public record SystemSettingsResponse(
            GeneralSettings general,
            PaymentSettingsResponse payments,
            ShippingSettings shipping,
            TaxSettings tax,
            ProductSettings product,
            NotificationSettings notifications,
            SecuritySettings security
    ) {
    }

    public record UpdateSystemSettingsRequest(
            @NotNull @Valid GeneralSettings general,
            @NotNull @Valid PaymentSettingsUpdateRequest payments,
            @NotNull @Valid ShippingSettings shipping,
            @NotNull @Valid TaxSettings tax,
            @NotNull @Valid ProductSettings product,
            @NotNull @Valid NotificationSettings notifications,
            @NotNull @Valid SecuritySettings security
    ) {
    }

    public record GeneralSettings(
            @NotBlank @Size(max = 160) String storeName,
            @Size(max = 500) String logoUrl,
            @NotBlank @Email @Size(max = 254) String contactEmail,
            @NotBlank @Size(max = 12) String defaultCurrency,
            @NotBlank @Size(max = 16) String defaultLanguage
    ) {
    }

    public record PaymentSettingsResponse(
            boolean creditCardEnabled,
            boolean cashOnDeliveryEnabled,
            boolean stripeEnabled,
            String stripePublicKey,
            boolean stripeSecretConfigured
    ) {
    }

    public record PaymentSettingsUpdateRequest(
            boolean creditCardEnabled,
            boolean cashOnDeliveryEnabled,
            boolean stripeEnabled,
            @Size(max = 255) String stripePublicKey,
            @Size(max = 255) String stripeSecretKey
    ) {
    }

    public record ShippingSettings(
            @NotNull @DecimalMin("0.00") @DecimalMax("999999.99") BigDecimal flatShippingFee,
            @NotNull @DecimalMin("0.00") @DecimalMax("999999.99") BigDecimal freeShippingThreshold,
            @NotEmpty List<@NotBlank @Size(max = 120) String> deliveryRegions,
            @NotBlank @Size(max = 120) String estimatedDeliveryTime
    ) {
    }

    public record TaxSettings(
            @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal taxRatePercent,
            List<@Valid RegionTaxRule> regionTaxRules
    ) {
    }

    public record RegionTaxRule(
            @NotBlank @Size(max = 120) String region,
            @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal taxRatePercent
    ) {
    }

    public record ProductSettings(
            @NotNull @Min(0) @Max(100000) Integer defaultStockThreshold,
            boolean lowStockAlertsEnabled,
            boolean reviewsEnabled
    ) {
    }

    public record NotificationSettings(
            boolean alertNewOrders,
            boolean alertLowStock,
            boolean alertNewUserRegistration
    ) {
    }

    public record SecuritySettings(
            @NotNull @Min(6) @Max(128) Integer passwordMinLength,
            boolean passwordRequireUppercase,
            boolean passwordRequireNumber,
            boolean passwordRequireSpecialCharacter,
            @NotNull @Min(5) @Max(1440) Integer sessionTimeoutMinutes,
            @NotNull @Min(3) @Max(20) Integer maxLoginAttempts,
            @NotNull @Min(5) @Max(2880) Integer jwtExpirationMinutes
    ) {
    }
}
