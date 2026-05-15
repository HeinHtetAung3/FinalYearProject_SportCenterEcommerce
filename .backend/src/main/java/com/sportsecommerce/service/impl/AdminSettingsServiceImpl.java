package com.sportsecommerce.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsecommerce.dto.AdminSettingsDtos;
import com.sportsecommerce.entity.SystemSettingsEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.SystemSettingsJpaRepository;
import com.sportsecommerce.service.AdminSettingsService;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminSettingsServiceImpl implements AdminSettingsService {

    private static final Long SETTINGS_ID = 1L;

    private final SystemSettingsJpaRepository repository;
    private final ObjectMapper objectMapper;
    private final SystemSettingsCryptoService cryptoService;
    private final CacheManager cacheManager;

    public AdminSettingsServiceImpl(
            SystemSettingsJpaRepository repository,
            ObjectMapper objectMapper,
            SystemSettingsCryptoService cryptoService,
            CacheManager cacheManager
    ) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.cryptoService = cryptoService;
        this.cacheManager = cacheManager;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSettingsDtos.SystemSettingsResponse getSettings() {
        return toResponse(loadOrCreateSettings());
    }

    @Override
    @Transactional
    public AdminSettingsDtos.SystemSettingsResponse updateSettings(AdminSettingsDtos.UpdateSystemSettingsRequest request) {
        SystemSettingsEntity entity = loadOrCreateSettings();
        validateShipping(request.shipping());
        validatePaymentModes(request.payments(), request.payments().stripeSecretKey(), entity);
        validateStripe(request.payments(), entity);
        apply(entity, request);
        SystemSettingsEntity saved = repository.save(entity);
        invalidateSettingsCache();
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AdminSettingsDtos.SystemSettingsResponse updatePayments(AdminSettingsDtos.PaymentSettingsUpdateRequest request) {
        SystemSettingsEntity entity = loadOrCreateSettings();
        validatePaymentModes(request, request.stripeSecretKey(), entity);
        validateStripe(request, entity);
        applyPayments(entity, request);
        SystemSettingsEntity saved = repository.save(entity);
        invalidateSettingsCache();
        return toResponse(saved);
    }

    @Override
    @Transactional
    public AdminSettingsDtos.SystemSettingsResponse resetToDefaults() {
        SystemSettingsEntity current = loadOrCreateSettings();
        Instant createdAt = current.getCreatedAt();
        SystemSettingsEntity fresh = defaultSettings();
        fresh.setId(SETTINGS_ID);
        if (createdAt != null) {
            fresh.setCreatedAt(createdAt);
        }
        SystemSettingsEntity saved = repository.save(fresh);
        invalidateSettingsCache();
        return toResponse(saved);
    }

    private void invalidateSettingsCache() {
        var cache = cacheManager.getCache("systemSettings");
        if (cache != null) {
            cache.invalidate();
        }
    }

    private void validateShipping(AdminSettingsDtos.ShippingSettings shipping) {
        if (shipping.freeShippingThreshold().compareTo(shipping.flatShippingFee()) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Free shipping threshold cannot be lower than flat shipping fee");
        }
    }

    private void validatePaymentModes(
            AdminSettingsDtos.PaymentSettingsUpdateRequest payments,
            String incomingSecret,
            SystemSettingsEntity current
    ) {
        boolean stripeReady = stripeReadyAfterApply(payments, incomingSecret, current);
        boolean any = payments.creditCardEnabled()
                || payments.cashOnDeliveryEnabled()
                || (payments.stripeEnabled() && stripeReady);
        if (!any) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one usable payment method must remain enabled");
        }
    }

    private void validateStripe(
            AdminSettingsDtos.PaymentSettingsUpdateRequest payments,
            SystemSettingsEntity entityBeforeApply
    ) {
        if (!payments.stripeEnabled()) {
            return;
        }
        String pk = payments.stripePublicKey();
        if (pk == null || pk.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Stripe public key is required when Stripe is enabled");
        }
        if (!stripePublicKeyLooksValid(pk)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Stripe public key must start with pk_test_ or pk_live_");
        }
        boolean secretIncoming = payments.stripeSecretKey() != null && !payments.stripeSecretKey().isBlank();
        boolean secretStored = entityBeforeApply.getStripeSecretEncrypted() != null
                && !entityBeforeApply.getStripeSecretEncrypted().isBlank();
        if (!secretIncoming && !secretStored) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Stripe secret key must be configured when Stripe is enabled");
        }
        if (secretIncoming && !stripeSecretKeyLooksValid(payments.stripeSecretKey())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Stripe secret key must start with sk_test_ or sk_live_");
        }
    }

    private boolean stripeReadyAfterApply(
            AdminSettingsDtos.PaymentSettingsUpdateRequest payments,
            String incomingSecret,
            SystemSettingsEntity current
    ) {
        if (!payments.stripeEnabled()) {
            return false;
        }
        String pk = payments.stripePublicKey();
        if (!stripePublicKeyLooksValid(pk)) {
            return false;
        }
        boolean secretOk = (incomingSecret != null && !incomingSecret.isBlank())
                || (current.getStripeSecretEncrypted() != null && !current.getStripeSecretEncrypted().isBlank());
        return secretOk;
    }

    private static boolean stripePublicKeyLooksValid(String pk) {
        if (pk == null || pk.isBlank()) {
            return false;
        }
        String t = pk.trim();
        return t.startsWith("pk_test_") || t.startsWith("pk_live_");
    }

    private static boolean stripeSecretKeyLooksValid(String sk) {
        String t = sk.trim();
        return t.startsWith("sk_test_") || t.startsWith("sk_live_");
    }

    private void apply(SystemSettingsEntity entity, AdminSettingsDtos.UpdateSystemSettingsRequest request) {
        AdminSettingsDtos.GeneralSettings general = request.general();
        AdminSettingsDtos.PaymentSettingsUpdateRequest payments = request.payments();
        AdminSettingsDtos.ShippingSettings shipping = request.shipping();
        AdminSettingsDtos.TaxSettings tax = request.tax();
        AdminSettingsDtos.ProductSettings product = request.product();
        AdminSettingsDtos.NotificationSettings notifications = request.notifications();
        AdminSettingsDtos.SecuritySettings security = request.security();

        entity.setStoreName(general.storeName().trim());
        entity.setLogoUrl(blankToNull(general.logoUrl()));
        entity.setContactEmail(general.contactEmail().trim().toLowerCase());
        entity.setDefaultCurrency(general.defaultCurrency().trim().toUpperCase());
        entity.setDefaultLanguage(general.defaultLanguage().trim().toLowerCase());

        applyPayments(entity, payments);

        entity.setShippingEnabled(shipping.shippingEnabled());
        entity.setShippingFee(scaleMoney(shipping.flatShippingFee()));
        entity.setFreeShippingThreshold(scaleMoney(shipping.freeShippingThreshold()));
        entity.setExpressShippingSurcharge(scaleMoney(shipping.expressShippingSurcharge()));
        entity.setDeliveryRegionsJson(writeJson(normalizeRegions(shipping.deliveryRegions())));
        entity.setEstimatedDeliveryTime(shipping.estimatedDeliveryTime().trim());

        entity.setTaxRate(scalePercent(tax.taxRatePercent()));
        entity.setTaxRulesJson(writeJson(normalizeTaxRules(tax.regionTaxRules())));

        entity.setStockThreshold(product.defaultStockThreshold());
        entity.setLowStockAlertEnabled(product.lowStockAlertsEnabled());
        entity.setReviewsEnabled(product.reviewsEnabled());

        entity.setNotifyNewOrders(notifications.alertNewOrders());
        entity.setNotifyLowStock(notifications.alertLowStock());
        entity.setNotifyNewUsers(notifications.alertNewUserRegistration());

        entity.setPasswordMinLength(security.passwordMinLength());
        entity.setPasswordRequireUppercase(security.passwordRequireUppercase());
        entity.setPasswordRequireNumber(security.passwordRequireNumber());
        entity.setPasswordRequireSpecial(security.passwordRequireSpecialCharacter());
        entity.setSessionTimeoutMinutes(security.sessionTimeoutMinutes());
        entity.setMaxLoginAttempts(security.maxLoginAttempts());
        entity.setJwtExpirationMinutes(security.jwtExpirationMinutes());
    }

    private void applyPayments(SystemSettingsEntity entity, AdminSettingsDtos.PaymentSettingsUpdateRequest payments) {
        entity.setPaymentCreditCardEnabled(payments.creditCardEnabled());
        entity.setPaymentCodEnabled(payments.cashOnDeliveryEnabled());
        entity.setPaymentStripeEnabled(payments.stripeEnabled());
        entity.setStripePublicKey(blankToNull(payments.stripePublicKey()));
        if (payments.stripeSecretKey() != null && !payments.stripeSecretKey().isBlank()) {
            entity.setStripeSecretEncrypted(cryptoService.encrypt(payments.stripeSecretKey().trim()));
        }
    }

    private AdminSettingsDtos.SystemSettingsResponse toResponse(SystemSettingsEntity entity) {
        boolean stripeSecretConfigured = entity.getStripeSecretEncrypted() != null
                && !entity.getStripeSecretEncrypted().isBlank();
        boolean stripeReady = entity.isPaymentStripeEnabled()
                && stripePublicKeyLooksValid(entity.getStripePublicKey())
                && stripeSecretConfigured;
        return new AdminSettingsDtos.SystemSettingsResponse(
                new AdminSettingsDtos.GeneralSettings(
                        entity.getStoreName(),
                        entity.getLogoUrl(),
                        entity.getContactEmail(),
                        entity.getDefaultCurrency(),
                        entity.getDefaultLanguage()
                ),
                new AdminSettingsDtos.PaymentSettingsResponse(
                        entity.isPaymentCreditCardEnabled(),
                        entity.isPaymentCodEnabled(),
                        entity.isPaymentStripeEnabled(),
                        entity.getStripePublicKey(),
                        stripeSecretConfigured,
                        stripeReady
                ),
                new AdminSettingsDtos.ShippingSettings(
                        entity.isShippingEnabled(),
                        entity.getShippingFee(),
                        entity.getFreeShippingThreshold(),
                        entity.getExpressShippingSurcharge(),
                        readRegions(entity.getDeliveryRegionsJson()),
                        entity.getEstimatedDeliveryTime()
                ),
                new AdminSettingsDtos.TaxSettings(
                        entity.getTaxRate(),
                        readTaxRules(entity.getTaxRulesJson())
                ),
                new AdminSettingsDtos.ProductSettings(
                        entity.getStockThreshold(),
                        entity.isLowStockAlertEnabled(),
                        entity.isReviewsEnabled()
                ),
                new AdminSettingsDtos.NotificationSettings(
                        entity.isNotifyNewOrders(),
                        entity.isNotifyLowStock(),
                        entity.isNotifyNewUsers()
                ),
                new AdminSettingsDtos.SecuritySettings(
                        entity.getPasswordMinLength(),
                        entity.isPasswordRequireUppercase(),
                        entity.isPasswordRequireNumber(),
                        entity.isPasswordRequireSpecial(),
                        entity.getSessionTimeoutMinutes(),
                        entity.getMaxLoginAttempts(),
                        entity.getJwtExpirationMinutes()
                )
        );
    }

    private SystemSettingsEntity loadOrCreateSettings() {
        return repository.findById(SETTINGS_ID).orElseGet(this::createDefaultSettings);
    }

    private SystemSettingsEntity createDefaultSettings() {
        SystemSettingsEntity defaults = defaultSettings();
        SystemSettingsEntity saved = repository.save(defaults);
        invalidateSettingsCache();
        return saved;
    }

    private SystemSettingsEntity defaultSettings() {
        SystemSettingsEntity entity = new SystemSettingsEntity();
        entity.setId(SETTINGS_ID);
        entity.setStoreName("Sports Hub");
        entity.setContactEmail("admin@sportshub.local");
        entity.setDefaultCurrency("USD");
        entity.setDefaultLanguage("en");
        entity.setPaymentCreditCardEnabled(true);
        entity.setPaymentCodEnabled(true);
        entity.setPaymentStripeEnabled(false);
        entity.setShippingEnabled(true);
        entity.setShippingFee(new BigDecimal("8.99"));
        entity.setFreeShippingThreshold(new BigDecimal("80.00"));
        entity.setExpressShippingSurcharge(new BigDecimal("12.99"));
        entity.setDeliveryRegionsJson(writeJson(List.of("United States")));
        entity.setEstimatedDeliveryTime("3-5 business days");
        entity.setTaxRate(new BigDecimal("7.00"));
        entity.setTaxRulesJson(writeJson(List.of()));
        entity.setStockThreshold(10);
        entity.setLowStockAlertEnabled(true);
        entity.setReviewsEnabled(true);
        entity.setNotifyNewOrders(true);
        entity.setNotifyLowStock(true);
        entity.setNotifyNewUsers(true);
        entity.setPasswordMinLength(8);
        entity.setPasswordRequireUppercase(true);
        entity.setPasswordRequireNumber(true);
        entity.setPasswordRequireSpecial(false);
        entity.setSessionTimeoutMinutes(30);
        entity.setMaxLoginAttempts(5);
        entity.setJwtExpirationMinutes(15);
        return entity;
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private static BigDecimal scaleMoney(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal scalePercent(BigDecimal percent) {
        return percent.setScale(2, RoundingMode.HALF_UP);
    }

    private List<String> normalizeRegions(List<String> regions) {
        List<String> out = new ArrayList<>();
        for (String region : regions) {
            if (region == null) {
                continue;
            }
            String trimmed = region.trim();
            if (!trimmed.isEmpty()) {
                out.add(trimmed);
            }
        }
        if (out.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one delivery region is required");
        }
        return out;
    }

    private List<AdminSettingsDtos.RegionTaxRule> normalizeTaxRules(List<AdminSettingsDtos.RegionTaxRule> rules) {
        if (rules == null || rules.isEmpty()) {
            return List.of();
        }
        return rules.stream()
                .map(rule -> new AdminSettingsDtos.RegionTaxRule(rule.region().trim(), scalePercent(rule.taxRatePercent())))
                .toList();
    }

    private List<String> readRegions(String json) {
        if (json == null || json.isBlank()) {
            return List.of("United States");
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException ex) {
            return List.of("United States");
        }
    }

    private List<AdminSettingsDtos.RegionTaxRule> readTaxRules(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException ex) {
            return List.of();
        }
    }

    private String writeJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize system settings");
        }
    }
}
