import { classNames } from '../../utils/format';

function LoadingSpinner({ label = 'Loading...', size = 'md', className = '' }) {
  const sizeClass = size === 'lg' ? 'h-6 w-6 border-[3px]' : 'h-4 w-4 border-2';
  return (
    <div
      className={classNames('flex items-center gap-3 text-sm text-ink-600', className)}
      role="status"
      aria-live="polite"
    >
      <span className={classNames('animate-spin rounded-full border-ink-200 border-t-ink-900', sizeClass)} />
      {label ? <span>{label}</span> : null}
    </div>
  );
}

export default LoadingSpinner;
