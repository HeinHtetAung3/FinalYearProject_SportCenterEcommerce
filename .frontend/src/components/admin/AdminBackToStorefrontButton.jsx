import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/format';
import { IconHome } from '../ui/Icon';

/**
 * Secondary pill control for nested admin pages (settings, profile). Returns to the main admin dashboard.
 * Hidden unless the user is an admin.
 */
export default function AdminBackToStorefrontButton({ className }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/admin')}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-2xs font-semibold uppercase tracking-wider text-ink-800 shadow-soft transition hover:border-ink-300 hover:bg-ink-100 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100 dark:hover:border-ink-500 dark:hover:bg-ink-800',
        className
      )}
    >
      <IconHome className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" aria-hidden />
      Back to Admin Dashboard
    </button>
  );
}
