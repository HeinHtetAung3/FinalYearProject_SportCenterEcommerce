import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import ProductCard from '../components/products/ProductCard';
import CategoryCard from '../components/products/CategoryCard';
import ProductRail from '../components/products/ProductRail';
import { ProductCardSkeleton } from '../components/feedback/Skeleton';
import { SPORT_ENTRIES, LIFESTYLE_ENTRIES } from '../components/layout/Header';
import { fetchProducts } from '../services/catalogService';
import { fetchStorefrontHome } from '../services/storefrontService';
import PromoStrip from '../components/storefront/PromoStrip';
import HeroSecondaryBanner from '../components/storefront/HeroSecondaryBanner';
import BrandRail from '../components/storefront/BrandRail';
import ClearanceSection from '../components/storefront/ClearanceSection';
import TestimonialsSection from '../components/storefront/TestimonialsSection';
import EditorialSection from '../components/storefront/EditorialSection';
import NewsletterSection from '../components/storefront/NewsletterSection';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import {
  IconArrowRight,
  IconRefresh,
  IconShield,
  IconSparkle,
  IconTruck
} from '../components/ui/Icon';
import { buildCategoryImageUrl } from '../utils/productImages';
import { formatInteger } from '../utils/format';

const HERO_IMAGE = buildCategoryImageUrl('outdoor', 4);

/** Short blurbs keyed by sport category slug — keeps sport pillar cards evocative. */
const SPORT_CARD_COPY = {
  running:
    'Lightweight trainers, tees and pacing gear engineered for endurance.',
  football: 'Cleats, match balls and layering built for ninety minutes.',
  fitness: 'Weights, cardio essentials and accessories for consistent training.',
  outdoor: 'Layering, trekking footwear and camp-ready staples.',
  basketball: 'Hoops sneakers, hoops apparel and breathable court staples.',
  training: 'Gym-floor essentials and recovery staples for repeat sessions.'
};

const LIFESTYLE_CARD_COPY = {
  Sneaker: 'Head-turning soles for sidewalks, travel days and downtime.',
  Hoodie:
    'Brushed fleece and premium weight for easy layering everywhere.',
  Tee:
    'Soft jersey and graphics that nail off-duty uniforms.',
  Jogger: 'Tailored tapered pairs with recovery-friendly stretch.',
  Cap: 'Brims and washes that finish hoodies-and-trainers fits.',
  Backpack: 'Commute-ready compartments with sport-inspired detailing.'
};

const GENDER_LINKS = [
  {
    label: 'Men',
    to: '/products?gender=men',
    image: buildCategoryImageUrl('running', 5)
  },
  {
    label: 'Women',
    to: '/products?gender=women',
    image: buildCategoryImageUrl('training', 3)
  },
  {
    label: 'Kids',
    to: '/products?gender=kids',
    image: buildCategoryImageUrl('basketball', 4)
  }
];

const PERKS = [
  { icon: <IconTruck />, title: 'Free shipping', description: 'On orders above $75' },
  { icon: <IconRefresh />, title: '30-day returns', description: 'Hassle-free exchanges' },
  { icon: <IconShield />, title: '2-year warranty', description: 'Built to last' },
  { icon: <IconSparkle />, title: 'Member rewards', description: 'Early drops & deals' }
];

function slugFromMegaPath(path) {
  const q = path.split('?')[1];
  if (!q) return null;
  return new URLSearchParams(q).get('category');
}

function keywordFromLifestyle(path) {
  const q = path.split('?')[1];
  if (!q) return '';
  const search = new URLSearchParams(q).get('search') || '';
  return search.replace(/[^a-zA-Z]/g, '');
}

function buildSportCards() {
  return SPORT_ENTRIES.map((entry, index) => {
    const slug = slugFromMegaPath(entry.to) || 'fitness';
    return {
      title: entry.label,
      eyebrow: 'Shop by sport',
      description: SPORT_CARD_COPY[slug] || `Browse premium ${entry.label.toLowerCase()} essentials.`,
      image: buildCategoryImageUrl(slug, (index % 6) + 1),
      to: entry.to
    };
  });
}

