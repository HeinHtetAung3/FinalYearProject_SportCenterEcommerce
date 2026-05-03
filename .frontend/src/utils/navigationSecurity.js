/**
 * Returns a safe in-app path for post-login redirect, or null.
 * Rejects protocol-relative URLs, external-looking paths, and /login.
 */
export function getSafeReturnPath(raw) {
    if (raw == null || typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed.startsWith('/')) return null;
    if (trimmed.startsWith('//')) return null;
    if (/[\r\n\0]/.test(trimmed)) return null;
    const pathPart = trimmed.split(/[?#]/)[0];
    const lower = pathPart.toLowerCase();
    if (lower === '/login' || lower.startsWith('/login/')) return null;
    return trimmed;
}