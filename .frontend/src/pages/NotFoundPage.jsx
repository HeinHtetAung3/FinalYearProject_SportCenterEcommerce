import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import ProductRail from '../components/products/ProductRail';
import { SPORT_ENTRIES, LIFESTYLE_ENTRIES } from '../components/layout/Header';
import { IconArrowRight, IconSearch } from '../components/ui/Icon';
import { getRecentlyViewed } from '../utils/recentlyViewed';

function NotFoundPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed());

  useEffect(() => {
    const syncRecent = () => setRecentlyViewed(getRecentlyViewed());
    window.addEventListener('storage', syncRecent);
    window.addEventListener('focus', syncRecent);
    document.addEventListener('visibilitychange', syncRecent);
    return () => {
      window.removeEventListener('storage', syncRecent);
      window.removeEventListener('focus', syncRecent);
      document.removeEventListener('visibilitychange', syncRecent);
    };
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Container className="py-10 md:py-14 lg:py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-14 lg:gap-16">
        <section className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-soft sm:p-12">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">404</span>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tightest text-ink-950">
            Off the field.
          </h1>
          <p className="mt-3 max-w-sm text-ink-500">
            The page you’re looking for doesn’t exist or has moved. Let’s get you back in the game.
          </p>
          <Button
            to="/"
            variant="primary"
            size="lg"
            className="mt-8"
            rightIcon={<IconArrowRight className="h-4 w-4" />}
          >
            Back to home
          </Button>
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
            Search
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
            Find gear on the catalogue
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Jump straight to matching products — filters on the listing page refine by sport,
            gender, colour and more.
          </p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
            <label htmlFor="not-found-search" className="sr-only">
              Search products
            </label>
            <div className="relative flex flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
                <IconSearch className="h-5 w-5" />
              </span>
              <input
                id="not-found-search"
                type="search"
                autoComplete="off"
                placeholder="Search shoes, jerseys, kits…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-ink-200 bg-ink-50/60 pl-12 pr-4 text-sm text-ink-900 outline-none ring-accent-400/40 transition placeholder:text-ink-400 focus:border-accent-400 focus:bg-white focus:ring-4"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-ink-950 px-6 text-sm font-semibold text-white transition hover:bg-ink-900"
            >
              Search
            </button>
          </form>
        </section>

        <section>
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
            Browse
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
            Popular categories
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Same paths as the main menu — so what you tap here matches the rest of the site.
          </p>

          <div className="mt-8 space-y-10">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Shop by sport
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SPORT_ENTRIES.map((entry) => (
                  <li key={entry.to}>
                    <Link
                      to={entry.to}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3.5 text-sm font-semibold text-ink-900 shadow-soft transition hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card"
                    >
                      <span>{entry.label}</span>
                      <IconArrowRight className="h-4 w-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-accent-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Shop by lifestyle
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {LIFESTYLE_ENTRIES.map((entry) => (
                  <li key={entry.to}>
                    <Link
                      to={entry.to}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3.5 text-sm font-semibold text-ink-900 shadow-soft transition hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-card"
                    >
                      <span className="line-clamp-2 text-left">{entry.label}</span>
                      <IconArrowRight className="h-4 w-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-accent-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-center text-sm text-ink-500">
              Or{' '}
              <Link to="/products" className="font-semibold text-ink-900 underline-offset-2 hover:text-accent-600 hover:underline">
                view all products
              </Link>
              .
            </p>
          </div>
        </section>

        <div className="[&_section]:mt-0">
          <ProductRail
            eyebrow="Pick up where you left off"
            title="Recently viewed"
            products={recentlyViewed}
            emptyMessage="No items yet — open a product page and we’ll remember it here for your next visit."
          />
        </div>
      </div>
    </Container>
  );
}

export default NotFoundPage;
