import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredAuth, normalizeAuthRecord, persistAuth, clearAuth } from '../utils/storage';
import { subscribeSessionInvalidated } from '../utils/sessionInvalidationBridge';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => normalizeAuthRecord(getStoredAuth()));

  // Upgrade legacy localStorage that had tokens but no `email` (API only returns JWTs).
  useEffect(() => {
    const raw = getStoredAuth();
    if (!raw?.accessToken) return;
    const norm = normalizeAuthRecord(raw);
    const emailUpgrade = norm?.email && (!raw.email || String(raw.email).trim() !== norm.email);
    const roleUpgrade = norm?.role && (!raw.role || String(raw.role).trim() !== norm.role);
    if (emailUpgrade || roleUpgrade) {
      persistAuth(norm);
      setAuthState(norm);
    }
  }, []);

  // Keep React auth in sync when apiClient clears storage (e.g. failed token refresh).
  useEffect(() => {
    return subscribeSessionInvalidated(() => {
      setAuthState(null);
      clearAuth();
    });
  }, []);

  const setSession = useCallback((next) => {
    const normalized = normalizeAuthRecord(next);
    setAuthState(normalized);
    persistAuth(normalized);
  }, []);

  const clearSession = useCallback(() => {
    setAuthState(null);
    clearAuth();
  }, []);

  const setProfileImageUrl = useCallback((profileImageUrl) => {
    setAuthState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, profileImageUrl: profileImageUrl || '' };
      persistAuth(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      authState,
      isAuthenticated: Boolean(authState?.accessToken),
      isAdmin: authState?.role === 'ADMIN',
      setSession,
      clearSession,
      setProfileImageUrl
    }),
    [authState, setSession, clearSession, setProfileImageUrl]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
