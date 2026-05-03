import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import EmptyState from '../feedback/EmptyState';
import LoadingSpinner from '../feedback/LoadingSpinner';
import {
  createAdminEditorialFeature,
  createAdminMarketingBanner,
  deleteAdminEditorialFeature,
  deleteAdminMarketingBanner,
  fetchAdminEditorialFeatures,
  fetchAdminMarketingBanners,
  updateAdminEditorialFeature,
  updateAdminMarketingBanner
} from '../../services/adminService';

const BANNER_SLOTS = [
  { value: 'TOP_BAR', label: 'Top bar' },
  { value: 'HERO_SECONDARY', label: 'Secondary hero' }
];

function emptyBannerForm() {
  return {
    slot: 'TOP_BAR',
    title: '',
    subtitle: '',
    ctaLabel: '',
    ctaHref: '',
    badge: '',
    sortOrder: '0',
    active: true,
    startsAt: '',
    endsAt: ''
  };
}

function emptyEditorialForm() {
  return {
    title: '',
    excerpt: '',
    imageUrl: '',
    href: '/products',
    sortOrder: '0',
    active: true
  };
}

function bannerToForm(b) {
  const toLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  return {
    slot: b.slot || 'TOP_BAR',
    title: b.title || '',
    subtitle: b.subtitle || '',
    ctaLabel: b.ctaLabel || '',
    ctaHref: b.ctaHref || '',
    badge: b.badge || '',
    sortOrder: String(b.sortOrder ?? 0),
    active: Boolean(b.active),
    startsAt: toLocal(b.startsAt),
    endsAt: toLocal(b.endsAt)
  };
}

function editorialToForm(e) {
  return {
    title: e.title || '',
    excerpt: e.excerpt || '',
    imageUrl: e.imageUrl || '',
    href: e.href || '',
    sortOrder: String(e.sortOrder ?? 0),
    active: Boolean(e.active)
  };
}

