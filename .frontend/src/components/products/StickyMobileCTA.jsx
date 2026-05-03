import { classNames, formatCurrency } from '../../utils/format';

/**
 * Mobile-only sticky bottom bar that mirrors the PDP "Add to bag" CTA.
 *
 * Visibility is controlled by the parent — typically driven by an
 * IntersectionObserver watching the in-page CTA: this bar only fades
 * in once the main button has scrolled out of view, so it does not
 * crowd the viewport while the user is making a selection.
 */
function StickyMobileCTA({
  visible,
  product,
  onAddToCart,
  adding = false,
  disabled = false,
  helperText
}) {
  if (!product) return null;

  return (
    <div
      className={classNames(
        'fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-card backdrop-blur lg:hidden',
        'transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink-700">{product.name}</p>
          <p className="text-base font-bold text-ink-950">{formatCurrency(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          disabled={disabled || adding}
          className={classNames(
            'inline-flex h-12 min-w-[10rem] flex-shrink-0 items-center justify-center rounded-full px-5 text-sm font-bold uppercase tracking-wider text-white transition',
            disabled
              ? 'cursor-not-allowed bg-ink-300'
              : 'bg-accent-500 hover:bg-accent-600 active:scale-95'
          )}
        >
          {adding ? 'Adding...' : disabled ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
      {helperText ? (
        <p className="mt-1 text-2xs font-medium text-rose-600" role="alert">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export default StickyMobileCTA;
