import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  clearStoredCart,
  clearStoredSelection,
  getEmailFromAccessToken,
  getStoredCart,
  getStoredSelection,
  makeCartLineKey,
  persistCart,
  persistSelection
} from '../utils/storage';
import {
  addCartItem,
  clearCartItems,
  fetchCart,
  removeCartItem,
  updateCartItem
} from '../services/cartService';

/**
 * CartContext owns the canonical cart state on the client.
 *
 * Per-user isolation:
 *   - The bag is keyed by the signed-in user's email (or "guest" when
 *     nobody is signed in) both in localStorage and in our in-memory
 *     state, so User A and User B never see each other's lines.
 *   - On sign out we wipe the local cache for the previous owner —
 *     making API calls is unnecessary because the backend cart is
 *     already attached to that user's account; the guest cache stays
 *     empty until they sign in again.
 *   - On sign in we drop any guest cache and fetch the freshly
 *     authenticated user's cart from the backend, which is the source
 *     of truth.
 *
 * Variant-aware design rule:
 *   Same productId in two different sizes (or colors) MUST produce two
 *   separate cart lines so the user can review and check out a real
 *   per-SKU bag — exactly the way Nike / Adidas behave. Backend may
 *   still merge by `productId` (today's Spring Boot impl does), so we
 *   keep the frontend authoritative: every mutation is applied locally
 *   first, then sent to the backend, and finally any backend response
 *   is reconciled with our local lines via `mergeBackendWithLocal()`
 *   below — preserving variant lines whenever the backend response
 *   would otherwise collapse them.
 */

const CartContext = createContext(null);
const GUEST_OWNER = 'guest';

function ownerForAuth(authState) {
  const email = authState?.email;
  if (typeof email === 'string') {
    const trimmed = email.trim().toLowerCase();
    if (trimmed) return trimmed;
  }
  const fromToken = getEmailFromAccessToken(authState?.accessToken);
  if (fromToken) return fromToken;
  return GUEST_OWNER;
}

function hasVariant(item) {
  if (!item) return false;
  const hasSize = item.size !== undefined && item.size !== null && item.size !== '';
  const hasColor = item.color !== undefined && item.color !== null && item.color !== '';
  return hasSize || hasColor;
}

/**
 * Defensive image-field copy.
 *
 * The backend cart response now includes `imageUrl` / `images` / `brand`
 * / `categoryName` (see CartItemResponse), but if a stale server or a
 * proxy ever drops them we fall back to whatever the matching local
 * line already remembers, so the bag UI never shows a generic
 * placeholder for a product the customer just added.
 */
function preserveDisplayFields(backendItem, localMatch) {
  if (!localMatch) return backendItem;
  const next = { ...backendItem };
  if (next.imageUrl == null && localMatch.imageUrl != null) next.imageUrl = localMatch.imageUrl;
  if (
    (!Array.isArray(next.images) || next.images.length === 0) &&
    Array.isArray(localMatch.images) &&
    localMatch.images.length > 0
  ) {
    next.images = localMatch.images;
  }
  if (next.brand == null && localMatch.brand != null) next.brand = localMatch.brand;
  if (next.categoryName == null && localMatch.categoryName != null) {
    next.categoryName = localMatch.categoryName;
  }
  if (next.productName == null && localMatch.productName != null) {
    next.productName = localMatch.productName;
  }
  return next;
}

function findLocalMatch(localItems, backendItem) {
  const pid = Number(backendItem.productId);
  return localItems.find((item) => Number(item.productId) === pid) || null;
}

/**
 * Reconcile a backend cart response with the locally tracked cart.
 *
 * For any productId that has at least one local variant line, we keep
 * ALL local lines for that product unchanged (the backend has already
 * been notified of the mutation and we trust our local variant
 * splitting). For any productId with no local variant data we fall
 * back to the backend representation so server-driven changes (e.g.
 * stock corrections from another tab) still propagate, but we still
 * splice over the local image / brand snapshot so the user never sees
 * a generic placeholder when the API response lacks those fields.
 */
function mergeBackendWithLocal(backendItems, localItems) {
  const safeBackend = Array.isArray(backendItems) ? backendItems : [];
  const safeLocal = Array.isArray(localItems) ? localItems : [];

  const variantProductIds = new Set(
    safeLocal.filter(hasVariant).map((item) => Number(item.productId))
  );

  if (variantProductIds.size === 0) {
    return safeBackend.map((item) => preserveDisplayFields(item, findLocalMatch(safeLocal, item)));
  }

  const merged = [];
  const replaced = new Set();

  for (const backendItem of safeBackend) {
    const pid = Number(backendItem.productId);
    if (variantProductIds.has(pid)) {
      if (!replaced.has(pid)) {
        merged.push(...safeLocal.filter((item) => Number(item.productId) === pid));
        replaced.add(pid);
      }
    } else {
      merged.push(preserveDisplayFields(backendItem, findLocalMatch(safeLocal, backendItem)));
    }
  }

  for (const localItem of safeLocal) {
    const pid = Number(localItem.productId);
    if (variantProductIds.has(pid) && !replaced.has(pid)) {
      merged.push(localItem);
      replaced.add(pid);
    }
  }

  return merged;
}

