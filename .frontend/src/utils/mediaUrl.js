import {
    getApiBaseUrl
} from './apiBase';

function trimTrailingSlash(value) {
    return String(value || '').replace(/\/+$/, '');
}

export function resolveMediaUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const url = rawUrl.trim();
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }
    const base = trimTrailingSlash(getApiBaseUrl());
    if (url.startsWith('/')) {
        return `${base}${url}`;
    }
    return `${base}/${url}`;
}