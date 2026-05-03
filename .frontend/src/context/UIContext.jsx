import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/**
 * Global UI state for ephemeral overlays that the agent rules of state
 * (mini-cart drawer + added-to-bag success modal). Kept separate from
 * CartContext so cart logic stays focused on data, and from AuthContext
 * so route-protected logic doesn't need to depend on UI chrome.
 *
 * Toasts are rendered by ToastHost in AppLayout and can be triggered from
 * any route (checkout errors, future profile saves, etc.).
 */

const UIContext = createContext(null);

function createToastId() {
  return globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function UIProvider({ children }) {
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const variant = options.variant ?? 'info';
      const duration = options.duration ?? (variant === 'loading' ? 0 : 4200);
      const id = createToastId();
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration);
        toastTimersRef.current.set(id, timer);
      }
      return id;
    },
    [dismissToast]
  );

  const openMiniCart = useCallback(() => {
    setAddedItem(null);
    setMiniCartOpen(true);
  }, []);

  const closeMiniCart = useCallback(() => {
    setMiniCartOpen(false);
  }, []);

  const showAddedToBag = useCallback((item) => {
    setMiniCartOpen(false);
    setAddedItem(item);
  }, []);

  const hideAddedToBag = useCallback(() => {
    setAddedItem(null);
  }, []);

  const value = useMemo(
    () => ({
      miniCartOpen,
      openMiniCart,
      closeMiniCart,
      addedItem,
      showAddedToBag,
      hideAddedToBag,
      toasts,
      showToast,
      dismissToast
    }),
    [miniCartOpen, addedItem, openMiniCart, closeMiniCart, showAddedToBag, hideAddedToBag, toasts, showToast, dismissToast]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
