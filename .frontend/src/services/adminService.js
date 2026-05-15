import apiClient from './apiClient';

export async function fetchAdminMetrics() {
    const {
        data
    } = await apiClient.get('/api/admin/metrics');
    return data;
}

/**
 * Full product list for admin (includes hidden SKUs). Uses GET /api/admin/products.
 */
export async function fetchAdminProducts() {
    const {
        data
    } = await apiClient.get('/api/admin/products');
    return Array.isArray(data) ? data : [];
}

export async function updateAdminOrderStatus(orderId, status) {
    const {
        data
    } = await apiClient.put(`/api/admin/orders/${orderId}/status`, {
        status
    });
    return data;
}

export async function fetchAdminOrders() {
    const {
        data
    } = await apiClient.get('/api/admin/orders');
    return data;
}

export async function fetchAdminUsers() {
    const {
        data
    } = await apiClient.get('/api/admin/users');
    return data;
}

export async function createAdminProduct(payload) {
    const {
        data
    } = await apiClient.post('/api/products', payload);
    return data;
}

export async function updateAdminProduct(productId, payload) {
    const {
        data
    } = await apiClient.put(`/api/products/${productId}`, payload);
    return data;
}

export async function deleteAdminProduct(productId) {
    await apiClient.delete(`/api/products/${productId}`);
}

export async function deleteAdminProductsBulk(ids) {
    await apiClient.delete('/api/products/bulk', {
        data: {
            ids
        }
    });
}

export async function fetchAdminMarketingBanners() {
    const {
        data
    } = await apiClient.get('/api/admin/marketing/banners');
    return Array.isArray(data) ? data : [];
}

export async function createAdminMarketingBanner(payload) {
    const {
        data
    } = await apiClient.post('/api/admin/marketing/banners', payload);
    return data;
}

export async function updateAdminMarketingBanner(bannerId, payload) {
    const {
        data
    } = await apiClient.put(`/api/admin/marketing/banners/${bannerId}`, payload);
    return data;
}

export async function deleteAdminMarketingBanner(bannerId) {
    await apiClient.delete(`/api/admin/marketing/banners/${bannerId}`);
}

export async function fetchAdminEditorialFeatures() {
    const {
        data
    } = await apiClient.get('/api/admin/marketing/editorial');
    return Array.isArray(data) ? data : [];
}

export async function createAdminEditorialFeature(payload) {
    const {
        data
    } = await apiClient.post('/api/admin/marketing/editorial', payload);
    return data;
}

export async function updateAdminEditorialFeature(id, payload) {
    const {
        data
    } = await apiClient.put(`/api/admin/marketing/editorial/${id}`, payload);
    return data;
}

export async function deleteAdminEditorialFeature(id) {
    await apiClient.delete(`/api/admin/marketing/editorial/${id}`);
}

export const EMPTY_SYSTEM_SETTINGS = {
    general: {
        storeName: '',
        logoUrl: '',
        contactEmail: '',
        defaultCurrency: 'USD',
        defaultLanguage: 'en'
    },
    payments: {
        creditCardEnabled: true,
        cashOnDeliveryEnabled: true,
        stripeEnabled: false,
        stripePublicKey: '',
        stripeSecretConfigured: false,
        stripeReady: false,
        stripeSecretKey: ''
    },
    shipping: {
        shippingEnabled: true,
        flatShippingFee: 0,
        freeShippingThreshold: 0,
        expressShippingSurcharge: 12.99,
        deliveryRegions: ['United States'],
        estimatedDeliveryTime: '3-5 business days'
    },
    tax: {
        taxRatePercent: 0,
        regionTaxRules: []
    },
    product: {
        defaultStockThreshold: 10,
        lowStockAlertsEnabled: true,
        reviewsEnabled: true
    },
    notifications: {
        alertNewOrders: true,
        alertLowStock: true,
        alertNewUserRegistration: true
    },
    security: {
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireNumber: true,
        passwordRequireSpecialCharacter: false,
        sessionTimeoutMinutes: 30,
        maxLoginAttempts: 5,
        jwtExpirationMinutes: 15
    }
};

