import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/feedback/EmptyState';
import ProductImage from '../components/products/ProductImage';
import CartLineVariant from '../components/cart/CartLineVariant';
import {
  IconCart,
  IconChat,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconTruck
} from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useUI } from '../context/UIContext';
import { placeOrder } from '../services/commerceService';
import { formatCurrency, classNames } from '../utils/format';
import {
  makeCartLineKey,
  getSavedCheckoutAddresses,
  persistSavedCheckoutAddresses
} from '../utils/storage';
import { useGooglePlacesAutocomplete } from '../hooks/useGooglePlacesAutocomplete';

const SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 9.99;
const EXPRESS_SURCHARGE = 12.99;

const STEPS = [
  { id: 'address', label: 'Address', description: 'Contact & delivery' },
  { id: 'shipping', label: 'Shipping', description: 'Speed & fees' },
  { id: 'payment', label: 'Payment', description: 'How you pay' }
];

const PAYMENT_TABS = [
  { id: 'CARD', label: 'Card', description: 'Visa, Mastercard, AmEx' },
  { id: 'COD', label: 'Cash on delivery', description: 'Pay when your parcel arrives' },
  { id: 'WALLET', label: 'Digital wallet', description: 'Apple Pay – style mock' }
];

function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function isValidCardNumber(raw) {
  const d = digitsOnly(raw);
  return d.length >= 13 && d.length <= 19;
}

function isValidExpiry(mmYy) {
  const m = String(mmYy ?? '').trim().match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = Number(`20${m[2]}`);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
}

function isValidCvv(cvv) {
  const d = digitsOnly(cvv);
  return d.length === 3 || d.length === 4;
}

function computeShipping(subtotal, shippingSpeedId) {
  const base = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return shippingSpeedId === 'express' ? base + EXPRESS_SURCHARGE : base;
}

