package com.sportsecommerce.service;

import com.sportsecommerce.dto.CartDtos;
import com.sportsecommerce.dto.CommerceDtos;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies the selective-checkout contract: only the cart lines whose
 * {@code id}s are listed in {@link CommerceDtos.CreateOrderRequest#cartItemIds()}
 * should leave the cart, the rest must remain available for a later
 * order.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderServiceImplTest {

    private static final String TEST_EMAIL = "ordertest.user@sportshub.local";

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Autowired
    private CartJpaRepository cartJpaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        ensureUser(TEST_EMAIL, "Order Test User");
    }

    @Test
    void shouldCheckoutOnlySelectedItemsAndKeepTheRestInCart() {
        cartService.addItem(TEST_EMAIL, new CartDtos.AddCartItemRequest(101L, 1, null, null));
        cartService.addItem(TEST_EMAIL, new CartDtos.AddCartItemRequest(212L, 1, 41, "Bright Crimson"));

        CartDtos.CartResponse before = cartService.getCart(TEST_EMAIL);
        assertEquals(2, before.items().size());

        Long firstId = before.items().getFirst().id();

        CommerceDtos.OrderResponse order = orderService.create(
                TEST_EMAIL,
                new CommerceDtos.CreateOrderRequest(
                        "12 Pho Hue, Hanoi",
                        "COD",
                        List.of(firstId)
                )
        );

        // The order contains only the selected line.
        assertEquals(1, order.items().size());
        assertEquals(before.items().getFirst().productId(), order.items().getFirst().productId());

        // The unticked line is still in the cart, the bought one is gone.
        CartDtos.CartResponse after = cartService.getCart(TEST_EMAIL);
        assertEquals(1, after.items().size());
        assertTrue(after.items().stream().noneMatch(i -> i.id().equals(firstId)));
    }

    @Test
    void shouldRejectCheckoutWithEmptySelection() {
        cartService.addItem(TEST_EMAIL, new CartDtos.AddCartItemRequest(101L, 1, null, null));

        assertThrows(ApiException.class, () -> orderService.create(
                TEST_EMAIL,
                new CommerceDtos.CreateOrderRequest("12 Pho Hue, Hanoi", "COD", List.of())
        ));
    }

    @Test
    void shouldRejectCheckoutWhenSelectedIdNoLongerExists() {
        cartService.addItem(TEST_EMAIL, new CartDtos.AddCartItemRequest(101L, 1, null, null));

        assertThrows(ApiException.class, () -> orderService.create(
                TEST_EMAIL,
                new CommerceDtos.CreateOrderRequest("12 Pho Hue, Hanoi", "COD", List.of(999_999L))
        ));
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
