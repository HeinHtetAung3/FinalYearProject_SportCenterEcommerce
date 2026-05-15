package com.sportsecommerce.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsecommerce.dto.AdminSettingsDtos;
import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.entity.OrderEntity;
import com.sportsecommerce.entity.OrderItemEntity;
import com.sportsecommerce.entity.SystemSettingsEntity;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.repository.OrderJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.service.CartService;
import com.sportsecommerce.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Set<String> ALLOWED_ORDER_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"
    );

    private final CartService cartService;
    private final CatalogRepository catalogRepository;
    private final UserJpaRepository userJpaRepository;
    private final OrderJpaRepository orderJpaRepository;
    private final CachedSystemSettingsProvider systemSettingsProvider;
    private final ObjectMapper objectMapper;

    public OrderServiceImpl(
            CartService cartService,
            CatalogRepository catalogRepository,
            UserJpaRepository userJpaRepository,
            OrderJpaRepository orderJpaRepository,
            CachedSystemSettingsProvider systemSettingsProvider,
            ObjectMapper objectMapper
    ) {
        this.cartService = cartService;
        this.catalogRepository = catalogRepository;
        this.userJpaRepository = userJpaRepository;
        this.orderJpaRepository = orderJpaRepository;
        this.systemSettingsProvider = systemSettingsProvider;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public CommerceDtos.OrderResponse create(String email, CommerceDtos.CreateOrderRequest request) {
        UserEntity user = findUser(email);
        SystemSettingsEntity settings = systemSettingsProvider.requireSettings();

        if (!settings.isShippingEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Shipping and delivery are temporarily unavailable");
        }

        CartDtos.CartResponse cart = cartService.getCart(user.getEmail());
        if (cart.items().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot checkout with an empty cart");
        }

        List<Long> requestedIds = request.cartItemIds();
        if (requestedIds == null || requestedIds.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No cart items selected");
        }
        Set<Long> requested = new HashSet<>(requestedIds);
        List<CartDtos.CartItemResponse> selected = cart.items().stream()
                .filter(i -> requested.contains(i.id()))
                .toList();
        if (selected.size() != requested.size()) {
            throw new ApiException(HttpStatus.NOT_FOUND,
                    "Selected cart items are no longer in your bag");
        }

        for (CartDtos.CartItemResponse line : selected) {
            Product p = catalogRepository.findProductById(line.productId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                            "One or more products are no longer available"));
            if (!p.storefrontVisible()) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "One or more products are no longer available");
            }
        }

        BigDecimal subtotal = selected.stream()
                .map(CartDtos.CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String shippingSpeed = normalizeShippingSpeed(request.shippingSpeedId());
        assertAddressMatchesDeliveryRegions(settings, request.shippingAddress());

        String normalizedPayment = normalizePaymentMethod(request.paymentMethod());
        assertPaymentMethodAllowed(settings, normalizedPayment);

        BigDecimal shippingAmount = computeShippingCost(settings, subtotal, shippingSpeed);
        BigDecimal taxPercent = resolveTaxPercent(settings, request.shippingAddress());
        BigDecimal taxableBase = subtotal.add(shippingAmount);
        BigDecimal taxAmount = taxableBase.multiply(taxPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(shippingAmount).add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setShippingAddress(request.shippingAddress());
        order.setPaymentMethod(normalizedPayment);
        order.setTotalAmount(total);

        List<OrderItemEntity> items = selected.stream().map(i -> {
            OrderItemEntity entity = new OrderItemEntity();
            entity.setOrder(order);
            entity.setProductId(i.productId());
            entity.setProductNameSnapshot(i.productName());
            entity.setUnitPriceSnapshot(i.unitPrice());
            entity.setQuantity(i.quantity());
            entity.setVariantSize(i.size());
            entity.setVariantColor(i.color());
            entity.setProductImageUrlSnapshot(primaryImageFromCartLine(i));
            return entity;
        }).toList();
        order.setItems(items);

        OrderEntity saved = orderJpaRepository.save(order);
        cartService.removeItemsByIds(user.getEmail(), requestedIds);
        return toResponse(saved);
    }

    private static String normalizeShippingSpeed(String shippingSpeedId) {
        if (shippingSpeedId == null || shippingSpeedId.isBlank()) {
            return "standard";
        }
        String s = shippingSpeedId.trim().toLowerCase(Locale.ROOT);
        if (!"standard".equals(s) && !"express".equals(s)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported shipping option");
        }
        return s;
    }

    private static String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment method is required");
        }
        String raw = paymentMethod.trim().toUpperCase(Locale.ROOT);
        if ("WALLET".equals(raw)) {
            return "STRIPE";
        }
        return raw;
    }

    private void assertPaymentMethodAllowed(SystemSettingsEntity settings, String normalizedPayment) {
        switch (normalizedPayment) {
            case "CARD" -> {
                if (!settings.isPaymentCreditCardEnabled()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Card payments are not available");
                }
            }
            case "COD" -> {
                if (!settings.isPaymentCodEnabled()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Cash on delivery is not available");
                }
            }
            case "STRIPE" -> {
                if (!settings.isPaymentStripeEnabled() || !stripeFullyConfigured(settings)) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Stripe payments are not available");
                }
            }
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported payment method");
        }
    }

    private static boolean stripeFullyConfigured(SystemSettingsEntity settings) {
        String pk = settings.getStripePublicKey();
        boolean pkOk = pk != null && !pk.isBlank()
                && (pk.trim().startsWith("pk_test_") || pk.trim().startsWith("pk_live_"));
        boolean secretOk = settings.getStripeSecretEncrypted() != null
                && !settings.getStripeSecretEncrypted().isBlank();
        return pkOk && secretOk;
    }

    private void assertAddressMatchesDeliveryRegions(SystemSettingsEntity settings, String address) {
        if (!settings.isShippingEnabled()) {
            return;
        }
        String addr = normalizeAddressForRegionMatch(address);
        List<String> regions = readRegions(settings.getDeliveryRegionsJson());
        if (regions.stream().anyMatch(OrderServiceImpl::isWorldwideRegion)) {
            return;
        }
        boolean ok = regions.stream().anyMatch(r -> addressMatchesConfiguredRegion(addr, r));
        if (!ok) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Delivery address is not within supported regions");
        }
    }

    private static boolean isWorldwideRegion(String region) {
        if (region == null) {
            return false;
        }
        String s = region.trim().toLowerCase(Locale.ROOT);
        return s.equals("worldwide")
                || s.equals("global")
                || s.equals("all countries")
                || s.equals("international");
    }

    /**
     * Matches a single configured region keyword against the free-text shipping address.
     * Short tokens (e.g. {@code US}) use word boundaries to avoid accidental substring hits.
     * When the store ships to the United States, common country spellings are accepted.
     */
    private static boolean addressMatchesConfiguredRegion(String addrLower, String region) {
        if (region == null) {
            return false;
        }
        String r = region.trim().toLowerCase(Locale.ROOT);
        if (r.isEmpty()) {
            return false;
        }
        if (matchesUnitedStatesFamily(r) && addressAppearsUnitedStates(addrLower)) {
            return true;
        }
        if (r.length() >= 5 || r.indexOf(' ') >= 0) {
            return addrLower.contains(r);
        }
        return Pattern.compile("\\b" + Pattern.quote(r) + "\\b", Pattern.CASE_INSENSITIVE).matcher(addrLower).find();
    }

    private static boolean matchesUnitedStatesFamily(String regionLower) {
        return regionLower.equals("united states")
                || regionLower.equals("united states of america")
                || regionLower.equals("usa")
                || regionLower.equals("us");
    }

    private static boolean addressAppearsUnitedStates(String addrLower) {
        if (addrLower.contains("united states")) {
            return true;
        }
        if (addrLower.contains("united states of america")) {
            return true;
        }
        if (Pattern.compile("\\busa\\b").matcher(addrLower).find()) {
            return true;
        }
        if (Pattern.compile("\\bus\\b").matcher(addrLower).find()) {
            return true;
        }
        if (Pattern.compile("\\bu\\.s\\.a\\.?\\b").matcher(addrLower).find()) {
            return true;
        }
        return Pattern.compile("\\bu\\.s\\.\\b").matcher(addrLower).find();
    }

    private static String normalizeAddressForRegionMatch(String raw) {
        if (raw == null) {
            return "";
        }
        String n = Normalizer.normalize(raw, Normalizer.Form.NFKC);
        n = n.replace('\u00A0', ' ').replace('\uFEFF', ' ');
        return n.toLowerCase(Locale.ROOT).trim();
    }

    private BigDecimal computeShippingCost(SystemSettingsEntity settings, BigDecimal subtotal, String shippingSpeed) {
        if (!settings.isShippingEnabled()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal base = subtotal.compareTo(settings.getFreeShippingThreshold()) >= 0
                ? BigDecimal.ZERO
                : settings.getShippingFee();
        BigDecimal express = settings.getExpressShippingSurcharge() != null
                ? settings.getExpressShippingSurcharge()
                : new BigDecimal("12.99");
        if ("express".equals(shippingSpeed)) {
            base = base.add(express);
        }
        return base.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveTaxPercent(SystemSettingsEntity settings, String address) {
        String addr = address.toLowerCase(Locale.ROOT);
        for (AdminSettingsDtos.RegionTaxRule rule : readTaxRules(settings.getTaxRulesJson())) {
            if (addr.contains(rule.region().toLowerCase(Locale.ROOT))) {
                return rule.taxRatePercent();
            }
        }
        return settings.getTaxRate();
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
            // Empty JSON array [] used to make every checkout fail; fall back like storefront config.
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

    @Override
    public List<CommerceDtos.OrderResponse> listByUser(String email) {
        UserEntity user = findUser(email);
        return orderJpaRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CommerceDtos.OrderResponse getById(Long orderId) {
        OrderEntity order = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        return toResponse(order);
    }

    @Override
    public CommerceDtos.OrderResponse getByIdForUser(String email, Long orderId) {
        UserEntity user = findUser(email);
        OrderEntity order = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return toResponse(order);
    }

    @Override
    @Transactional
    public CommerceDtos.OrderResponse cancel(String email, Long orderId) {
        UserEntity user = findUser(email);
        OrderEntity current = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!current.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        String status = current.getStatus();
        boolean pendingOrLegacyPlaced =
                "PENDING".equals(status)
                        || (status != null && "PLACED".equalsIgnoreCase(status));
        if (!pendingOrLegacyPlaced) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending orders can be cancelled");
        }
        current.setStatus("CANCELLED");
        return toResponse(current);
    }

    @Override
    public List<CommerceDtos.OrderResponse> listAll() {
        return orderJpaRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CommerceDtos.OrderResponse updateStatus(Long orderId, String status) {
        if (status == null || status.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ORDER_STATUSES.contains(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported order status: " + normalized);
        }
        OrderEntity order = orderJpaRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(normalized);
        return toResponse(order);
    }

    /**
     * Matches cart / catalog semantics: prefer explicit {@code imageUrl}, else first non-blank gallery path.
     */
    private static String primaryImageFromCartLine(CartDtos.CartItemResponse line) {
        if (line.imageUrl() != null && !line.imageUrl().isBlank()) {
            return line.imageUrl().trim();
        }
        if (line.images() == null || line.images().isEmpty()) {
            return null;
        }
        for (String s : line.images()) {
            if (s != null && !s.isBlank()) {
                return s.trim();
            }
        }
        return null;
    }

    private UserEntity findUser(String email) {
        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return userJpaRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    private CommerceDtos.OrderResponse toResponse(OrderEntity order) {
        return new CommerceDtos.OrderResponse(
                order.getId(),
                order.getUser().getEmail(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getPaymentMethod(),
                order.getCreatedAt(),
                order.getItems().stream()
                        .map(item -> new CommerceDtos.OrderItemResponse(
                                item.getProductId(),
                                item.getProductNameSnapshot(),
                                item.getUnitPriceSnapshot(),
                                item.getQuantity(),
                                item.getUnitPriceSnapshot().multiply(java.math.BigDecimal.valueOf(item.getQuantity())),
                                item.getVariantSize(),
                                item.getVariantColor(),
                                item.getProductImageUrlSnapshot()
                        )).toList(),
                order.getTotalAmount()
        );
    }
}