function OrderSummaryBody({
  cartItems,
  subtotal,
  shipping,
  tax,
  grand,
  footer,
  compact = false
}) {
  return (
    <>
      <div className={classNames('border-b border-ink-100', compact ? 'px-4 py-3' : 'px-6 py-5')}>
        <h2 className="font-display text-lg font-semibold text-ink-950">Order summary</h2>
      </div>
      <ul className="divide-y divide-ink-100">
        {cartItems.map((item) => (
          <li
            key={makeCartLineKey(item.productId, item.size, item.color)}
            className={classNames('flex items-center gap-4', compact ? 'px-4 py-3' : 'px-6 py-4')}
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-100">
              <ProductImage
                product={{ ...item, name: item.productName }}
                className="h-full w-full"
                rounded="rounded-xl"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{item.productName || item.name}</p>
              <CartLineVariant size={item.size} color={item.color} className="mt-0.5" />
              <p className="text-xs text-ink-500">Qty {item.quantity}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-ink-900">
              {formatCurrency(Number(item.unitPrice ?? item.price ?? 0) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className={classNames('space-y-3 text-sm text-ink-700', compact ? 'px-4 py-4' : 'px-6 py-5')}>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-ink-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="font-semibold text-ink-900">
            {shipping === 0 ? 'Free' : formatCurrency(shipping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax (est.)</span>
          <span className="font-semibold text-ink-900">{formatCurrency(tax)}</span>
        </div>
        <div className="flex items-end justify-between border-t border-ink-100 pt-4">
          <span className="text-xs uppercase tracking-widest text-ink-500">Total</span>
          <span className="font-display text-2xl font-bold text-ink-950">{formatCurrency(grand)}</span>
        </div>
      </div>
      {footer ? <div className="border-t border-ink-100">{footer}</div> : null}
    </>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const {
    cartItems,
    selectedItems,
    selectedTotal,
    selectedItemCount,
    selectedIds,
    clearSelection
  } = useCart();
  const { showToast, dismissToast } = useUI();
  const { language, currency, timezone } = usePreferences();

  const shippingOptions = useMemo(
    () => [
      {
        id: 'standard',
        title: 'Standard delivery',
        subtitle: '5–7 business days',
        note: `Free over ${formatCurrency(SHIPPING_THRESHOLD)}, otherwise a flat fee applies.`
      },
      {
        id: 'express',
        title: 'Express delivery',
        subtitle: '2–3 business days',
        note: `Adds ${formatCurrency(EXPRESS_SURCHARGE)} on top of standard shipping.`
      }
    ],
    [language, currency, timezone]
  );

  // Selective checkout: only the lines the user ticked on /cart go
  // through. If somehow we arrive here with an empty selection but a
  // non-empty bag, send the user back to /cart to pick items rather
  // than silently checking out the whole bag.
  useEffect(() => {
    if (cartItems.length > 0 && selectedItemCount === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, selectedItemCount, navigate]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '',
    email: authState?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States'
  });
  const [savedAddresses, setSavedAddresses] = useState(() => getSavedCheckoutAddresses());
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [shippingSpeedId, setShippingSpeedId] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [card, setCard] = useState({
    nameOnCard: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [addressFocused, setAddressFocused] = useState(false);

  const { suggestions: addressSuggestions, isLoading: isAddressLoading, setSuggestions: setAddressSuggestions } = useGooglePlacesAutocomplete({
    query: form.address,
    active: step === 0
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, email: authState?.email || prev.email }));
  }, [authState?.email]);

  useEffect(() => {
    if (step !== 0) {
      setAddressFocused(false);
      setAddressSuggestions([]);
    }
  }, [step, setAddressSuggestions]);

  const subtotal = selectedTotal;
  const shipping = useMemo(
    () => computeShipping(subtotal, shippingSpeedId),
    [subtotal, shippingSpeedId]
  );
  const tax = +(subtotal * 0.08).toFixed(2);
  const grand = subtotal + shipping + tax;
  const summaryItems = selectedItems;

  const updateField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const showAddressSuggestions = step === 0 && addressFocused && addressSuggestions.length > 0;

  const applyAddressSuggestion = (suggestion) => {
    setForm((prev) => ({
      ...prev,
      address: suggestion.addressLine || prev.address,
      city: suggestion.city || prev.city,
      postalCode: suggestion.postalCode || prev.postalCode,
      country: suggestion.country || prev.country
    }));
    setAddressSuggestions([]);
    setAddressFocused(false);
  };

  const updateCard = (key) => (event) => setCard((prev) => ({ ...prev, [key]: event.target.value }));

  const applySavedAddress = (id) => {
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setForm({
      fullName: addr.fullName,
      email: addr.email,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country
    });
  };

  const handleSavedSelect = (event) => {
    const id = event.target.value;
    setSelectedSavedId(id);
    if (id) applySavedAddress(id);
  };

  const saveCurrentAddress = () => {
    const err = validateAddressFields(form);
    if (err) {
      showToast(err, { variant: 'error' });
      return;
    }
    const label = form.city?.trim() ? `${form.city.trim()} · Home` : 'Saved address';
    const id = globalThis.crypto?.randomUUID?.() ?? `addr-${Date.now()}`;
    const entry = {
      id,
      label,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country
    };
    const next = [...savedAddresses.filter((a) => a.id !== id), entry];
    setSavedAddresses(next);
    persistSavedCheckoutAddresses(next);
    setSelectedSavedId(id);
    showToast('Address saved for next time.', { variant: 'success' });
  };

  function validateAddressFields(f) {
    if (!f.fullName?.trim()) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.email || '').trim())) return 'Please enter a valid email.';
    if (!f.phone?.trim()) return 'Please enter a phone number.';
    if (!f.address?.trim()) return 'Please enter a street address.';
    if (!f.city?.trim()) return 'Please enter your city.';
    if (!f.postalCode?.trim()) return 'Please enter a postal code.';
    if (!f.country?.trim()) return 'Please enter your country.';
    return null;
  }

  function validatePayment() {
    if (paymentMethod !== 'CARD') return null;
    if (!card.nameOnCard?.trim()) return 'Enter the name on your card.';
    if (!isValidCardNumber(card.number)) return 'Enter a valid card number (13–19 digits).';
    if (!isValidExpiry(card.expiry)) return 'Enter expiry as MM/YY with a future date.';
    if (!isValidCvv(card.cvv)) return 'Enter a valid CVV (3 or 4 digits).';
    return null;
  }

  const validateStep = (index) => {
    if (index === 0) return validateAddressFields(form);
    if (index === 1) return null;
    if (index === 2) return validatePayment();
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      showToast(err, { variant: 'error' });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const err = validateStep(2);
    if (err) {
      showToast(err, { variant: 'error' });
      return;
    }
    if (placing) return;

    if (selectedItemCount === 0) {
      showToast('Select at least one item to checkout.', { variant: 'error' });
      navigate('/cart', { replace: true });
      return;
    }

    setPlacing(true);
    const loadingToastId = showToast('Placing your order…', { variant: 'loading', duration: 0 });
    try {
      const shippingAddress = `${form.fullName}, ${form.address}, ${form.city} ${form.postalCode}, ${form.country} (Tel: ${form.phone}) · Speed: ${shippingSpeedId}`;
      // Only the ticked cart lines are submitted; the backend will
      // remove just those lines from the bag, leaving everything else
      // untouched for a future checkout.
      const cartItemIds = Array.from(selectedIds).map(Number);
      const order = await placeOrder({ shippingAddress, paymentMethod, cartItemIds });
      dismissToast(loadingToastId);
      clearSelection();
      navigate(`/orders/success/${order.id}`);
    } catch (apiError) {
      dismissToast(loadingToastId);
      const status = apiError?.status ? `HTTP ${apiError.status}` : null;
      const msg = apiError?.message || 'Unable to place order.';
      showToast(status ? `${status} · ${msg}` : msg, { variant: 'error' });
    } finally {
      setPlacing(false);
    }
  };

  if (!cartItems.length) {
    return (
      <Container>
        <EmptyState
          icon={<IconCart />}
          title="Nothing to check out"
          description="Add products to your bag before placing an order."
          action={
            <Button to="/products" variant="primary">
              Browse products
            </Button>
          }
        />
      </Container>
    );
  }

  const desktopSummaryFooter =
    step === STEPS.length - 1 ? (
      <div className="px-6 py-5">
        <Button type="submit" form="checkout-main-form" variant="accent" size="lg" fullWidth disabled={placing}>
          {placing ? 'Placing order…' : `Place order · ${formatCurrency(grand)}`}
        </Button>
        <p className="mt-3 text-center text-2xs text-ink-500">Secure checkout · Encrypted in transit</p>
      </div>
    ) : null;

  const mobilePrimaryLabel =
    step < STEPS.length - 1 ? (
      <>
        Continue
        <IconChevronRight className="ml-1 inline h-4 w-4" aria-hidden />
      </>
    ) : placing ? (
      'Placing order…'
    ) : (
      `Place order · ${formatCurrency(grand)}`
    );

  return (
    <Container>
      <header className="mb-8 lg:mb-10">
        <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">Checkout</span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 sm:text-5xl">
          Finish your order
        </h1>
        <p className="mt-2 text-ink-500">Review details across three quick steps.</p>
      </header>

      {/* Step indicator */}
      <nav aria-label="Checkout steps" className="mb-8 lg:mb-10">
        <ol className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-3">
          {STEPS.map((s, index) => {
            const done = index < step;
            const active = index === step;
            const clickable = index < step;
            return (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setStep(index)}
                  className={classNames(
                    'flex w-full flex-col rounded-2xl border px-4 py-3 text-left transition sm:min-h-[88px]',
                    active && 'border-ink-950 bg-ink-950 text-white shadow-md',
                    done && !active && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                    !active && !done && 'border-ink-100 bg-white text-ink-500',
                    clickable && 'cursor-pointer hover:border-ink-300',
                    !clickable && !active && 'opacity-80'
                  )}
                >
                  <span className="text-2xs font-semibold uppercase tracking-widest">
                    Step {index + 1}
                  </span>
                  <span className="mt-1 font-display text-lg font-semibold">{s.label}</span>
                  <span
                    className={classNames(
                      'mt-0.5 text-xs',
                      active ? 'text-white/80' : done ? 'text-emerald-800' : 'text-ink-400'
                    )}
                  >
                    {s.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <form id="checkout-main-form" onSubmit={handleSubmit} className="space-y-8 pb-28 lg:pb-0">
          {step === 0 ? (
            <section className="card-base p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink-950">Delivery details</h2>
              <p className="mt-1 text-sm text-ink-500">Choose a saved address or enter a new one.</p>

              {savedAddresses.length ? (
                <div className="mt-6 space-y-2">
                  <label className="label-base" htmlFor="saved-address">
                    Saved addresses
                  </label>
                  <select
                    id="saved-address"
                    className="input-base w-full"
                    value={selectedSavedId}
                    onChange={handleSavedSelect}
                  >
                    <option value="">New address</option>
                    {savedAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="text-sm font-semibold text-accent-600 hover:underline" onClick={saveCurrentAddress}>
                    Save current fields as a new saved address
                  </button>
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Full name">
                  <input className="input-base" required value={form.fullName} onChange={updateField('fullName')} />
                </Field>
                <Field label="Email">
                  <input className="input-base" type="email" required value={form.email} onChange={updateField('email')} />
                </Field>
                <Field label="Phone">
                  <input className="input-base" required value={form.phone} onChange={updateField('phone')} />
                </Field>
                <Field label="Address" full>
                  <div className="relative">
                    <input
                      className="input-base"
                      required
                      value={form.address}
                      onChange={updateField('address')}
                      onFocus={() => setAddressFocused(true)}
                      onBlur={() => setTimeout(() => setAddressFocused(false), 120)}
                      autoComplete="street-address"
                      placeholder="Start typing your street address"
                    />
                    {showAddressSuggestions ? (
                      <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-ink-100 bg-white p-1 shadow-lg">
                        {addressSuggestions.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
                              onMouseDown={() => applyAddressSuggestion(item)}
                              onClick={() => applyAddressSuggestion(item)}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Field>
                <Field label="City">
                  <input className="input-base" required value={form.city} onChange={updateField('city')} />
                </Field>
                <Field label="Postal code">
                  <input className="input-base" required value={form.postalCode} onChange={updateField('postalCode')} />
                </Field>
                <Field label="Country" full>
                  <input className="input-base" required value={form.country} onChange={updateField('country')} />
                </Field>
              </div>
              {isAddressLoading && addressFocused ? (
                <p className="mt-2 text-xs text-ink-500">Searching addresses…</p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={goNext}>
                  Continue to shipping
                  <IconChevronRight className="ml-1 inline h-4 w-4" aria-hidden />
                </Button>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="card-base p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                  <IconTruck className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink-950">Shipping speed</h2>
                  <p className="mt-1 text-sm text-ink-500">Choose how quickly you need your gear.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {shippingOptions.map((opt) => {
                  const active = shippingSpeedId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={classNames(
                        'cursor-pointer rounded-2xl border p-5 transition',
                        active ? 'border-ink-950 bg-ink-50 shadow-sm' : 'border-ink-100 bg-white hover:border-ink-300'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">{opt.title}</p>
                          <p className="text-sm text-ink-600">{opt.subtitle}</p>
                          <p className="mt-2 text-xs text-ink-500">{opt.note}</p>
                        </div>
                        <input
                          type="radio"
                          name="shipping-speed"
                          className="mt-1"
                          checked={active}
                          onChange={() => setShippingSpeedId(opt.id)}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button type="button" variant="ghost" onClick={goBack}>
                  <IconChevronLeft className="mr-1 inline h-4 w-4" aria-hidden />
                  Back
                </Button>
                <Button type="button" variant="outline" onClick={goNext}>
                  Continue to payment
                  <IconChevronRight className="ml-1 inline h-4 w-4" aria-hidden />
                </Button>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="card-base p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink-950">Payment</h2>
              <p className="mt-1 text-sm text-ink-500">Pick a method. Card details stay on this device for demo only.</p>

              <div role="tablist" aria-label="Payment method" className="mt-6 flex flex-wrap gap-2">
                {PAYMENT_TABS.map((tab) => {
                  const active = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={classNames(
                        'rounded-full border px-4 py-2 text-sm font-semibold transition',
                        active ? 'border-ink-950 bg-ink-950 text-white' : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
                      )}
                      onClick={() => setPaymentMethod(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-ink-100 bg-bone/60 p-5">
                {PAYMENT_TABS.map((tab) =>
                  paymentMethod === tab.id ? (
                    <div key={tab.id} role="tabpanel">
                      <p className="text-sm text-ink-600">{tab.description}</p>
                      {tab.id === 'CARD' ? (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <Field label="Name on card" full>
                            <input
                              className="input-base"
                              autoComplete="cc-name"
                              value={card.nameOnCard}
                              onChange={updateCard('nameOnCard')}
                              placeholder="As printed on card"
                            />
                          </Field>
                          <Field label="Card number" full>
                            <input
                              className="input-base"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              value={card.number}
                              onChange={updateCard('number')}
                              placeholder="•••• •••• •••• ••••"
                            />
                          </Field>
                          <Field label="Expiry (MM/YY)">
                            <input
                              className="input-base"
                              autoComplete="cc-exp"
                              value={card.expiry}
                              onChange={updateCard('expiry')}
                              placeholder="MM/YY"
                            />
                          </Field>
                          <Field label="CVV">
                            <input
                              className="input-base"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              value={card.cvv}
                              onChange={updateCard('cvv')}
                              placeholder="•••"
                            />
                          </Field>
                        </div>
                      ) : null}
                      {tab.id === 'COD' ? (
                        <p className="mt-4 text-sm text-ink-700">
                          You will pay the courier in cash or card when your order arrives. Have the exact amount ready if
                          possible.
                        </p>
                      ) : null}
                      {tab.id === 'WALLET' ? (
                        <p className="mt-4 text-sm text-ink-700">
                          Demo wallet: no extra fields — in production this would launch Apple Pay / Google Pay.
                        </p>
                      ) : null}
                    </div>
                  ) : null
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button type="button" variant="ghost" onClick={goBack}>
                  <IconChevronLeft className="mr-1 inline h-4 w-4" aria-hidden />
                  Back
                </Button>
                <Button type="submit" variant="accent" disabled={placing} className="hidden lg:inline-flex">
                  {placing ? 'Placing order…' : `Place order · ${formatCurrency(grand)}`}
                </Button>
              </div>
            </section>
          ) : null}
        </form>

        {/* Desktop sticky summary */}
        <aside className="sticky top-24 hidden self-start lg:block">
          <div className="card-base overflow-hidden">
            <OrderSummaryBody
              cartItems={summaryItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              grand={grand}
              footer={desktopSummaryFooter}
            />
          </div>
          <p className="mt-4 flex items-start justify-center gap-2 px-1 text-center text-sm text-ink-600 dark:text-ink-400">
            <IconChat className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" aria-hidden />
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
        </aside>
      </div>

      {/* Mobile bottom bar + drawer */}
      <MobileCheckoutBar
        grand={grand}
        step={step}
        summaryOpen={summaryOpen}
        setSummaryOpen={setSummaryOpen}
        onPrimary={
          step < STEPS.length - 1
            ? goNext
            : () => document.getElementById('checkout-main-form')?.requestSubmit()
        }
        primaryDisabled={placing}
        primaryLabel={mobilePrimaryLabel}
        cartItems={summaryItems}
        subtotal={subtotal}
        shipping={shipping}
        tax={tax}
      />
    </Container>
  );
}

function MobileCheckoutBar({
  grand,
  step,
  summaryOpen,
  setSummaryOpen,
  onPrimary,
  primaryDisabled,
  primaryLabel,
  cartItems,
  subtotal,
  shipping,
  tax
}) {
  return (
    <>
      <div
        className={classNames(
          'fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur-md lg:hidden',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]'
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4">
          <div>
            <p className="text-2xs uppercase tracking-widest text-ink-500">Total</p>
            <p className="font-display text-xl font-bold text-ink-950">{formatCurrency(grand)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSummaryOpen(true)}>
              Summary
            </Button>
            <Button type="button" variant="accent" size="md" disabled={primaryDisabled} onClick={onPrimary}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>

      {summaryOpen && typeof document !== 'undefined'
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Order summary">
              <button
                type="button"
                className="absolute inset-0 bg-ink-950/50"
                aria-label="Close summary"
                onClick={() => setSummaryOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                  <span className="font-display text-lg font-semibold text-ink-950">Your bag</span>
                  <button
                    type="button"
                    className="rounded-full p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                    onClick={() => setSummaryOpen(false)}
                    aria-label="Close"
                  >
                    <IconClose className="h-5 w-5" />
                  </button>
                </div>
                <div className="max-h-[calc(88vh-52px)] overflow-y-auto">
                  <OrderSummaryBody
                    cartItems={cartItems}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    grand={grand}
                    compact
                    footer={
                      step === STEPS.length - 1 ? (
                        <div className="px-4 py-4">
                          <Button
                            type="button"
                            variant="accent"
                            size="lg"
                            fullWidth
                            disabled={primaryDisabled}
                            onClick={() => {
                              setSummaryOpen(false);
                              onPrimary();
                            }}
                          >
                            {primaryLabel}
                          </Button>
                        </div>
                      ) : null
                    }
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function Field({ label, full = false, children }) {
  return (
    <label className={classNames('block', full ? 'md:col-span-2' : '')}>
      <span className="label-base">{label}</span>
      {children}
    </label>
  );
}

export default CheckoutPage;
