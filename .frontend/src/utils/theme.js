const STORAGE_KEY = 'sportshub.darkMode';

export function readStoredDarkMode() {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

export function applyThemeDarkMode(darkMode) {
    const on = Boolean(darkMode);
    document.documentElement.classList.toggle('dark', on);
    try {
        localStorage.setItem(STORAGE_KEY, String(on));
    } catch {
        // ignore
    }
    try {
        window.dispatchEvent(new CustomEvent('sportshub-theme-change', {
            detail: {
                dark: on
            }
        }));
    } catch {
        // ignore (non-browser)
    }
}