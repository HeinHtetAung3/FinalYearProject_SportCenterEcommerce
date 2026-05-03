package com.sportsecommerce.service;

import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.entity.Role;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.CartJpaRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CartServiceImplTest {

    private static final String TEST_EMAIL_A = "carttest.a@sportshub.local";
    private static final String TEST_EMAIL_B = "carttest.b@sportshub.local";

    @Autowired
    private CartService cartService;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private CartJpaRepository cartJpaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        ensureUser(TEST_EMAIL_A, "Cart Test A");
        ensureUser(TEST_EMAIL_B, "Cart Test B");
    }

    @Test
    void shouldMergeDuplicatesAndUpdateQuantity() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(101L, 1, null, null));
        CartDtos.CartResponse response = cartService.addItem(TEST_EMAIL_A,
                new CartDtos.AddCartItemRequest(101L, 2, null, null));

        assertEquals(1, response.items().size());
        assertEquals(3, response.items().getFirst().quantity());
        assertEquals(3, response.itemCount());
    }

    @Test
    void shouldKeepSeparateLinesForSameProductWithDifferentVariants() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(212L, 1, 40, "Bright Crimson"));
        CartDtos.CartResponse response = cartService.addItem(TEST_EMAIL_A,
                new CartDtos.AddCartItemRequest(212L, 1, 41, "Bright Crimson"));

        assertEquals(2, response.items().size());
        assertEquals(2, response.itemCount());
    }

    @Test
    void shouldRejectVariantSizeNotOfferedOnProduct() {
        assertThrows(ApiException.class, () ->
                cartService.addItem(TEST_EMAIL_A,
                        new CartDtos.AddCartItemRequest(212L, 1, 99, "Bright Crimson")));
    }

    @Test
    void shouldRejectQuantityBeyondStock() {
        assertThrows(ApiException.class, () ->
                cartService.addItem(TEST_EMAIL_A,
                        new CartDtos.AddCartItemRequest(212L, 100, null, null)));
    }

    @Test
    void shouldKeepCartsIsolatedBetweenUsers() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(101L, 2, null, null));
        cartService.addItem(TEST_EMAIL_B, new CartDtos.AddCartItemRequest(212L, 1, 41, "Bright Crimson"));

        CartDtos.CartResponse cartA = cartService.getCart(TEST_EMAIL_A);
        CartDtos.CartResponse cartB = cartService.getCart(TEST_EMAIL_B);

        assertEquals(1, cartA.items().size());
        assertEquals(101L, cartA.items().getFirst().productId());
        assertEquals(2, cartA.itemCount());

        assertEquals(1, cartB.items().size());
        assertEquals(212L, cartB.items().getFirst().productId());
        assertEquals(1, cartB.itemCount());
    }

    @Test
    void shouldExposeProductDisplayFieldsOnCartResponse() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(101L, 1, null, null));

        CartDtos.CartItemResponse line = cartService.getCart(TEST_EMAIL_A).items().getFirst();

        assertNotNull(line.id(), "cart line id must be exposed for selective checkout");
        assertNotNull(line.productName());
        assertNotNull(line.imageUrl(), "imageUrl must be joined from the catalog so the bag UI never falls back to a generic placeholder");
        assertNotNull(line.unitPrice());
    }

    @Test
    void shouldRemoveOnlySelectedCartLines() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(101L, 1, null, null));
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(212L, 1, 41, "Bright Crimson"));

        CartDtos.CartResponse before = cartService.getCart(TEST_EMAIL_A);
        Long firstId = before.items().getFirst().id();

        cartService.removeItemsByIds(TEST_EMAIL_A, List.of(firstId));

        CartDtos.CartResponse after = cartService.getCart(TEST_EMAIL_A);
        assertEquals(1, after.items().size());
        assertTrue(after.items().stream().noneMatch(i -> i.id().equals(firstId)));
    }

    @Test
    void shouldRejectRemovalOfForeignCartLine() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(101L, 1, null, null));
        cartService.addItem(TEST_EMAIL_B, new CartDtos.AddCartItemRequest(212L, 1, 41, "Bright Crimson"));

        Long foreignId = cartService.getCart(TEST_EMAIL_B).items().getFirst().id();

        assertThrows(ApiException.class, () ->
                cartService.removeItemsByIds(TEST_EMAIL_A, List.of(foreignId)));

        // User A's cart must remain untouched.
        assertEquals(1, cartService.getCart(TEST_EMAIL_A).items().size());
        // User B's line must still be there.
        assertEquals(1, cartService.getCart(TEST_EMAIL_B).items().size());
    }

    @Test
    void shouldRejectEmptyRemovalSelection() {
        cartService.addItem(TEST_EMAIL_A, new CartDtos.AddCartItemRequest(101L, 1, null, null));

        assertThrows(ApiException.class, () ->
                cartService.removeItemsByIds(TEST_EMAIL_A, List.of()));
    }

    private void ensureUser(String email, String fullName) {
        userJpaRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            cartJpaRepository.findByUser(user).ifPresent(cartJpaRepository::delete);
            userJpaRepository.delete(user);
        });
        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setEnabled(true);
        user.setRole(Role.USER);
        userJpaRepository.save(user);
    }
}
