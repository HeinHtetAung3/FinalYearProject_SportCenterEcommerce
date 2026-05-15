/**
 * Category / marketing image URLs. Prefers committed assets from
 * {@link ./product-image-manifest.json} (paths under /images/products/).
 * Optional VITE_PRODUCT_IMAGE_SOURCE=firebase still resolves generic
 * slug/index URLs against Firebase when a bucket is configured.
 */

import manifest from '../data/product-image-manifest.json';

const RAW_MODE = (
    import.meta.env.VITE_PRODUCT_IMAGE_SOURCE || 'local').toString().trim().toLowerCase();
const SUPPORTED_MODES = new Set(['unsplash', 'local', 'firebase']);
const MODE = SUPPORTED_MODES.has(RAW_MODE) ? RAW_MODE : 'local';

const FIREBASE_BUCKET =
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';

const PLACEHOLDER = '/images/placeholder-product.svg';

const UNSPLASH_PARAMS = '?auto=format&fit=crop&w=900&q=80';

const UNSPLASH_POOLS = {
    running: [
        'photo-1542291026-7eec264c27ff',
        'photo-1595950653106-6c9ebd614d3a',
        'photo-1517466787929-bc90951d0974',
        'photo-1571902943202-507ec2618e8f'
    ],
    football: ['photo-1551958219-acbc608c6377', 'photo-1511886929837-354d827aae26'],
    fitness: ['photo-1581009146145-b5ef050c2e1e', 'photo-1534438327276-14e5300c3a48'],
    outdoor: [
        // TODO(asset): replace with dedicated trail / shell / hiking pack photography when available.
        'photo-1551632811-561732d1e306',
        'photo-1504280390367-361c6d9f38f4'
    ],
    basketball: ['photo-1546519638-68e109498ffc', 'photo-1552346154-21d32810aba3'],
    training: ['photo-1581009146145-b5ef050c2e1e', 'photo-1517836357463-d25dfeac3438'],
    accessories: ['photo-1612872087720-bb876e2e67d1', 'photo-1554068865-24cecd4e34b8'],
    lifestyle: ['photo-1542291026-7eec264c27ff', 'photo-1552346154-21d32810aba3']
};

function poolFor(slug) {
    return UNSPLASH_POOLS[slug] || UNSPLASH_POOLS.fitness;
}

function buildUnsplash(slug, index) {
    const pool = poolFor(slug);
    const photoId = pool[((Number(index) - 1) % pool.length + pool.length) % pool.length];
    return `https://images.unsplash.com/${photoId}${UNSPLASH_PARAMS}`;
}

function buildLocalLegacy(slug, index) {
    const safeSlug = String(slug || 'fitness').toLowerCase();
    const safeIndex = Number.isFinite(Number(index)) && Number(index) > 0 ? Number(index) : 1;
    return `/images/products/${safeSlug}/${safeSlug}-${safeIndex}.jpg`;
}

function buildFirebase(slug, index) {
    if (!FIREBASE_BUCKET) return null;
    const safeSlug = String(slug || '').toLowerCase();
    const safeIndex = Number.isFinite(Number(index)) && Number(index) > 0 ? Number(index) : 1;
    const path = encodeURIComponent(`products/${safeSlug}/${safeSlug}-${safeIndex}.jpg`);
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${path}?alt=media`;
}

function heroesForSlug(slug) {
    const key = String(slug || 'fitness').toLowerCase().trim();
    const heroes = manifest.categoryHeroes[key];
    if (Array.isArray(heroes) && heroes.length > 0) return heroes;
    return manifest.categoryHeroes.fitness || manifest.categoryHeroes.running || [];
}

/**
 * Maps API / UI category labels to manifest {@code categoryHeroes} keys.
 * Exported for {@link ./firebaseStorage.js} fallbacks.
 */
export const CATEGORY_IMAGE_ALIASES = {
    running: 'running',
    footwear: 'running',
    shoes: 'running',
    football: 'football',
    soccer: 'football',
    balls: 'balls',
    ball: 'balls',
    fitness: 'fitness',
    gym: 'gym',
    outdoor: 'outdoor',
    hiking: 'outdoor',
    basketball: 'basketball',
    training: 'training',
    accessories: 'accessories',
    lifestyle: 'lifestyle'
};

/**
 * When a product has no usable image URL, pick a hero pool from name /
 * subcategory so lifestyle and accessories SKUs stay visually accurate.
 */
export function inferCategoryHeroSlug(product) {
    if (!product || typeof product !== 'object') return null;
    const name = String(product.name || '').toLowerCase();
    const sub = String(product.subcategory || '').toLowerCase();
    const raw = String(
        product.categorySlug || product.category || product.categoryName || ''
    ).toLowerCase();

    const inLifestyle = raw.includes('lifestyle') || raw === 'lifestyle';
    if (inLifestyle) {
        if (sub.includes('sneaker') || /\bsneaker/i.test(name)) return 'lifestyle-sneakers';
        if (sub.includes('hoodie') || /\bhoodie/i.test(name)) return 'lifestyle-hoodies';
        if (sub.includes('t-shirt') || sub.includes('tee') || /\bt-?shirt/i.test(name) || /\btee\b/i.test(name)) {
            return 'lifestyle-tees';
        }
        if (sub.includes('jogger') || /\bjogger/i.test(name)) return 'lifestyle-joggers';
        if (sub.includes('cap') || /\bcaps?\b/i.test(name)) return 'lifestyle-caps';
        if (sub.includes('bag') || /\bbags?\b/i.test(name)) return 'lifestyle-bags';
    }

    if (raw.includes('accessor') || raw === 'accessories') {
        if (/bag|backpack|duffel|sling|grip bag|pitch/i.test(name)) return 'accessories-bags';
        if (/cap|hat|boonie|trucker/i.test(name)) return 'accessories-headwear';
        if (/shinguard|shin guard|glove|keeper/i.test(name)) return 'accessories-protective';
        if (/\bball\b/i.test(name)) return 'balls';
    }

    return null;
}

/**
 * Marketing / category rails: use manifest heroes when available.
 */
export function buildCategoryImageUrl(slug, index = 1) {
    const heroes = heroesForSlug(slug);
    if (heroes.length > 0) {
        const i = ((Number(index) - 1) % heroes.length + heroes.length) % heroes.length;
        return heroes[i];
    }
    if (MODE === 'firebase') {
        const url = buildFirebase(slug, index);
        if (url) return url;
    }
    if (MODE === 'unsplash') {
        return buildUnsplash(String(slug || 'fitness').toLowerCase(), index);
    }
    return PLACEHOLDER;
}

/**
 * Same resolution as {@link #buildCategoryImageUrl} for slug-based fallbacks.
 */
export function buildProductImageUrl(slug, index = 1) {
    if (MODE === 'firebase') {
        const url = buildFirebase(slug, index);
        if (url) return url;
    }
    if (MODE === 'local') {
        const heroes = heroesForSlug(slug);
        if (heroes.length > 0) {
            const i = ((Number(index) - 1) % heroes.length + heroes.length) % heroes.length;
            return heroes[i];
        }
        return buildLocalLegacy(slug, index);
    }
    return buildUnsplash(String(slug || 'fitness').toLowerCase(), index);
}

export const PRODUCT_IMAGE_SOURCE = MODE;