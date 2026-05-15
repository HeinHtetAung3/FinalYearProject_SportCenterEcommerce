package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.entity.WishlistEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.repository.WishlistJpaRepository;
import com.sportsecommerce.service.CartService;
import com.sportsecommerce.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final CatalogRepository catalogRepository;
    private final CartService cartService;
    private final UserJpaRepository userJpaRepository;
    private final WishlistJpaRepository wishlistJpaRepository;

    public WishlistServiceImpl(
            CatalogRepository catalogRepository,
            CartService cartService,
            UserJpaRepository userJpaRepository,
            WishlistJpaRepository wishlistJpaRepository) {
        this.catalogRepository = catalogRepository;
        this.cartService = cartService;
        this.userJpaRepository = userJpaRepository;
        this.wishlistJpaRepository = wishlistJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CommerceDtos.WishlistResponse get(String email) {
        UserEntity user = findUser(email);
        return buildResponse(user);
    }

    @Override
    @Transactional
    public CommerceDtos.WishlistResponse add(String email, CommerceDtos.AddWishlistItemRequest request) {
        UserEntity user = findUser(email);
        requireStorefrontProduct(request.productId());
        if (wishlistJpaRepository.findByUserAndProductId(user, request.productId()).isEmpty()) {
            WishlistEntity row = new WishlistEntity();
            row.setUser(user);
            row.setProductId(request.productId());
            wishlistJpaRepository.save(row);
        }
        return buildResponse(user);
    }

    @Override
    @Transactional
    public CommerceDtos.WishlistResponse remove(String email, Long productId) {
        UserEntity user = findUser(email);
        wishlistJpaRepository.deleteByUserAndProductId(user, productId);
        return buildResponse(user);
    }

    @Override
    @Transactional
    public CommerceDtos.WishlistResponse moveToCart(String email, Long productId) {
        UserEntity user = findUser(email);
        Product product = requireStorefrontProduct(productId);
        wishlistJpaRepository.deleteByUserAndProductId(user, productId);
        cartService.addItem(email, new CartDtos.AddCartItemRequest(product.id(), 1, null, null));
        return buildResponse(user);
    }

    @Override
    @Transactional
    public CommerceDtos.WishlistToggleResponse toggle(String email, Long productId) {
        UserEntity user = findUser(email);
        requireStorefrontProduct(productId);
        Optional<WishlistEntity> existing = wishlistJpaRepository.findByUserAndProductId(user, productId);
        if (existing.isPresent()) {
            wishlistJpaRepository.delete(existing.get());
            return new CommerceDtos.WishlistToggleResponse(false, wishlistJpaRepository.countByUser(user));
        }
        WishlistEntity row = new WishlistEntity();
        row.setUser(user);
        row.setProductId(productId);
        wishlistJpaRepository.save(row);
        return new CommerceDtos.WishlistToggleResponse(true, wishlistJpaRepository.countByUser(user));
    }

    private CommerceDtos.WishlistResponse buildResponse(UserEntity user) {
        List<CommerceDtos.WishlistItemResponse> items = wishlistJpaRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(row -> catalogRepository.findProductById(row.getProductId()).orElse(null))
                .filter(p -> p != null && p.storefrontVisible())
                .map(product -> new CommerceDtos.WishlistItemResponse(
                        product.id(),
                        product.name(),
                        product.price(),
                        product.stock(),
                        product.imageUrl()
                ))
                .sorted(Comparator.comparing(CommerceDtos.WishlistItemResponse::productName, String.CASE_INSENSITIVE_ORDER))
                .toList();
        return new CommerceDtos.WishlistResponse(items, items.size());
    }

    private UserEntity findUser(String email) {
        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return userJpaRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required"));
    }

    private Product requireStorefrontProduct(Long productId) {
        Product p = catalogRepository.findProductById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!p.storefrontVisible()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        return p;
    }
}
