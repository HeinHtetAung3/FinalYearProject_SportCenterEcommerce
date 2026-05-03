package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.entity.UserEntity;
import com.sportsecommerce.entity.UserSettingsEntity;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.repository.UserSettingsJpaRepository;
import com.sportsecommerce.service.UserSettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
public class UserSettingsServiceImpl implements UserSettingsService {

    private static final Set<String> ALLOWED_VISIBILITY = Set.of("PRIVATE", "PUBLIC");

    private final UserJpaRepository userJpaRepository;
    private final UserSettingsJpaRepository userSettingsJpaRepository;

    public UserSettingsServiceImpl(
            UserJpaRepository userJpaRepository,
            UserSettingsJpaRepository userSettingsJpaRepository
    ) {
        this.userJpaRepository = userJpaRepository;
        this.userSettingsJpaRepository = userSettingsJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CommerceDtos.UserSettingsResponse getSettings(String email) {
        UserEntity user = findUser(email);
        UserSettingsEntity settings = getOrCreateSettings(user);
        if (settings.isPromotions() != user.isMarketingEmailOptIn()) {
            settings.setPromotions(user.isMarketingEmailOptIn());
            userSettingsJpaRepository.save(settings);
        }
        return toResponse(settings);
    }

    @Override
    @Transactional
    public CommerceDtos.UserSettingsResponse updateSettings(String email, CommerceDtos.UserSettingsUpdateRequest request) {
        String visibility = request.profileVisibility().toUpperCase(Locale.ROOT);
        if (!ALLOWED_VISIBILITY.contains(visibility)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "profileVisibility must be PRIVATE or PUBLIC");
        }

        UserEntity user = findUser(email);
        UserSettingsEntity settings = getOrCreateSettings(user);

        settings.setLanguage(request.language().trim());
        settings.setCurrency(request.currency().trim().toUpperCase(Locale.ROOT));
        settings.setTimezone(request.timezone().trim());
        settings.setDarkMode(request.darkMode());
        settings.setOrderUpdates(request.orderUpdates());
        settings.setPromotions(request.promotions());
        settings.setEmailNotifications(request.emailNotifications());
        settings.setSmsNotifications(request.smsNotifications());
        settings.setProfileVisibility(visibility);
        settings.setDataSharing(request.dataSharing());
        settings.setPersonalizedAds(request.personalizedAds());

        user.setMarketingEmailOptIn(request.promotions());
        userJpaRepository.save(user);
        userSettingsJpaRepository.save(settings);

        return toResponse(settings);
    }

    private UserEntity findUser(String email) {
        return userJpaRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserSettingsEntity getOrCreateSettings(UserEntity user) {
        return userSettingsJpaRepository.findById(user.getId())
                .orElseGet(() -> {
                    UserSettingsEntity created = new UserSettingsEntity();
                    created.setUser(user);
                    created.setPromotions(user.isMarketingEmailOptIn());
                    return userSettingsJpaRepository.save(created);
                });
    }

    private static CommerceDtos.UserSettingsResponse toResponse(UserSettingsEntity s) {
        return new CommerceDtos.UserSettingsResponse(
                s.getLanguage(),
                s.getCurrency(),
                s.getTimezone(),
                s.isDarkMode(),
                s.isOrderUpdates(),
                s.isPromotions(),
                s.isEmailNotifications(),
                s.isSmsNotifications(),
                s.getProfileVisibility(),
                s.isDataSharing(),
                s.isPersonalizedAds()
        );
    }
}
