import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import ProductCard from '../products/ProductCard';
import { ProductCardSkeleton } from '../feedback/Skeleton';
import { IconArrowRight } from '../ui/Icon';

function ClearanceSection({ products, loading, error }) {
  const hasProducts = Array.isArray(products) && products.length > 0;
  if (!loading && !error && !hasProducts) return null;

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-400">
              Clearance & deals
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
              Marked down while stock lasts.
            </h2>
          </div>
          <Link
            to="/products?onSale=1"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
          >
            Shop all deals <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </p>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`cl-${i}`} />)
            : products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </Container>
    </section>
  );
}

export default ClearanceSection;
