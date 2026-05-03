import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '../../utils/format';

const VARIANT_STYLES = {
  primary:
    'bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-ink-900 disabled:bg-ink-300 disabled:hover:bg-ink-300',
  accent:
    'bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-500 shadow-glow disabled:bg-accent-200 disabled:shadow-none',
  outline:
    'border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white focus-visible:ring-ink-900',
  ghost: 'text-ink-700 hover:bg-ink-100 focus-visible:ring-ink-300',
  danger:
    'border border-rose-500 text-rose-600 hover:bg-rose-500 hover:text-white focus-visible:ring-rose-400'
};

const SIZE_STYLES = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-sm',
  xl: 'h-14 px-9 text-base'
};

const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    ...rest
  },
  ref
) {
  const classes = classNames(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-wider',
    'transition duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed',
    VARIANT_STYLES[variant] || VARIANT_STYLES.primary,
    SIZE_STYLES[size] || SIZE_STYLES.md,
    fullWidth ? 'w-full' : '',
    className
  );

  const content = (
    <>
      {leftIcon ? <span className="-ml-0.5 inline-flex">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="-mr-0.5 inline-flex">{rightIcon}</span> : null}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  const Component = as || 'button';
  return (
    <Component ref={ref} type={Component === 'button' ? type : undefined} className={classes} {...rest}>
      {content}
    </Component>
  );
});

export default Button;
