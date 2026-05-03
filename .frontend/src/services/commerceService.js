import apiClient from './apiClient';
import {
    mockReviews
} from '../data/mockCatalog';
import {
    allowDemoDataFallback
} from '../utils/demoFallback';

export async function placeOrder(payload) {
    const {
        data
    } = await apiClient.post('/api/orders', payload);
    return data;
}

export async function fetchOrders() {
    const {
        data
    } = await apiClient.get('/api/orders');
    return Array.isArray(data) ? data : [];
}

/**
 * Returns only the orders that belong to the currently logged-in user.
 * Backend ensures one user can never see another user's orders, so the
 * frontend never has to filter the result client-side.
 */
export async function fetchMyOrders() {
    const {
        data
    } = await apiClient.get('/api/orders/my-orders');
    return Array.isArray(data) ? data : [];
}

export async function fetchOrderById(orderId) {
    const {
        data
    } = await apiClient.get(`/api/orders/${orderId}`);
    return data;
}

export async function cancelOrder(orderId) {
    const {
        data
    } = await apiClient.post(`/api/orders/${orderId}/cancel`, {});
    return data;
}

export async function updateOrderStatus(orderId, status) {
    const {
        data
    } = await apiClient.put(`/api/orders/${orderId}/status`, {
        status
    });
    return data;
}

export async function fetchReviews(productId) {
    try {
        const {
            data
        } = await apiClient.get('/api/reviews', {
            params: {
                productId
            }
        });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (allowDemoDataFallback()) {
            return mockReviews[Number(productId)] || [];
        }
        if (error && error.message) throw error;
        throw new Error('Unable to load reviews. Check your connection or try again.');
    }
}

export async function createReview(payload) {
    const {
        data
    } = await apiClient.post('/api/reviews', payload);
    return data;
}

export async function fetchWishlist() {
    const {
        data
    } = await apiClient.get('/api/wishlist');
    return data;
}

export async function addWishlistItem(productId) {
    const {
        data
    } = await apiClient.post('/api/wishlist/items', {
        productId
    });
    return data;
}

export async function removeWishlistItem(productId) {
    const {
        data
    } = await apiClient.delete(`/api/wishlist/items/${productId}`);
    return data;
}

export async function toggleWishlistItem(productId) {
    const {
        data
    } = await apiClient.post(`/api/wishlist/toggle/${productId}`, {});
    return data;
}

export async function moveWishlistToCart(productId) {
    const {
        data
    } = await apiClient.post(`/api/wishlist/items/${productId}/move-to-cart`, {});
    return data;
}

export async function fetchProfile() {
    const {
        data
    } = await apiClient.get('/api/users/profile');
    return data;
}

export async function updateProfile(payload) {
    const {
        data
    } = await apiClient.put('/api/profile', payload);
    return data;
}

export async function changePassword(payload) {
    await apiClient.put('/api/profile/password', payload);
}

export async function createProfileAddress(payload) {
    const {
        data
    } = await apiClient.post('/api/profile/addresses', payload);
    return data;
}

export async function updateProfileAddress(addressId, payload) {
    const {
        data
    } = await apiClient.put(`/api/profile/addresses/${addressId}`, payload);
    return data;
}

export async function deleteProfileAddress(addressId) {
    await apiClient.delete(`/api/profile/addresses/${addressId}`);
}

export async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const {
        data
    } = await apiClient.post('/api/users/upload-profile-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export async function updateProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const {
        data
    } = await apiClient.put('/api/users/update-profile-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export async function deleteProfileImage() {
    const {
        data
    } = await apiClient.delete('/api/users/profile-image');
    return data;
}