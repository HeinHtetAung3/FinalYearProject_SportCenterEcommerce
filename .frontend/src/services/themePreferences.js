import {
    fetchUserSettings,
    updateUserSettings
} from './userSettingsService';
import {
    applyThemeDarkMode
} from '../utils/theme';

/**
 * Flip light/dark on <html>. Guests: localStorage only. Logged-in: persists via PUT /api/user/settings.
 * On API failure, reverts the DOM and rethrows so the caller can toast.
 */
export async function toggleColorTheme(isAuthenticated) {
    const previous = document.documentElement.classList.contains('dark');
    const next = !previous;
    applyThemeDarkMode(next);
    if (!isAuthenticated) {
        return;
    }
    try {
        const settings = await fetchUserSettings();
        await updateUserSettings({
            ...settings,
            darkMode: next
        });
    } catch (err) {
        applyThemeDarkMode(previous);
        throw err;
    }
}