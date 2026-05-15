package com.sportsecommerce.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "system_settings")
public class SystemSettingsEntity {

    @Id
    private Long id;

    @Column(name = "store_name", nullable = false, length = 160)
    private String storeName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "contact_email", nullable = false, length = 254)
    private String contactEmail;

    @Column(name = "default_currency", nullable = false, length = 12)
    private String defaultCurrency;

    @Column(name = "default_language", nullable = false, length = 16)
    private String defaultLanguage;

    @Column(name = "payment_credit_card_enabled", nullable = false)
    private boolean paymentCreditCardEnabled;

    @Column(name = "payment_cod_enabled", nullable = false)
    private boolean paymentCodEnabled;

    @Column(name = "payment_stripe_enabled", nullable = false)
    private boolean paymentStripeEnabled;

    @Column(name = "stripe_public_key", length = 255)
    private String stripePublicKey;

    @Column(name = "stripe_secret_encrypted", length = 1024)
    private String stripeSecretEncrypted;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "free_shipping_threshold", nullable = false, precision = 12, scale = 2)
    private BigDecimal freeShippingThreshold;

    @Column(name = "shipping_enabled", nullable = false)
    private boolean shippingEnabled = true;

    @Column(name = "express_shipping_surcharge", nullable = false, precision = 12, scale = 2)
    private BigDecimal expressShippingSurcharge;

    @Column(name = "delivery_regions_json", columnDefinition = "TEXT")
    private String deliveryRegionsJson;

    @Column(name = "estimated_delivery_time", nullable = false, length = 120)
    private String estimatedDeliveryTime;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    @Column(name = "tax_rules_json", columnDefinition = "TEXT")
    private String taxRulesJson;

    @Column(name = "stock_threshold", nullable = false)
    private Integer stockThreshold;

    @Column(name = "low_stock_alert_enabled", nullable = false)
    private boolean lowStockAlertEnabled;

    @Column(name = "reviews_enabled", nullable = false)
    private boolean reviewsEnabled;

    @Column(name = "notify_new_orders", nullable = false)
    private boolean notifyNewOrders;

    @Column(name = "notify_low_stock", nullable = false)
    private boolean notifyLowStock;

    @Column(name = "notify_new_users", nullable = false)
    private boolean notifyNewUsers;

    @Column(name = "password_min_length", nullable = false)
    private Integer passwordMinLength;

    @Column(name = "password_require_uppercase", nullable = false)
    private boolean passwordRequireUppercase;

    @Column(name = "password_require_number", nullable = false)
    private boolean passwordRequireNumber;

    @Column(name = "password_require_special", nullable = false)
    private boolean passwordRequireSpecial;

    @Column(name = "session_timeout_minutes", nullable = false)
    private Integer sessionTimeoutMinutes;

    @Column(name = "max_login_attempts", nullable = false)
    private Integer maxLoginAttempts;

    @Column(name = "jwt_expiration_minutes", nullable = false)
    private Integer jwtExpirationMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Instant updatedAt;

    @PrePersist
    void onInsert() {
        if (id == null) {
            id = 1L;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    public void setDefaultCurrency(String defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
    }

    public String getDefaultLanguage() {
        return defaultLanguage;
    }

    public void setDefaultLanguage(String defaultLanguage) {
        this.defaultLanguage = defaultLanguage;
    }

    public boolean isPaymentCreditCardEnabled() {
        return paymentCreditCardEnabled;
    }

    public void setPaymentCreditCardEnabled(boolean paymentCreditCardEnabled) {
        this.paymentCreditCardEnabled = paymentCreditCardEnabled;
    }

    public boolean isPaymentCodEnabled() {
        return paymentCodEnabled;
    }

    public void setPaymentCodEnabled(boolean paymentCodEnabled) {
        this.paymentCodEnabled = paymentCodEnabled;
    }

    public boolean isPaymentStripeEnabled() {
        return paymentStripeEnabled;
    }

    public void setPaymentStripeEnabled(boolean paymentStripeEnabled) {
        this.paymentStripeEnabled = paymentStripeEnabled;
    }

    public String getStripePublicKey() {
        return stripePublicKey;
    }

    public void setStripePublicKey(String stripePublicKey) {
        this.stripePublicKey = stripePublicKey;
    }

    public String getStripeSecretEncrypted() {
        return stripeSecretEncrypted;
    }

    public void setStripeSecretEncrypted(String stripeSecretEncrypted) {
        this.stripeSecretEncrypted = stripeSecretEncrypted;
    }

    public BigDecimal getShippingFee() {
        return shippingFee;
    }

    public void setShippingFee(BigDecimal shippingFee) {
        this.shippingFee = shippingFee;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public boolean isShippingEnabled() {
        return shippingEnabled;
    }

    public void setShippingEnabled(boolean shippingEnabled) {
        this.shippingEnabled = shippingEnabled;
    }

    public BigDecimal getExpressShippingSurcharge() {
        return expressShippingSurcharge;
    }

    public void setExpressShippingSurcharge(BigDecimal expressShippingSurcharge) {
        this.expressShippingSurcharge = expressShippingSurcharge;
    }

    public String getDeliveryRegionsJson() {
        return deliveryRegionsJson;
    }

    public void setDeliveryRegionsJson(String deliveryRegionsJson) {
        this.deliveryRegionsJson = deliveryRegionsJson;
    }

    public String getEstimatedDeliveryTime() {
        return estimatedDeliveryTime;
    }

    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) {
        this.estimatedDeliveryTime = estimatedDeliveryTime;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }

    public String getTaxRulesJson() {
        return taxRulesJson;
    }

    public void setTaxRulesJson(String taxRulesJson) {
        this.taxRulesJson = taxRulesJson;
    }

    public Integer getStockThreshold() {
        return stockThreshold;
    }

    public void setStockThreshold(Integer stockThreshold) {
        this.stockThreshold = stockThreshold;
    }

    public boolean isLowStockAlertEnabled() {
        return lowStockAlertEnabled;
    }

    public void setLowStockAlertEnabled(boolean lowStockAlertEnabled) {
        this.lowStockAlertEnabled = lowStockAlertEnabled;
    }

    public boolean isReviewsEnabled() {
        return reviewsEnabled;
    }

    public void setReviewsEnabled(boolean reviewsEnabled) {
        this.reviewsEnabled = reviewsEnabled;
    }

    public boolean isNotifyNewOrders() {
        return notifyNewOrders;
    }

    public void setNotifyNewOrders(boolean notifyNewOrders) {
        this.notifyNewOrders = notifyNewOrders;
    }

    public boolean isNotifyLowStock() {
        return notifyLowStock;
    }

    public void setNotifyLowStock(boolean notifyLowStock) {
        this.notifyLowStock = notifyLowStock;
    }

    public boolean isNotifyNewUsers() {
        return notifyNewUsers;
    }

    public void setNotifyNewUsers(boolean notifyNewUsers) {
        this.notifyNewUsers = notifyNewUsers;
    }

    public Integer getPasswordMinLength() {
        return passwordMinLength;
    }

    public void setPasswordMinLength(Integer passwordMinLength) {
        this.passwordMinLength = passwordMinLength;
    }

    public boolean isPasswordRequireUppercase() {
        return passwordRequireUppercase;
    }

    public void setPasswordRequireUppercase(boolean passwordRequireUppercase) {
        this.passwordRequireUppercase = passwordRequireUppercase;
    }

    public boolean isPasswordRequireNumber() {
        return passwordRequireNumber;
    }

    public void setPasswordRequireNumber(boolean passwordRequireNumber) {
        this.passwordRequireNumber = passwordRequireNumber;
    }

    public boolean isPasswordRequireSpecial() {
        return passwordRequireSpecial;
    }

    public void setPasswordRequireSpecial(boolean passwordRequireSpecial) {
        this.passwordRequireSpecial = passwordRequireSpecial;
    }

    public Integer getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(Integer sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public Integer getMaxLoginAttempts() {
        return maxLoginAttempts;
    }

    public void setMaxLoginAttempts(Integer maxLoginAttempts) {
        this.maxLoginAttempts = maxLoginAttempts;
    }

    public Integer getJwtExpirationMinutes() {
        return jwtExpirationMinutes;
    }

    public void setJwtExpirationMinutes(Integer jwtExpirationMinutes) {
        this.jwtExpirationMinutes = jwtExpirationMinutes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