function buildCartLine(productId, quantity, options = {}) {
  const { size, color, snapshot } = options;
  const line = {
    productId: Number(productId),
    quantity
  };
  if (size !== undefined && size !== null && size !== '') {
    line.size = size;
  }
  if (color !== undefined && color !== null && color !== '') {
    line.color = color;
  }
  if (snapshot) {
    line.productName = snapshot.productName || snapshot.name;
    line.brand = snapshot.brand;
    line.unitPrice = Number(snapshot.unitPrice ?? snapshot.price ?? 0);
    line.imageUrl = snapshot.imageUrl;
    if (Array.isArray(snapshot.images)) line.images = snapshot.images;
    line.categoryId = snapshot.categoryId;
    line.categoryName = snapshot.categoryName || snapshot.category;
    line.stock = snapshot.stock;
  }
  // The backend assigns a stable numeric id — preserve it on the line
  // when the upstream caller already has one (e.g. a re-add coming from
  // a fetched cart) so the selection logic keeps tracking it.
  return line;
}

function localUpsertLine(items, line) {
  const key = makeCartLineKey(line.productId, line.size, line.color);
  const idx = items.findIndex(
    (existing) => makeCartLineKey(existing.productId, existing.size, existing.color) === key
  );
  if (idx === -1) {
    return [...items, line];
  }
  const next = items.slice();
  next[idx] = {
    ...next[idx],
    ...line,
    quantity: (next[idx].quantity || 0) + line.quantity
  };
  return next;
}

function localUpdateQuantity(items, productId, size, color, quantity) {
  const key = makeCartLineKey(productId, size, color);
  if (quantity <= 0) {
    return items.filter(
      (item) => makeCartLineKey(item.productId, item.size, item.color) !== key
    );
  }
  return items.map((item) =>
    makeCartLineKey(item.productId, item.size, item.color) === key
      ? { ...item, quantity }
      : item
  );
}

function localRemove(items, productId, size, color) {
  const key = makeCartLineKey(productId, size, color);
  return items.filter(
    (item) => makeCartLineKey(item.productId, item.size, item.color) !== key
  );
}

