import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import { IconArrowRight } from '../ui/Icon';

function brandHref(brand) {
  if (brand?.href) return brand.href;
  const name = brand?.name;
  if (!name) return '/products';
  return `/products?brand=${encodeURIComponent(name)}`;
}

function BrandRail({ brands }) {
  if (!Array.isArray(brands) || brands.length === 0) return null;

  return (
    <section className="border-b border-ink-100 bg-ink-50/80 py-12 dark:border-ink-800 dark:bg-ink-900/30">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              Shop by brand
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-3xl">
              Trusted names, one roof.
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
          >
            All products <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {brands.map((b) => (
            <Link
              key={`${b.name}-${brandHref(b)}`}
              to={brandHref(b)}
              className="rounded-full border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-soft transition hover:-translate-y-0.5 hover:border-accent-400 hover:text-accent-700 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 dark:hover:border-accent-500"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default BrandRail;
