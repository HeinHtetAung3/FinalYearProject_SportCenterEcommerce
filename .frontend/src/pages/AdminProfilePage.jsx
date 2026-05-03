import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import AdminBackToStorefrontButton from '../components/admin/AdminBackToStorefrontButton';
import { Button } from '../components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/shadcn/card';
import {
  IconArrowRight,
  IconHome,
  IconMail,
  IconPhone,
  IconSettings,
  IconShield,
  IconUser
} from '../components/ui/Icon';
import { useAuth } from '../context/AuthContext';
import { fetchProfile } from '../services/commerceService';
import { fetchAdminOrders } from '../services/adminService';
import { resolveMediaUrl } from '../utils/mediaUrl';
import Badge from '../components/ui/Badge';
import { classNames, formatCurrency } from '../utils/format';

const ROLE_TAGS = ['Admin', 'Catalog', 'Orders', 'Commerce', 'Support'];

const RECENT_ACTIVITY_ORDER_LIMIT = 8;

const ORDER_STATUS_VARIANTS = {
  PLACED: 'warning',
  PAID: 'success',
  SHIPPED: 'volt',
  DELIVERED: 'success',
  CANCELLED: 'danger'
};

function ActivityFeedEmpty({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-4 py-8 text-center dark:border-ink-700 dark:bg-ink-900/40">
      <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{description}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">Open dashboard</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/settings">Admin settings</Link>
        </Button>
      </div>
    </div>
  );
}

