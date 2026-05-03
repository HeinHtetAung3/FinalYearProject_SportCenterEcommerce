import apiClient from './apiClient';

/**
 * Cart REST client. Sends `size` (EU) and `color` with mutations so the
 * backend can address variant lines via the composite key (productId,
 * size, color).
 */

function variantFields(payload = {}) {
    const out = {};
    const {
        size,
        color
    } = payload;
    if (size !== undefined && size !== null && size !== '') {
        const n = typeof size === 'number' ? size : Number(size);
        if (!Number.isNaN(n)) out.size = n;
    }
    if (color !== undefined && color !== null && color !== '') {
        out.color = String(color);
    }
    return out;
}

export async function fetchCart() {
    const {
        data
    } = await apiClient.get('/api/cart');
    return data;
}

export async function addCartItem(payload = {}) {
    const body = {
        productId: payload.productId,
        quantity: payload.quantity,
        ...variantFields(payload)
    };
    const {
        data
    } = await apiClient.post('/api/cart/items', body);
    return data;
}

export async function updateCartItem(productId, payload = {}) {
    const body = {
        quantity: payload.quantity,
        ...variantFields(payload)
    };
    const {
        data
    } = await apiClient.put(`/api/cart/items/${productId}`, body);
    return data;
}

export async function removeCartItem(productId, payload = {}) {
    const vf = variantFields(payload);
    const config = Object.keys(vf).length ? {
        data: vf
    } : undefined;
    const {
        data
    } = await apiClient.delete(`/api/cart/items/${productId}`, config);
    return data;
}

export async function clearCartItems() {
    await apiClient.delete('/api/cart');
}