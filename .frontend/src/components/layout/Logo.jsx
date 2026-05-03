import { Link } from 'react-router-dom';
import { classNames } from '../../utils/format';

function Logo({ className = '', tone = 'dark' }) {
  const textTone = tone === 'light' ? 'text-white' : 'text-ink-950';
  return (
    <Link
      to="/"
      className={classNames(
        'group inline-flex items-center gap-2 font-display text-xl font-bold tracking-tightest',
        textTone,
        className
      )}
      aria-label="SportsHub home"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink-950 text-white transition group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M3 16c3-1.5 6-2 10-1.2 4 .8 7-1.5 9-5.5-1 5-4.4 9-9 10.6-3.4 1.2-7 .9-10-.7-.4-.9-.4-2 0-3.2z"
            fill="#ff5a1f"
          />
          <circle cx="17" cy="7" r="2" fill="#b6ff3c" />
        </svg>
      </span>
      <span className="leading-none">
        Sports
        <span className="text-accent-500">Hub</span>
      </span>
    </Link>
  );
}

export default Logo;
