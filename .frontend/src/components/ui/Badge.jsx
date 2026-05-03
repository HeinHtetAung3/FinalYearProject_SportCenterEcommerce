import { classNames } from '../../utils/format';

const VARIANT_STYLES = {
  default: 'bg-ink-100 text-ink-700',
  accent: 'bg-accent-500 text-white',
  volt: 'bg-volt-400 text-ink-950',
  success: 'bg-emerald-500/10 text-emerald-700',
  warning: 'bg-amber-500/10 text-amber-700',
  danger: 'bg-rose-500/10 text-rose-700',
  outline: 'border border-ink-200 text-ink-700'
};

function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wider',
        VARIANT_STYLES[variant] || VARIANT_STYLES.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
