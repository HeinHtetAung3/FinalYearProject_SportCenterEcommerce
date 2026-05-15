/**
 * Resolves image URLs for products. Supports four sources:
 *   1. Absolute http(s) URLs (returned as-is).
 *   2. Same-origin local paths starting with "/" (returned as-is, served by Vite from public/).
 *   3. Firebase Storage object paths (built into firebasestorage.googleapis.com URLs).
 *   4. Missing/invalid sources (delegates to productImages.js via category fallback).
 *
 * The Firebase bucket is configured via VITE_FIREBASE_STORAGE_BUCKET so the
 * frontend stays decoupled from secrets and works in every environment.
 */

import {
    buildCategoryImageUrl,
    CATEGORY_IMAGE_ALIASES,
    inferCategoryHeroSlug
} from './productImages';

const FIREBASE_BUCKET =
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';

/** Static SVG in /public when remote or category fallbacks fail */
const PLACEHOLDER_PATH = '/images/placeholder-product.svg';

const PLACEHOLDER_DATA_URL =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f5f5f5"/>
          <stop offset="100%" stop-color="#e5e5e5"/>
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="url(#g)"/>
      <text x="50%" y="50%" font-family="Inter,system-ui,sans-serif" font-size="22"
        fill="#a0a0a0" text-anchor="middle" dominant-baseline="middle">SportsHub</text>
    </svg>`
    );

function isAbsoluteUrl(value) {
    return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function isLocalPath(value) {
    return typeof value === 'string' && value.startsWith('/');
}

export function buildFirebaseImageUrl(path) {
    if (!path || !FIREBASE_BUCKET) return null;
    if (isLocalPath(path)) return null;
    const encoded = encodeURIComponent(path.replace(/^\/+/, ''));
    return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encoded}?alt=media`;
}

function fallbackForCategory(category, product) {
    const inferred = product && inferCategoryHeroSlug(product);
    if (inferred) {
        return buildCategoryImageUrl(inferred, 1);
    }
    const key = String(category || '').toLowerCase().trim();
    const slug = CATEGORY_IMAGE_ALIASES[key] || key || 'fitness';
    return buildCategoryImageUrl(slug, 1);
}

export function resolveProductImage(product, {
    index = 0
} = {}) {
    if (!product) return PLACEHOLDER_PATH;

    const candidates = []
        .concat(product.images || [])
        .concat(product.imageUrl ? [product.imageUrl] : [])
        .concat(product.imagePath ? [product.imagePath] : []);

    const candidate = candidates[index] || candidates[0];

    if (isAbsoluteUrl(candidate) || isLocalPath(candidate)) return candidate;
    const firebaseUrl = buildFirebaseImageUrl(candidate);
    if (firebaseUrl) return firebaseUrl;
    const fb = fallbackForCategory(
        product.categoryName || product.category || product.categorySlug,
        product
    );
    return fb || PLACEHOLDER_PATH;
}

export function getProductGallery(product, count = 4) {
    if (!product) return [];
    const sources = []
        .concat(product.images || [])
        .concat(product.imageUrl ? [product.imageUrl] : [])
        .concat(product.imagePath ? [product.imagePath] : []);
    const seen = new Set();
    const resolved = [];
    sources.forEach((source) => {
        const url =
            isAbsoluteUrl(source) || isLocalPath(source) ?
            source :
            buildFirebaseImageUrl(source);
        if (url && !seen.has(url)) {
            seen.add(url);
            resolved.push(url);
        }
    });
    if (resolved.length === 0) {
        resolved.push(
            fallbackForCategory(product.categoryName || product.category || product.categorySlug, product) ||
            PLACEHOLDER_PATH
        );
    }
    while (resolved.length < count) {
        resolved.push(resolved[resolved.length - 1]);
    }
    return resolved;
}

export const IMAGE_PLACEHOLDER = PLACEHOLDER_PATH;

/** Inline SVG used only when the static placeholder file fails to load */
export const IMAGE_PLACEHOLDER_INLINE = PLACEHOLDER_DATA_URL;