function RecentActivityFeed() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAdminOrders();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => {
          const ta = a.placedAt ? new Date(a.placedAt).getTime() : 0;
          const tb = b.placedAt ? new Date(b.placedAt).getTime() : 0;
          return tb - ta;
        });
        setOrders(sorted.slice(0, RECENT_ACTIVITY_ORDER_LIMIT));
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load recent orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading recent activity">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex w-4 shrink-0 flex-col items-center pt-1">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink-200 dark:bg-ink-700" />
              {i < 3 ? <div className="mt-2 h-full min-h-[2.5rem] w-px grow animate-pulse bg-ink-100 dark:bg-ink-800" /> : null}
            </div>
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <div className="h-4 max-w-[200px] animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
              <div className="h-3 max-w-[140px] animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ActivityFeedEmpty
        title="Could not load activity"
        description={error}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <ActivityFeedEmpty
        title="No orders yet"
        description="When customers place orders, they will appear here. Open the dashboard to manage the store."
      />
    );
  }

  return (
    <ul className="space-y-0">
      {orders.map((order, index) => {
        const placed = order.placedAt
          ? new Date(order.placedAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })
          : null;
        const isLast = index === orders.length - 1;
        return (
          <li className={classNames('flex gap-4', !isLast && 'pb-8')} key={order.id}>
            <div className="flex w-4 shrink-0 flex-col items-center">
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500 ring-4 ring-bone dark:bg-accent-400 dark:ring-ink-950"
                aria-hidden
              />
              {!isLast ? (
                <span className="mt-1 min-h-[2.75rem] w-px grow bg-ink-200 dark:bg-ink-700" aria-hidden />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950 dark:text-ink-50">
                    Order #{order.id}
                    <span className="font-normal text-ink-500 dark:text-ink-400">
                      {placed ? ` · ${placed}` : ''}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-600 dark:text-ink-400">
                    {order.customerEmail || 'Customer'} · {formatCurrency(order.total ?? 0)}
                  </p>
                </div>
                <Badge variant={ORDER_STATUS_VARIANTS[order.status] || 'default'} className="shrink-0">
                  {order.status}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ProfileLinkRow({ to, icon: Icon, title, description, compact = false }) {
  return (
    <Link
      to={to}
      className={classNames(
        'group flex items-center rounded-2xl border border-ink-100 bg-white transition',
        'hover:border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:bg-ink-900 dark:hover:border-ink-600 dark:hover:bg-ink-800/80',
        compact ? 'gap-3 p-3' : 'gap-4 p-4'
      )}
    >
      <span
        className={classNames(
          'flex shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
          compact ? 'h-9 w-9' : 'h-11 w-11'
        )}
      >
        <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink-950 dark:text-ink-50">{title}</span>
        {description ? (
          <span
            className={classNames(
              'mt-0.5 block text-ink-600 dark:text-ink-400',
              compact ? 'line-clamp-2 text-xs' : 'text-sm'
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
      <IconArrowRight
        className={classNames(
          'shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-ink-700 dark:text-ink-500 dark:group-hover:text-ink-300',
          compact ? 'h-4 w-4' : 'h-5 w-5'
        )}
      />
    </Link>
  );
}

export default function AdminProfilePage() {
  const { authState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await fetchProfile();
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.message || 'Unable to load profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedAvatar = resolveMediaUrl(profile?.profileImageUrl || authState?.profileImageUrl || '');
  const email = (profile?.email || authState?.email || '').trim();
  const phone = (profile?.phoneNumber ?? '').toString().trim();
  const displayName =
    profile?.fullName?.trim() ||
    (email ? email.split('@')[0] : '') ||
    'Administrator';

  return (
    <div className="min-h-[60vh] bg-bone py-10 dark:bg-ink-950">
      <Container className="max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-950 dark:text-ink-50">
              My account
            </h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
              Your admin identity and shortcuts. Edit personal details and preferences under Account preferences in
              the admin console; store-wide configuration is under admin system settings.
            </p>
          </div>
          <AdminBackToStorefrontButton className="shrink-0 sm:mt-0" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Card className="overflow-hidden border-ink-100 dark:border-ink-800">
              <CardContent className="space-y-6 p-6 sm:p-8">
                {loadError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    {loadError}
                  </p>
                ) : null}

                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-ink-50 shadow-md ring-1 ring-ink-200 dark:border-ink-800 dark:bg-ink-800 dark:ring-ink-700">
                    {resolvedAvatar ? (
                      <img src={resolvedAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <IconUser className="h-14 w-14 text-ink-400 dark:text-ink-500" />
                    )}
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink-950 dark:text-ink-50">
                    {loading ? '…' : displayName}
                  </h2>
                  <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-400">
                    Store administrator · Commerce console
                  </p>

                  <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-start">
                    <Button className="w-full sm:w-auto" asChild>
                      <Link to="/admin/account?tab=profile">Edit account</Link>
                    </Button>
                    <Button variant="outline" className="w-full gap-2 sm:w-auto" asChild>
                      <Link to="/">
                        <IconHome className="h-4 w-4 shrink-0" />
                        View storefront
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-6 flex w-full flex-wrap justify-center gap-2 sm:justify-start">
                    {ROLE_TAGS.map((label) => (
                      <span
                        key={label}
                        className="inline-flex rounded-full border border-ink-200 bg-ink-50/90 px-3 py-1 text-xs font-medium text-ink-800 dark:border-ink-600 dark:bg-ink-800/80 dark:text-ink-200"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-ink-100 pt-6 dark:border-ink-800">
                  <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                    About
                  </p>
                  <ul className="mt-4 space-y-3 text-left text-sm text-ink-800 dark:text-ink-200">
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                        <IconMail className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 pt-1.5">
                        {email ? (
                          <a href={`mailto:${email}`} className="break-all text-ink-950 underline-offset-2 hover:underline dark:text-ink-50">
                            {email}
                          </a>
                        ) : (
                          <span className="text-ink-500 dark:text-ink-400">No email on file</span>
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
                        <IconPhone className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 pt-1.5">
                        {phone ? (
                          <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-ink-950 underline-offset-2 hover:underline dark:text-ink-50">
                            {phone}
                          </a>
                        ) : (
                          <span className="text-ink-500 dark:text-ink-400">No phone on file</span>
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-ink-100 pt-6 dark:border-ink-800">
                  <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                    Settings shortcuts
                  </p>
                  <div className="mt-3 space-y-2">
                    <ProfileLinkRow
                      compact
                      to="/admin/account"
                      icon={IconSettings}
                      title="Account preferences"
                      description="Profile, addresses, notifications, and security."
                    />
                    <ProfileLinkRow
                      compact
                      to="/admin/settings"
                      icon={IconShield}
                      title="Admin system settings"
                      description="Store-wide commerce, payments, and operations."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-8">
            <Card className="overflow-hidden border-ink-100 dark:border-ink-800">
              <CardHeader className="border-b border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
                <CardTitle className="text-lg">Recent activity</CardTitle>
                <CardDescription>Latest store orders, newest first.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RecentActivityFeed />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
