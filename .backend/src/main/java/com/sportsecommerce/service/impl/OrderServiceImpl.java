package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.entity.OrderEntity;
import com.sportsecommerce.entity.OrderItemEntity;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.OrderJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.service.CartService;
import com.sportsecommerce.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Set<String> ALLOWED_ORDER_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"
    );

    private final CartService cartService;
    private final UserJpaRepository userJpaRepository;
    private final OrderJpaRepository orderJpaRepository;

    public OrderServiceImpl(
            CartService cartService,
            UserJpaRepository userJpaRepository,
            OrderJpaRepository orderJpaRepository
    ) {
        this.cartService = cartService;
        this.userJpaRepository = userJpaRepository;
        this.orderJpaRepository = orderJpaRepository;
    }

    @Override
    @Transactional
    public CommerceDtos.OrderResponse create(String email, CommerceDtos.CreateOrderRequest request) {
        UserEntity user = findUser(email);
        CartDtos.CartResponse cart = cartService.getCart(user.getEmail());
        if (cart.items().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot checkout with an empty cart");
        }

        // Selective checkout: build the order from only the cart lines
        // the customer ticked. Every requested id must still be present
        // in the cart so the user gets a clear error if the bag changed
        // in another tab between the page load and submit.
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

        BigDecimal total = selected.stream()
                .map(CartDtos.CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setShippingAddress(request.shippingAddress());
        order.setPaymentMethod(request.paymentMethod());
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
            return entity;
        }).toList();
        order.setItems(items);

        OrderEntity saved = orderJpaRepository.save(order);
        // Only the purchased lines leave the cart; anything the user
        // left unticked stays for a later checkout.
        cartService.removeItemsByIds(user.getEmail(), requestedIds);
        return toResponse(saved);
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
