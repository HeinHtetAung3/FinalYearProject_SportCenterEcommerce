import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ToastHost from '../feedback/ToastHost';
import { useAuth } from '../../context/AuthContext';
import Container from '../ui/Container';
import Logo from './Logo';
import { IconChevronDown, IconHome, IconLogout, IconSettings, IconUser } from '../ui/Icon';
import { classNames } from '../../utils/format';
import { fetchProfile } from '../../services/commerceService';
import { resolveMediaUrl } from '../../utils/mediaUrl';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { authState, clearSession, setProfileImageUrl, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarBuster, setAvatarBuster] = useState(() => Date.now());
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const menuRootRef = useRef(null);

  const resolvedAvatarUrl = resolveMediaUrl(authState?.profileImageUrl || '');
  const avatarSrc = resolvedAvatarUrl
    ? `${resolvedAvatarUrl}${resolvedAvatarUrl.includes('?') ? '&' : '?'}t=${avatarBuster}`
    : '';

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [resolvedAvatarUrl, avatarBuster]);

  useEffect(() => {
    let cancelled = false;
    async function syncHeaderProfileImage() {
      if (!isAuthenticated) return;
      try {
        const profile = await fetchProfile();
        if (!cancelled) {
          setProfileImageUrl(profile?.profileImageUrl || '');
          setAvatarBuster(Date.now());
        }
      } catch {
        // Ignore profile sync failures in admin header.
      }
    }
    syncHeaderProfileImage();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setProfileImageUrl]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handlePointerDown(event) {
      if (menuRootRef.current && !menuRootRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    clearSession();
    navigate('/login', { replace: true });
  }

  const menuItemClass =
    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800';

  return (
    <div className="min-h-screen bg-bone dark:bg-ink-950">
      {/* z-40 + overflow-visible: backdrop-blur creates a stacking context; without z-index the whole header paints under <main>, clipping the dropdown */}
      <header className="relative z-40 overflow-visible border-b border-ink-100 bg-white/90 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/90">
        <Container className="relative flex h-16 items-center justify-between gap-4 overflow-visible">
          <div className="flex items-center gap-5">
            <Logo />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-500 sm:inline-flex">
              Admin Console
            </span>
          </div>

          <div className="relative flex shrink-0 items-center overflow-visible" ref={menuRootRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-2 text-ink-700 shadow-sm transition hover:border-ink-300 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-600 dark:hover:bg-ink-800"
              aria-label="Admin account menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-50 dark:bg-ink-800">
                {avatarSrc && !avatarLoadFailed ? (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <IconUser className="h-5 w-5" />
                )}
              </span>
              <IconChevronDown
                className={classNames(
                  'h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200 dark:text-ink-400',
                  menuOpen ? 'rotate-180' : ''
                )}
                aria-hidden
              />
            </button>

            <div
              className={classNames(
                'absolute right-0 top-full z-50 mt-2 min-h-0 min-w-[14rem] max-h-none origin-top-right overflow-visible rounded-xl border border-ink-100 bg-white py-2 shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out dark:border-ink-700 dark:bg-ink-900 dark:ring-white/10 sm:min-w-[15.5rem]',
                menuOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-1 opacity-0'
              )}
              role="menu"
              aria-label="Admin account"
              aria-hidden={!menuOpen}
            >
              <Link
                to="/admin/profile"
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
                className={menuItemClass}
                onClick={() => setMenuOpen(false)}
              >
                <IconUser className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                My Profile
              </Link>
              <Link
                to="/admin/settings"
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
                className={menuItemClass}
                onClick={() => setMenuOpen(false)}
              >
                <IconSettings className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                Settings
              </Link>
              <Link
                to="/"
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
                className={menuItemClass}
                onClick={() => setMenuOpen(false)}
              >
                <IconHome className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                View Storefront
              </Link>
              <div className="my-1 border-t border-ink-100 dark:border-ink-700" aria-hidden />
              <button
                type="button"
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <IconLogout className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </Container>
      </header>
      <main className="py-8">{children}</main>
      <ToastHost />
    </div>
  );
}

export default AdminLayout;
