import { classNames } from '../../utils/format';

/**
 * Tiny presentational chip rendering a cart-line variant string.
 * Used by CartPage, MiniCartDrawer, AddedToBagModal, OrdersPage and
 * WishlistPage so the format stays consistent everywhere variants
 * surface in the UI.
 *
 * Renders gracefully for partial data:
 *   { size: 42 }                -> "EU 42"
 *   { color: 'Solar Red' }      -> "Solar Red"
 *   { size: 42, color: 'Red' }  -> "EU 42 · Red"
 *   { }                         -> null (component renders nothing)
 */
function CartLineVariant({ size, color, className = '' }) {
  const hasSize = size !== undefined && size !== null && size !== '';
  const hasColor = typeof color === 'string' && color.trim().length > 0;
  if (!hasSize && !hasColor) return null;

  const parts = [];
  if (hasSize) parts.push(`EU ${size}`);
  if (hasColor) parts.push(color);

  return (
    <p
      className={classNames(
        'text-2xs font-semibold uppercase tracking-widest text-ink-500',
        className
      )}
    >
      {parts.join(' · ')}
    </p>
  );
}

export default CartLineVariant;
