/**
 * Single source of truth for building product image URLs.
 *
 * The catalog (mockCatalog.js, backend API) stores a logical reference for
 * each product — a category slug + an index — and this module turns it
 * into a real URL. Swapping the entire image backend is therefore a
 * one-env-var change rather than a data migration.
 *
 * Modes (set with VITE_PRODUCT_IMAGE_SOURCE in .frontend/.env.local):
 *
 *   1. 'unsplash'  (default, zero setup) — curated Unsplash photo IDs per
 *                  category. Free, no API key, served by Unsplash's CDN.
 *
 *   2. 'local'     — files under public/images/products/<slug>/<slug>-N.jpg.
 *                  Produced by `node scripts/download-pexels-images.mjs`
 *                  after pasting a free Pexels API key into scripts/.env.
 *
 *   3. 'firebase'  — files at products/<slug>/<slug>-N.jpg in your
 *                  Firebase Storage bucket. Requires VITE_FIREBASE_STORAGE_BUCKET.
 *
 * Migration playbook to Firebase (later):
 *
 *   1. Upload running-1.jpg ... accessories-20.jpg to Firebase Storage
 *      under products/<slug>/<file>.
 *   2. In .frontend/.env.local set
 *        VITE_FIREBASE_STORAGE_BUCKET=<your-bucket>
 *        VITE_PRODUCT_IMAGE_SOURCE=firebase
 *   3. Restart `npm run dev`. No data or component changes needed —
 *      every product card swaps to the Firebase URL automatically.
 */

const RAW_MODE = (
        import.meta.env.VITE_PRODUCT_IMAGE_SOURCE || 'unsplash')
    .toString()
    .trim()
    .toLowerCase();

const SUPPORTED_MODES = new Set(['unsplash', 'local', 'firebase']);
const MODE = SUPPORTED_MODES.has(RAW_MODE) ? RAW_MODE : 'unsplash';

const FIREBASE_BUCKET =
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';

const UNSPLASH_PARAMS = '?auto=format&fit=crop&w=900&q=80';

/**
 * Curated Unsplash photo IDs per category. Each pool has 5–8 entries which
 * are cycled (modulo) to cover all 20 products per category. IDs were
 * chosen for being on-topic and from popular sports/fitness collections,
 * so even if a single ID 404s the rest of the pool keeps the page rich.
 *
 * Add/replace IDs freely — the rest of the codebase doesn't need to know.
 */
const UNSPLASH_POOLS = {
    running: [
        'photo-1542291026-7eec264c27ff',
        'photo-1595950653106-6c9ebd614d3a',
        'photo-1517466787929-bc90951d0974',
        'photo-1571902943202-507ec2618e8f',
        'photo-1539185441755-769473a23570',
        'photo-1556906781-9a412961c28c',
        'photo-1486218119243-13883505764c',
        'photo-1502904550040-7534597429ae'
    ],
    football: [
        'photo-1551958219-acbc608c6377',
        'photo-1511886929837-354d827aae26',
        'photo-1574629810360-7efbbe195018',
        'photo-1517927033932-b3d18e61fb3a',
        'photo-1543351611-58f69d7c1781',
        'photo-1518604666860-9ed391f76460',
        'photo-1577223625816-7546f13df25d'
    ],
    fitness: [
        'photo-1581009146145-b5ef050c2e1e',
        'photo-1534438327276-14e5300c3a48',
        'photo-1638536532686-d610adfc8e5c',
        'photo-1591291621164-2c6367723315',
        'photo-1517836357463-d25dfeac3438',
        'photo-1571019613454-1cb2f99b2d8b',
        'photo-1584735935682-2f2b69dff9d2',
        'photo-1540497077202-7c8a3999166f'
    ],
    outdoor: [
        'photo-1551632811-561732d1e306',
        'photo-1504280390367-361c6d9f38f4',
        'photo-1496080174650-637e3f22fa03',
        'photo-1517649763962-0c623066013b',
        'photo-1493246507139-91e8fad9978e',
        'photo-1464822759023-fed622ff2c3b',
        'photo-1455156218388-5e61b526818b'
    ],
    basketball: [
        'photo-1546519638-68e109498ffc',
        'photo-1552346154-21d32810aba3',
        'photo-1518614368389-89f7b0f6a3f0',
        'photo-1559692048-79a3f837883d',
        'photo-1574623452334-1e0ac2b3ccb4',
        'photo-1608245449230-4ac19066d2d0'
    ],
    accessories: [
        'photo-1612872087720-bb876e2e67d1',
        'photo-1554068865-24cecd4e34b8',
        'photo-1523275335684-37898b6baf30',
        'photo-1559056199-641a0ac8b55e',
        'photo-1542219550-37153d387c27',
        'photo-1556906781-9a412961c28c'
    ]
};

function poolFor(slug) {
    return UNSPLASH_POOLS[slug] || UNSPLASH_POOLS.fitness;
}

function buildUnsplash(slug, index) {
    const pool = poolFor(slug);
    const photoId = pool[((Number(index) - 1) % pool.length + pool.length) % pool.length];
    return `https://images.unsplash.com/${photoId}${UNSPLASH_PARAMS}`;
}

function buildLocal(slug, index) {
    return `/images/products/${slug}/${slug}-${index}.jpg`;
}

function buildFirebase(slug, index) {
    if (!FIREBASE_BUCKET) return null;
    const path = encodeURIComponent(`products/${slug}/${slug}-${index}.jpg`);
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${path}?alt=media`;
}

/**
 * Returns a fully-qualified URL for the requested product image. Always
 * resolves to *something* renderable: if the configured mode can't produce
 * a URL (e.g. firebase mode without a configured bucket), falls back to
 * the Unsplash pool so the UI is never empty.
 */
export function buildProductImageUrl(slug, index = 1) {
    const safeSlug = String(slug || '').toLowerCase();
    const safeIndex = Number.isFinite(Number(index)) && Number(index) > 0 ? Number(index) : 1;

    switch (MODE) {
        case 'local':
            return buildLocal(safeSlug, safeIndex);
        case 'firebase': {
            const url = buildFirebase(safeSlug, safeIndex);
            return url || buildUnsplash(safeSlug, safeIndex);
        }
        case 'unsplash':
        default:
            return buildUnsplash(safeSlug, safeIndex);
    }
}

/**
 * Convenience for category-card / hero / fallback contexts that just want
 * "a nice photo for category X" without caring about which product it is.
 */
export function buildCategoryImageUrl(slug, index = 1) {
    return buildProductImageUrl(slug, index);
}

export const PRODUCT_IMAGE_SOURCE = MODE;