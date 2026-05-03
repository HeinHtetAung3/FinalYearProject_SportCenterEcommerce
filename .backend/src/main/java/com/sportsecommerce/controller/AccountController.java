package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.AccountService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/account")
public class AccountController {

    private final AccountService accountService;
    private final UserContextResolver userContextResolver;

    public AccountController(AccountService accountService, UserContextResolver userContextResolver) {
        this.accountService = accountService;
        this.userContextResolver = userContextResolver;
    }

    @PostMapping("/deactivate")
    public ResponseEntity<Void> deactivate() {
        String email = userContextResolver.requireAuthenticatedEmail();
        accountService.deactivateAccount(email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody CommerceDtos.DeleteAccountRequest request) {
        String email = userContextResolver.requireAuthenticatedEmail();
        accountService.deleteAccount(email, request);
        return ResponseEntity.noContent().build();
    }
}
