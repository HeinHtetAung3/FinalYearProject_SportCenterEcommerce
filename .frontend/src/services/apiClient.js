import axios from 'axios';
import {
    clearAuth,
    getStoredAuth,
    normalizeAuthRecord,
    persistAuth
} from '../utils/storage';
import {
    emitSessionInvalidated
} from '../utils/sessionInvalidationBridge';
import {
    getApiBaseUrl
} from '../utils/apiBase';

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

/** Login/register 401 must not trigger refresh or session wipe. */
function isAuthPublicRequest(config) {
    const url = String(config?.url || '');
    return (
        url.includes('/api/auth/login') ||
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/refresh')
    );
}

function invalidateSession() {
    clearAuth();
    emitSessionInvalidated();
}

let refreshPromise = null;

function performTokenRefresh() {
    const auth = getStoredAuth();
    if (!auth?.refreshToken) {
        invalidateSession();
        return Promise.reject(new Error('No refresh token'));
    }
    return axios
        .post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {
            refreshToken: auth.refreshToken
        })
        .then(({
            data
        }) => {
            const nextAuth = normalizeAuthRecord({
                ...auth,
                ...data
            });
            persistAuth(nextAuth);
            return nextAuth;
        })
        .catch((err) => {
            invalidateSession();
            throw err;
        });
}

function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = performTokenRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
    const auth = getStoredAuth();
    if (auth?.accessToken) {
        config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthFailure = error?.response?.status === 401;

        if (
            isAuthFailure &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthPublicRequest(originalRequest)
        ) {
            originalRequest._retry = true;
            const auth = getStoredAuth();
            if (auth?.refreshToken) {
                try {
                    const nextAuth = await refreshAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${nextAuth.accessToken}`;
                    return apiClient(originalRequest);
                } catch {
                    return Promise.reject(normalizeApiError(error));
                }
            }
            invalidateSession();
            return Promise.reject(normalizeApiError(error));
        }

        return Promise.reject(normalizeApiError(error));
    }
);

function normalizeApiError(error) {
    const fallbackMessage = 'Something went wrong. Please try again.';
    if (!error?.response) {
        if (error?.code === 'ECONNABORTED') {
            return {
                status: undefined,
                message: 'Request timed out. Please try again.',
                details: []
            };
        }
        return {
            status: undefined,
            message: 'Cannot reach the server. Check that the API is running and the URL is correct.',
            details: []
        };
    }
    const rawDetails = error.response.data?.validationErrors;
    const details = Array.isArray(rawDetails) ? rawDetails.filter(Boolean) : [];
    const base = error.response.data?.message || fallbackMessage;
    const message =
        details.length > 0 ? `${base} ${details.join(' ')}`.trim() : base;
    return {
        status: error.response.status,
        message,
        details
    };
}

export default apiClient;