import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconChevronRight } from '../ui/Icon';
import ProductImage from './ProductImage';
import { formatCurrency, classNames } from '../../utils/format';

/**
 * Horizontal product rail used for "You may also like" and
 * "Recently viewed" on the PDP. Cards live in a scroll-snap row that
 * supports touch swipes on mobile and arrow buttons on desktop. We use
 * a slimmer card layout (no add-to-cart hover) so the rail stays light
 * — full ProductCard remains for the main grid on the PLP.
 */
function ProductRail({ title, eyebrow, products = [], emptyMessage }) {
  const scrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({ canPrev: false, canNext: false });

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const canPrev = el.scrollLeft > 4;
    const canNext = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setScrollState((prev) =>
      prev.canPrev === canPrev && prev.canNext === canNext ? prev : { canPrev, canNext }
    );
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products.length]);

  const scrollByCards = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-rail-card]');
    const step = card ? card.clientWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  if (!products || products.length === 0) {
    if (!emptyMessage) return null;
    return (
      <section className="mt-16">
        <RailHeader title={title} eyebrow={eyebrow} />
        <p className="rounded-2xl border border-dashed border-ink-200 bg-white p-6 text-sm text-ink-500">
          {emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <RailHeader title={title} eyebrow={eyebrow} />
        <div className="hidden gap-2 lg:flex">
          <RailArrow
            direction={-1}
            onClick={() => scrollByCards(-1)}
            disabled={!scrollState.canPrev}
            label="Scroll left"
          />
          <RailArrow
            direction={1}
            onClick={() => scrollByCards(1)}
            disabled={!scrollState.canNext}
            label="Scroll right"
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-none"
      >
        {products.map((product) => (
          <RailCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function RailHeader({ title, eyebrow }) {
  return (
    <div>
      {eyebrow ? (
        <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">{title}</h2>
    </div>
  );
}

function RailArrow({ direction, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={classNames(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-soft transition',
        'hover:border-ink-900 hover:text-ink-950',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-700'
      )}
    >
      {direction < 0 ? (
        <IconChevronLeft className="h-4 w-4" />
      ) : (
        <IconChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

function RailCard({ product }) {
  const isOutOfStock = product.stock === 0;
  return (
    <Link
      to={`/products/${product.id}`}
      data-rail-card
      className="group flex w-[14.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card sm:w-[15.5rem]"
    >
      <div className="relative">
        <ProductImage product={product} rounded="rounded-none" className="aspect-square" />
        {isOutOfStock ? (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-rose-600 px-2 py-1 text-2xs font-semibold uppercase tracking-wider text-white">
            Sold out
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.categoryName ? (
          <span className="text-2xs font-semibold uppercase tracking-widest text-ink-400">
            {product.categoryName}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 transition group-hover:text-accent-600">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-base font-bold text-ink-950">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default ProductRail;
