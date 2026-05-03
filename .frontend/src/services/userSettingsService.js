import apiClient from './apiClient';

export function normalizeUserSettings(data) {
    const defaults = {
        language: 'en',
        currency: 'USD',
        timezone: 'America/New_York',
        darkMode: false,
        orderUpdates: true,
        promotions: true,
        emailNotifications: true,
        smsNotifications: false,
        profileVisibility: 'PRIVATE',
        dataSharing: false,
        personalizedAds: false
    };
    if (!data || typeof data !== 'object') {
        return {
            ...defaults
        };
    }
    return {
        language: data.language ?? defaults.language,
        currency: data.currency ?? defaults.currency,
        timezone: data.timezone ?? defaults.timezone,
        darkMode: Boolean(data.darkMode),
        orderUpdates: data.orderUpdates !== false,
        promotions: data.promotions !== false,
        emailNotifications: data.emailNotifications !== false,
        smsNotifications: Boolean(data.smsNotifications),
        profileVisibility: data.profileVisibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        dataSharing: Boolean(data.dataSharing),
        personalizedAds: Boolean(data.personalizedAds)
    };
}

export const EMPTY_USER_SETTINGS = normalizeUserSettings(null);

export function serializeSettingsForCompare(settings) {
    return JSON.stringify(normalizeUserSettings(settings));
}

export async function fetchUserSettings() {
    const {
        data
    } = await apiClient.get('/api/user/settings');
    return normalizeUserSettings(data);
}

export async function updateUserSettings(payload) {
    const body = normalizeUserSettings(payload);
    const {
        data
    } = await apiClient.put('/api/user/settings', body);
    return normalizeUserSettings(data);
}