import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import ProductCard from '../components/products/ProductCard';
import FilterSidebar, { FilterSheet } from '../components/products/FilterSidebar';
import { ProductCardSkeleton } from '../components/feedback/Skeleton';
import EmptyState from '../components/feedback/EmptyState';
import {
  IconChevronDown,
  IconClose,
  IconFilter,
  IconSearch
} from '../components/ui/Icon';
import { fetchCategories, fetchProducts } from '../services/catalogService';
import {
  PLP_BRAND_OPTIONS,
  PLP_COLOR_SWATCHES,
  PLP_EU_SIZE_OPTIONS,
  PLP_GENDER_OPTIONS
} from '../data/mockCatalog';
import { useDebounce } from '../hooks/useDebounce';
import { classNames } from '../utils/format';

const SORT_OPTIONS = [
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'ratingDesc', label: 'Top Rated' },
  { value: 'nameAsc', label: 'Alphabetical' }
];

const FILTER_CATEGORIES = [
  'All',
  'Running',
  'Football',
  'Fitness',
  'Outdoor',
  'Basketball',
  'Training',
  'Accessories',
  'Lifestyle'
];

const PAGE_SIZE = 12;

function findCategoryByValue(categories, value) {
  if (!value) return null;
  return (
    categories.find((category) => String(category.id) === String(value)) ||
    categories.find((category) => category.slug === value) ||
    categories.find((category) => category.name?.toLowerCase() === String(value).toLowerCase()) ||
    null
  );
}

