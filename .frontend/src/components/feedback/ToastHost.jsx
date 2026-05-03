import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../../context/UIContext';
import { classNames } from '../../utils/format';

function ToastHost() {
  const { toasts, dismissToast } = useUI();

  const node = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return (
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-end gap-2 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:top-auto sm:w-full sm:max-w-sm"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            className={classNames(
              'pointer-events-auto w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-lg transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto',
              toast.variant === 'error' && 'border-rose-200 bg-rose-50 text-rose-900 focus-visible:outline-rose-400',
              toast.variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900 focus-visible:outline-emerald-400',
              toast.variant === 'loading' && 'border-ink-200 bg-white text-ink-900 focus-visible:outline-ink-400',
              toast.variant === 'info' &&
                'border-ink-200 bg-white text-ink-900 focus-visible:outline-ink-400'
            )}
          >
            <span className="flex items-start gap-3">
              {toast.variant === 'loading' ? (
                <span
                  className="mt-0.5 inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700"
                  aria-hidden
                />
              ) : null}
              <span className="flex-1">{toast.message}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }, [toasts, dismissToast]);

  if (!node || typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

export default ToastHost;
