/**
 * LocalStorage helpers for auth + cart.
 *
 * Cart storage is keyed by user (or "guest" when nobody is signed in)
 * so two different users on the same browser never see each other's
 * bag — the canonical bag still lives in the backend, but the local
 * mirror also has to be user-scoped to avoid stale lines flashing
 * after a logout / login. The cart payload was bumped to v3 (from v2)
 * to introduce the per-user key namespace; v2 (single global key) and
 * v1 (legacy, no variants) are read once for migration so refresh
 * after upgrade does not nuke an in-flight bag.
 */

const AUTH_KEY = 'sportshub.auth';
const CART_KEY_V1 = 'sportshub.cart';
const CART_KEY_V2 = 'sportshub.cart.v2';
const CART_KEY_PREFIX_V3 = 'sportshub.cart.v3.';
const CART_SELECTION_KEY_PREFIX = 'sportshub.cart-selection.v1.';
const GUEST_CART_OWNER = 'guest';

export function getStoredAuth() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    } catch {
        return null;
    }
}

/**
 * JJWT emits JWTs with a Base64**URL** payload. `atob` only accepts classic
 * Base64 (+ / padding), so naive `atob` decoding often throws — then email
 * is never read and every user stays on cart owner "guest".
 */
function parseJwtPayload(accessToken) {
    if (!accessToken || typeof accessToken !== 'string') return null;
    try {
        const parts = accessToken.split('.');
        if (parts.length < 2) return null;
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const json = new TextDecoder('utf-8').decode(bytes);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/**
 * Subject from JWT is the signed-in email when the API body did not send it.
 */
export function getEmailFromAccessToken(accessToken) {
    const payload = parseJwtPayload(accessToken);
    const sub = payload?.sub;
    if (typeof sub === 'string' && sub.trim()) {
        return sub.trim().toLowerCase();
    }
    return null;
}

function getRoleFromAccessToken(accessToken) {
    const payload = parseJwtPayload(accessToken);
    const role = payload?.role;
    return typeof role === 'string' && role.trim() ? role.trim() : null;
}

/**
 * Ensures `email` and `role` are populated from the access token when the
 * API body omitted them (legacy clients). Login/refresh now also return
 * `email` and `role` in JSON.
 */
export function normalizeAuthRecord(auth) {
    if (auth == null || typeof auth !== 'object') {
        return auth;
    }
    const emailFromBody = typeof auth.email === 'string' ? auth.email.trim() : '';
    const email =
        emailFromBody.length > 0 ?
        emailFromBody.toLowerCase() :
        getEmailFromAccessToken(auth.accessToken) || '';
    const roleFromBody = typeof auth.role === 'string' ? auth.role.trim() : '';
    const role =
        roleFromBody.length > 0 ?
        roleFromBody :
        getRoleFromAccessToken(auth.accessToken) || 'USER';
    return {
        ...auth,
        email,
        role
    };
}

export function persistAuth(value) {
    try {
        localStorage.setItem(AUTH_KEY, JSON.stringify(value));
    } catch {
        // ignore quota errors
    }
}

export function clearAuth() {
    try {
        localStorage.removeItem(AUTH_KEY);
    } catch {
        // ignore
    }
}

function normalizeCartOwner(owner) {
    if (typeof owner !== 'string') return GUEST_CART_OWNER;
    const trimmed = owner.trim().toLowerCase();
    return trimmed.length === 0 ? GUEST_CART_OWNER : trimmed;
}

function cartKeyFor(owner) {
    return `${CART_KEY_PREFIX_V3}${normalizeCartOwner(owner)}`;
}

function readLegacyCart() {
    try {
        const v2 = localStorage.getItem(CART_KEY_V2);
        if (v2) {
            const parsed = JSON.parse(v2);
            return Array.isArray(parsed) ? parsed : [];
        }
        const v1 = localStorage.getItem(CART_KEY_V1);
        if (v1) {
            const parsed = JSON.parse(v1);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch {
        return [];
    }
    return [];
}

function clearLegacyCart() {
    try {
        localStorage.removeItem(CART_KEY_V2);
        localStorage.removeItem(CART_KEY_V1);
    } catch {
        // ignore
    }
}

/**
 * Load the locally-cached cart for a given owner ("guest" by default).
 *
 * On first load, any legacy v1/v2 (single-global) cart is migrated into
 * the guest namespace so existing anonymous shoppers don't lose their
 * bag — but we never migrate it into a logged-in user's namespace,
 * because that would silently leak items between users sharing a
 * browser.
 */
export function getStoredCart(owner = GUEST_CART_OWNER) {
    const ownerKey = normalizeCartOwner(owner);
    try {
        const namespaced = localStorage.getItem(cartKeyFor(ownerKey));
        if (namespaced) {
            const parsed = JSON.parse(namespaced);
            return Array.isArray(parsed) ? parsed : [];
        }
        if (ownerKey === GUEST_CART_OWNER) {
            const legacy = readLegacyCart();
            if (legacy.length > 0) {
                try {
                    localStorage.setItem(cartKeyFor(GUEST_CART_OWNER), JSON.stringify(legacy));
                } catch {
                    // ignore quota errors
                }
                clearLegacyCart();
                return legacy;
            }
            clearLegacyCart();
        }
        return [];
    } catch {
        return [];
    }
}

export function persistCart(value, owner = GUEST_CART_OWNER) {
    try {
        localStorage.setItem(cartKeyFor(owner), JSON.stringify(value || []));
    } catch {
        // ignore quota errors
    }
}

/**
 * Drop the local cart cache for a given owner. Called on sign out so
 * the next visitor (guest or another user) starts with a clean slate.
 */
export function clearStoredCart(owner = GUEST_CART_OWNER) {
    try {
        localStorage.removeItem(cartKeyFor(owner));
    } catch {
        // ignore
    }
}

/**
 * Stable per-line key for the cart. Two cart lines are considered the
 * same physical SKU only if `productId`, `size` and `color` all match.
 * This is the rule that lets "same boot in two sizes" produce two
 * separate lines without needing backend support.
 */
export function makeCartLineKey(productId, size, color) {
    const normalizedSize = size === undefined || size === null || size === '' ? '' : String(size);
    const normalizedColor = color === undefined || color === null || color === '' ? '' : String(color);
    return `${productId}|${normalizedSize}|${normalizedColor}`;
}

/**
 * Per-user persistence for the "selected for checkout" set. We persist
 * the numeric backend cart-line ids (CartItemEntity.id) so a refresh
 * does not lose what the user already ticked. Selections are scoped to
 * the same owner key as the cart itself, so two users on one browser
 * never share selections.
 */
function selectionKeyFor(owner) {
    return `${CART_SELECTION_KEY_PREFIX}${normalizeCartOwner(owner)}`;
}

export function getStoredSelection(owner = GUEST_CART_OWNER) {
    try {
        const raw = localStorage.getItem(selectionKeyFor(owner));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id));
    } catch {
        return [];
    }
}

export function persistSelection(ids, owner = GUEST_CART_OWNER) {
    try {
        const safe = Array.isArray(ids) ?
            ids.map((id) => Number(id)).filter((id) => Number.isFinite(id)) : [];
        localStorage.setItem(selectionKeyFor(owner), JSON.stringify(safe));
    } catch {
        // ignore quota errors
    }
}

export function clearStoredSelection(owner = GUEST_CART_OWNER) {
    try {
        localStorage.removeItem(selectionKeyFor(owner));
    } catch {
        // ignore
    }
}

const PREFS_KEY_PREFIX = 'sportshub.prefs.v1.';

function prefsKeyForEmail(email) {
    const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
    return `${PREFS_KEY_PREFIX}${e.length ? e : 'unknown'}`;
}

/** @returns {{ language: string, currency: string, timezone: string } | null} */
export function getStoredUserPreferences(email) {
    try {
        const raw = localStorage.getItem(prefsKeyForEmail(email));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const language = typeof parsed.language === 'string' ? parsed.language : null;
        const currency = typeof parsed.currency === 'string' ? parsed.currency : null;
        const timezone = typeof parsed.timezone === 'string' ? parsed.timezone : null;
        if (!language || !currency || !timezone) return null;
        return {
            language,
            currency,
            timezone
        };
    } catch {
        return null;
    }
}

export function persistUserPreferences(email, prefs) {
    if (!email || typeof email !== 'string' || !email.trim()) return;
    try {
        const payload = {
            language: prefs?.language,
            currency: prefs?.currency,
            timezone: prefs?.timezone
        };
        if (!payload.language || !payload.currency || !payload.timezone) return;
        localStorage.setItem(prefsKeyForEmail(email), JSON.stringify(payload));
    } catch {
        // ignore quota errors
    }
}

const CHECKOUT_ADDRESSES_KEY = 'sportshub.checkout.addresses';

/** @returns {Array<{ id: string, label: string, fullName: string, email: string, phone: string, address: string, city: string, postalCode: string, country: string }>} */
export function getSavedCheckoutAddresses() {
    try {
        const raw = localStorage.getItem(CHECKOUT_ADDRESSES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function persistSavedCheckoutAddresses(addresses) {
    try {
        localStorage.setItem(CHECKOUT_ADDRESSES_KEY, JSON.stringify(addresses || []));
    } catch {
        // ignore quota errors
    }
}