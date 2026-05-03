import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ProductImage from './ProductImage';
import Rating from '../ui/Rating';
import Badge from '../ui/Badge';
import { IconCart, IconHeart } from '../ui/Icon';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency, classNames } from '../../utils/format';

function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  if (!product) return null;

  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const isNew =
    product.newArrival === true ||
    product.isNew === true ||
    (product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30);
  const compareAt = product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
  const priceNum = Number(product.price);
  const isOnSale =
    compareAt != null && !Number.isNaN(compareAt) && !Number.isNaN(priceNum) && compareAt > priceNum;

  const handleAdd = async (event) => {
    event.preventDefault();
    if (isOutOfStock || busy) return;
    setBusy(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setBusy(false);
    }
  };

  const wishlisted = isInWishlist(product.id);

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.id}` } });
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    try {
      await toggleWishlist(product.id);
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className={classNames(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition duration-300',
        'hover:-translate-y-1 hover:border-ink-200 hover:shadow-card'
      )}
    >
      <div className="relative">
        <ProductImage
          product={product}
          rounded="rounded-none"
          className="aspect-square"
          zoom
        />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isOnSale ? <Badge variant="danger">Sale</Badge> : null}
          {isNew ? <Badge variant="volt">New</Badge> : null}
          {isOutOfStock ? <Badge variant="danger">Out of stock</Badge> : null}
          {isLowStock && !isOutOfStock ? <Badge variant="warning">Low stock</Badge> : null}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishBusy}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={classNames(
            'absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:bg-white',
            wishlisted ? 'text-rose-600' : 'text-ink-700 hover:text-accent-600',
            wishBusy ? 'opacity-70' : ''
          )}
        >
          <IconHeart className="h-4 w-4" filled={wishlisted} />
        </button>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:pointer-events-auto">
          <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock || busy}
            className={classNames(
              'flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-4 py-2.5 text-2xs font-bold uppercase tracking-wider text-white',
              'transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:bg-ink-300'
            )}
          >
            <IconCart className="h-4 w-4" />
            {isOutOfStock ? 'Sold out' : busy ? 'Adding...' : 'Add to cart'}
          </button>
        </div>
      </div>

      <div className={classNames('flex flex-1 flex-col gap-2 p-5', compact ? 'p-4' : '')}>
        <div className="flex items-center justify-between gap-2">
          {product.categoryName ? (
            <span className="text-2xs font-semibold uppercase tracking-widest text-ink-400">
              {product.categoryName}
            </span>
          ) : <span />}
          {product.brand ? (
            <span className="text-2xs font-bold uppercase tracking-widest text-accent-600">
              {product.brand}
            </span>
          ) : null}
        </div>
        <h3 className="line-clamp-2 font-semibold text-ink-900 transition group-hover:text-accent-600">
          {product.name}
        </h3>
        {Array.isArray(product.colors) && product.colors.length > 0 ? (
          <p className="text-2xs uppercase tracking-wider text-ink-400">
            {product.colors.length} colour{product.colors.length === 1 ? '' : 's'}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-ink-900 dark:text-ink-50">{formatCurrency(product.price)}</span>
            {isOnSale ? (
              <span className="text-sm font-medium text-ink-400 line-through dark:text-ink-500">
                {formatCurrency(compareAt)}
              </span>
            ) : null}
          </div>
          {typeof product.rating === 'number' && product.rating > 0 ? (
            <Rating value={product.rating} showValue />
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
