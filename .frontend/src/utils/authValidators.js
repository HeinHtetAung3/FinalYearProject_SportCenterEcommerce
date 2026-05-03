/**
 * Client-side auth form validation (mirrors UX expectations; backend may differ).
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Safe string for forms — avoids optional-chaining tokens that some formatters break. */
function asString(value) {
    if (value === undefined || value === null) return '';
    return String(value);
}

export function validateEmail(value) {
    const trimmed = asString(value).trim();
    if (!trimmed) return 'Enter your email address.';
    if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
    return null;
}

export function validateLoginPassword(value) {
    if (!asString(value).length) return 'Enter your password.';
    return null;
}

export function validateRegisterFullName(value) {
    const trimmed = asString(value).trim();
    if (!trimmed) return 'Enter your full name.';
    if (trimmed.length < 2) return 'Use at least 2 characters.';
    return null;
}

export function validateRegisterPassword(value) {
    if (!asString(value).length) return 'Choose a password.';
    if (asString(value).length < 8) return 'Use at least 8 characters.';
    return null;
}

export function validateConfirmPassword(password, confirm) {
    if (!asString(confirm).length) return 'Confirm your password.';
    if (password !== confirm) return 'Passwords do not match.';
    return null;
}

/**
 * @returns {{ met: number, max: number, label: string, barClass: string }}
 */
export function getPasswordStrength(password) {
    const pw = asString(password);
    if (!pw) {
        return {
            met: 0,
            max: 5,
            label: '',
            barClass: 'bg-ink-100'
        };
    }
    const checks = [
        pw.length >= 8,
        /[a-z]/.test(pw),
        /[A-Z]/.test(pw),
        /\d/.test(pw),
        /[^A-Za-z0-9]/.test(pw)
    ];
    const met = checks.filter(Boolean).length;
    let label = 'Weak';
    let barClass = 'bg-rose-400';
    if (met >= 2) {
        label = 'Fair';
        barClass = 'bg-amber-400';
    }
    if (met >= 3) {
        label = 'Good';
        barClass = 'bg-volt-500';
    }
    if (met >= 4) {
        label = 'Strong';
        barClass = 'bg-emerald-500';
    }
    return {
        met,
        max: 5,
        label,
        barClass
    };
}

/** Filled segments (0–4) for a 4-bar meter */
export function strengthBarCount(met) {
    if (met <= 0) return 0;
    return Math.min(4, Math.ceil((met / 5) * 4));
}