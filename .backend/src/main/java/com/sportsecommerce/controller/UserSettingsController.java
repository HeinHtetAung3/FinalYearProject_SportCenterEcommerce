package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.UserContextResolver;
import com.sportsecommerce.service.UserSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;
    private final UserContextResolver userContextResolver;

    public UserSettingsController(
            UserSettingsService userSettingsService,
            UserContextResolver userContextResolver
    ) {
        this.userSettingsService = userSettingsService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping("/settings")
    public ResponseEntity<CommerceDtos.UserSettingsResponse> getSettings() {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(userSettingsService.getSettings(email));
    }

    @PutMapping("/settings")
    public ResponseEntity<CommerceDtos.UserSettingsResponse> updateSettings(
            @Valid @RequestBody CommerceDtos.UserSettingsUpdateRequest request
    ) {
        String email = userContextResolver.requireAuthenticatedEmail();
        return ResponseEntity.ok(userSettingsService.updateSettings(email, request));
    }
}
