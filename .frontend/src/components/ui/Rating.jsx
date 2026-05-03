import { IconStar } from './Icon';
import { classNames } from '../../utils/format';

function Rating({ value = 0, max = 5, size = 'sm', showValue = false, className = '' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const numeric = Math.max(0, Math.min(Number(value) || 0, max));
  const rounded = Math.round(numeric);

  return (
    <div className={classNames('inline-flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: max }).map((_, index) => (
          <IconStar
            key={index}
            className={classNames(sizeClass, index < rounded ? '' : 'text-ink-200')}
            filled={index < rounded}
          />
        ))}
      </div>
      {showValue ? (
        <span className="text-xs font-semibold text-ink-700">{numeric.toFixed(1)}</span>
      ) : null}
    </div>
  );
}

export default Rating;
