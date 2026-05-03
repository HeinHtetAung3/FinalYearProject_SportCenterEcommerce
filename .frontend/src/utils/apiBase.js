function trimTrailingSlash(value) {
    return String(value || '').replace(/\/+$/, '');
}

/**
 * Base URL for REST, WebSocket/SockJS, and resolved media (`/uploads/...`).
 * Keeps axios and `<img src>` pointing at the same host as the API.
 */
export function getApiBaseUrl() {
    const configured =
        import.meta.env.VITE_API_BASE_URL;
    if (configured != null && String(configured).trim() !== '') {
        return trimTrailingSlash(String(configured));
    }
    if (typeof window !== 'undefined') {
        if (
            import.meta.env.DEV) {
            return 'http://localhost:8080';
        }
        return trimTrailingSlash(window.location.origin);
    }
    return 'http://localhost:8080';
}