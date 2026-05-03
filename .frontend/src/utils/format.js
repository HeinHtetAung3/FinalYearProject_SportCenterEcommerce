/** Maps app language codes to BCP 47 tags for Intl (numbers, dates, currency). */
const LANGUAGE_TO_LOCALE = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR'
};

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_LOCALE_TAG = 'en-US';
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_TIMEZONE = 'America/New_York';

let localeTag = DEFAULT_LOCALE_TAG;
let currencyCode = DEFAULT_CURRENCY;
let timeZone = DEFAULT_TIMEZONE;

let currencyFormatter = new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2
});

function rebuildCurrencyFormatter() {
    currencyFormatter = new Intl.NumberFormat(localeTag, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2
    });
}

/**
 * Updates storefront formatting (currency, date locale, IANA time zone) and the html lang attribute.
 * Called when user settings load or after Save on the settings page.
 */
export function setGlobalLocalePreferences({
    language,
    currency,
    timezone
}) {
    const lang = typeof language === 'string' && language.trim() ? language.trim() : DEFAULT_LANGUAGE;
    localeTag = LANGUAGE_TO_LOCALE[lang] || DEFAULT_LOCALE_TAG;
    currencyCode =
        typeof currency === 'string' && currency.trim() ?
        currency.trim().toUpperCase() :
        DEFAULT_CURRENCY;
    timeZone =
        typeof timezone === 'string' && timezone.trim() ? timezone.trim() : DEFAULT_TIMEZONE;
    rebuildCurrencyFormatter();
    try {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    } catch {
        // ignore non-browser
    }
}

export function resetGlobalLocalePreferences() {
    localeTag = DEFAULT_LOCALE_TAG;
    currencyCode = DEFAULT_CURRENCY;
    timeZone = DEFAULT_TIMEZONE;
    rebuildCurrencyFormatter();
    try {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = DEFAULT_LANGUAGE;
        }
    } catch {
        // ignore
    }
}

export function getGlobalLocalePreferences() {
    return {
        localeTag,
        currency: currencyCode,
        timezone: timeZone
    };
}

export function formatCurrency(value) {
    const numeric = Number(value || 0);
    if (Number.isNaN(numeric)) return currencyFormatter.format(0);
    return currencyFormatter.format(numeric);
}

/** Integers with grouping, using the current locale (e.g. home page stats). */
export function formatInteger(value) {
    const numeric = Number(value || 0);
    const n = Number.isNaN(numeric) ? 0 : Math.trunc(numeric);
    return new Intl.NumberFormat(localeTag, {
        maximumFractionDigits: 0
    }).format(n);
}

/**
 * Date-only in the user's time zone and locale (e.g. order list snippets).
 */
export function formatDateInUserTimezone(dateLike) {
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(localeTag, {
        timeZone,
        dateStyle: 'medium'
    }).format(d);
}

/**
 * Date and time in the user's time zone and locale (e.g. order detail).
 */
export function formatDateTimeInUserTimezone(dateLike) {
    const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(localeTag, {
        timeZone,
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(d);
}

export function classNames(...values) {
    return values.filter(Boolean).join(' ');
}