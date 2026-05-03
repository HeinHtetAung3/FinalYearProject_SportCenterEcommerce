import { useEffect, useState } from 'react';
import { showDemoBannerInThisBuild } from '../../utils/demoFallback';
import { isDemoMode, subscribeDemoMode } from '../../utils/demoMode';
import Container from '../ui/Container';
import { IconClose } from '../ui/Icon';

/**
 * Dismissible banner when catalog/reviews are using mock fallback (dev by default;
 * staging can set VITE_SHOW_DEMO_BANNER=true).
 */
function DemoModeBanner() {
  const [active, setActive] = useState(isDemoMode());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => subscribeDemoMode(setActive), []);

  if (!showDemoBannerInThisBuild()) return null;
  if (!active || dismissed) return null;

  return (
    <div className="border-b border-volt-400 bg-ink-950 text-white">
      <Container className="flex items-center justify-between gap-3 py-2 text-2xs">
        <p className="font-semibold uppercase tracking-widest">
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-volt-400 align-middle" />
          Demo data — backend offline. Start it with{' '}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono normal-case tracking-normal text-volt-300">
            docker compose up
          </code>
          .
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo banner"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <IconClose className="h-3 w-3" />
        </button>
      </Container>
    </div>
  );
}

export default DemoModeBanner;
