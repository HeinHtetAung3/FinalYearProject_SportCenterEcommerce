import apiClient from './apiClient';

/**
 * Catalog service backed strictly by backend API.
 */

function catalogUnavailableError(context) {
    const err = new Error(
        `Unable to load ${context}. Check your connection or try again. If you are running a preview without an API, set VITE_ALLOW_DEMO_FALLBACK=true.`
    );
    err.code = 'CATALOG_UNAVAILABLE';
    return err;
}

function rethrowIfApiError(error) {
    if (error && error.message) throw error;
}

function pageSizeFromParams(params) {
    if (params && params.size !== undefined && params.size !== null) return params.size;
    return 24;
}

export async function fetchCategories() {
    try {
        const {
            data
        } = await apiClient.get('/api/categories');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        rethrowIfApiError(error);
        throw catalogUnavailableError('categories');
    }
}

export async function fetchProducts(params) {
    try {
        const {
            data
        } = await apiClient.get('/api/products', {
            params
        });
        if (data && typeof data === 'object') {
            return {
                ...data,
                items: Array.isArray(data.items) ? data.items : []
            };
        }
        return {
            items: [],
            totalItems: 0,
            totalPages: 0,
            page: 0,
            size: pageSizeFromParams(params)
        };
    } catch (error) {
        rethrowIfApiError(error);
        throw catalogUnavailableError('products');
    }
}

export async function fetchProductById(productId) {
    try {
        const {
            data
        } = await apiClient.get(`/api/products/${productId}`);
        if (data) return data;
        throw new Error('Product not found.');
    } catch (error) {
        if (error instanceof Error && error.message === 'Product not found.') throw error;
        rethrowIfApiError(error);
        throw catalogUnavailableError('this product');
    }
}

/**
 * Related products for the PDP rail. In strict mode, failures yield an empty list
 * so the page can still render.
 */
export async function fetchRelatedProducts(product, limit = 8) {
    if (!product || product.id === undefined || product.id === null) return [];

    try {
        const {
            data
        } = await apiClient.get(`/api/products/${product.id}/related`, {
            params: {
                limit
            }
        });
        const items = Array.isArray(data) ? data : [];
        return items
            .filter((p) => Number(p.id) !== Number(product.id))
            .slice(0, limit);
    } catch {
        return [];
    }
}