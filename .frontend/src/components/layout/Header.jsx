import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { fetchProfile } from '../../services/commerceService';
import Container from '../ui/Container';
import Logo from './Logo';
import {
  IconCart,
  IconChat,
  IconChevronDown,
  IconClose,
  IconHeart,
  IconLogout,
  IconMenu,
  IconMoon,
  IconSearch,
  IconSun,
  IconUser,
  IconHome,
  IconSettings,
  IconShield
} from '../ui/Icon';
import { toggleColorTheme } from '../../services/themePreferences';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { classNames } from '../../utils/format';

/**
 * Top-level mega-menu structure used by both the desktop dropdown and the
 * mobile accordion. Tabs mirror large athletic retailers (gender pillars + Sports).
 *
 * Each tab carries an array of `columns`, where each column is a titled
 * group of links. Links route to the existing `/products` PLP with query
 * params already supported by ProductsPage (`category`, `gender`, `search`,
 * `sort`, `maxPrice`).
 */
export const SPORT_ENTRIES = [
  { label: 'Running', to: '/products?category=running' },
  { label: 'Football', to: '/products?category=football' },
  { label: 'Fitness', to: '/products?category=fitness' },
  { label: 'Outdoor', to: '/products?category=outdoor' },
  { label: 'Basketball', to: '/products?category=basketball' },
  { label: 'Training', to: '/products?category=training' }
];

export const LIFESTYLE_ENTRIES = [
  { label: 'Sneakers', to: '/products?category=lifestyle&search=Sneaker' },
  { label: 'Hoodies & Sweatshirts', to: '/products?category=lifestyle&search=Hoodie' },
  { label: 'T-Shirts & Tops', to: '/products?category=lifestyle&search=Tee' },
  { label: 'Joggers & Pants', to: '/products?category=lifestyle&search=Jogger' },
  { label: 'Caps & Hats', to: '/products?category=lifestyle&search=Cap' },
  { label: 'Bags & Backpacks', to: '/products?category=lifestyle&search=Backpack' }
];

function withGender(entries, gender) {
  return entries.map((entry) => ({
    ...entry,
    to: `${entry.to}${entry.to.includes('?') ? '&' : '?'}gender=${gender}`
  }));
}

function genderTab(genderSlug, label) {
  return {
    id: genderSlug,
    label,
    to: `/products?gender=${genderSlug}`,
    columns: [
      {
        title: 'Featured',
        items: [
          { label: 'New arrivals', to: `/products?gender=${genderSlug}&sort=ratingDesc` },
          { label: 'Best sellers', to: `/products?gender=${genderSlug}&sort=ratingDesc` },
          { label: 'Sale', to: `/products?gender=${genderSlug}&maxPrice=70` }
        ]
      },
      { title: 'Shop by sport', items: withGender(SPORT_ENTRIES, genderSlug) },
      { title: 'Shop by lifestyle', items: withGender(LIFESTYLE_ENTRIES, genderSlug) }
    ]
  };
}

const SHOP_MENU = [
  genderTab('men', 'Men'),
  genderTab('women', 'Women'),
  genderTab('kids', 'Kids'),
  {
    id: 'sports',
    label: 'Sports',
    to: '/products',
    columns: [
      { title: 'Shop by sport', items: SPORT_ENTRIES },
      {
        title: 'Train smarter',
        items: [
          { label: 'New arrivals', to: '/products?sort=ratingDesc' },
          { label: 'Top rated gear', to: '/products?sort=ratingDesc' },
          { label: 'On sale', to: '/products?maxPrice=80' },
          { label: 'Accessories', to: '/products?category=accessories' }
        ]
      }
    ]
  },
];

const PRIMARY_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/orders', label: 'Orders' }
];

