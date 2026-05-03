/**
 * Lightweight pub/sub for demo-mode state.
 *
 * Demo mode is enabled automatically by the catalog service when the
 * backend API can't be reached, so the UI can render mock data and surface
 * a dev-only banner. No external dependency, no React-specific coupling —
 * any component can subscribe.
 */

let demoModeActive = false;
const listeners = new Set();

function notify() {
    listeners.forEach((listener) => {
        try {
            listener(demoModeActive);
        } catch (error) {
            // A failing listener should never break the publisher.
            // eslint-disable-next-line no-console
            console.error('demoMode listener error', error);
        }
    });
}

export function enableDemoMode() {
    if (demoModeActive) return;
    demoModeActive = true;
    notify();
}

export function disableDemoMode() {
    if (!demoModeActive) return;
    demoModeActive = false;
    notify();
}

export function isDemoMode() {
    return demoModeActive;
}

export function subscribeDemoMode(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}