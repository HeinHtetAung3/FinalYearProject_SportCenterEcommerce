import apiClient from './apiClient';

export async function fetchAdminMetrics() {
    const {
        data
    } = await apiClient.get('/api/admin/metrics');
    return data;
}

/**
 * Full product list for admin: pages through GET /api/products (same data as the storefront).
 */
export async function fetchAdminProducts() {
    const pageSize = 250;
    const all = [];
    let page = 0;
    let totalPages = 1;

    while (page < totalPages) {
        const {
            data
        } = await apiClient.get('/api/products', {
            params: {
                page,
                size: pageSize,
                sort: 'nameAsc'
            }
        });
        const items = Array.isArray(data?.items) ? data.items : [];
        all.push(...items);
        const reported = data?.totalPages;
        totalPages = typeof reported === 'number' && reported >= 0 ? reported : page + 1;
        page += 1;
        if (items.length === 0 && page >= totalPages) {
            break;
        }
    }
    return all;
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
        stripeSecretKey: ''
    },
    shipping: {
        flatShippingFee: 0,
        freeShippingThreshold: 0,
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
            stripeSecretKey: ''
        },
        shipping: {
            ...EMPTY_SYSTEM_SETTINGS.shipping,
            ...(source.shipping || {}),
            deliveryRegions: Array.isArray(source.shipping?.deliveryRegions) ?
                source.shipping.deliveryRegions : EMPTY_SYSTEM_SETTINGS.shipping.deliveryRegions
        },
        tax: {
            ...EMPTY_SYSTEM_SETTINGS.tax,
            ...(source.tax || {}),
            regionTaxRules: Array.isArray(source.tax?.regionTaxRules) ? source.tax.regionTaxRules : []
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