import { useEffect } from 'react';
import { IconChevronLeft, IconChevronRight, IconClose } from '../ui/Icon';
import { classNames } from '../../utils/format';

/**
 * Full-screen image viewer launched from the PDP gallery.
 *
 * Keyboard support:
 *   - ArrowLeft  : previous image
 *   - ArrowRight : next image
 *   - Escape     : close
 *
 * Body scroll is locked while the lightbox is open.
 */
function ImageLightbox({ open, images = [], activeIndex = 0, onClose, onNavigate }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        onNavigate?.(1);
      } else if (event.key === 'ArrowLeft') {
        onNavigate?.(-1);
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, onNavigate]);

  if (!open || images.length === 0) return null;

  const current = images[activeIndex] || images[0];
  const total = images.length;
  const hasMany = total > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/95"
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <IconClose />
      </button>

      <span className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-white">
        {activeIndex + 1} / {total}
      </span>

      {hasMany ? (
        <button
          type="button"
          onClick={() => onNavigate?.(-1)}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-8"
        >
          <IconChevronLeft className="h-5 w-5" />
        </button>
      ) : null}

      {hasMany ? (
        <button
          type="button"
          onClick={() => onNavigate?.(1)}
          aria-label="Next image"
          className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-8"
        >
          <IconChevronRight className="h-5 w-5" />
        </button>
      ) : null}

      <div className="flex h-full w-full items-center justify-center p-6 sm:p-12">
        <img
          src={current}
          alt={`Product image ${activeIndex + 1} of ${total}`}
          className="max-h-full max-w-full rounded-2xl object-contain shadow-card"
        />
      </div>

      {hasMany ? (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 px-4">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => onNavigate?.(index - activeIndex)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={classNames(
                'h-2 w-8 rounded-full transition',
                index === activeIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ImageLightbox;
