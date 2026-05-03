import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/feedback/EmptyState';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import CartLineVariant from '../components/cart/CartLineVariant';
import ProductImage from '../components/products/ProductImage';
import { IconBox } from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUI } from '../context/UIContext';
import { cancelOrder, fetchMyOrders, fetchOrderById } from '../services/commerceService';
import {
  formatCurrency,
  formatDateInUserTimezone,
  formatDateTimeInUserTimezone,
  classNames
} from '../utils/format';
import { makeCartLineKey } from '../utils/storage';

/** Map legacy API values for display / timeline indexing. */
function normalizeOrderStatus(status) {
  if (!status) return 'PENDING';
  const s = String(status).trim().toUpperCase();
  if (s === 'PLACED') return 'PENDING';
  if (s === 'PAID') return 'CONFIRMED';
  return s;
}

const STATUS_VARIANTS = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  SHIPPED: 'volt',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  PLACED: 'warning',
  PAID: 'success'
};

/** Align API (`variantSize` / `variantColor`) with cart line shape used in UI. */
function normalizeOrderItem(item) {
  if (!item) return item;
  const size = item.size ?? item.variantSize ?? null;
  const color = item.color ?? item.variantColor ?? null;
  const imageUrl = item.imageUrl ?? null;
  const productName = (item.productName || item.name || '').trim() || 'Product';
  return { ...item, size, color, imageUrl, productName };
}

/** Minimal product-shaped object for {@link ProductImage} / image resolver. */
function orderLinePreviewProduct(item) {
  const n = normalizeOrderItem(item);
  return {
    id: n.productId,
    name: n.productName,
    imageUrl: n.imageUrl,
    images: n.imageUrl ? [n.imageUrl] : []
  };
}

const FULFILLMENT_STEPS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' }
];

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

function orderTimestamp(order) {
  if (!order) return null;
  const raw = order.placedAt ?? order.createdAt;
  return raw ? new Date(raw) : null;
}

function stepVisualState(stepIndex, effective, activeIdx) {
  if (effective === 'DELIVERED' || stepIndex < activeIdx) return 'complete';
  if (stepIndex === activeIdx) return 'current';
  return 'upcoming';
}

