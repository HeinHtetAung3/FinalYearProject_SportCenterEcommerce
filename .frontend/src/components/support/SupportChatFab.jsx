import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconChat } from '../ui/Icon';
import { classNames } from '../../utils/format';

/**
 * Floating support entry (ecommerce-style). Visible to all non-admin shoppers;
 * guests are sent through login via ProtectedRoute on /support/chat.
 */
export default function SupportChatFab() {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  if (isAdmin) return null;
  if (pathname.startsWith('/admin')) return null;
  if (pathname === '/support/chat') return null;

  const isCheckout = pathname === '/checkout';

  return (
    <Link
      to="/support/chat"
      className={classNames(
        'fixed right-6 z-50 flex items-center gap-2 rounded-full',
        'bg-ink-950 px-4 py-3 text-white shadow-lg transition hover:bg-ink-800',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-950 focus-visible:ring-offset-2',
        'dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100 dark:focus-visible:ring-white',
        isCheckout ? 'bottom-24 lg:bottom-6' : 'bottom-6'
      )}
      aria-label="Open customer support chat"
    >
      <IconChat className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden text-sm font-semibold sm:inline">Help</span>
    </Link>
  );
}
