import { Link } from 'react-router-dom';
import { classNames } from '../../utils/format';

/**
 * Slim top promo bar from an active marketing banner (e.g. TOP_BAR).
 */
function PromoStrip({ banner }) {
  if (!banner || !banner.title) return null;

  const Inner = (
    <div
      className={classNames(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-sm',
        banner.ctaHref ? 'sm:justify-between sm:text-left' : ''
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {banner.badge ? (
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-volt-200">
            {banner.badge}
          </span>
        ) : null}
        <span className="font-semibold text-white">{banner.title}</span>
        {banner.subtitle ? <span className="text-white/75">{banner.subtitle}</span> : null}
      </div>
      {banner.ctaLabel && banner.ctaHref ? (
        <span className="text-2xs font-bold uppercase tracking-wider text-volt-300 underline decoration-volt-300/50 underline-offset-4">
          {banner.ctaLabel} →
        </span>
      ) : null}
    </div>
  );

  const className =
    'relative border-b border-white/10 bg-gradient-to-r from-ink-900 via-ink-950 to-ink-900 text-white shadow-sm';

  if (banner.ctaHref) {
    return (
      <div className={className}>
        <Link to={banner.ctaHref} className="block transition hover:bg-white/5">
          {Inner}
        </Link>
      </div>
    );
  }

  return <div className={className}>{Inner}</div>;
}

export default PromoStrip;
