import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/feedback/EmptyState';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import ProductImage from '../components/products/ProductImage';
import CartLineVariant from '../components/cart/CartLineVariant';
import {
  IconArrowRight,
  IconCart,
  IconChat,
  IconMinus,
  IconPlus,
  IconShield,
  IconTrash,
  IconTruck
} from '../components/ui/Icon';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import { makeCartLineKey } from '../utils/storage';

const SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 9.99;

function CartPage() {
  const {
    cartItems,
    itemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartLoading,
    selectedItems,
    selectedItemCount,
    selectedTotal,
    allSelectableSelected,
    isSelected,
    toggleSelected,
    selectAll,
    clearSelection
  } = useCart();

  if (cartLoading) {
    return (
      <Container>
        <LoadingSpinner label="Loading your bag..." />
      </Container>
    );
  }

  if (!cartItems.length) {
    return (
      <Container>
        <EmptyState
          icon={<IconCart />}
          title="Your bag is empty"
          description="Browse the catalog and add gear to get started."
          action={
            <Button to="/products" variant="primary" size="lg">
              Shop products
            </Button>
          }
        />
      </Container>
    );
  }

  // The Order Summary on the cart page is **selection-aware**: only the
  // ticked lines drive subtotals, free-shipping progress and the total
  // — non-ticked lines remain visible in the list but stay out of the
  // checkout. This mirrors the Shopee / Lazada / Amazon pattern.
  const selectableItems = cartItems.filter((item) => item.id != null);
  const hasSelectableItems = selectableItems.length > 0;
  const hasSelection = selectedItemCount > 0;

  const subtotal = selectedTotal;
  const qualifiesForFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shipping = hasSelection ? (qualifiesForFreeShipping ? 0 : SHIPPING_FEE) : 0;
  const tax = hasSelection ? +(subtotal * 0.08).toFixed(2) : 0;
  const grand = subtotal + shipping + tax;
  const remainingForFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);

  const onToggleAll = () => {
    if (allSelectableSelected) clearSelection();
    else selectAll();
  };

  return (
    <Container>
      <header className="mb-10">
        <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
          Cart
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-5xl">
          Your bag
        </h1>
        <p className="mt-2 text-ink-500 dark:text-ink-400">{itemCount} item{itemCount === 1 ? '' : 's'} ready to ship</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="rounded-3xl border border-ink-100 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-6 dark:border-ink-800">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-ink-900 dark:text-ink-100">
                <input
                  type="checkbox"
                  checked={allSelectableSelected}
                  onChange={onToggleAll}
                  disabled={!hasSelectableItems}
                  className="h-4 w-4 cursor-pointer rounded border-ink-300 text-accent-600 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-600 dark:bg-ink-900"
                  aria-label="Select all items"
                />
                <span>
                  Select all
                  <span className="ml-2 text-xs font-medium text-ink-500 dark:text-ink-400">
                    ({selectedItems.length} of {selectableItems.length} selected)
                  </span>
                </span>
              </label>
              <button
                type="button"
                onClick={clearCart}
                className="text-2xs font-semibold uppercase tracking-wider text-ink-500 transition hover:text-rose-600 dark:text-ink-400 dark:hover:text-rose-400"
              >
                Clear bag
              </button>
            </div>
            <ul className="divide-y divide-ink-100 dark:divide-ink-800">
              {cartItems.map((item) => (
                <CartLine
                  key={makeCartLineKey(item.productId, item.size, item.color)}
                  item={item}
                  selectable={item.id != null}
                  selected={isSelected(item.id)}
                  onToggleSelected={() => toggleSelected(item.id)}
                  onChange={(quantity) =>
                    updateQuantity(item.productId, quantity, {
                      size: item.size,
                      color: item.color
                    })
                  }
                  onRemove={() =>
                    removeFromCart(item.productId, {
                      size: item.size,
                      color: item.color
                    })
                  }
                />
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-ink-500 sm:grid-cols-3 dark:text-ink-400">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-ink-900">
              <IconTruck className="h-5 w-5 text-ink-900 dark:text-ink-100" />
              Free shipping over {formatCurrency(SHIPPING_THRESHOLD)}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-ink-900">
              <IconShield className="h-5 w-5 text-ink-900 dark:text-ink-100" />
              Secure checkout
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 dark:bg-ink-900">
              <IconCart className="h-5 w-5 text-ink-900 dark:text-ink-100" />
              30-day easy returns
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-base p-6">
            <h2 className="font-display text-xl font-semibold text-ink-950 dark:text-ink-50">Order summary</h2>
            <p className="mt-1 text-xs font-medium text-ink-500 dark:text-ink-400">
              {selectedItemCount} selected item{selectedItemCount === 1 ? '' : 's'}
            </p>

            <div className="mt-5 space-y-3 text-sm text-ink-700 dark:text-ink-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-ink-900 dark:text-ink-100">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-ink-900 dark:text-ink-100">
                  {hasSelection ? (shipping === 0 ? 'Free' : formatCurrency(shipping)) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated tax</span>
                <span className="font-semibold text-ink-900 dark:text-ink-100">
                  {hasSelection ? formatCurrency(tax) : '—'}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-ink-50 p-4 dark:bg-ink-800/60">
              {!hasSelection ? (
                <p className="text-xs text-ink-600 dark:text-ink-300">
                  Select items to see shipping and totals.
                </p>
              ) : qualifiesForFreeShipping ? (
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  You unlocked free shipping!
                </p>
              ) : (
                <p className="text-xs text-ink-600 dark:text-ink-300">
                  Add{' '}
                  <span className="font-semibold text-ink-900 dark:text-ink-100">
                    {formatCurrency(remainingForFreeShipping)}
                  </span>{' '}
                  more for free shipping.
                </p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700">
                <div
                  className="h-full rounded-full bg-accent-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-ink-600 dark:text-ink-400">
              <IconChat className="h-4 w-4 shrink-0 text-ink-500 dark:text-ink-500" aria-hidden />
              <span>
                Questions?{' '}
                <Link
                  to="/support/chat"
                  className="font-semibold text-ink-950 underline underline-offset-2 hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
                >
                  Chat with us
                </Link>
              </span>
            </p>

            <div className="mt-6 border-t border-ink-100 pt-5 dark:border-ink-800">
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">Total</span>
                <span className="font-display text-2xl font-bold text-ink-950 dark:text-ink-50">
                  {formatCurrency(grand)}
                </span>
              </div>

              <Button
                to={hasSelection ? '/checkout' : undefined}
                variant="accent"
                size="lg"
                fullWidth
                className="mt-5"
                disabled={!hasSelection}
                rightIcon={<IconArrowRight className="h-4 w-4" />}
              >
                {hasSelection
                  ? `Checkout (${selectedItemCount} item${selectedItemCount === 1 ? '' : 's'})`
                  : 'Select items to checkout'}
              </Button>
              <Link
                to="/products"
                className="mt-4 block text-center text-xs font-semibold uppercase tracking-wider text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function CartLine({ item, selectable, selected, onToggleSelected, onChange, onRemove }) {
  const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
  const lineTotal = unitPrice * item.quantity;

  const update = (next) => {
    const bounded = Math.max(1, Math.min(item.stock || 99, next));
    onChange(bounded);
  };

  return (
    <li
      className={`flex flex-wrap items-start gap-4 p-6 sm:flex-nowrap ${
        selectable && !selected ? 'opacity-70 transition-opacity hover:opacity-100' : ''
      }`}
    >
      <div className="flex h-24 items-center pt-1">
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onChange={onToggleSelected}
          disabled={!selectable}
          className="h-4 w-4 cursor-pointer rounded border-ink-300 text-accent-600 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-600 dark:bg-ink-900"
          aria-label={`Select ${item.productName || item.name || 'item'} for checkout`}
          title={selectable ? undefined : 'Sign in to include this item in checkout'}
        />
      </div>
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
        <ProductImage product={{ ...item, name: item.productName || item.name }} rounded="rounded-2xl" className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {item.brand ? (
          <p className="text-2xs font-bold uppercase tracking-widest text-accent-600">
            {item.brand}
          </p>
        ) : null}
        <Link
          to={`/products/${item.productId}`}
          className="text-base font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
        >
          {item.productName || item.name}
        </Link>
        <CartLineVariant size={item.size} color={item.color} />
        <p className="text-xs text-ink-500 dark:text-ink-400">{item.categoryName || 'SportsHub'}</p>
        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{formatCurrency(unitPrice)}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-950">
          <button
            type="button"
            onClick={() => update(item.quantity - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition hover:text-ink-950 disabled:opacity-40 dark:text-ink-300 dark:hover:text-white"
            disabled={item.quantity <= 1}
            aria-label="Decrease"
          >
            <IconMinus className="h-4 w-4" />
          </button>
          <span className="min-w-[1.75rem] text-center text-sm font-semibold text-ink-900 dark:text-ink-100">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => update(item.quantity + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-700 transition hover:text-ink-950 dark:text-ink-300 dark:hover:text-white"
            aria-label="Increase"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>
        <span className="hidden text-sm font-semibold text-ink-900 dark:text-ink-100 sm:inline">
          {formatCurrency(lineTotal)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          aria-label="Remove"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

export default CartPage;
