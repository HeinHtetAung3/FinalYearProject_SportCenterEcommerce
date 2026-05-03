package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.ProfileService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserContextResolver userContextResolver;

    public ProfileController(ProfileService profileService, UserContextResolver userContextResolver) {
        this.profileService = profileService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping
    public ResponseEntity<CommerceDtos.ProfileResponse> get() {
        String email = userContextResolver.resolveAuthenticatedEmail();
        return ResponseEntity.ok(profileService.get(email));
    }

    @PutMapping
    public ResponseEntity<CommerceDtos.ProfileResponse> update(@Valid @RequestBody CommerceDtos.UpdateProfileRequest request) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        return ResponseEntity.ok(profileService.update(email, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody CommerceDtos.ChangePasswordRequest request) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        profileService.changePassword(email, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/addresses")
    public ResponseEntity<CommerceDtos.AddressResponse> addAddress(@Valid @RequestBody CommerceDtos.UpsertAddressRequest request) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        return ResponseEntity.ok(profileService.addAddress(email, request));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<CommerceDtos.AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody CommerceDtos.UpsertAddressRequest request
    ) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        return ResponseEntity.ok(profileService.updateAddress(email, id, request));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        profileService.deleteAddress(email, id);
        return ResponseEntity.noContent().build();
    }
}
