/**
 * LocalStorage helper for the "Recently viewed" rail on the PDP.
 *
 * We deliberately store a *snapshot* of each product (id, name, price,
 * imageUrl, categoryName, brand) instead of just an id list, so the
 * rail can render instantly on next visit without an extra API round
 * trip and still works in fully offline / demo-mode sessions.
 *
 * Storage layout:
 *   key   : sportshub.recentlyViewed
 *   value : Array<RecentItem>, newest first, capped at MAX_ITEMS
 */

const STORAGE_KEY = 'sportshub.recentlyViewed';
const MAX_ITEMS = 12;

function readSafe() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeSafe(items) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {
        // Quota exceeded or storage disabled — silent no-op so the PDP
        // never breaks because of a tracking-style feature.
    }
}

export function getRecentlyViewed() {
    return readSafe();
}

export function recordRecentlyViewed(product) {
    if (!product || product.id === undefined || product.id === null) return [];
    const numericId = Number(product.id);
    const snapshot = {
        id: numericId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryName: product.categoryName || product.category || null,
        brand: product.brand || null,
        rating: product.rating || 0,
        viewedAt: Date.now()
    };
    const filtered = readSafe().filter((item) => Number(item.id) !== numericId);
    const next = [snapshot, ...filtered].slice(0, MAX_ITEMS);
    writeSafe(next);
    return next;
}

export function clearRecentlyViewed() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}