function Header() {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { authState, isAuthenticated, isAdmin, clearSession, setProfileImageUrl } = useAuth();
  const { openMiniCart, showToast } = useUI();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedTab, setMobileExpandedTab] = useState(null);
  const [mobileShopTab, setMobileShopTab] = useState('men');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const [shopMegaOpen, setShopMegaOpen] = useState(false);
  const [activeShopTab, setActiveShopTab] = useState('men');
  const [avatarBuster, setAvatarBuster] = useState(Date.now());
  const [accountAvatarFailed, setAccountAvatarFailed] = useState(false);
  const [themeToggleBusy, setThemeToggleBusy] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, [location.pathname, isAuthenticated]);

  useEffect(() => {
    function onThemeChange() {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }
    window.addEventListener('sportshub-theme-change', onThemeChange);
    return () => window.removeEventListener('sportshub-theme-change', onThemeChange);
  }, []);

  const resolvedHeaderAvatarUrl = resolveMediaUrl(authState?.profileImageUrl || '');
  const accountAvatarUrl = resolvedHeaderAvatarUrl
    ? `${resolvedHeaderAvatarUrl}${resolvedHeaderAvatarUrl.includes('?') ? '&' : '?'}t=${avatarBuster}`
    : '';

  useEffect(() => {
    setAccountAvatarFailed(false);
  }, [resolvedHeaderAvatarUrl, avatarBuster]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileExpandedTab(null);
    setMobileShopTab('men');
    setAccountOpen(false);
    setSearchOpen(false);
    setShopMegaOpen(false);
    setActiveShopTab('men');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

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
        // Ignore profile sync failures in header.
      }
    }
    syncHeaderProfileImage();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setProfileImageUrl]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    function handlePointerDown(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  const handleThemeToggle = async () => {
    if (themeToggleBusy) return;
    setThemeToggleBusy(true);
    try {
      await toggleColorTheme(isAuthenticated);
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    } catch (err) {
      showToast(err.message || 'Could not update theme.', { variant: 'error' });
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    } finally {
      setThemeToggleBusy(false);
    }
  };

  return (
    <>
      <div className="hidden border-b border-ink-900 bg-ink-950 text-white md:block">
        <Container className="flex h-9 items-center justify-between text-2xs font-medium uppercase tracking-wider text-white/70">
          <span>Free shipping on orders over $75</span>
          <div className="flex items-center gap-5">
            <Link to="/orders" className="hover:text-white">Track order</Link>
            <Link to="/profile" className="hover:text-white">Help</Link>
          </div>
        </Container>
      </div>

      <header
        className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 shadow-sm backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/90"
        onMouseLeave={() => setShopMegaOpen(false)}
      >
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-20">
          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated && isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-500/40 bg-ink-950 text-white shadow-sm transition hover:bg-ink-900 dark:border-accent-400/50"
                aria-label="Admin console"
              >
                <IconShield className="h-5 w-5" aria-hidden />
              </Link>
            ) : null}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-ink-700 transition hover:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu />
            </button>
          </div>

          <Logo />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            <NavLink
              to={PRIMARY_LINKS[0].to}
              end={PRIMARY_LINKS[0].end}
              className={({ isActive }) =>
                classNames(
                  'relative inline-flex h-10 items-center px-3 text-sm font-medium transition',
                  isActive
                    ? 'text-ink-950 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-accent-500 dark:text-white dark:after:bg-accent-400'
                    : 'text-ink-600 hover:text-ink-950 dark:text-ink-300 dark:hover:text-white'
                )
              }
            >
              {PRIMARY_LINKS[0].label}
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setShopMegaOpen(true)}
              onFocus={() => setShopMegaOpen(true)}
            >
              <button
                type="button"
                className={classNames(
                  'relative inline-flex h-10 items-center gap-1 px-3 text-sm font-medium transition',
                  shopMegaOpen
                    ? 'text-ink-950 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-accent-500 dark:text-white dark:after:bg-accent-400'
                    : 'text-ink-600 hover:text-ink-950 dark:text-ink-300 dark:hover:text-white'
                )}
                aria-haspopup="true"
                aria-expanded={shopMegaOpen}
                onClick={() => setShopMegaOpen((prev) => !prev)}
              >
                Shop
                <IconChevronDown
                  className={classNames('h-3.5 w-3.5 transition-transform', shopMegaOpen ? 'rotate-180' : '')}
                />
              </button>
            </div>

            {PRIMARY_LINKS.slice(1).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  classNames(
                    'relative inline-flex h-10 items-center px-3 text-sm font-medium transition',
                    isActive
                      ? 'text-ink-950 after:absolute after:bottom-1 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-accent-500 dark:text-white dark:after:bg-accent-400'
                      : 'text-ink-600 hover:text-ink-950 dark:text-ink-300 dark:hover:text-white'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {isAuthenticated && isAdmin ? (
              <Link
                to="/admin"
                className="hidden items-center gap-1.5 rounded-full bg-ink-950 px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-ink-900 lg:inline-flex"
              >
                <IconShield className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Admin console
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleThemeToggle}
              disabled={themeToggleBusy}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100 disabled:opacity-50 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <IconSun /> : <IconMoon />}
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label="Search"
            >
              <IconSearch />
            </button>

            <Link
              to="/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 sm:inline-flex"
              aria-label={
                isAuthenticated && wishlistCount > 0
                  ? `Wishlist with ${wishlistCount} item${wishlistCount === 1 ? '' : 's'}`
                  : 'Wishlist'
              }
            >
              <IconHeart />
              {isAuthenticated && wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1 text-2xs font-bold text-white">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={openMiniCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
              aria-label={`Open shopping bag with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            >
              <IconCart />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1 text-2xs font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </button>

            <div className="relative ml-1" ref={accountMenuRef}>
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                  >
                    {accountAvatarUrl && !accountAvatarFailed ? (
                      <img
                        src={accountAvatarUrl}
                        alt="Account avatar"
                        className="h-full w-full object-cover"
                        onError={() => setAccountAvatarFailed(true)}
                      />
                    ) : (
                      <IconUser />
                    )}
                  </button>
                  {accountOpen ? (
                    <div
                      className="absolute right-0 top-12 z-30 w-56 origin-top-right rounded-[14px] border border-ink-100 bg-white p-1.5 shadow-card ring-1 ring-black/5 transition-all duration-200 ease-out animate-slide-down dark:border-ink-700 dark:bg-ink-900 dark:ring-white/10"
                      role="menu"
                      aria-label={isAdmin ? 'Admin account' : 'Account'}
                    >
                      {isAdmin ? (
                        <>
                          <Link
                            to="/admin"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconShield className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                            Admin console
                          </Link>
                          <Link
                            to="/admin/profile"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconUser className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/admin/settings"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconSettings className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            Settings
                          </Link>
                          <Link
                            to="/"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconHome className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            View Storefront
                          </Link>
                          <div className="my-1 border-t border-ink-100 dark:border-ink-700" aria-hidden />
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              clearSession();
                              setAccountOpen(false);
                              navigate('/');
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors duration-150 hover:bg-ink-100 dark:text-rose-400 dark:hover:bg-ink-800"
                          >
                            <IconLogout className="h-4 w-4 shrink-0" />
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/settings?tab=profile"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconUser className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/settings"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconSettings className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            Settings
                          </Link>
                          <Link
                            to="/support/chat"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconChat className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" aria-hidden />
                            Support chat
                          </Link>
                          <Link
                            to="/orders"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconCart className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-150 hover:bg-ink-100 dark:text-ink-100 dark:hover:bg-ink-800"
                            onClick={() => setAccountOpen(false)}
                          >
                            <IconHeart className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-400" />
                            Wishlist
                          </Link>
                          <div className="my-1 border-t border-ink-100 dark:border-ink-700" aria-hidden />
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              clearSession();
                              setAccountOpen(false);
                              navigate('/');
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors duration-150 hover:bg-ink-100 dark:text-rose-400 dark:hover:bg-ink-800"
                          >
                            <IconLogout className="h-4 w-4 shrink-0" />
                            Sign Out
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </>
              ) : (
                <Link
                  to="/login"
                  className="ml-1 hidden h-10 items-center rounded-full bg-ink-950 px-5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-ink-800 sm:inline-flex"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </Container>

        {searchOpen ? (
          <div className="border-t border-ink-100 bg-white animate-slide-down dark:border-ink-800 dark:bg-ink-950">
            <Container className="py-3">
              <form onSubmit={submitSearch} className="flex items-center gap-3">
                <IconSearch className="text-ink-400 dark:text-ink-500" />
                <input
                  autoFocus
                  type="search"
                  className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none dark:text-ink-100 dark:placeholder:text-ink-500"
                  placeholder="Search shoes, gear, brands..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-2xs font-semibold uppercase tracking-wider text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100"
                >
                  Close
                </button>
              </form>
            </Container>
          </div>
        ) : null}

        {/* Desktop mega-menu panel */}
        {shopMegaOpen ? (
          <div className="absolute inset-x-0 top-full hidden border-t border-ink-100 bg-white shadow-lg animate-slide-down dark:border-ink-800 dark:bg-ink-950 lg:block lg:rounded-b-2xl lg:border-x lg:border-b lg:border-ink-100 lg:shadow-xl dark:lg:border-ink-800">
            <Container className="py-8 lg:py-10">
              {(() => {
                const tab = SHOP_MENU.find((entry) => entry.id === activeShopTab) || SHOP_MENU[0];
                return (
                  <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-12">
                    <aside className="border-r border-ink-100 pr-6 dark:border-ink-800">
                      <p className="mb-4 text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                        Shop
                      </p>
                      <ul className="space-y-1">
                        {SHOP_MENU.map((entry) => {
                          const isActive = entry.id === tab.id;
                          return (
                            <li key={entry.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setActiveShopTab(entry.id)}
                                onFocus={() => setActiveShopTab(entry.id)}
                                onClick={() => setActiveShopTab(entry.id)}
                                className={classNames(
                                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                                  isActive
                                    ? 'bg-ink-950 text-white dark:bg-white dark:text-ink-950'
                                    : 'text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'
                                )}
                              >
                                {entry.label}
                                <IconChevronDown
                                  className={classNames(
                                    'h-3.5 w-3.5 -rotate-90',
                                    isActive ? 'text-current' : 'text-ink-400 dark:text-ink-500'
                                  )}
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <Link
                        to="/products"
                        className="mt-6 inline-flex rounded-full border border-ink-200 px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-ink-700 transition hover:border-ink-900 hover:text-ink-900 dark:border-ink-700 dark:text-ink-200 dark:hover:border-ink-500 dark:hover:text-white"
                      >
                        View all products
                      </Link>
                    </aside>

                    <div
                      className={classNames(
                        'grid gap-10',
                        tab.columns.length >= 3
                          ? 'grid-cols-3'
                          : tab.columns.length === 2
                            ? 'grid-cols-2 max-w-3xl'
                            : 'grid-cols-1 max-w-md'
                      )}
                    >
                      {tab.columns.map((column) => (
                        <div key={column.title}>
                          <p className="mb-4 text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                            {column.title}
                          </p>
                          <ul className="space-y-1">
                            {column.items.map((item) => (
                              <li key={`${column.title}-${item.label}`}>
                                <Link
                                  to={item.to}
                                  className="-mx-1 block rounded-lg px-1 py-1.5 text-sm font-medium text-ink-800 transition hover:bg-ink-50 hover:text-accent-600 dark:text-ink-200 dark:hover:bg-ink-800/60 dark:hover:text-accent-400"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </Container>
          </div>
        ) : null}
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-card animate-slide-down dark:bg-ink-950">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5 dark:border-ink-800">
              <Logo />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleThemeToggle}
                  disabled={themeToggleBusy}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 disabled:opacity-50 dark:text-ink-200 dark:hover:bg-ink-800"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <IconSun /> : <IconMoon />}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  <IconClose />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
              <ul className="space-y-1">
                {isAuthenticated && isAdmin ? (
                  <li>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 rounded-2xl bg-ink-950 px-4 py-3 text-base font-semibold text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      <IconShield className="h-5 w-5 shrink-0" aria-hidden />
                      Admin console
                    </Link>
                  </li>
                ) : null}
                <li>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      classNames(
                        'block rounded-2xl px-4 py-3 text-base font-semibold',
                        isActive ? 'bg-ink-950 text-white' : 'text-ink-800 hover:bg-ink-100'
                      )
                    }
                  >
                    Home
                  </NavLink>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpandedTab((cur) => (cur === 'shop' ? null : 'shop'))
                    }
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-ink-800 hover:bg-ink-100"
                    aria-expanded={mobileExpandedTab === 'shop'}
                  >
                    <span>Shop</span>
                    <IconChevronDown
                      className={classNames(
                        'h-4 w-4 transition-transform',
                        mobileExpandedTab === 'shop' ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {mobileExpandedTab === 'shop' ? (
                    <div className="space-y-4 pb-4 pl-2 pt-1">
                      <div className="flex flex-wrap gap-2">
                        {SHOP_MENU.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setMobileShopTab(tab.id)}
                            className={classNames(
                              'rounded-full border px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider transition',
                              tab.id === mobileShopTab
                                ? 'border-ink-950 bg-ink-950 text-white'
                                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900'
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                      {(() => {
                        const tab = SHOP_MENU.find((entry) => entry.id === mobileShopTab) || SHOP_MENU[0];
                        return (
                          <>
                            <Link
                              to={tab.to}
                              className="block rounded-xl bg-ink-950 px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-white"
                            >
                              Shop all {tab.label.toLowerCase()}
                            </Link>
                            {tab.columns.map((column) => (
                              <div key={column.title} className="space-y-1">
                                <p className="px-2 text-2xs font-semibold uppercase tracking-widest text-ink-500">
                                  {column.title}
                                </p>
                                <ul className="space-y-1">
                                  {column.items.map((item) => (
                                    <li key={`mob-${tab.id}-${column.title}-${item.label}`}>
                                      <Link
                                        to={item.to}
                                        className="block rounded-xl px-3 py-2 text-sm text-ink-800 hover:bg-ink-100"
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                </li>

                {PRIMARY_LINKS.slice(1).map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        classNames(
                          'block rounded-2xl px-4 py-3 text-base font-semibold',
                          isActive ? 'bg-ink-950 text-white' : 'text-ink-800 hover:bg-ink-100'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}

                <li>
                  <NavLink
                    to="/wishlist"
                    className={({ isActive }) =>
                      classNames(
                        'block rounded-2xl px-4 py-3 text-base font-semibold',
                        isActive ? 'bg-ink-950 text-white' : 'text-ink-800 hover:bg-ink-100'
                      )
                    }
                  >
                    Wishlist
                    {isAuthenticated && wishlistCount > 0 ? ` (${wishlistCount})` : ''}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      classNames(
                        'block rounded-2xl px-4 py-3 text-base font-semibold',
                        isActive ? 'bg-ink-950 text-white' : 'text-ink-800 hover:bg-ink-100'
                      )
                    }
                  >
                    Cart ({itemCount})
                  </NavLink>
                </li>
                {isAuthenticated ? (
                  <li>
                    <NavLink
                      to={isAdmin ? '/admin/settings' : '/settings'}
                      className={({ isActive }) =>
                        classNames(
                          'block rounded-2xl px-4 py-3 text-base font-semibold',
                          isActive ? 'bg-ink-950 text-white' : 'text-ink-800 hover:bg-ink-100'
                        )
                      }
                    >
                      Settings
                    </NavLink>
                  </li>
                ) : null}
              </ul>
            </nav>
            <div className="border-t border-ink-100 p-5">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    navigate('/');
                  }}
                  className="w-full rounded-full border border-ink-900 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-ink-900"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full rounded-full bg-ink-950 px-5 py-3 text-center text-sm font-semibold uppercase tracking-wider text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Header;
