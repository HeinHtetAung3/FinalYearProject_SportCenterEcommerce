import apiClient from './apiClient';

/** @returns {Record<string, unknown>} */
function emptyHome() {
    return {
        banners: [],
        editorialFeatures: [],
        brands: [],
        featuredReviews: [],
        heroStats: null
    };
}

function normalizeHeroStats(raw) {
    if (!raw || typeof raw !== 'object') return null;
    return {
        productCount: Number(raw.productCount) || 0,
        brandCount: Number(raw.brandCount) || 0,
        reviewCount: Number(raw.reviewCount) || 0,
        averageRating: raw.averageRating != null ? Number(raw.averageRating) : null
    };
}

function normalizeHome(data) {
    if (!data || typeof data !== 'object') return emptyHome();
    return {
        banners: Array.isArray(data.banners) ? data.banners : [],
        editorialFeatures: Array.isArray(data.editorialFeatures) ? data.editorialFeatures : [],
        brands: Array.isArray(data.brands) ? data.brands : [],
        featuredReviews: Array.isArray(data.featuredReviews) ? data.featuredReviews : [],
        heroStats: normalizeHeroStats(data.heroStats)
    };
}

/**
 * Public home payload: banners, editorial, brands, featured reviews.
 * On failure returns empty collections so the page can render without the API.
 */
export async function fetchStorefrontHome() {
    try {
        const {
            data
        } = await apiClient.get('/api/storefront/home');
        return normalizeHome(data);
    } catch {
        return emptyHome();
    }
}

/**
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function subscribeNewsletter(email) {
    const {
        data
    } = await apiClient.post('/api/newsletter/subscribe', {
        email
    });
    return {
        success: Boolean(data?.success),
        message: typeof data?.message === 'string' ? data.message : ''
    };
}