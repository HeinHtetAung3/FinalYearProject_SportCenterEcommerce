package com.sportsecommerce.service;

import com.sportsecommerce.dto.CommerceDtos;

public interface UserSettingsService {

    CommerceDtos.UserSettingsResponse getSettings(String email);

    CommerceDtos.UserSettingsResponse updateSettings(String email, CommerceDtos.UserSettingsUpdateRequest request);
}