function pickPromoBanner(banners) {
  if (!Array.isArray(banners) || banners.length === 0) return null;
  const topBar = banners.find((b) => b.slot === 'TOP_BAR');
  if (topBar) return topBar;
  const nonHero = banners.find((b) => b.slot !== 'HERO_SECONDARY');
  return nonHero || banners[0];
}

function pickHeroSecondaryBanner(banners) {
  if (!Array.isArray(banners)) return null;
  return banners.find((b) => b.slot === 'HERO_SECONDARY') || null;
}

/** Live figures from `/api/storefront/home` — omit row if API has no stats yet. */
function buildHeroStatTiles(stats) {
  if (!stats || typeof stats !== 'object') return [];
  const tiles = [
    [formatInteger(stats.productCount), 'Products stocked'],
    [formatInteger(stats.brandCount), 'Brands'],
    [formatInteger(stats.reviewCount), 'Reviews']
  ];
  if (stats.reviewCount > 0 && stats.averageRating != null && !Number.isNaN(stats.averageRating)) {
    tiles.push([`${stats.averageRating}★`, 'Avg. rating']);
  }
  return tiles;
}

function buildLifestyleCards() {
  return LIFESTYLE_ENTRIES.map((entry, index) => {
    const hint = keywordFromLifestyle(entry.to);
    return {
      title: entry.label,
      eyebrow: 'Shop lifestyle',
      description:
        LIFESTYLE_CARD_COPY[hint] ||
        `${entry.label} — staples inspired by locker rooms and city streets.`,
      image: buildCategoryImageUrl('lifestyle', (index % 6) + 2),
      to: entry.to
    };
  });
}