export function normalizeAdminSettings(data) {
    const source = data && typeof data === 'object' ? data : {};
    return {
        general: {
            ...EMPTY_SYSTEM_SETTINGS.general,
            ...(source.general || {})
        },
        payments: {
            ...EMPTY_SYSTEM_SETTINGS.payments,
            ...(source.payments || {}),
            stripeSecretKey: '',
            stripeReady: Boolean(source.payments && source.payments.stripeReady)
        },
        shipping: {
            ...EMPTY_SYSTEM_SETTINGS.shipping,
            ...(source.shipping || {}),
            shippingEnabled: source.shipping && typeof source.shipping.shippingEnabled === 'boolean' ?
                source.shipping.shippingEnabled : EMPTY_SYSTEM_SETTINGS.shipping.shippingEnabled,
            expressShippingSurcharge: source.shipping && source.shipping.expressShippingSurcharge != null ?
                Number(source.shipping.expressShippingSurcharge) : EMPTY_SYSTEM_SETTINGS.shipping.expressShippingSurcharge,
            deliveryRegions: Array.isArray(source.shipping && source.shipping.deliveryRegions) ?
                source.shipping.deliveryRegions : EMPTY_SYSTEM_SETTINGS.shipping.deliveryRegions
        },
        tax: {
            ...EMPTY_SYSTEM_SETTINGS.tax,
            ...(source.tax || {}),
            regionTaxRules: Array.isArray(source.tax && source.tax.regionTaxRules) ?
                source.tax.regionTaxRules : []
        },
        product: {
            ...EMPTY_SYSTEM_SETTINGS.product,
            ...(source.product || {})
        },
        notifications: {
            ...EMPTY_SYSTEM_SETTINGS.notifications,
            ...(source.notifications || {})
        },
        security: {
            ...EMPTY_SYSTEM_SETTINGS.security,
            ...(source.security || {})
        }
    };
}

export function serializeAdminSettingsForCompare(settings) {
    const normalized = normalizeAdminSettings(settings);
    const comparable = {
        ...normalized,
        payments: {
            ...normalized.payments,
            stripeSecretKey: ''
        }
    };
    return JSON.stringify(comparable);
}

export function toAdminSettingsUpdatePayload(settings) {
    const normalized = normalizeAdminSettings(settings);
    return {
        ...normalized,
        payments: {
            creditCardEnabled: Boolean(normalized.payments.creditCardEnabled),
            cashOnDeliveryEnabled: Boolean(normalized.payments.cashOnDeliveryEnabled),
            stripeEnabled: Boolean(normalized.payments.stripeEnabled),
            stripePublicKey: normalized.payments.stripePublicKey || '',
            stripeSecretKey: normalized.payments.stripeSecretKey || ''
        }
    };
}

export async function fetchAdminSettings() {
    const {
        data
    } = await apiClient.get('/api/admin/settings');
    return normalizeAdminSettings(data);
}

export async function updateAdminSettings(payload) {
    const {
        data
    } = await apiClient.put('/api/admin/settings', toAdminSettingsUpdatePayload(payload));
    return normalizeAdminSettings(data);
}

export async function fetchAdminPaymentSettings() {
    const {
        data
    } = await apiClient.get('/api/admin/settings/payments');
    return data;
}

export async function updateAdminPaymentSettings(paymentsPayload) {
    const body = {
        creditCardEnabled: Boolean(paymentsPayload.creditCardEnabled),
        cashOnDeliveryEnabled: Boolean(paymentsPayload.cashOnDeliveryEnabled),
        stripeEnabled: Boolean(paymentsPayload.stripeEnabled),
        stripePublicKey: paymentsPayload.stripePublicKey || '',
        stripeSecretKey: paymentsPayload.stripeSecretKey || ''
    };
    const {
        data
    } = await apiClient.put('/api/admin/settings/payments', body);
    return data;
}

export async function resetAdminSettingsToDefaults() {
    const {
        data
    } = await apiClient.post('/api/admin/settings/reset');
    return normalizeAdminSettings(data);
}