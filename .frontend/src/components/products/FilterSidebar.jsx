import Button from '../ui/Button';
import { classNames } from '../../utils/format';

/** Simple hash colour for swatch previews (keyword match on label). */
const SWATCH_LOOKUP = [
  ['black', '#0f172a'],
  ['white', '#f8fafc'],
  ['cloud', '#e5e7eb'],
  ['red', '#dc2626'],
  ['solar', '#ef4444'],
  ['crimson', '#b91c1c'],
  ['blue', '#2563eb'],
  ['navy', '#1e3a8a'],
  ['royal', '#1d4ed8'],
  ['sapphire', '#1e40af'],
  ['university', '#2563eb'],
  ['volt', '#bef264'],
  ['lemon', '#facc15'],
  ['yellow', '#facc15'],
  ['orange', '#f97316'],
  ['ultra', '#f97316'],
  ['pink', '#ec4899'],
  ['hyper', '#ec4899'],
  ['mint', '#5eead4'],
  ['foam', '#a7f3d0'],
  ['chrome', '#9ca3af'],
  ['anthracite', '#374151'],
  ['mahogany', '#7c2d12'],
  ['gold', '#d4a017'],
  ['neon', '#84cc16'],
  ['neon citrus', '#fbbf24'],
  ['energy', '#6366f1'],
  ['ink', '#1e293b'],
  ['deep', '#1e3a8f'],
  ['lucid', '#ecfccb'],
  ['team', '#1d4ed8'],
  ['core', '#111827'],
  ['bold', '#4b5563'],
  ['pink glo', '#f472b6'],
  ['bright', '#f97316']
];

function swatchCss(label) {
  const compact = label.toLowerCase();
  const hits = SWATCH_LOOKUP.filter(([k]) => compact.includes(k)).slice(0, 2);
  if (hits.length === 0) return '#94a3b8';
  if (hits.length === 1) return hits[0][1];
  return `linear-gradient(135deg, ${hits[0][1]} 0%, ${hits[0][1]} 50%, ${hits[1][1]} 50%, ${hits[1][1]} 100%)`;
}

/**
 * Left-column filter panel (desktop) and the same fields inside the
 * mobile full-screen sheet. Works with the demo catalog facet params
 * (`brand`, `eu`, `color`, `minPrice`, `maxPrice`, `inStock`) wired in
 * `mockCatalog.applyFacetFilters`.
 */
function FilterSidebar({
  brandOptions = [],
  euOptions = [],
  colorSwatches = [],
  genderOptions = [],
  selectedBrands = [],
  onToggleBrand,
  selectedEu = [],
  onToggleEu,
  selectedColorSlugs = [],
  onToggleColor,
  selectedGenders = [],
  onToggleGender,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStockOnly,
  onInStockChange,
  onClearFacets
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-ink-900">Refine</h2>
        <button
          type="button"
          onClick={onClearFacets}
          className="text-2xs font-semibold uppercase tracking-wider text-ink-500 transition hover:text-ink-900"
        >
          Clear
        </button>
      </div>

      {genderOptions.length > 0 ? (
        <section className="space-y-3">
          <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">Gender</p>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map(({ slug, label }) => {
              const active = selectedGenders.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onToggleGender(slug)}
                  aria-pressed={active}
                  className={classNames(
                    'rounded-full border px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider transition',
                    active
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {brandOptions.length > 0 ? (
        <section className="space-y-3">
          <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">Brand</p>
          <div className="flex flex-wrap gap-2">
            {brandOptions.map((brand) => {
              const key = brand.toLowerCase();
              const active = selectedBrands.includes(key);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onToggleBrand(key)}
                  aria-pressed={active}
                  className={classNames(
                    'rounded-full border px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider transition',
                    active
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900'
                  )}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {euOptions.length > 0 ? (
        <section className="space-y-3">
          <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">EU size</p>
          <div className="flex flex-wrap gap-2">
            {euOptions.map((n) => {
              const active = selectedEu.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onToggleEu(n)}
                  aria-pressed={active}
                  className={classNames(
                    'inline-flex h-10 min-w-[2.75rem] items-center justify-center rounded-xl border px-2 text-sm font-semibold transition',
                    active
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900'
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {colorSwatches.length > 0 ? (
        <section className="space-y-3">
          <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">Colour</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {colorSwatches.map(({ slug, label }) => {
              const active = selectedColorSlugs.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => onToggleColor(slug)}
                  aria-pressed={active}
                  className={classNames(
                    'flex items-center gap-2 rounded-xl border px-2 py-2 text-left text-2xs font-semibold transition',
                    active
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-ink-200 bg-white text-ink-800 hover:border-ink-900'
                  )}
                >
                  <span
                    aria-hidden
                    className="h-5 w-5 flex-shrink-0 rounded-full border border-white/30"
                    style={{ background: swatchCss(label) }}
                  />
                  <span className="line-clamp-2">{label}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">Price (USD)</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="input-base py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="input-base py-2.5 text-sm"
            />
          </label>
        </div>
      </section>

      <section>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-3">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-ink-950 focus:ring-ink-900"
          />
          <span className="text-sm font-medium text-ink-800">In stock only</span>
        </label>
      </section>
    </div>
  );
}

/**
 * Mobile full-screen filter sheet with sticky header + footer.
 */
export function FilterSheet({
  open,
  onClose,
  children
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter products">
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close filters"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-card animate-slide-down">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <p className="text-sm font-bold uppercase tracking-widest text-ink-900">Filters</p>
          <button
            type="button"
            onClick={onClose}
            className="text-2xs font-semibold uppercase tracking-wider text-ink-500 hover:text-ink-900"
          >
            Done
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
        <div className="border-t border-ink-100 p-4">
          <Button type="button" variant="accent" size="lg" fullWidth onClick={onClose}>
            View results
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterSidebar;
