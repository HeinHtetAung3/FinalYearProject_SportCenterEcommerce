/**
 * Demo catalog used as a graceful fallback when the backend API is
 * unreachable (e.g. running `npm run dev` without starting Spring Boot).
 *
 * The product list itself lives in `./products.js` (single array,
 * { id, name, price, category, imageUrl, rating, stock, description }).
 * This file just shapes that data into the structure the UI expects:
 *
 *   - `mockCategories`  — list of { id, name, slug }
 *   - `mockProducts`    — products with `categoryId` / `categoryName`
 *                         derived from each entry's `category` string
 *   - `paginate()` / `findMockProduct()` — same API the live backend
 *                                          response would have
 */

import {
    products as RAW_PRODUCTS
} from './products';

/**
 * Normalize a colour label to the same slug shape used in URL query params
 * (e.g. "Volt / Black" → "volt-black") for facet matching.
 */
export function slugifyColorLabel(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\//g, ' ')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function parseCsv(str) {
    if (str === undefined || str === null || str === '') return [];
    const s = String(str).trim();
    if (!s) return [];
    return s.split(',').map((part) => part.trim()).filter(Boolean);
}

/**
 * True when any advanced PLP facet is active. Used by mock pagination
 * when falling back from the API with facet query params applied locally.
 */
export function hasFacetParams(params = {}) {
    const p = params;
    if (!p || typeof p !== 'object') return false;
    if (typeof p.brand === 'string' && p.brand.trim()) return true;
    if (typeof p.eu === 'string' && p.eu.trim()) return true;
    if (typeof p.color === 'string' && p.color.trim()) return true;
    if (typeof p.gender === 'string' && p.gender.trim()) return true;
    if (p.minPrice !== undefined && p.minPrice !== null && p.minPrice !== '') return true;
    if (p.maxPrice !== undefined && p.maxPrice !== null && p.maxPrice !== '') return true;
    if (p.inStock === true || p.inStock === 1 || p.inStock === '1') return true;
    if (p.isNewArrival === true || p.isNewArrival === 1 || p.isNewArrival === '1') return true;
    if (p.isBestSeller === true || p.isBestSeller === 1 || p.isBestSeller === '1') return true;
    if (p.onSale === true || p.onSale === 1 || p.onSale === '1') return true;
    return false;
}

/**
 * Brand / boot-size / colour / price / stock filters. Only products that
 * define the relevant fields participate (e.g. brand filter excludes
 * products with no `brand` field).
 */
