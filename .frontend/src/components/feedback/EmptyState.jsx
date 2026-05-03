import { classNames } from '../../utils/format';

function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={classNames(
        'mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white p-12 text-center',
        className
      )}
    >
      {icon ? (
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-700">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