export function CartProvider({ children }) {
  const { authState, isAuthenticated } = useAuth();
  const owner = ownerForAuth(authState);
  const [cartOwner, setCartOwner] = useState(owner);
  const [cartItems, setCartItems] = useState(() => getStoredCart(owner));
  const [cartLoading, setCartLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set(getStoredSelection(owner)));
  const previousOwnerRef = useRef(owner);

  useEffect(() => {
    const previousOwner = previousOwnerRef.current;
    const ownerChanged = previousOwner !== owner;

    let cancelled = false;

    async function syncCart() {
      if (ownerChanged) {
        // When signing in, capture the guest bag *before* clearing the
        // guest namespace so items added while logged out are not lost.
        const guestCartSnapshot =
          previousOwner === GUEST_OWNER && owner !== GUEST_OWNER ? getStoredCart(GUEST_OWNER) : [];
        clearStoredCart(previousOwner);
        clearStoredSelection(previousOwner);
        const localForNewOwner = getStoredCart(owner);
        const initialItems =
          localForNewOwner.length > 0 ? localForNewOwner : guestCartSnapshot;
        setCartOwner(owner);
        setCartItems(initialItems);
        // Hydrate the new owner's saved selection. We re-prune below
        // once the backend cart has been fetched and merged so stale
        // ids (e.g. lines purchased on another device) drop off.
        setSelectedIds(new Set(getStoredSelection(owner)));
        if (initialItems.length > 0) {
          persistCart(initialItems, owner);
        }
        previousOwnerRef.current = owner;

        if (owner === GUEST_OWNER) {
          // Signing out: nothing to fetch; the local guest cart is
          // empty (we just cleared the previous owner) and the
          // backend cart is gated behind authentication.
          return;
        }
      }

      if (!isAuthenticated) {
        return;
      }

      setCartLoading(true);
      try {
        const local = getStoredCart(owner);
        const response = await fetchCart();
        if (cancelled) return;
        const backendItems = response?.items || [];
        const merged = mergeBackendWithLocal(backendItems, local);
        persistCart(merged, owner);
        setCartItems(merged);

        // If the backend cart is empty but the local guest cache had
        // items the user picked before signing in, push them up so
        // their bag survives the login.
        if (Array.isArray(local) && local.length > 0 && backendItems.length === 0) {
          try {
            await clearCartItems();
            for (const line of local) {
              await addCartItem({
                productId: line.productId,
                quantity: line.quantity,
                size: line.size,
                color: line.color
              });
            }
            const response2 = await fetchCart();
            if (cancelled) return;
            const backendItems2 = response2?.items || [];
            const merged2 = mergeBackendWithLocal(backendItems2, local);
            persistCart(merged2, owner);
            setCartItems(merged2);
          } catch {
            // Best effort only — keep whatever cart we already have.
          }
        }
      } catch {
        // Backend unavailable — keep the locally restored cart for this owner.
      } finally {
        if (!cancelled) setCartLoading(false);
      }
    }

    syncCart();
    return () => {
      cancelled = true;
    };
  }, [owner, isAuthenticated]);

  // Prune selection whenever cart contents change so we never carry
  // stale ids (e.g. a line removed in another tab or already
  // purchased) into the next checkout. Persist after pruning so the
  // user's selection survives a page refresh.
  useEffect(() => {
    const liveIds = new Set(
      cartItems
        .map((item) => (item.id == null ? null : Number(item.id)))
        .filter((id) => id !== null && Number.isFinite(id))
    );
    setSelectedIds((current) => {
      let mutated = false;
      const next = new Set();
      for (const id of current) {
        if (liveIds.has(id)) {
          next.add(id);
        } else {
          mutated = true;
        }
      }
      const finalSet = mutated ? next : current;
      persistSelection(Array.from(finalSet), cartOwner);
      return finalSet;
    });
  }, [cartItems, cartOwner]);

  const value = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const total = cartItems.reduce((sum, item) => {
      const price = Number(item.unitPrice ?? item.price ?? 0);
      return sum + price * (item.quantity || 0);
    }, 0);

    // Lines that have a backend id are eligible for selection — guest /
    // optimistic-only lines are not yet persisted server-side and
    // therefore cannot be part of a selective checkout.
    const selectableItems = cartItems.filter(
      (item) => item.id != null && Number.isFinite(Number(item.id))
    );
    const selectedItems = selectableItems.filter((item) => selectedIds.has(Number(item.id)));
    const selectedItemCount = selectedItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const selectedTotal = selectedItems.reduce((sum, item) => {
      const price = Number(item.unitPrice ?? item.price ?? 0);
      return sum + price * (item.quantity || 0);
    }, 0);
    const allSelectableSelected =
      selectableItems.length > 0 && selectedItems.length === selectableItems.length;

    const syncItems = (nextItems) => {
      setCartItems(nextItems);
      persistCart(nextItems, cartOwner);
    };

    const updateSelection = (mutator) => {
      setSelectedIds((current) => {
        const next = mutator(new Set(current));
        persistSelection(Array.from(next), cartOwner);
        return next;
      });
    };

    return {
      cartItems,
      itemCount,
      total,
      cartLoading,
      setCartItems: syncItems,

      // Selective-checkout API
      selectedIds,
      selectedItems,
      selectedItemCount,
      selectedTotal,
      allSelectableSelected,
      isSelected: (id) => {
        if (id == null) return false;
        return selectedIds.has(Number(id));
      },
      toggleSelected: (id) => {
        if (id == null) return;
        const numeric = Number(id);
        if (!Number.isFinite(numeric)) return;
        updateSelection((set) => {
          if (set.has(numeric)) set.delete(numeric);
          else set.add(numeric);
          return set;
        });
      },
      selectAll: () => {
        updateSelection(() => {
          const next = new Set();
          for (const item of selectableItems) next.add(Number(item.id));
          return next;
        });
      },
      clearSelection: () => {
        updateSelection(() => new Set());
      },

      addToCart: async (productId, quantity = 1, options = {}) => {
        const line = buildCartLine(productId, quantity, options);
        const optimistic = localUpsertLine(cartItems, line);
        syncItems(optimistic);
        if (!isAuthenticated) return;
        try {
          const response = await addCartItem({
            productId: line.productId,
            quantity,
            size: line.size,
            color: line.color
          });
          syncItems(mergeBackendWithLocal(response?.items || [], optimistic));
        } catch {
          // Backend unavailable — optimistic state already correct.
        }
      },

      updateQuantity: async (productId, quantity, options = {}) => {
        const { size, color } = options;
        const optimistic = localUpdateQuantity(cartItems, productId, size, color, quantity);
        syncItems(optimistic);
        if (!isAuthenticated) return;
        try {
          const response = await updateCartItem(productId, { quantity, size, color });
          syncItems(mergeBackendWithLocal(response?.items || [], optimistic));
        } catch {
          // ignore
        }
      },

      removeFromCart: async (productId, options = {}) => {
        const { size, color } = options;
        const optimistic = localRemove(cartItems, productId, size, color);
        syncItems(optimistic);
        if (!isAuthenticated) return;
        try {
          const response = await removeCartItem(productId, { size, color });
          syncItems(mergeBackendWithLocal(response?.items || [], optimistic));
        } catch {
          // ignore
        }
      },

      clearCart: async () => {
        syncItems([]);
        updateSelection(() => new Set());
        if (!isAuthenticated) return;
        try {
          await clearCartItems();
        } catch {
          // ignore
        }
      }
    };
  }, [cartItems, cartLoading, cartOwner, isAuthenticated, selectedIds]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
