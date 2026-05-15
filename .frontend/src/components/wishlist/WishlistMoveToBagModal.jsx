import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { IconClose, IconRuler } from '../ui/Icon';
import SizeGuideModal from '../products/SizeGuideModal';
import ProductImage from '../products/ProductImage';
import { classNames } from '../../utils/format';

const COLOR_KEYWORDS = [
  ['white', '#f8fafc'],
  ['cloud', '#e5e7eb'],
  ['silver', '#d4d4d8'],
  ['black', '#0f172a'],
  ['onix', '#1f2937'],
  ['anthracite', '#1f2937'],
  ['navy', '#1e3a8a'],
  ['royal', '#1d4ed8'],
  ['blue', '#2563eb'],
  ['sapphire', '#1e40af'],
  ['mint', '#5eead4'],
  ['teal', '#14b8a6'],
  ['green', '#16a34a'],
  ['lemon', '#facc15'],
  ['volt', '#bef264'],
  ['yellow', '#facc15'],
  ['gold', '#d4a017'],
  ['orange', '#f97316'],
  ['mahogany', '#7c2d12'],
  ['red', '#dc2626'],
  ['crimson', '#b91c1c'],
  ['solar', '#ef4444'],
  ['pink', '#ec4899'],
  ['purple', '#9333ea'],
  ['ink', '#0f172a'],
  ['chrome', '#9ca3af']
];

function colorToCss(label) {
  if (!label) return '#94a3b8';
  const tokens = String(label).toLowerCase().split(/[\s/]+/).filter(Boolean);
  const matches = tokens
    .map((token) => COLOR_KEYWORDS.find(([key]) => token.includes(key)))
    .filter(Boolean)
    .slice(0, 2);
  if (matches.length === 0) return '#94a3b8';
  if (matches.length === 1) return matches[0][1];
  return `linear-gradient(135deg, ${matches[0][1]} 0%, ${matches[0][1]} 50%, ${matches[1][1]} 50%, ${matches[1][1]} 100%)`;
}

function SizeSelectorRow({ sizes, selected, onSelect, onOpenSizeGuide, error }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
          Select size (EU)
        </span>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline"
        >
          <IconRuler className="h-4 w-4" />
          Size guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isActive = selected === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              aria-pressed={isActive}
              className={classNames(
                'inline-flex h-12 min-w-[3.25rem] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition',
                isActive
                  ? 'border-ink-950 bg-ink-950 text-white shadow-soft'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-950'
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ColorSelectorRow({ colors, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
          Colour
        </span>
        {selected ? (
          <span className="text-sm font-medium text-ink-700">{selected}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isActive = selected === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelect(color)}
              aria-pressed={isActive}
              className={classNames(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition',
                isActive
                  ? 'border-ink-950 bg-ink-950 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-950'
              )}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full border border-white/40"
                style={{ background: colorToCss(color) }}
              />
              {color}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Pick size / colour before moving a wishlist line into the bag so cart
 * keys match `makeCartLineKey(productId, size, color)`.
 */
function WishlistMoveToBagModal({ open, onClose, wishlistItem, product, onConfirm }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0;

  useEffect(() => {
    if (!open || !product) return;
    setSelectedSize(null);
    setSizeError('');
    setSizeGuideOpen(false);
    setSubmitting(false);
    setSelectedColor(hasColors ? product.colors[0] : null);
  }, [open, product, hasColors]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && !sizeGuideOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, sizeGuideOpen]);

  if (!open || !wishlistItem || !product) return null;

  const handleSubmit = async () => {
    if (hasSizes && selectedSize == null) {
      setSizeError('Choose a size to add this item to your bag.');
      return;
    }
    setSizeError('');
    setSubmitting(true);
    try {
      await onConfirm({
        size: hasSizes ? selectedSize : undefined,
        color: hasColors ? selectedColor : undefined
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-move-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close"
        />
        <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-card animate-slide-down sm:rounded-3xl">
          <div className="flex items-start gap-4 border-b border-ink-100 px-5 py-4 sm:px-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-ink-100">
              <ProductImage
                product={{
                  ...product,
                  name: wishlistItem.productName || product.name,
                  imageUrl: wishlistItem.imageUrl || product.imageUrl
                }}
                className="h-full w-full"
                rounded="rounded-2xl"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-semibold uppercase tracking-widest text-accent-600">
                Move to bag
              </p>
              <h2 id="wishlist-move-title" className="mt-1 font-display text-lg font-bold text-ink-950">
                {wishlistItem.productName || product.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
              aria-label="Close"
            >
              <IconClose />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="space-y-6">
              {hasColors ? (
                <ColorSelectorRow
                  colors={product.colors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                />
              ) : null}
              {hasSizes ? (
                <SizeSelectorRow
                  sizes={product.sizes}
                  selected={selectedSize}
                  onSelect={(size) => {
                    setSelectedSize(size);
                    setSizeError('');
                  }}
                  onOpenSizeGuide={() => setSizeGuideOpen(true)}
                  error={sizeError}
                />
              ) : null}
            </div>
          </div>

          <div className="border-t border-ink-100 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button
                type="button"
                variant="accent"
                fullWidth
                className="sm:flex-1"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Adding…' : 'Add to bag'}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="sm:flex-1"
                disabled={submitting}
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        availableEuSizes={product.sizes || []}
      />
    </>
  );
}

export default WishlistMoveToBagModal;