function parseInstant(local) {
  if (!local || !String(local).trim()) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function MarketingAdminSection() {
  const [banners, setBanners] = useState([]);
  const [editorial, setEditorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerEditor, setBannerEditor] = useState(null);
  const [editorialEditor, setEditorialEditor] = useState(null);
  const [bannerForm, setBannerForm] = useState(() => emptyBannerForm());
  const [editorialForm, setEditorialForm] = useState(() => emptyEditorialForm());
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setError('');
    const [b, e] = await Promise.all([fetchAdminMarketingBanners(), fetchAdminEditorialFeatures()]);
    setBanners(b);
    setEditorial(e);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load marketing data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openNewBanner() {
    setBannerForm(emptyBannerForm());
    setBannerEditor({ mode: 'create' });
  }

  function openEditBanner(b) {
    setBannerForm(bannerToForm(b));
    setBannerEditor({ mode: 'edit', id: b.id });
  }

  function openNewEditorial() {
    setEditorialForm(emptyEditorialForm());
    setEditorialEditor({ mode: 'create' });
  }

  function openEditEditorial(row) {
    setEditorialForm(editorialToForm(row));
    setEditorialEditor({ mode: 'edit', id: row.id });
  }

  async function saveBanner(e) {
    e.preventDefault();
    const title = bannerForm.title.trim();
    if (!title) {
      setError('Banner title is required.');
      return;
    }
    const sortOrder = parseInt(bannerForm.sortOrder, 10);
    if (Number.isNaN(sortOrder)) {
      setError('Sort order must be a number.');
      return;
    }
    const payload = {
      slot: bannerForm.slot,
      title,
      subtitle: bannerForm.subtitle.trim() || null,
      ctaLabel: bannerForm.ctaLabel.trim() || null,
      ctaHref: bannerForm.ctaHref.trim() || null,
      badge: bannerForm.badge.trim() || null,
      sortOrder,
      active: bannerForm.active,
      startsAt: parseInstant(bannerForm.startsAt),
      endsAt: parseInstant(bannerForm.endsAt)
    };
    setSaving(true);
    setError('');
    try {
      if (bannerEditor.mode === 'edit') {
        await updateAdminMarketingBanner(bannerEditor.id, payload);
      } else {
        await createAdminMarketingBanner(payload);
      }
      setBannerEditor(null);
      await refresh();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Save failed.';
      setError(typeof msg === 'string' ? msg : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function saveEditorial(e) {
    e.preventDefault();
    const title = editorialForm.title.trim();
    const href = editorialForm.href.trim();
    if (!title || !href) {
      setError('Editorial title and link (href) are required.');
      return;
    }
    const sortOrder = parseInt(editorialForm.sortOrder, 10);
    if (Number.isNaN(sortOrder)) {
      setError('Sort order must be a number.');
      return;
    }
    const payload = {
      title,
      excerpt: editorialForm.excerpt.trim() || null,
      imageUrl: editorialForm.imageUrl.trim() || null,
      href,
      sortOrder,
      active: editorialForm.active
    };
    setSaving(true);
    setError('');
    try {
      if (editorialEditor.mode === 'edit') {
        await updateAdminEditorialFeature(editorialEditor.id, payload);
      } else {
        await createAdminEditorialFeature(payload);
      }
      setEditorialEditor(null);
      await refresh();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Save failed.';
      setError(typeof msg === 'string' ? msg : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function removeBanner(id) {
    if (!globalThis.confirm('Delete this banner?')) return;
    setError('');
    try {
      await deleteAdminMarketingBanner(id);
      await refresh();
    } catch (err) {
      setError(err?.message || 'Delete failed.');
    }
  }

  async function removeEditorial(id) {
    if (!globalThis.confirm('Delete this editorial card?')) return;
    setError('');
    try {
      await deleteAdminEditorialFeature(id);
      await refresh();
    } catch (err) {
      setError(err?.message || 'Delete failed.');
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading marketing…" />;
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
      ) : null}

      <div className="card-base overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-5">
          <h3 className="font-display text-lg font-semibold text-ink-950">Banners</h3>
          <Button type="button" size="sm" variant="primary" onClick={openNewBanner}>
            Add banner
          </Button>
        </div>
        {banners.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No banners" description="Create a top bar or secondary hero banner." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-ink-50 text-2xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Slot</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-right">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-900">{b.slot}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-ink-700">{b.title}</td>
                    <td className="px-4 py-3">{b.active ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{b.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 font-semibold text-accent-600 hover:text-accent-500"
                        onClick={() => openEditBanner(b)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-rose-600 hover:text-rose-500"
                        onClick={() => removeBanner(b.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-base overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-5">
          <h3 className="font-display text-lg font-semibold text-ink-950">Editorial</h3>
          <Button type="button" size="sm" variant="primary" onClick={openNewEditorial}>
            Add editorial card
          </Button>
        </div>
        {editorial.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No editorial cards" description="Journal-style cards on the home page." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-ink-50 text-2xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Href</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-right">Order</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {editorial.map((row) => (
                  <tr key={row.id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-900">{row.title}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-ink-600">{row.href}</td>
                    <td className="px-4 py-3">{row.active ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mr-2 font-semibold text-accent-600 hover:text-accent-500"
                        onClick={() => openEditEditorial(row)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-rose-600 hover:text-rose-500"
                        onClick={() => removeEditorial(row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {bannerEditor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => !saving && setBannerEditor(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="card-base max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h4 className="font-display text-lg font-semibold text-ink-950">
              {bannerEditor.mode === 'edit' ? 'Edit banner' : 'New banner'}
            </h4>
            <form className="mt-4 space-y-3" onSubmit={saveBanner}>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Slot</span>
                <select
                  className="input-base mt-1"
                  value={bannerForm.slot}
                  onChange={(ev) => setBannerForm((f) => ({ ...f, slot: ev.target.value }))}
                >
                  {BANNER_SLOTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Title</span>
                <input
                  className="input-base mt-1"
                  value={bannerForm.title}
                  onChange={(ev) => setBannerForm((f) => ({ ...f, title: ev.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Subtitle</span>
                <input
                  className="input-base mt-1"
                  value={bannerForm.subtitle}
                  onChange={(ev) => setBannerForm((f) => ({ ...f, subtitle: ev.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">CTA label</span>
                <input
                  className="input-base mt-1"
                  value={bannerForm.ctaLabel}
                  onChange={(ev) => setBannerForm((f) => ({ ...f, ctaLabel: ev.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">CTA href</span>
                <input
                  className="input-base mt-1"
                  value={bannerForm.ctaHref}
                  onChange={(ev) => setBannerForm((f) => ({ ...f, ctaHref: ev.target.value }))}
                  placeholder="/products"
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Badge</span>
                <input
                  className="input-base mt-1"
                  value={bannerForm.badge}
                  onChange={(ev) => setBannerForm((f) => ({ ...f, badge: ev.target.value }))}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Sort order</span>
                  <input
                    type="number"
                    className="input-base mt-1"
                    value={bannerForm.sortOrder}
                    onChange={(ev) => setBannerForm((f) => ({ ...f, sortOrder: ev.target.value }))}
                  />
                </label>
                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(ev) => setBannerForm((f) => ({ ...f, active: ev.target.checked }))}
                  />
                  <span className="text-sm font-medium text-ink-800">Active</span>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Starts at</span>
                  <input
                    type="datetime-local"
                    className="input-base mt-1"
                    value={bannerForm.startsAt}
                    onChange={(ev) => setBannerForm((f) => ({ ...f, startsAt: ev.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Ends at</span>
                  <input
                    type="datetime-local"
                    className="input-base mt-1"
                    value={bannerForm.endsAt}
                    onChange={(ev) => setBannerForm((f) => ({ ...f, endsAt: ev.target.value }))}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setBannerEditor(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editorialEditor ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => !saving && setEditorialEditor(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="card-base max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h4 className="font-display text-lg font-semibold text-ink-950">
              {editorialEditor.mode === 'edit' ? 'Edit editorial' : 'New editorial'}
            </h4>
            <form className="mt-4 space-y-3" onSubmit={saveEditorial}>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Title</span>
                <input
                  className="input-base mt-1"
                  value={editorialForm.title}
                  onChange={(ev) => setEditorialForm((f) => ({ ...f, title: ev.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Excerpt</span>
                <textarea
                  className="input-base mt-1 min-h-[72px] resize-y"
                  value={editorialForm.excerpt}
                  onChange={(ev) => setEditorialForm((f) => ({ ...f, excerpt: ev.target.value }))}
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Image URL</span>
                <input
                  className="input-base mt-1"
                  value={editorialForm.imageUrl}
                  onChange={(ev) => setEditorialForm((f) => ({ ...f, imageUrl: ev.target.value }))}
                  placeholder="https://…"
                />
              </label>
              <label className="block">
                <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Link (href)</span>
                <input
                  className="input-base mt-1"
                  value={editorialForm.href}
                  onChange={(ev) => setEditorialForm((f) => ({ ...f, href: ev.target.value }))}
                  required
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Sort order</span>
                  <input
                    type="number"
                    className="input-base mt-1"
                    value={editorialForm.sortOrder}
                    onChange={(ev) => setEditorialForm((f) => ({ ...f, sortOrder: ev.target.value }))}
                  />
                </label>
                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={editorialForm.active}
                    onChange={(ev) => setEditorialForm((f) => ({ ...f, active: ev.target.checked }))}
                  />
                  <span className="text-sm font-medium text-ink-800">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setEditorialEditor(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MarketingAdminSection;