function OrderStatusTimeline({ status }) {
  const effective = normalizeOrderStatus(status);
  if (effective === 'CANCELLED') {
    return (
      <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-rose-900">Order cancelled</p>
        <p className="mt-1 text-xs text-rose-700">This order will not be shipped. You can still reorder items below.</p>
      </div>
    );
  }

  const activeIdx = Math.max(0, FULFILLMENT_STEPS.findIndex((s) => s.key === effective));

  return (
    <div className="mt-6">
      <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">Fulfillment</p>
      <div className="mt-4 overflow-x-auto pb-1">
        <ol
          className="flex min-w-[36rem] list-none items-start px-0.5 sm:min-w-0 sm:w-full"
          aria-label="Order fulfillment steps"
        >
          {FULFILLMENT_STEPS.map((step, i) => {
            const visual = stepVisualState(i, effective, activeIdx);
            const segAfterDone = i < activeIdx || effective === 'DELIVERED';
            const isLast = i === FULFILLMENT_STEPS.length - 1;
            return (
              <Fragment key={step.key}>
                <li className="flex min-w-0 flex-1 flex-col items-center text-center">
                  <div
                    className={classNames(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                      visual === 'complete' &&
                        'border-emerald-500 bg-emerald-500 text-white shadow-sm',
                      visual === 'current' &&
                        'border-ink-950 bg-white text-ink-950 shadow-[0_0_0_4px_rgba(17,24,39,0.08)]',
                      visual === 'upcoming' && 'border-ink-200 bg-ink-50 text-ink-400'
                    )}
                    aria-current={visual === 'current' ? 'step' : undefined}
                  >
                    {visual === 'complete' ? '✓' : i + 1}
                  </div>
                  <p
                    className={classNames(
                      'mt-2 text-xs font-semibold sm:text-sm',
                      visual === 'upcoming' ? 'text-ink-400' : 'text-ink-900'
                    )}
                  >
                    {step.label}
                  </p>
                  {visual === 'current' ? (
                    <p className="mt-0.5 text-2xs text-ink-500">Current</p>
                  ) : null}
                </li>
                {!isLast ? (
                  <li
                    className="flex w-6 shrink-0 items-center self-start pt-5 sm:w-10"
                    aria-hidden
                  >
                    <div
                      className={classNames(
                        'h-0.5 w-full rounded-full',
                        segAfterDone ? 'bg-emerald-400' : 'bg-ink-200'
                      )}
                    />
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function OrdersPage() {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useUI();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const displayOrders = useMemo(() => {
    const list =
      statusFilter === 'ALL'
        ? orders
        : orders.filter((o) => normalizeOrderStatus(o.status) === statusFilter);
    if (orderId) {
      const fromFull = orders.find((o) => String(o.id) === String(orderId));
      if (fromFull && !list.some((o) => String(o.id) === String(orderId))) {
        return [fromFull, ...list];
      }
    }
    return list;
  }, [orders, statusFilter, orderId]);

  async function handleReorder() {
    const lines = selectedOrder?.items;
    if (!lines?.length) return;
    setReordering(true);
    try {
      for (const raw of lines) {
        const item = normalizeOrderItem(raw);
        if (item.productId == null) continue;
        await addToCart(item.productId, item.quantity || 1, {
          size: item.size,
          color: item.color
        });
      }
      showToast('Items added to your bag with the same sizes and colours.', { variant: 'success' });
    } finally {
      setReordering(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!orderId && !isAuthenticated) {
        setLoading(false);
        return;
      }

      if (orderId && !isAuthenticated) {
        setLoading(false);
        setError('');
        setOrders([]);
        setSelectedOrder(null);
        return;
      }

      setLoading(true);
      setError('');
      try {
        if (orderId) {
          const detail = await fetchOrderById(orderId);
          if (cancelled) return;
          setSelectedOrder(detail);
          setOrders(detail ? [detail] : []);
        } else if (isAuthenticated) {
          const list = await fetchMyOrders();
          if (cancelled) return;
          setOrders(list || []);
          setSelectedOrder(null);
        }
      } catch (apiError) {
        if (!cancelled) {
          setError(apiError.message || 'Unable to load orders.');
          setOrders([]);
          setSelectedOrder(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, isAuthenticated]);

  const trackingOnly = Boolean(orderId && !isAuthenticated);
  const listMode = Boolean(!orderId && isAuthenticated);

  if (!orderId && !isAuthenticated) {
    return (
      <Container>
        <EmptyState
          icon={<IconBox />}
          title="Sign in to see your orders"
          description="Track shipments, view receipts and re-order favourites. If you checked out without an account, use the Track order link from your confirmation screen."
          action={
            <Button to="/login" variant="primary">
              Sign in
            </Button>
          }
        />
      </Container>
    );
  }

  if (orderId && !isAuthenticated) {
    return (
      <Container>
        <EmptyState
          icon={<IconBox />}
          title="Sign in to track this order"
          description={`Order #${orderId} is available after you sign in with the same account you used at checkout.`}
          action={
            <Button to="/login" variant="primary" state={{ from: `/orders/${orderId}` }}>
              Sign in
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container>
      <header className="mb-10">
        <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
          {trackingOnly ? 'Order' : 'Account'}
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">
          {trackingOnly ? 'Track your order' : 'Your orders'}
        </h1>
        <p className="mt-2 text-ink-500">
          {trackingOnly
            ? 'Order status updates as your shipment progresses.'
            : 'View status, track shipping and re-order your favourites.'}
        </p>
        {Boolean(orderId) && isAuthenticated ? (
          <p className="mt-4">
            <Link to="/orders" className="text-sm font-semibold text-accent-600 underline-offset-4 hover:underline">
              ← Back to all orders
            </Link>
          </p>
        ) : null}
      </header>

      {!loading && !error && orders.length > 0 && listMode ? (
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="toolbar"
          aria-label="Filter orders by status"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={classNames(
                'rounded-full border px-4 py-2 text-xs font-semibold transition',
                statusFilter === opt.value
                  ? 'border-ink-950 bg-ink-950 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? <LoadingSpinner label="Loading orders..." /> : null}
      {!loading && error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : null}

      {!loading && !error && orders.length === 0 && listMode ? (
        <EmptyState
          icon={<IconBox />}
          title="No orders yet"
          description="When you place an order, it shows up here."
          action={
            <Button to="/products" variant="primary">
              Start shopping
            </Button>
          }
        />
      ) : null}

      {!loading && orders.length > 0 ? (
        <div
          className={classNames(
            'grid gap-8',
            trackingOnly ? 'max-w-3xl' : 'lg:grid-cols-[1fr_1.4fr]'
          )}
        >
          {!trackingOnly ? (
          <aside className="space-y-3">
            {displayOrders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/80 p-4 text-sm text-ink-600">
                No orders match this status.
              </p>
            ) : null}
            {displayOrders.map((order) => {
              const lines = Array.isArray(order.items) ? order.items : [];
              const selectedCard = String(selectedOrder?.id) === String(order.id);
              const totalQty = lines.reduce((acc, row) => acc + (Number(row.quantity) || 0), 0);
              const previewLines = lines.slice(0, 3);
              const extraCount = Math.max(0, lines.length - previewLines.length);
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className={classNames(
                    'block rounded-2xl border p-4 transition',
                    selectedCard
                      ? 'border-ink-950 bg-ink-950 text-white shadow-card'
                      : 'border-ink-100 bg-white hover:border-ink-300'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">#{order.id}</span>
                    <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>{order.status}</Badge>
                  </div>
                  <p
                    className={classNames(
                      'mt-2 text-xs',
                      selectedCard ? 'text-white/70' : 'text-ink-500'
                    )}
                  >
                    Placed {(() => {
                      const ts = orderTimestamp(order);
                      return ts ? formatDateInUserTimezone(ts) : 'recently';
                    })()}
                  </p>
                  {lines.length > 0 ? (
                    <>
                      <div className="mt-3 flex items-center gap-2">
                        {previewLines.map((raw) => {
                          const item = normalizeOrderItem(raw);
                          return (
                            <ProductImage
                              key={`${order.id}-${makeCartLineKey(item.productId, item.size, item.color)}`}
                              product={orderLinePreviewProduct(item)}
                              className={classNames(
                                'h-12 w-12 shrink-0 border',
                                selectedCard ? 'border-white/25' : 'border-ink-100'
                              )}
                              rounded="rounded-lg"
                            />
                          );
                        })}
                        {extraCount > 0 ? (
                          <span
                            className={classNames(
                              'flex h-12 min-w-[2.5rem] items-center justify-center rounded-lg border text-xs font-bold',
                              selectedCard
                                ? 'border-white/25 bg-white/10 text-white'
                                : 'border-ink-100 bg-ink-50 text-ink-600'
                            )}
                          >
                            +{extraCount}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={classNames(
                          'mt-2 line-clamp-2 text-xs font-medium leading-snug',
                          selectedCard ? 'text-white/90' : 'text-ink-700'
                        )}
                      >
                        {lines.length === 1
                          ? `${normalizeOrderItem(lines[0]).productName} · Qty ${lines[0].quantity ?? 0}`
                          : `${lines.length} items · ${totalQty} ${totalQty === 1 ? 'piece' : 'pieces'}`}
                      </p>
                    </>
                  ) : null}
                  <p className="mt-2 font-display text-lg font-bold">
                    {formatCurrency(order.total)}
                  </p>
                </Link>
              );
            })}
          </aside>
          ) : null}

          <section className="card-base p-6 sm:p-8">
            {!selectedOrder ? (
              <EmptyState
                title="Select an order"
                description="Pick an order from the list to see details, items, and status."
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-ink-500">
                      Order #{selectedOrder.id}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-ink-950">
                      {formatCurrency(selectedOrder.total)}
                    </h2>
                    <p className="mt-1 text-xs text-ink-500">
                      {(() => {
                        const ts = orderTimestamp(selectedOrder);
                        return ts ? `Placed ${formatDateTimeInUserTimezone(ts)}` : null;
                      })()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        reordering || !(selectedOrder.items && selectedOrder.items.length)
                      }
                      onClick={handleReorder}
                    >
                      {reordering ? 'Adding…' : 'Reorder'}
                    </Button>
                    <Badge variant={STATUS_VARIANTS[selectedOrder.status] || 'default'}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>

                <OrderStatusTimeline status={selectedOrder.status} />

                <div className="mt-6 grid gap-4 text-sm text-ink-600 sm:grid-cols-2">
                  <div className="rounded-2xl bg-ink-50 p-4">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
                      Shipping address
                    </p>
                    <p className="mt-1 text-ink-900">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div className="rounded-2xl bg-ink-50 p-4">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
                      Payment
                    </p>
                    <p className="mt-1 text-ink-900">
                      {selectedOrder.paymentMethod || 'Card on file'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
                    Items
                  </p>
                  <ul className="mt-3 divide-y divide-ink-100 rounded-2xl border border-ink-100">
                    {(selectedOrder.items || []).map((raw) => {
                      const item = normalizeOrderItem(raw);
                      const unit = item.unitPrice;
                      return (
                        <li
                          key={makeCartLineKey(item.productId, item.size, item.color)}
                          className="flex items-center gap-4 p-4"
                        >
                          <ProductImage
                            product={orderLinePreviewProduct(item)}
                            className="h-16 w-16 shrink-0 border border-ink-100"
                            rounded="rounded-xl"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink-900">{item.productName}</p>
                            <CartLineVariant
                              size={item.size}
                              color={item.color}
                              className="mt-1"
                            />
                            <p className="mt-1 text-xs text-ink-500">
                              Qty {item.quantity}
                              {unit != null && !Number.isNaN(Number(unit)) ? (
                                <span className="text-ink-400">
                                  {' '}
                                  · {formatCurrency(unit)} each
                                </span>
                              ) : null}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-ink-900">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {isAuthenticated && normalizeOrderStatus(selectedOrder.status) === 'PENDING' ? (
                  <div className="mt-8">
                    <Button
                      variant="danger"
                      disabled={cancelling}
                      onClick={async () => {
                        setCancelling(true);
                        try {
                          const next = await cancelOrder(selectedOrder.id);
                          setSelectedOrder(next);
                          setOrders((prev) =>
                            prev.map((order) => (order.id === next.id ? next : order))
                          );
                        } catch (apiError) {
                          setError(apiError.message || 'Unable to cancel order.');
                        } finally {
                          setCancelling(false);
                        }
                      }}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel order'}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      ) : null}
    </Container>
  );
}

export default OrdersPage;