export function applyFacetFilters(items, params = {}) {
    let filtered = Array.isArray(items) ? items.slice() : [];

    const brands = parseCsv(params.brand);
    if (brands.length > 0) {
        const wanted = new Set(brands.map((b) => String(b).toLowerCase()));
        filtered = filtered.filter((item) => {
            const b = item.brand ? String(item.brand).toLowerCase() : '';
            return b && wanted.has(b);
        });
    }

    const euRaw = parseCsv(params.eu);
    if (euRaw.length > 0) {
        const wanted = new Set(euRaw.map((n) => Number(n)).filter((n) => !Number.isNaN(n)));
        filtered = filtered.filter((item) => {
            if (!Array.isArray(item.sizes) || item.sizes.length === 0) return false;
            return item.sizes.some((s) => wanted.has(Number(s)));
        });
    }

    const colorSlugs = parseCsv(params.color).map((s) => String(s).toLowerCase());
    if (colorSlugs.length > 0) {
        const wanted = new Set(colorSlugs);
        filtered = filtered.filter((item) => {
            if (!Array.isArray(item.colors) || item.colors.length === 0) return false;
            return item.colors.some((c) => wanted.has(slugifyColorLabel(c)));
        });
    }

    const genders = parseCsv(params.gender).map((s) => String(s).toLowerCase());
    if (genders.length > 0) {
        const wanted = new Set(genders);
        // Unisex items are always included so the mega-menu Men / Women /
        // Kids tabs still surface shared performance gear (e.g. football
        // boots, running shoes) that does not declare a specific gender.
        filtered = filtered.filter((item) => {
            const g = item.gender ? String(item.gender).toLowerCase() : '';
            if (!g) return true;
            if (g === 'unisex') return true;
            return wanted.has(g);
        });
    }

    const minP =
        params.minPrice !== undefined && params.minPrice !== null && params.minPrice !== '' ?
        Number(params.minPrice) :
        null;
    const maxP =
        params.maxPrice !== undefined && params.maxPrice !== null && params.maxPrice !== '' ?
        Number(params.maxPrice) :
        null;

    if (minP !== null && !Number.isNaN(minP)) {
        filtered = filtered.filter((item) => Number(item.price) >= minP);
    }
    if (maxP !== null && !Number.isNaN(maxP)) {
        filtered = filtered.filter((item) => Number(item.price) <= maxP);
    }

    if (params.inStock === true || params.inStock === 1 || params.inStock === '1') {
        filtered = filtered.filter((item) => Number(item.stock) > 0);
    }

    if (params.isNewArrival === true || params.isNewArrival === 1 || params.isNewArrival === '1') {
        filtered = filtered.filter((item) => item.newArrival === true);
    }

    if (params.isBestSeller === true || params.isBestSeller === 1 || params.isBestSeller === '1') {
        filtered = filtered.filter((item) => item.bestSeller === true);
    }

    if (params.onSale === true || params.onSale === 1 || params.onSale === '1') {
        filtered = filtered.filter((item) => {
            const cap = item.compareAtPrice != null ? Number(item.compareAtPrice) : null;
            const price = Number(item.price);
            return cap != null && !Number.isNaN(cap) && !Number.isNaN(price) && cap > price;
        });
    }

    return filtered;
}

const brandsFromData = (() => {
    const s = new Set();
    RAW_PRODUCTS.forEach((p) => {
        if (p.brand) s.add(p.brand);
    });
    return [...s].sort((a, b) => a.localeCompare(b));
})();

