import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchWishlist, toggleWishlistItem as toggleWishlistItemApi } from '../services/commerceService';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistedIds, setWishlistedIds] = useState(() => new Set());
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistedIds(new Set());
      setWishlistCount(0);
      return;
    }
    try {
      const data = await fetchWishlist();
      const items = data?.items || [];
      setWishlistedIds(new Set(items.map((i) => Number(i.productId))));
      setWishlistCount(typeof data?.itemCount === 'number' ? data.itemCount : items.length);
    } catch {
      setWishlistedIds(new Set());
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = useCallback((productId) => wishlistedIds.has(Number(productId)), [wishlistedIds]);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        return { ok: false, reason: 'auth' };
      }
      const id = Number(productId);
      let wasWishlisted = false;

      setWishlistedIds((prev) => {
        wasWishlisted = prev.has(id);
        const next = new Set(prev);
        if (wasWishlisted) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setWishlistCount((c) => (wasWishlisted ? Math.max(0, c - 1) : c + 1));

      try {
        const res = await toggleWishlistItemApi(id);
        const count = typeof res?.wishlistCount === 'number' ? res.wishlistCount : undefined;
        const listed = Boolean(res?.isWishlisted);
        if (count !== undefined) {
          setWishlistCount(count);
        }
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          if (listed) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
        return { ok: true, ...res };
      } catch (err) {
        setWishlistedIds((prev) => {
          const next = new Set(prev);
          if (wasWishlisted) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
        setWishlistCount((c) => (wasWishlisted ? c + 1 : Math.max(0, c - 1)));
        return { ok: false, error: err };
      }
    },
    [isAuthenticated]
  );

  const value = useMemo(
    () => ({
      wishlistCount,
      wishlistedIds,
      isInWishlist,
      toggleWishlist,
      refreshWishlist
    }),
    [wishlistCount, wishlistedIds, isInWishlist, toggleWishlist, refreshWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}
