import Button from '../ui/Button';
import { IconArrowRight } from '../ui/Icon';

/** Full-width secondary hero slot (e.g. HERO_SECONDARY). */
function HeroSecondaryBanner({ banner }) {
  if (!banner || !banner.title) return null;

  return (
    <section className="border-y border-ink-100 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900 py-14 text-white dark:border-ink-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {banner.badge ? (
            <span className="text-2xs font-semibold uppercase tracking-widest text-volt-300">{banner.badge}</span>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{banner.title}</h2>
          {banner.subtitle ? <p className="mt-4 text-lg text-white/80">{banner.subtitle}</p> : null}
          {banner.ctaLabel && banner.ctaHref ? (
            <Button
              to={banner.ctaHref}
              size="lg"
              variant="accent"
              className="mt-8"
              rightIcon={<IconArrowRight className="h-4 w-4" />}
            >
              {banner.ctaLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default HeroSecondaryBanner;
