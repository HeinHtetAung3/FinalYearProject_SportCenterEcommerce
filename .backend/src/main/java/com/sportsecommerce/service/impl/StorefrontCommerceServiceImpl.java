package com.sportsecommerce.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsecommerce.dto.AdminSettingsDtos;
import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.entity.SystemSettingsEntity;
import com.sportsecommerce.service.StorefrontCommerceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StorefrontCommerceServiceImpl implements StorefrontCommerceService {

    private final CachedSystemSettingsProvider settingsProvider;
    private final ObjectMapper objectMapper;

    public StorefrontCommerceServiceImpl(
            CachedSystemSettingsProvider settingsProvider,
            ObjectMapper objectMapper
    ) {
        this.settingsProvider = settingsProvider;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public StorefrontDtos.CommerceCheckoutConfigResponse getCheckoutConfig() {
        SystemSettingsEntity s = settingsProvider.requireSettings();
        boolean stripeReady = stripeReady(s);
        String pk = s.getStripePublicKey();
        String publishable = s.isPaymentStripeEnabled() && stripeReady ? pk : null;

        List<String> regions = readRegions(s.getDeliveryRegionsJson());
        List<AdminSettingsDtos.RegionTaxRule> taxRules = readTaxRules(s.getTaxRulesJson());
        List<StorefrontDtos.CommerceTaxRule> tax = taxRules.stream()
                .map(r -> new StorefrontDtos.CommerceTaxRule(r.region(), r.taxRatePercent()))
                .toList();

        return new StorefrontDtos.CommerceCheckoutConfigResponse(
                new StorefrontDtos.CommercePaymentOptions(
                        s.isPaymentCreditCardEnabled(),
                        s.isPaymentCodEnabled(),
                        s.isPaymentStripeEnabled(),
                        publishable
                ),
                new StorefrontDtos.CommerceShippingOptions(
                        s.isShippingEnabled(),
                        s.getShippingFee(),
                        s.getFreeShippingThreshold(),
                        s.getExpressShippingSurcharge(),
                        regions,
                        s.getEstimatedDeliveryTime()
                ),
                new StorefrontDtos.CommerceTaxOptions(s.getTaxRate(), tax),
                s.isReviewsEnabled()
        );
    }

    private static boolean stripeReady(SystemSettingsEntity entity) {
        String pk = entity.getStripePublicKey();
        boolean pkOk = pk != null && !pk.isBlank()
                && (pk.startsWith("pk_test_") || pk.startsWith("pk_live_"));
        boolean secretOk = entity.getStripeSecretEncrypted() != null && !entity.getStripeSecretEncrypted().isBlank();
        return entity.isPaymentStripeEnabled() && pkOk && secretOk;
    }

    private List<String> readRegions(String json) {
        if (json == null || json.isBlank()) {
            return List.of("United States");
        }
        try {
            List<String> parsed = objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
            if (parsed == null) {
                return List.of("United States");
            }
            List<String> cleaned = parsed.stream()
                    .map(s -> s == null ? "" : s.trim())
                    .filter(s -> !s.isEmpty())
                    .toList();
            if (cleaned.isEmpty()) {
                return List.of("United States");
            }
            return cleaned;
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
}
