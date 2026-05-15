package com.sportsecommerce.controller;

import com.sportsecommerce.dto.AdminSettingsDtos;
import com.sportsecommerce.service.AdminSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    public AdminSettingsController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping
    public ResponseEntity<AdminSettingsDtos.SystemSettingsResponse> getSettings() {
        return ResponseEntity.ok(adminSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<AdminSettingsDtos.SystemSettingsResponse> updateSettings(
            @Valid @RequestBody AdminSettingsDtos.UpdateSystemSettingsRequest request
    ) {
        return ResponseEntity.ok(adminSettingsService.updateSettings(request));
    }

    @GetMapping("/payments")
    public ResponseEntity<AdminSettingsDtos.PaymentSettingsResponse> getPaymentSettings() {
        return ResponseEntity.ok(adminSettingsService.getSettings().payments());
    }

    @PutMapping("/payments")
    public ResponseEntity<AdminSettingsDtos.PaymentSettingsResponse> updatePaymentSettings(
            @Valid @RequestBody AdminSettingsDtos.PaymentSettingsUpdateRequest request
    ) {
        return ResponseEntity.ok(adminSettingsService.updatePayments(request).payments());
    }

    @PostMapping("/reset")
    public ResponseEntity<AdminSettingsDtos.SystemSettingsResponse> resetToDefaults() {
        return ResponseEntity.ok(adminSettingsService.resetToDefaults());
    }
}
