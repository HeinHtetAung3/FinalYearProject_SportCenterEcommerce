package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.entity.CartEntity;
import com.sportsecommerce.entity.CartItemEntity;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CartJpaRepository;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Persistent per-user cart implementation.
 *
 * <p>Every operation locates (or lazily creates) a {@link CartEntity}
 * tied to the authenticated {@link UserEntity}, so users never share
 * cart state — User A and User B always see strictly their own bag.</p>
 *
 * <p>Cart lines are keyed by {@code (productId, variantSize, variantColor)}
 * to mirror the frontend's variant-aware {@code makeCartLineKey}; absent
 * variants normalise to {@code 0} / {@code ""} per the V7 schema, where
 * those columns are {@code NOT NULL}.</p>
 */
@Service
public class CartServiceImpl implements CartService {

    private static final Integer NO_SIZE = 0;
    private static final String NO_COLOR = "";

    private final CatalogRepository catalogRepository;
    private final CartJpaRepository cartJpaRepository;
    private final UserJpaRepository userJpaRepository;

    public CartServiceImpl(
            CatalogRepository catalogRepository,
            CartJpaRepository cartJpaRepository,
            UserJpaRepository userJpaRepository
    ) {
        this.catalogRepository = catalogRepository;
        this.cartJpaRepository = cartJpaRepository;
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    @Transactional
    public CartDtos.CartResponse getCart(String email) {
        CartEntity cart = ensureCart(email);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartDtos.CartResponse addItem(String email, CartDtos.AddCartItemRequest request) {
        Product product = findProduct(request.productId());
        validateVariant(product, request.size(), request.color());
        CartEntity cart = ensureCart(email);

        Integer sizeKey = normalizeSize(request.size());
        String colorKey = normalizeColor(request.color());

        Optional<CartItemEntity> existing = findLine(cart, request.productId(), sizeKey, colorKey);
        int currentQty = existing.map(CartItemEntity::getQuantity).orElse(0);
        int nextQty = currentQty + request.quantity();
        if (nextQty > product.stock()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Requested quantity exceeds stock");
        }

        if (existing.isPresent()) {
            existing.get().setQuantity(nextQty);
        } else {
            CartItemEntity item = new CartItemEntity();
            item.setCart(cart);
            item.setProductId(request.productId());
            item.setQuantity(request.quantity());
            item.setVariantSize(sizeKey);
            item.setVariantColor(colorKey);
            cart.getItems().add(item);
        }
        cartJpaRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartDtos.CartResponse updateItem(String email, Long productId, CartDtos.UpdateCartItemRequest request) {
        Product product = findProduct(productId);
        validateVariant(product, request.size(), request.color());
        CartEntity cart = ensureCart(email);

        Integer sizeKey = normalizeSize(request.size());
        String colorKey = normalizeColor(request.color());

        CartItemEntity item = findLine(cart, productId, sizeKey, colorKey)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));

        if (request.quantity() > product.stock()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Requested quantity exceeds stock");
        }
        item.setQuantity(request.quantity());
        cartJpaRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartDtos.CartResponse removeItem(String email, Long productId, Integer size, String color) {
        CartEntity cart = ensureCart(email);
        Integer sizeKey = normalizeSize(size);
        String colorKey = normalizeColor(color);

        CartItemEntity item = findLine(cart, productId, sizeKey, colorKey)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));

        cart.getItems().remove(item);
        cartJpaRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public void removeItemsByIds(String email, List<Long> cartItemIds) {
        if (cartItemIds == null || cartItemIds.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No cart items selected");
        }
        CartEntity cart = ensureCart(email);
        Set<Long> requested = new HashSet<>(cartItemIds);
        Set<Long> owned = cart.getItems().stream()
                .map(CartItemEntity::getId)
                .collect(java.util.stream.Collectors.toSet());

        // Reject the whole operation if any requested id does not belong
        // to this user's cart so a malicious caller cannot delete another
        // user's lines via guessed ids.
        for (Long id : requested) {
            if (id == null || !owned.contains(id)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid cart selection");
            }
        }

        cart.getItems().removeIf(item -> requested.contains(item.getId()));
        cartJpaRepository.save(cart);
    }

    @Override
    @Transactional
    public void clear(String email) {
        CartEntity cart = ensureCart(email);
        cart.getItems().clear();
        cartJpaRepository.save(cart);
    }

    private CartEntity ensureCart(String email) {
        UserEntity user = findUser(email);
        return cartJpaRepository.findByUser(user).orElseGet(() -> {
            CartEntity cart = new CartEntity();
            cart.setUser(user);
            return cartJpaRepository.save(cart);
        });
    }

    private UserEntity findUser(String email) {
        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return userJpaRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    private Product findProduct(Long productId) {
        return catalogRepository.findProductById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private static Optional<CartItemEntity> findLine(CartEntity cart, Long productId, Integer sizeKey, String colorKey) {
        return cart.getItems().stream()
                .filter(it -> it.getProductId().equals(productId))
                .filter(it -> sizeKey.equals(normalizeSize(it.getVariantSize())))
                .filter(it -> colorKey.equals(normalizeColor(it.getVariantColor())))
                .findFirst();
    }

    private static Integer normalizeSize(Integer size) {
        return size == null ? NO_SIZE : size;
    }

    private static String normalizeColor(String color) {
        if (color == null) return NO_COLOR;
        String trimmed = color.trim();
        return trimmed.isEmpty() ? NO_COLOR : trimmed;
    }

    private static void validateVariant(Product p, Integer size, String color) {
        if (size != null) {
            List<Integer> sizes = p.sizes();
            if (sizes != null && !sizes.isEmpty() && !sizes.contains(size)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid size for product");
            }
        }
        if (color != null && !color.isBlank()) {
            List<String> colors = p.colors();
            if (colors != null && !colors.isEmpty()) {
                String trimmed = color.trim();
                boolean ok = colors.stream().anyMatch(c -> c.equalsIgnoreCase(trimmed));
                if (!ok) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid color for product");
                }
            }
        }
    }

    private CartDtos.CartResponse buildCartResponse(CartEntity cart) {
        List<CartDtos.CartItemResponse> cartItems = cart.getItems().stream()
                .map(item -> {
                    Product product = findProduct(item.getProductId());
                    BigDecimal subtotal = product.price().multiply(BigDecimal.valueOf(item.getQuantity()));
                    Integer sizeForResponse = NO_SIZE.equals(item.getVariantSize()) ? null : item.getVariantSize();
                    String colorForResponse = NO_COLOR.equals(item.getVariantColor()) ? null : item.getVariantColor();
                    return new CartDtos.CartItemResponse(
                            item.getId(),
                            product.id(),
                            product.name(),
                            product.brand(),
                            product.imageUrl(),
                            product.images(),
                            resolveCategoryName(product.categoryId()),
                            product.price(),
                            item.getQuantity(),
                            product.stock(),
                            subtotal,
                            sizeForResponse,
                            colorForResponse
                    );
                })
                .toList();

        BigDecimal total = cartItems.stream()
                .map(CartDtos.CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int count = cartItems.stream().mapToInt(CartDtos.CartItemResponse::quantity).sum();

        return new CartDtos.CartResponse(cartItems, count, total);
    }

    /**
     * Best-effort lookup of the human-readable category name for a product.
     * Returns {@code null} when the product has no category or the
     * category was deleted; callers treat absent values as "unknown".
     */
    private String resolveCategoryName(Long categoryId) {
        if (categoryId == null) return null;
        return catalogRepository.findCategoryById(categoryId)
                .map(c -> c.name())
                .orElse(null);
    }
}
