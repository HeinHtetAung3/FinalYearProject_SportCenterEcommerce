import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { applyThemeDarkMode, readStoredDarkMode } from '../utils/theme';

/**
 * Guest / logged-out theme: follow localStorage. Signed-in users get dark mode from
 * {@link PreferencesProvider} when settings load (and on navigation, to match server).
 */
export function ThemeProvider({ children }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    applyThemeDarkMode(readStoredDarkMode());
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      applyThemeDarkMode(readStoredDarkMode());
    }
  }, [isAuthenticated]);

  return children;
}
