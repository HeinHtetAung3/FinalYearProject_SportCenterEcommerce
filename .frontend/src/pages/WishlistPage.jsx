import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/feedback/EmptyState';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import ProductImage from '../components/products/ProductImage';
import CartLineVariant from '../components/cart/CartLineVariant';
import WishlistMoveToBagModal from '../components/wishlist/WishlistMoveToBagModal';
import { IconArrowRight, IconHeart, IconShare, IconTrash } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { fetchWishlist, removeWishlistItem } from '../services/commerceService';
import { fetchCart } from '../services/cartService';
import { fetchProductById } from '../services/catalogService';
import { getProductGallery } from '../utils/firebaseStorage';
import { formatCurrency } from '../utils/format';
import { SPORT_ENTRIES } from '../components/layout/Header';

async function shareOrCopy(url, title, showToast) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard', { variant: 'success' });
  } catch {
    showToast('Could not copy link', { variant: 'error' });
  }
}

function WishlistPage() {
  const { authState, isAuthenticated } = useAuth();
  const { refreshWishlist } = useWishlist();
  const { setCartItems, addToCart } = useCart();
  const { showToast, showAddedToBag } = useUI();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchWishlist(authState);
        if (!cancelled) setWishlist(data?.items || []);
      } catch (apiError) {
        if (!cancelled) setError(apiError.message || 'Unable to load wishlist.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isAuthenticated) load();
    else setLoading(false);
    return () => {
      cancelled = true;
    };
  }, [authState, isAuthenticated]);

  const refreshWishlistAndCart = useCallback(async () => {
    const [wl, cart] = await Promise.all([fetchWishlist(authState), fetchCart()]);
    setWishlist(wl?.items || []);
    setCartItems(cart?.items || []);
  }, [authState, setCartItems]);

  const finalizeMoveToBag = useCallback(
    async (item, product, { size, color }) => {
      const gallery = getProductGallery(product, 4);
      const primaryImage = gallery[0] || item.imageUrl || product.imageUrl;

      await addToCart(product.id, 1, {
        size,
        color,
        snapshot: {
          name: product.name || item.productName,
          brand: product.brand,
          price: product.price ?? item.price,
          imageUrl: primaryImage,
          images: product.images,
          categoryId: product.categoryId,
          categoryName: product.categoryName || product.category,
          stock: product.stock
        }
      });

      showAddedToBag({
        productId: product.id,
        productName: item.productName || product.name,
        brand: product.brand,
        imageUrl: primaryImage
      });

      try {
        await removeWishlistItem(item.productId, authState);
      } catch {
        showToast('Added to bag, but we could not remove it from your wishlist.', { variant: 'error' });
      }

      await refreshWishlistAndCart();
      await refreshWishlist();
      setMoveModal(null);
    },
    [addToCart, authState, refreshWishlist, refreshWishlistAndCart, showAddedToBag, showToast]
  );

  const handleMoveToBag = async (item) => {
    setBusyId(item.productId);
    setError('');
    try {
      const product = await fetchProductById(item.productId);
      const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
      const hasColors = Array.isArray(product?.colors) && product.colors.length > 0;
      const isOutOfStock = Number(product?.stock) === 0;

      if (isOutOfStock) {
        showToast('This item is sold out.', { variant: 'error' });
        return;
      }

      if (!hasSizes && !hasColors) {
        await finalizeMoveToBag(item, product, {});
        return;
      }

      setMoveModal({ item, product });
    } catch (apiError) {
      setError(apiError.message || 'Unable to load product options.');
    } finally {
      setBusyId(null);
    }
  };

  const handleModalConfirm = async ({ size, color }) => {
    if (!moveModal) return;
    await finalizeMoveToBag(moveModal.item, moveModal.product, { size, color });
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      const response = await removeWishlistItem(productId, authState);
      setWishlist(response?.items || []);
      await refreshWishlist();
    } catch (apiError) {
      setError(apiError.message || 'Unable to remove item.');
    } finally {
      setBusyId(null);
    }
  };

  const handleShareList = () => {
    const url = window.location.href;
    shareOrCopy(url, 'My wishlist', showToast);
  };

  const handleShareProduct = (item) => {
    const origin = window.location.origin;
    const url = `${origin}/products/${item.productId}`;
    shareOrCopy(url, item.productName, showToast);
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <EmptyState
          icon={<IconHeart />}
          title="Sign in to view your wishlist"
          description="Save your favourite gear and find it on any device."
          action={
            <Button to="/login" variant="primary">
              Sign in
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container>
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
            Saved
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">
            Wishlist
          </h1>
          <p className="mt-2 text-ink-500">
            {wishlist.length} item{wishlist.length === 1 ? '' : 's'} you’re eyeing.
          </p>
        </div>
        {!loading && wishlist.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<IconShare className="h-4 w-4" />}
            onClick={handleShareList}
          >
            Share list
          </Button>
        ) : null}
      </header>

      {loading ? <LoadingSpinner label="Loading wishlist..." /> : null}

      {!loading && error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : null}

      {!loading && !error && wishlist.length === 0 ? (
        <section className="relative overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-white via-ink-50/50 to-accent-50/20 shadow-soft">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-accent-400/15 blur-3xl" aria-hidden />
          <div className="relative px-6 py-14 text-center sm:px-12 sm:py-16">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-accent-600 shadow-soft ring-1 ring-ink-100">
              <IconHeart className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
              Your wishlist is waiting
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-600">
              Save products you love with the heart icon on any card or detail page. When you’re ready, move them to
              your bag with the right size and colour.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button to="/products" variant="accent" size="lg" rightIcon={<IconArrowRight className="h-4 w-4" />}>
                Discover gear
              </Button>
              <Button to="/products?sort=ratingDesc" variant="outline" size="lg">
                Top rated
              </Button>
            </div>
            <div className="mx-auto mt-10 max-w-lg border-t border-ink-100/80 pt-8">
              <p className="text-2xs font-semibold uppercase tracking-widest text-ink-400">Popular now</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-2">
                {SPORT_ENTRIES.slice(0, 6).map((entry) => (
                  <li key={entry.to}>
                    <Link
                      to={entry.to}
                      className="inline-flex rounded-full border border-ink-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-accent-300 hover:text-accent-700"
                    >
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && wishlist.length > 0 ? (
        <ul className="grid gap-4">
          {wishlist.map((item) => (
            <li
              key={item.productId}
              className="card-base flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-ink-100">
                <ProductImage product={{ ...item, name: item.productName }} className="h-full w-full" rounded="rounded-2xl" />
              </div>
              <div className="flex-1">
                {item.brand ? (
                  <p className="text-2xs font-bold uppercase tracking-widest text-accent-600">
                    {item.brand}
                  </p>
                ) : null}
                <Link
                  to={`/products/${item.productId}`}
                  className="text-base font-semibold text-ink-900 hover:text-accent-600"
                >
                  {item.productName}
                </Link>
                <CartLineVariant size={item.size} color={item.color} className="mt-1" />
                <p className="mt-1 text-sm font-semibold text-ink-900">
                  {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleShareProduct(item)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                  aria-label={`Share ${item.productName}`}
                >
                  <IconShare className="h-4 w-4" />
                </button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleMoveToBag(item)}
                  disabled={busyId === item.productId}
                >
                  {busyId === item.productId ? '…' : 'Move to bag'}
                </Button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.productId)}
                  disabled={busyId === item.productId}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Remove"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <WishlistMoveToBagModal
        open={Boolean(moveModal)}
        onClose={() => setMoveModal(null)}
        wishlistItem={moveModal?.item}
        product={moveModal?.product}
        onConfirm={handleModalConfirm}
      />
    </Container>
  );
}

export default WishlistPage;
