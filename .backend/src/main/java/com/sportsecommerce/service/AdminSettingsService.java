package com.sportsecommerce.service;

import com.sportsecommerce.dto.AdminSettingsDtos;

public interface AdminSettingsService {

    AdminSettingsDtos.SystemSettingsResponse getSettings();

    AdminSettingsDtos.SystemSettingsResponse updateSettings(AdminSettingsDtos.UpdateSystemSettingsRequest request);

    AdminSettingsDtos.SystemSettingsResponse updatePayments(AdminSettingsDtos.PaymentSettingsUpdateRequest request);

    AdminSettingsDtos.SystemSettingsResponse resetToDefaults();
}
