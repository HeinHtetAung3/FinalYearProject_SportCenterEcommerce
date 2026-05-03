import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { fetchProducts } from '../../services/catalogService';
import ProductImage from '../products/ProductImage';
import CartLineVariant from './CartLineVariant';
import Button from '../ui/Button';
import { IconArrowRight, IconCheck, IconClose } from '../ui/Icon';
import { formatCurrency } from '../../utils/format';

/**
 * "Added to bag" success modal — Adidas / Nike style.
 *
 * Triggered by `showAddedToBag(item)` from the PDP after a successful
 * Add-to-Cart. Renders the just-added line with brand, name, variant
 * chip, qty and price; a "You may also like" mini-rail with three
 * cross-sell products from the same category; and three CTAs:
 *   - Continue shopping (close)
 *   - View bag (close + open mini-cart drawer)
 *   - Checkout (close + navigate to /checkout)
 *
 * Auto-dismisses after 12s of inactivity. Esc and backdrop click also
 * dismiss. Body scroll is locked while the modal is open.
 */
function AddedToBagModal() {
  const { addedItem, hideAddedToBag, openMiniCart } = useUI();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (!addedItem) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') hideAddedToBag();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(hideAddedToBag, 12000);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer);
    };
  }, [addedItem, hideAddedToBag]);

  useEffect(() => {
    if (!addedItem) {
      setRecommended([]);
      return undefined;
    }
    let cancelled = false;
    async function loadRecommended() {
      try {
        const data = await fetchProducts({
          page: 0,
          size: 8,
          categoryId: addedItem.categoryId,
          sort: 'ratingDesc'
        });
        if (cancelled) return;
        const cartProductIds = new Set(
          cartItems.map((item) => Number(item.productId))
        );
        const filtered = (data?.items || [])
          .filter((product) => Number(product.id) !== Number(addedItem.productId))
          .filter((product) => !cartProductIds.has(Number(product.id)))
          .slice(0, 3);
        setRecommended(filtered);
      } catch {
        if (!cancelled) setRecommended([]);
      }
    }
    loadRecommended();
    return () => {
      cancelled = true;
    };
  }, [addedItem, cartItems]);

  if (!addedItem) return null;

  const handleViewBag = () => {
    hideAddedToBag();
    openMiniCart();
  };

  const handleCheckout = () => {
    hideAddedToBag();
    navigate('/checkout');
  };

  const goToProduct = (productId) => {
    hideAddedToBag();
    navigate(`/products/${productId}`);
  };

  const unitPrice = Number(addedItem.unitPrice ?? addedItem.price ?? 0);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="added-to-bag-title"
    >
      <button
        type="button"
        onClick={hideAddedToBag}
        aria-label="Close"
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-card animate-fade-in-up">
        <button
          type="button"
          onClick={hideAddedToBag}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        >
          <IconClose />
        </button>

        <div className="px-6 pt-7 sm:px-8">
          <div
            id="added-to-bag-title"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-2xs font-bold uppercase tracking-widest text-emerald-700"
          >
            <IconCheck className="h-4 w-4" />
            Added to bag
          </div>
        </div>

        <div className="px-6 pb-6 sm:px-8 sm:pb-7">
          <div className="mt-5 flex gap-4 sm:gap-5">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-ink-100 sm:h-28 sm:w-28">
              <ProductImage
                product={{
                  ...addedItem,
                  name: addedItem.productName || addedItem.name
                }}
                rounded="rounded-2xl"
                className="h-full w-full"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              {addedItem.brand ? (
                <p className="text-2xs font-bold uppercase tracking-widest text-accent-600">
                  {addedItem.brand}
                </p>
              ) : null}
              <p className="font-semibold text-ink-950">
                {addedItem.productName || addedItem.name}
              </p>
              <CartLineVariant size={addedItem.size} color={addedItem.color} />
              <div className="mt-1 flex items-center gap-3 text-sm text-ink-600">
                <span>Qty {addedItem.quantity}</span>
                <span className="font-bold text-ink-900">
                  {formatCurrency(unitPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={handleViewBag} variant="primary" size="lg">
              View bag
            </Button>
            <Button
              onClick={handleCheckout}
              variant="accent"
              size="lg"
              rightIcon={<IconArrowRight className="h-4 w-4" />}
            >
              Checkout
            </Button>
          </div>
          <button
            type="button"
            onClick={hideAddedToBag}
            className="mt-3 block w-full text-center text-2xs font-semibold uppercase tracking-wider text-ink-500 transition hover:text-ink-900"
          >
            Continue shopping
          </button>
        </div>

        {recommended.length > 0 ? (
          <div className="border-t border-ink-100 bg-ink-50/60 px-6 py-6 sm:px-8">
            <p className="text-2xs font-bold uppercase tracking-widest text-ink-500">
              You may also like
            </p>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {recommended.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => goToProduct(product.id)}
                    className="group block w-full text-left"
                  >
                    <div className="aspect-square overflow-hidden rounded-2xl bg-ink-100">
                      <ProductImage
                        product={product}
                        rounded="rounded-2xl"
                        className="h-full w-full"
                        zoom
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-ink-900 transition group-hover:text-accent-600">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-ink-900">
                      {formatCurrency(product.price)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AddedToBagModal;