function HomePage() {
  const [storefront, setStorefront] = useState(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [clearance, setClearance] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed());
  const [loading, setLoading] = useState(true);
  const [clearanceLoading, setClearanceLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearanceError, setClearanceError] = useState('');
  const [catalogTick, setCatalogTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const home = await fetchStorefrontHome();
      if (!cancelled) setStorefront(home);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onCatalogChanged() {
      setCatalogTick((t) => t + 1);
    }
    window.addEventListener('catalog:changed', onCatalogChanged);
    return () => window.removeEventListener('catalog:changed', onCatalogChanged);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCatalogRails() {
      setLoading(true);
      setClearanceLoading(true);
      setError('');
      setClearanceError('');
      try {
        const [novel, trending, dealz] = await Promise.all([
          fetchProducts({ page: 0, size: 12, sort: 'ratingDesc', isNewArrival: 1 }),
          fetchProducts({ page: 0, size: 12, sort: 'ratingDesc', isBestSeller: 1 }),
          fetchProducts({ page: 0, size: 8, sort: 'priceAsc', onSale: 1 })
        ]);
        if (cancelled) return;
        setNewArrivals(novel?.items || []);
        setBestSellers(trending?.items || []);
        setClearance(dealz?.items || []);
      } catch (apiError) {
        if (!cancelled) {
          const msg = apiError.message || 'Unable to load products.';
          setError(msg);
          setClearanceError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setClearanceLoading(false);
        }
      }
    }
    loadCatalogRails();
    return () => {
      cancelled = true;
    };
  }, [catalogTick]);

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

  const sportCards = buildSportCards();
  const lifestyleCards = buildLifestyleCards();
  const banners = storefront?.banners || [];
  const promoBanner = pickPromoBanner(banners);
  const heroSecondary = pickHeroSecondaryBanner(banners);
  const heroStatTiles = buildHeroStatTiles(storefront?.heroStats);

  return (
    <>
      <PromoStrip banner={promoBanner} />

      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <img
          src={HERO_IMAGE}
          alt="Athlete training"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/80 to-ink-950/30" />
        <Container className="relative flex min-h-[78vh] flex-col justify-center py-24 sm:py-32">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-2xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-volt-400" /> New season drops
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tightest text-white text-balance sm:text-7xl lg:text-[88px]">
            Upgrade Your <span className="text-accent-500">Game.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
            Shop premium sports equipment engineered for athletes who refuse to settle. Move faster,
            hit harder, train longer.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button to="/products" size="xl" variant="accent" rightIcon={<IconArrowRight className="h-4 w-4" />}>
              Shop Now
            </Button>
            <Button
              to="/products?category=running"
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white hover:text-ink-950"
            >
              Browse Running
            </Button>
          </div>

          {heroStatTiles.length > 0 ? (
            <div
              className={`mt-16 grid gap-x-8 gap-y-4 border-t border-white/10 pt-8 text-white/80 ${
                heroStatTiles.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              {heroStatTiles.map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-white">{value}</p>
                  <p className="text-2xs uppercase tracking-widest text-white/60">{label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section className="border-y border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
        <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-center gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-900 dark:bg-ink-800 dark:text-ink-100">
                {perk.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{perk.title}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">{perk.description}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      <BrandRail brands={storefront?.brands} />

      <HeroSecondaryBanner banner={heroSecondary} />

      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
                Shop by sport
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
                Performance by discipline.
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
            >
              View all <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sportCards.map((category) => (
              <CategoryCard key={category.title} category={category} />
            ))}
          </div>

          <div className="mt-16 border-t border-ink-100 pt-14 dark:border-ink-800">
            <div className="mb-8 text-center lg:mb-10">
              <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
                Shop by gender
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-3xl">
                Men · Women · Kids
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {GENDER_LINKS.map((g) => (
                <Link
                  key={g.label}
                  to={g.to}
                  className="group relative isolate overflow-hidden rounded-3xl border border-ink-100 bg-ink-950 shadow-card transition hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <img
                    src={g.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 ease-out group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/40 to-ink-950/25" />
                  <div className="relative flex min-h-[10rem] flex-col justify-end p-6 sm:min-h-[12rem] sm:p-8">
                    <span className="text-2xs font-semibold uppercase tracking-widest text-volt-300">
                      For {g.label.toLowerCase()}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-2 font-display text-xl font-bold text-white sm:text-2xl">
                      Shop {g.label}{' '}
                      <IconArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-ink-100 pt-14">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
                Shop by lifestyle category
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
                Off-duty rotations.
              </h2>
            </div>
            <Link
              to="/products?category=lifestyle"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-accent-600"
            >
              All lifestyle <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lifestyleCards.map((category) => (
              <CategoryCard key={category.title} category={category} />
            ))}
          </div>
        </Container>
      </section>

      <ClearanceSection products={clearance} loading={clearanceLoading} error={clearanceError} />

      {recentlyViewed.length > 0 ? (
        <Container className="pb-6">
          <ProductRail eyebrow="Continue exploring" title="Recently viewed" products={recentlyViewed} />
        </Container>
      ) : null}

      <section className="bg-ink-50 py-20 dark:bg-ink-900/40">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
                New arrivals
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
                Fresh drops across the catalog.
              </h2>
            </div>
            <Link
              to="/products?isNewArrival=1"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-accent-600"
            >
              See all new arrivals <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {error ? (
            <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
              : newArrivals.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
                Best sellers
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
                Trusted by tens of thousands of athletes.
              </h2>
            </div>
            <Link
              to="/products?isBestSeller=1"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 hover:text-accent-600"
            >
              See all best sellers <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <ProductCardSkeleton key={`bs-${index}`} />
                ))
              : bestSellers.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </Container>
      </section>

      <TestimonialsSection reviews={storefront?.featuredReviews} />

      <EditorialSection items={storefront?.editorialFeatures} />

      <NewsletterSection showMemberPitch />
    </>
  );
}

export default HomePage;
