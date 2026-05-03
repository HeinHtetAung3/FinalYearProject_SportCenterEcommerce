import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { fetchUserSettings, normalizeUserSettings } from '../services/userSettingsService';
import { getStoredUserPreferences, persistUserPreferences } from '../utils/storage';
import { applyThemeDarkMode, readStoredDarkMode } from '../utils/theme';
import {
  resetGlobalLocalePreferences,
  setGlobalLocalePreferences
} from '../utils/format';

const PreferencesContext = createContext(null);

function preferencesReducer(state, action) {
  if (action.type === 'set') {
    return {
      language: action.language,
      currency: action.currency,
      timezone: action.timezone
    };
  }
  return state;
}

const DEFAULT_PREFS = {
  language: 'en',
  currency: 'USD',
  timezone: 'America/New_York'
};

export function PreferencesProvider({ children }) {
  const { isAuthenticated, authState } = useAuth();
  const email = authState?.email || '';
  const { pathname } = useLocation();
  const [prefs, dispatchPrefs] = useReducer(preferencesReducer, DEFAULT_PREFS);
  const [, bump] = useReducer((x) => x + 1, 0);

  const applyFromNormalizedSettings = useCallback(
    (settings) => {
      const n = normalizeUserSettings(settings);
      setGlobalLocalePreferences({
        language: n.language,
        currency: n.currency,
        timezone: n.timezone
      });
      dispatchPrefs({
        type: 'set',
        language: n.language,
        currency: n.currency,
        timezone: n.timezone
      });
      applyThemeDarkMode(n.darkMode);
      bump();
    },
    [bump]
  );

  useEffect(() => {
    if (!isAuthenticated || !email) {
      resetGlobalLocalePreferences();
      dispatchPrefs({ type: 'set', ...DEFAULT_PREFS });
      applyThemeDarkMode(readStoredDarkMode());
      bump();
      return;
    }

    const cached = getStoredUserPreferences(email);
    if (cached) {
      setGlobalLocalePreferences(cached);
      dispatchPrefs({ type: 'set', ...cached });
      bump();
    }

    let cancelled = false;
    (async () => {
      try {
        const s = await fetchUserSettings();
        if (cancelled) return;
        persistUserPreferences(email, {
          language: s.language,
          currency: s.currency,
          timezone: s.timezone
        });
        applyFromNormalizedSettings(s);
      } catch {
        if (cancelled) return;
        if (cached) {
          setGlobalLocalePreferences(cached);
          dispatchPrefs({ type: 'set', ...cached });
          bump();
        } else {
          resetGlobalLocalePreferences();
          dispatchPrefs({ type: 'set', ...DEFAULT_PREFS });
          applyThemeDarkMode(readStoredDarkMode());
          bump();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, email, pathname, applyFromNormalizedSettings, bump]);

  const syncFromSavedSettings = useCallback(
    (settings) => {
      if (!email) return;
      const n = normalizeUserSettings(settings);
      persistUserPreferences(email, {
        language: n.language,
        currency: n.currency,
        timezone: n.timezone
      });
      applyFromNormalizedSettings(n);
    },
    [email, applyFromNormalizedSettings]
  );

  const value = useMemo(
    () => ({
      ...prefs,
      syncFromSavedSettings
    }),
    [prefs, syncFromSavedSettings]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}