function parseBrandsParam(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseEuParam(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

function parseColorParam(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function parseGenderParam(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => PLP_GENDER_OPTIONS.some((opt) => opt.slug === s));
}

function formatBrandLabel(slug) {
  if (!slug) return '';
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'priceAsc';
  const initialPage = Number(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 350);

  const [categoryValue, setCategoryValue] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(Math.max(1, initialPage));

  const [selectedBrands, setSelectedBrands] = useState(() =>
    parseBrandsParam(searchParams.get('brand'))
  );
  const [selectedEu, setSelectedEu] = useState(() => parseEuParam(searchParams.get('eu')));
  const [selectedColors, setSelectedColors] = useState(() =>
    parseColorParam(searchParams.get('color'))
  );
  const [selectedGenders, setSelectedGenders] = useState(() =>
    parseGenderParam(searchParams.get('gender'))
  );
  const [minPriceFilter, setMinPriceFilter] = useState(() => searchParams.get('minPrice') || '');
  const [maxPriceFilter, setMaxPriceFilter] = useState(() => searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(() => searchParams.get('inStock') === '1');

  const brandKey = useMemo(() => [...selectedBrands].sort().join(','), [selectedBrands]);
  const euKey = useMemo(
    () =>
      [...selectedEu]
        .sort((a, b) => a - b)
        .join(','),
    [selectedEu]
  );
  const colorKey = useMemo(() => [...selectedColors].sort().join(','), [selectedColors]);
  const genderKey = useMemo(() => [...selectedGenders].sort().join(','), [selectedGenders]);

  const facetCount = useMemo(() => {
    let n =
      selectedBrands.length +
      selectedEu.length +
      selectedColors.length +
      selectedGenders.length;
    if (minPriceFilter !== '') n += 1;
    if (maxPriceFilter !== '') n += 1;
    if (inStockOnly) n += 1;
    return n;
  }, [
    selectedBrands.length,
    selectedEu.length,
    selectedColors.length,
    selectedGenders.length,
    minPriceFilter,
    maxPriceFilter,
    inStockOnly
  ]);

  // Sync URL when filters / page change.
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch) next.set('search', debouncedSearch);
    if (categoryValue) next.set('category', categoryValue);
    if (sort && sort !== 'priceAsc') next.set('sort', sort);
    if (page > 1) next.set('page', String(page));
    if (selectedBrands.length) next.set('brand', [...selectedBrands].sort().join(','));
    if (selectedEu.length)
      next.set(
        'eu',
        [...selectedEu]
          .sort((a, b) => a - b)
          .join(',')
      );
    if (selectedColors.length) next.set('color', [...selectedColors].sort().join(','));
    if (selectedGenders.length) next.set('gender', [...selectedGenders].sort().join(','));
    if (minPriceFilter !== '') next.set('minPrice', String(minPriceFilter));
    if (maxPriceFilter !== '') next.set('maxPrice', String(maxPriceFilter));
    if (inStockOnly) next.set('inStock', '1');
    setSearchParams(next, { replace: true });
  }, [
    debouncedSearch,
    categoryValue,
    sort,
    page,
    brandKey,
    euKey,
    colorKey,
    genderKey,
    minPriceFilter,
    maxPriceFilter,
    inStockOnly,
    selectedBrands,
    selectedEu,
    selectedColors,
    selectedGenders,
    setSearchParams
  ]);

  // Re-hydrate state from the URL when the user navigates to /products with
  // new query params (e.g. clicking a mega-menu link from another /products
  // URL). `setSearchParams(..., { replace: true })` keeps `location.key`
  // stable, so this effect does NOT loop with the state -> URL effect above.
  const isFirstHydrationRef = useRef(true);
  useEffect(() => {
    if (isFirstHydrationRef.current) {
      isFirstHydrationRef.current = false;
      return;
    }
    setSearchInput(searchParams.get('search') || '');
    setCategoryValue(searchParams.get('category') || '');
    setSort(searchParams.get('sort') || 'priceAsc');
    setPage(Math.max(1, Number(searchParams.get('page') || '1')));
    setSelectedBrands(parseBrandsParam(searchParams.get('brand')));
    setSelectedEu(parseEuParam(searchParams.get('eu')));
    setSelectedColors(parseColorParam(searchParams.get('color')));
    setSelectedGenders(parseGenderParam(searchParams.get('gender')));
    setMinPriceFilter(searchParams.get('minPrice') || '');
    setMaxPriceFilter(searchParams.get('maxPrice') || '');
    setInStockOnly(searchParams.get('inStock') === '1');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only on push/pop nav
  }, [location.key]);

  const filtersSignature = `${debouncedSearch}|${categoryValue}|${sort}|${brandKey}|${euKey}|${colorKey}|${genderKey}|${minPriceFilter}|${maxPriceFilter}|${inStockOnly}`;
  const prevFiltersSig = useRef(null);
  useEffect(() => {
    if (prevFiltersSig.current === null) {
      prevFiltersSig.current = filtersSignature;
      return;
    }
    if (prevFiltersSig.current !== filtersSignature) {
      prevFiltersSig.current = filtersSignature;
      setPage(1);
    }
  }, [filtersSignature]);

  // Load categories once.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await fetchCategories();
        if (!cancelled) setCategories(list || []);
      } catch {
        // Non-fatal — UI still works without category dropdown options.
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-fetch when admin mutates catalog in another view/tab.
  useEffect(() => {
    function onCatalogChanged() {
      setRefreshTick((prev) => prev + 1);
    }
    window.addEventListener('catalog:changed', onCatalogChanged);
    return () => {
      window.removeEventListener('catalog:changed', onCatalogChanged);
    };
  }, []);

  const resolvedCategoryId = useMemo(() => {
    const match = findCategoryByValue(categories, categoryValue);
    return match?.id;
  }, [categories, categoryValue]);

  // Load products when filters or page change.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: page - 1,
          size: PAGE_SIZE,
          search: debouncedSearch || undefined,
          categoryId: resolvedCategoryId || undefined,
          sort,
          ...(selectedBrands.length ? { brand: [...selectedBrands].sort().join(',') } : {}),
          ...(selectedEu.length
            ? {
                eu: [...selectedEu]
                  .sort((a, b) => a - b)
                  .join(',')
              }
            : {}),
          ...(selectedColors.length ? { color: [...selectedColors].sort().join(',') } : {}),
          ...(selectedGenders.length ? { gender: [...selectedGenders].sort().join(',') } : {}),
          ...(minPriceFilter !== '' ? { minPrice: minPriceFilter } : {}),
          ...(maxPriceFilter !== '' ? { maxPrice: maxPriceFilter } : {}),
          ...(inStockOnly ? { inStock: 1 } : {})
        };
        const data = await fetchProducts(params);
        if (cancelled) return;
        setProducts(data?.items || []);
        setTotalItems(data?.totalItems || 0);
        setTotalPages(data?.totalPages || 0);
      } catch (apiError) {
        if (!cancelled) setError(apiError.message || 'Unable to load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [
    debouncedSearch,
    resolvedCategoryId,
    sort,
    page,
    brandKey,
    euKey,
    colorKey,
    genderKey,
    minPriceFilter,
    maxPriceFilter,
    inStockOnly,
    refreshTick
  ]);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (debouncedSearch) {
      chips.push({
        key: 'search',
        label: `“${debouncedSearch}”`,
        onRemove: () => setSearchInput('')
      });
    }
    if (categoryValue) {
      chips.push({
        key: 'category',
        label: findCategoryByValue(categories, categoryValue)?.name || categoryValue,
        onRemove: () => setCategoryValue('')
      });
    }
    selectedBrands.forEach((slug) =>
      chips.push({
        key: `brand:${slug}`,
        label: formatBrandLabel(slug),
        onRemove: () => setSelectedBrands((prev) => prev.filter((b) => b !== slug))
      })
    );
    selectedEu.forEach((eu) =>
      chips.push({
        key: `eu:${eu}`,
        label: `EU ${eu}`,
        onRemove: () => setSelectedEu((prev) => prev.filter((x) => x !== eu))
      })
    );
    selectedColors.forEach((slug) => {
      const found = PLP_COLOR_SWATCHES.find((r) => r.slug === slug);
      chips.push({
        key: `color:${slug}`,
        label: found?.label || slug,
        onRemove: () => setSelectedColors((prev) => prev.filter((c) => c !== slug))
      });
    });
    selectedGenders.forEach((slug) => {
      const found = PLP_GENDER_OPTIONS.find((r) => r.slug === slug);
      chips.push({
        key: `gender:${slug}`,
        label: found?.label || slug,
        onRemove: () => setSelectedGenders((prev) => prev.filter((g) => g !== slug))
      });
    });
    if (minPriceFilter !== '') {
      chips.push({
        key: 'minPrice',
        label: `Min $${minPriceFilter}`,
        onRemove: () => setMinPriceFilter('')
      });
    }
    if (maxPriceFilter !== '') {
      chips.push({
        key: 'maxPrice',
        label: `Max $${maxPriceFilter}`,
        onRemove: () => setMaxPriceFilter('')
      });
    }
    if (inStockOnly) {
      chips.push({
        key: 'inStock',
        label: 'In stock',
        onRemove: () => setInStockOnly(false)
      });
    }
    return chips;
  }, [
    debouncedSearch,
    categoryValue,
    categories,
    selectedBrands,
    selectedEu,
    selectedColors,
    selectedGenders,
    minPriceFilter,
    maxPriceFilter,
    inStockOnly
  ]);

  const clearFacetState = () => {
    setSelectedBrands([]);
    setSelectedEu([]);
    setSelectedColors([]);
    setSelectedGenders([]);
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setInStockOnly(false);
  };

  const handleClearAll = () => {
    setSearchInput('');
    setCategoryValue('');
    setSort('priceAsc');
    clearFacetState();
  };

  const toggleBrand = (key) => {
    setSelectedBrands((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleEu = (n) => {
    setSelectedEu((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  const toggleColorSlug = (slug) => {
    setSelectedColors((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const toggleGender = (slug) => {
    setSelectedGenders((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const facetFieldProps = {
    brandOptions: PLP_BRAND_OPTIONS,
    euOptions: PLP_EU_SIZE_OPTIONS,
    colorSwatches: PLP_COLOR_SWATCHES,
    genderOptions: PLP_GENDER_OPTIONS,
    selectedBrands,
    onToggleBrand: toggleBrand,
    selectedEu,
    onToggleEu: toggleEu,
    selectedColorSlugs: selectedColors,
    onToggleColor: toggleColorSlug,
    selectedGenders,
    onToggleGender: toggleGender,
    minPrice: minPriceFilter,
    maxPrice: maxPriceFilter,
    onMinPriceChange: setMinPriceFilter,
    onMaxPriceChange: setMaxPriceFilter,
    inStockOnly,
    onInStockChange: setInStockOnly,
    onClearFacets: clearFacetState
  };

  return (
    <Container>
      <header className="mb-10">
        <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
          Catalog
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-5xl">
          Shop all gear
        </h1>
        <p className="mt-3 max-w-2xl text-ink-500 dark:text-ink-400">
          {totalItems
            ? `${totalItems} products engineered for performance.`
            : 'Premium sports gear, hand-picked by our team.'}
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        {/* Desktop facet column */}
        <aside className="mb-8 hidden lg:mb-0 lg:block">
          <div className="card-base sticky top-28 max-h-[calc(100vh-6.5rem)] overflow-y-auto p-5 pb-8">
            <FilterSidebar {...facetFieldProps} />
          </div>
        </aside>

        <div className="min-w-0 lg:pb-16">
          <div className="mb-4 flex flex-wrap items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setFilterSheetOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-800 shadow-soft transition hover:border-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-500"
            >
              <IconFilter className="h-4 w-4" />
              Filters
              {facetCount > 0 ? (
                <span className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-2xs font-bold text-white">
                  {facetCount > 99 ? '99+' : facetCount}
                </span>
              ) : null}
            </button>
            <span className="text-xs text-ink-500 dark:text-ink-400">
              Refine brand, EU size and colour
            </span>
          </div>

          <div className="card-base mb-6 grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_auto] md:items-center md:p-3">
            <label className="relative flex items-center">
              <IconSearch className="absolute left-4 text-ink-400 dark:text-ink-500" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products..."
                className="input-base pl-11"
              />
            </label>

            <label className="relative">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="input-base appearance-none pr-10"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <IconChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" />
            </label>

            <Button variant="ghost" size="md" onClick={handleClearAll} className="md:px-5">
              Reset
            </Button>
          </div>

          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Product categories">
            {FILTER_CATEGORIES.map((label) => {
              const slug = label === 'All' ? '' : label.toLowerCase();
              const isActive =
                (slug === '' && !categoryValue) ||
                (slug !== '' && String(categoryValue).toLowerCase() === slug);
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setCategoryValue(slug)}
                  className={classNames(
                    'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition',
                    isActive
                      ? 'border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:border-ink-500 dark:hover:text-white'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {activeFilters.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                Active ({activeFilters.length})
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.onRemove}
                  className="inline-flex items-center gap-1 rounded-full bg-ink-950 px-3 py-1.5 text-2xs font-semibold text-white"
                >
                  {filter.label}
                  <IconClose className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}

          {facetCount > 0 ? (
            <p className="mb-6 text-xs text-ink-500 dark:text-ink-400">
              Showing faceted catalog (brand / EU size / colour matching football boots plus price &
              stock). Clear filters anytime.
            </p>
          ) : null}

          {error ? (
            <p className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<IconSearch />}
              title="No products match your filters"
              description="Try adjusting your search, facet filters, category or price range."
              action={
                <Button variant="primary" onClick={handleClearAll}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : null}
        </div>
      </div>

      <FilterSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)}>
        <FilterSidebar {...facetFieldProps} />
      </FilterSheet>
    </Container>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-700 transition hover:border-ink-900 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>
      <ul className="flex items-center gap-1">
        {pages.map((entry, index) =>
          entry === '…' ? (
            <li key={`ellipsis-${index}`} className="px-2 text-sm text-ink-400">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onChange(entry)}
                className={classNames(
                  'h-10 w-10 rounded-full text-sm font-semibold transition',
                  entry === page
                    ? 'bg-ink-950 text-white'
                    : 'text-ink-700 hover:bg-ink-100'
                )}
              >
                {entry}
              </button>
            </li>
          )
        )}
      </ul>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-700 transition hover:border-ink-900 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

function buildPageList(current, total) {
  const result = [];
  const window = 1;
  for (let i = 1; i <= total; i += 1) {
    if (i === 1 || i === total || (i >= current - window && i <= current + window)) {
      result.push(i);
    } else if (result[result.length - 1] !== '…') {
      result.push('…');
    }
  }
  return result;
}

export default ProductsPage;
