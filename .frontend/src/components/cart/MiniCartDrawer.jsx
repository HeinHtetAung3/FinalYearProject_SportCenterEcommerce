import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import ProductImage from '../products/ProductImage';
import CartLineVariant from './CartLineVariant';
import Button from '../ui/Button';
import EmptyState from '../feedback/EmptyState';
import {
  IconArrowRight,
  IconCart,
  IconClose,
  IconMinus,
  IconPlus,
  IconTrash
} from '../ui/Icon';
import { classNames, formatCurrency } from '../../utils/format';
import { makeCartLineKey } from '../../utils/storage';

const SHIPPING_THRESHOLD = 75;

/**
 * Slide-in mini-cart drawer (right side, 420px wide on desktop, full
 * width on mobile). Mirrors the Nike "Bag" overlay UX: opens from the
 * header cart icon, locks page scroll, dismisses on Esc / backdrop /
 * close button, and keeps a sticky footer with the live subtotal and
 * the two checkout CTAs.
 *
 * The drawer is mounted unconditionally at the App root so the slide
 * transition feels native (no remount) and so any page can trigger
 * `openMiniCart()` from `useUI()` without prop drilling.
 */
function MiniCartDrawer() {
  const { miniCartOpen, closeMiniCart } = useUI();
  const { cartItems, total, itemCount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!miniCartOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMiniCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [miniCartOpen, closeMiniCart]);

  useEffect(() => {
    if (!miniCartOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [miniCartOpen]);

  const subtotal = total;
  const remaining = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);

  const goCheckout = () => {
    closeMiniCart();
    navigate('/checkout');
  };
  const goBag = () => {
    closeMiniCart();
    navigate('/cart');
  };
  const goShop = () => {
    closeMiniCart();
    navigate('/products');
  };

  return (
    <div
      className={classNames(
        'fixed inset-0 z-[60] transition-opacity duration-300',
        miniCartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      aria-hidden={!miniCartOpen}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-ink-950/40 backdrop-blur-sm"
        onClick={closeMiniCart}
        aria-label="Close mini cart"
        tabIndex={miniCartOpen ? 0 : -1}
      />

      <aside
        className={classNames(
          'absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-card transition-transform duration-300 ease-out',
          miniCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
              Your bag
            </p>
            <h2 className="font-display text-xl font-bold text-ink-950">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeMiniCart}
            aria-label="Close"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <IconClose />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="px-6 py-12">
              <EmptyState
                icon={<IconCart />}
                title="Your bag is empty"
                description="Add gear from the catalog to get started."
                action={
                  <Button onClick={goShop} variant="primary">
                    Shop products
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {cartItems.map((item) => (
                <DrawerLine
                  key={makeCartLineKey(item.productId, item.size, item.color)}
                  item={item}
                  onIncrement={() =>
                    updateQuantity(item.productId, (item.quantity || 0) + 1, {
                      size: item.size,
                      color: item.color
                    })
                  }
                  onDecrement={() =>
                    updateQuantity(
                      item.productId,
                      Math.max(1, (item.quantity || 1) - 1),
                      { size: item.size, color: item.color }
                    )
                  }
                  onRemove={() =>
                    removeFromCart(item.productId, {
                      size: item.size,
                      color: item.color
                    })
                  }
                  onNavigate={closeMiniCart}
                />
              ))}
            </ul>
          )}
        </div>

        {cartItems.length > 0 ? (
          <footer className="border-t border-ink-100 bg-ink-50/50 px-6 py-5">
            <div className="rounded-2xl bg-white p-4 shadow-soft">
              {subtotal >= SHIPPING_THRESHOLD ? (
                <p className="text-xs font-semibold text-emerald-700">
                  You unlocked free shipping!
                </p>
              ) : (
                <p className="text-xs text-ink-600">
                  Add{' '}
                  <span className="font-semibold text-ink-900">
                    {formatCurrency(remaining)}
                  </span>{' '}
                  more for free shipping
                </p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-accent-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-ink-500">
                Subtotal
              </span>
              <span className="font-display text-2xl font-bold text-ink-950">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-2xs text-ink-500">
              Shipping & taxes calculated at checkout.
            </p>

            <Button
              onClick={goCheckout}
              variant="accent"
              size="lg"
              fullWidth
              className="mt-4"
              rightIcon={<IconArrowRight className="h-4 w-4" />}
            >
              Checkout
            </Button>
            <button
              type="button"
              onClick={goBag}
              className="mt-3 block w-full rounded-full border border-ink-900 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-ink-900 transition hover:bg-ink-900 hover:text-white"
            >
              View bag
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

function DrawerLine({ item, onIncrement, onDecrement, onRemove, onNavigate }) {
  const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
  const lineTotal = unitPrice * (item.quantity || 0);

  return (
    <li className="flex gap-3 p-5">
      <Link
        to={`/products/${item.productId}`}
        onClick={onNavigate}
        className="block h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ink-100"
      >
        <ProductImage
          product={{ ...item, name: item.productName || item.name }}
          rounded="rounded-xl"
          className="h-full w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          to={`/products/${item.productId}`}
          onClick={onNavigate}
          className="line-clamp-2 text-sm font-semibold text-ink-900 transition hover:text-accent-600"
        >
          {item.productName || item.name}
        </Link>
        {item.brand ? (
          <p className="text-2xs font-bold uppercase tracking-widest text-accent-600">
            {item.brand}
          </p>
        ) : null}
        <CartLineVariant size={item.size} color={item.color} />

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border border-ink-200 bg-white">
            <button
              type="button"
              onClick={onDecrement}
              disabled={item.quantity <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-700 transition hover:text-ink-950 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <IconMinus className="h-3 w-3" />
            </button>
            <span className="min-w-[1.5rem] text-center text-xs font-semibold text-ink-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-700 transition hover:text-ink-950"
              aria-label="Increase quantity"
            >
              <IconPlus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-ink-900">
            {formatCurrency(lineTotal)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="self-start text-ink-300 transition hover:text-rose-500"
        aria-label="Remove from bag"
      >
        <IconTrash className="h-4 w-4" />
      </button>
    </li>
  );
}

export default MiniCartDrawer;
