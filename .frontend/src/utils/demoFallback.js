/**
 * Controls whether the app may substitute mock catalog/review data when the
 * API fails or returns empty payloads.
 *
 * - Development (`vite dev`): always allowed (smooth local UX).
 * - Production build: disallowed unless `VITE_ALLOW_DEMO_FALLBACK=true`
 *   (e.g. static preview hosts without a backend).
 */
export function allowDemoDataFallback() {
    if (
        import.meta.env.DEV) return true;
    return import.meta.env.VITE_ALLOW_DEMO_FALLBACK === 'true';
}

/** Show the demo banner outside `vite dev` (e.g. staging with fallback on). */
export function showDemoBannerInThisBuild() {
    if (
        import.meta.env.DEV) return true;
    return import.meta.env.VITE_SHOW_DEMO_BANNER === 'true';
}