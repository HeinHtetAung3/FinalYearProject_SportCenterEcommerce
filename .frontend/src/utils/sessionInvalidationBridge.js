/** Subscribers notified when the API client clears auth (e.g. failed token refresh). */

const listeners = new Set();

/**
 * @param {() => void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribeSessionInvalidated(handler) {
    listeners.add(handler);
    return () => listeners.delete(handler);
}

export function emitSessionInvalidated() {
    listeners.forEach((fn) => {
        try {
            fn();
        } catch {
            // avoid one bad subscriber breaking others
        }
    });
}