const colorSwatchesFromData = (() => {
    const map = new Map();
    RAW_PRODUCTS.forEach((p) => {
        if (Array.isArray(p.colors)) {
            p.colors.forEach((label) => {
                const slug = slugifyColorLabel(label);
                if (slug && !map.has(slug)) map.set(slug, label);
            });
        }
    });
    return [...map.entries()]
        .map(([slug, label]) => ({
            slug,
            label
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
})();

/** Brand chips for the PLP filter sidebar (demo products that define `brand`). */
export const PLP_BRAND_OPTIONS = brandsFromData;

/** EU sizes shown as filter toggles (footwear with `sizes` arrays). */
export const PLP_EU_SIZE_OPTIONS = [40, 41, 42, 43, 44];

/** Unique colourways across products that expose `colors[]`, for swatch grid. */
export const PLP_COLOR_SWATCHES = colorSwatchesFromData;

/**
 * Gender pills for the PLP filter sidebar. Slugs match the URL `gender=`
 * query param (e.g. `?gender=men,women`). Unisex products are always
 * included alongside a specific gender — see `applyFacetFilters`.
 */
export const PLP_GENDER_OPTIONS = [{
        slug: 'men',
        label: 'Men'
    },
    {
        slug: 'women',
        label: 'Women'
    },
    {
        slug: 'kids',
        label: 'Kids'
    },
    {
        slug: 'unisex',
        label: 'Unisex'
    }
];

export const mockCategories = [{
        id: 1,
        name: 'Running',
        slug: 'running'
    },
    {
        id: 2,
        name: 'Football',
        slug: 'football'
    },
    {
        id: 3,
        name: 'Fitness',
        slug: 'fitness'
    },
    {
        id: 4,
        name: 'Outdoor',
        slug: 'outdoor'
    },
    {
        id: 5,
        name: 'Basketball',
        slug: 'basketball'
    },
    {
        id: 6,
        name: 'Training',
        slug: 'training'
    },
    {
        id: 7,
        name: 'Accessories',
        slug: 'accessories'
    },
    {
        id: 8,
        name: 'Lifestyle',
        slug: 'lifestyle'
    }
];

const CATEGORY_ID_BY_NAME = Object.fromEntries(
    mockCategories.map((c) => [c.name, c.id])
);

export const mockProducts = RAW_PRODUCTS.map((product) => {
    const id = product.id;
    const price = Number(product.price);
    const onSalePattern = id % 7 === 3;
    const compareAt = onSalePattern ? Math.round((price + 28 + (id % 5)) * 100) / 100 : null;
    return {
        ...product,
        categoryId: CATEGORY_ID_BY_NAME[product.category] || null,
        categoryName: product.category,
        newArrival: id % 4 === 1,
        bestSeller: id % 5 === 2,
        compareAtPrice: compareAt
    };
});

export const mockReviews = {
    1: [{
            id: 9001,
            reviewerEmail: 'alex@runners.club',
            rating: 5,
            comment: 'Shaved 12 seconds off my mile time. Best shoes I have ever owned.'
        },
        {
            id: 9002,
            reviewerEmail: 'jordan@fastpace.io',
            rating: 4,
            comment: 'Super lightweight. Wish they came in more colourways.'
        }
    ],
    2: [{
        id: 9101,
        reviewerEmail: 'sam@trailcrew.com',
        rating: 5,
        comment: 'Took these through mud, snow and creeks. Bone dry every time.'
    }],
    22: [{
        id: 9201,
        reviewerEmail: 'coach@matchday.fc',
        rating: 5,
        comment: 'True flight, great grip in the rain. Our team uses nothing else now.'
    }],
    41: [{
        id: 9301,
        reviewerEmail: 'maya@homegym.app',
        rating: 5,
        comment: 'Build quality is unreal. Handle never slips even with chalk-free hands.'
    }]
};

/**
 * Sort, filter and paginate the demo dataset to mirror the backend
 * `ProductListResponse` payload exactly: { items, totalItems, totalPages, page, size }.
 */
export function paginate(items, params = {}) {
    const {
        page = 0,
            size = 12,
            search,
            categoryId,
            sort = 'priceAsc'
    } = params;

    let filtered = items.slice();

    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
        const numericId = Number(categoryId);
        filtered = filtered.filter((item) => Number(item.categoryId) === numericId);
    }

    filtered = applyFacetFilters(filtered, params);

    if (search) {
        const term = String(search).toLowerCase();
        filtered = filtered.filter((item) => [item.name, item.description, item.categoryName, item.brand]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term))
        );
    }

    filtered.sort((a, b) => {
        switch (sort) {
            case 'priceDesc':
                return Number(b.price) - Number(a.price);
            case 'ratingDesc':
                return Number(b.rating || 0) - Number(a.rating || 0);
            case 'nameAsc':
                return String(a.name).localeCompare(String(b.name));
            case 'priceAsc':
            default:
                return Number(a.price) - Number(b.price);
        }
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / size));
    const start = page * size;
    const slice = filtered.slice(start, start + size);

    return {
        items: slice,
        totalItems,
        totalPages,
        page,
        size
    };
}

export function findMockProduct(productId) {
    const numeric = Number(productId);
    return mockProducts.find((product) => product.id === numeric) || null;
}

/**
 * Pick up to `limit` products from the same category as the given product,
 * excluding the product itself. Falls back to top-rated cross-category
 * picks if the category does not have enough siblings (e.g. a brand-new
 * category with only one entry).
 */
export function findMockRelated(productId, limit = 8) {
    const numericId = Number(productId);
    const source = mockProducts.find((p) => p.id === numericId);
    if (!source) return [];

    const sameCategory = mockProducts
        .filter((p) => p.id !== numericId && p.categoryId === source.categoryId)
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

    if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

    const fillers = mockProducts
        .filter((p) =>
            p.id !== numericId &&
            p.categoryId !== source.categoryId &&
            !sameCategory.some((s) => s.id === p.id)
        )
        .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        .slice(0, limit - sameCategory.length);

    return [...sameCategory, ...fillers];
}