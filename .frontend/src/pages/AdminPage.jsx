import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/feedback/LoadingSpinner';
import EmptyState from '../components/feedback/EmptyState';
import ProductImage from '../components/products/ProductImage';
import {
  IconBox,
  IconChart,
  IconChat,
  IconSearch,
  IconShield,
  IconSparkle,
  IconUsers
} from '../components/ui/Icon';
import MarketingAdminSection from '../components/admin/MarketingAdminSection';
import {
  createAdminProduct,
  deleteAdminProduct,
  deleteAdminProductsBulk,
  fetchAdminMetrics,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminUsers,
  updateAdminOrderStatus,
  updateAdminProduct
} from '../services/adminService';
import { fetchCategories } from '../services/catalogService';
import { PLP_GENDER_OPTIONS } from '../data/mockCatalog';
import { formatCurrency, classNames } from '../utils/format';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <IconChart /> },
  { id: 'products', label: 'Products', icon: <IconBox /> },
  { id: 'settings', label: 'System settings', icon: <IconShield />, href: '/admin/settings' },
  { id: 'marketing', label: 'Storefront', icon: <IconSparkle /> },
  { id: 'orders', label: 'Orders', icon: <IconShield /> },
  { id: 'users', label: 'Users', icon: <IconUsers /> },
  { id: 'support', label: 'Support chat', icon: <IconChat />, href: '/admin/chat' }
];

const ORDER_STATUS_VARIANTS = {
  PLACED: 'warning',
  PAID: 'success',
  SHIPPED: 'volt',
  DELIVERED: 'success',
  CANCELLED: 'danger'
};

function emptyProductForm(categories = []) {
  const first = categories[0];
  return {
    name: '',
    description: '',
    price: '',
    stock: '0',
    categoryId: first ? String(first.id) : '',
    imageUrl: '',
    brand: '',
    gender: '',
    subcategory: '',
    sizesText: '',
    colorsText: '',
    imagesText: ''
  };
}

function productToForm(product) {
  return {
    name: product.name || '',
    description: product.description || '',
    price: product.price != null ? String(product.price) : '',
    stock: product.stock != null ? String(product.stock) : '',
    categoryId: product.categoryId != null ? String(product.categoryId) : '',
    imageUrl: product.imageUrl || '',
    brand: product.brand || '',
    gender: product.gender || '',
    subcategory: product.subcategory || '',
    sizesText: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
    colorsText: Array.isArray(product.colors) ? product.colors.join(', ') : '',
    imagesText: Array.isArray(product.images) ? product.images.join('\n') : ''
  };
}

function parseEuSizesFromForm(text) {
  if (!text || !String(text).trim()) return [];
  return String(text)
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
}

function parseDelimitedStrings(text) {
  if (!text || !String(text).trim()) return [];
  return String(text)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseImageLines(text) {
  if (!text || !String(text).trim()) return [];
  return String(text)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProductEditorSheet({ mode, product, categories, onClose, onSaved }) {
  const [fields, setFields] = useState(() => emptyProductForm());
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFields(productToForm(product));
    } else {
      setFields(emptyProductForm(categories));
    }
    setSubmitError('');
  }, [mode, product, categories]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function updateField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    const name = fields.name.trim();
    const description = fields.description.trim();
    if (!name || !description) {
      setSubmitError('Name and description are required.');
      return;
    }
    const price = Number(fields.price);
    if (Number.isNaN(price) || price < 0) {
      setSubmitError('Enter a valid price.');
      return;
    }
    const stock = parseInt(fields.stock, 10);
    if (Number.isNaN(stock) || stock < 0) {
      setSubmitError('Enter a valid stock count.');
      return;
    }
    const categoryId = Number(fields.categoryId);
    if (Number.isNaN(categoryId)) {
      setSubmitError('Choose a category.');
      return;
    }
    const payload = {
      name,
      description,
      price,
      stock,
      categoryId,
      imageUrl: fields.imageUrl.trim() || null,
      brand: fields.brand.trim() || null,
      gender: fields.gender.trim() || null,
      subcategory: fields.subcategory.trim() || null,
      sizes: parseEuSizesFromForm(fields.sizesText),
      colors: parseDelimitedStrings(fields.colorsText),
      images: parseImageLines(fields.imagesText)
    };
    setSaving(true);
    try {
      const saved =
        mode === 'edit' && product
          ? await updateAdminProduct(product.id, payload)
          : await createAdminProduct(payload);
      onSaved(saved);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Save failed.';
      setSubmitError(typeof msg === 'string' ? msg : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-editor-title"
        className="card-base max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="product-editor-title" className="font-display text-lg font-semibold text-ink-950">
            {mode === 'edit' ? 'Edit product' : 'New product'}
          </h3>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {submitError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Name</span>
              <input
                className="input-base mt-1"
                value={fields.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Description</span>
              <textarea
                className="input-base mt-1 min-h-[88px] resize-y"
                value={fields.description}
                onChange={(e) => updateField('description', e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Price</span>
              <input
                className="input-base mt-1"
                type="number"
                min="0"
                step="0.01"
                value={fields.price}
                onChange={(e) => updateField('price', e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Stock</span>
              <input
                className="input-base mt-1"
                type="number"
                min="0"
                value={fields.stock}
                onChange={(e) => updateField('stock', e.target.value)}
                required
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Category</span>
              <select
                className="input-base mt-1"
                value={fields.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
                required
              >
                {!fields.categoryId ? <option value="">Select category</option> : null}
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">
                Primary image URL
              </span>
              <input className="input-base mt-1" value={fields.imageUrl} onChange={(e) => updateField('imageUrl', e.target.value)} placeholder="https://…" />
            </label>
            <label className="block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Brand</span>
              <input
                className="input-base mt-1"
                value={fields.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="Nike"
              />
            </label>
            <label className="block">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Gender</span>
              <select
                className="input-base mt-1"
                value={fields.gender}
                onChange={(e) => updateField('gender', e.target.value)}
              >
                <option value="">—</option>
                {PLP_GENDER_OPTIONS.map((opt) => (
                  <option key={opt.slug} value={opt.slug}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Subcategory</span>
              <input
                className="input-base mt-1"
                value={fields.subcategory}
                onChange={(e) => updateField('subcategory', e.target.value)}
                placeholder="e.g. Sneakers, Running shoes"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">
                EU sizes (comma-separated)
              </span>
              <input
                className="input-base mt-1"
                value={fields.sizesText}
                onChange={(e) => updateField('sizesText', e.target.value)}
                placeholder="40, 41, 42"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">
                Colors (comma or newline separated)
              </span>
              <input
                className="input-base mt-1"
                value={fields.colorsText}
                onChange={(e) => updateField('colorsText', e.target.value)}
                placeholder="Black, White, Volt"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">
                Gallery image URLs (one per line)
              </span>
              <textarea
                className="input-base mt-1 min-h-[96px] resize-y font-mono text-xs"
                value={fields.imagesText}
                onChange={(e) => updateField('imagesText', e.target.value)}
                placeholder={'https://…\nhttps://…'}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPage() {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [section, setSection] = useState('overview');
  const [productSearch, setProductSearch] = useState('');
  const [adminCategories, setAdminCategories] = useState([]);

  async function reloadAdminProducts() {
    const productData = await fetchAdminProducts();
    setProducts(Array.isArray(productData) ? productData : []);
  }

  useEffect(() => {
    if (section !== 'products') return undefined;
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCategories();
        if (!cancelled) setAdminCategories(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setAdminCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [section]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [metricData, orderData, userData, productData] = await Promise.all([
          fetchAdminMetrics(),
          fetchAdminOrders(),
          fetchAdminUsers(),
          fetchAdminProducts()
        ]);
        if (cancelled) return;
        setMetrics(metricData);
        setOrders(orderData || []);
        setUsers(userData || []);
        setProducts(productData || []);
      } catch (apiError) {
        if (!cancelled) setError(apiError.message || 'Unable to load admin dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.name, product.categoryName, product.brand, product.subcategory, String(product.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, productSearch]);

  return (
    <Container className="py-2">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-base p-5">
            <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">
              Admin console
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink-950">Dashboard</h2>
            <nav className="mt-6 space-y-1">
              {NAV_ITEMS.map((item) =>
                item.href ? (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-700">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={classNames(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                      section === item.id
                        ? 'bg-ink-950 text-white'
                        : 'text-ink-700 hover:bg-ink-100'
                    )}
                  >
                    <span
                      className={classNames(
                        'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                        section === item.id ? 'bg-white/10 text-white' : 'bg-ink-100 text-ink-700'
                      )}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                )
              )}
            </nav>
          </div>
        </aside>

        <section>
          <div className="mb-8">
            <span className="text-2xs font-semibold uppercase tracking-widest text-accent-500">
              Admin
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
              {NAV_ITEMS.find((item) => item.id === section)?.label}
            </h1>
          </div>

          {error ? (
            <p className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {loading ? <LoadingSpinner label="Loading dashboard..." /> : null}

          {!loading && section === 'overview' ? (
            <Overview metrics={metrics} orders={orders} products={products} />
          ) : null}

          {!loading && section === 'products' ? (
            <ProductsTable
              products={filteredProducts}
              search={productSearch}
              onSearch={setProductSearch}
              categories={adminCategories}
              onProductSaved={(saved) => {
                void saved;
                reloadAdminProducts();
                window.dispatchEvent(new Event('catalog:changed'));
              }}
              onProductDeleted={(id) => {
                void id;
                reloadAdminProducts();
                window.dispatchEvent(new Event('catalog:changed'));
              }}
              onCatalogMutated={() => {
                reloadAdminProducts();
                window.dispatchEvent(new Event('catalog:changed'));
              }}
            />
          ) : null}

          {!loading && section === 'orders' ? (
            <OrdersTable
              orders={orders}
              onUpdate={async (order) => {
                const next = order.status === 'SHIPPED' ? 'DELIVERED' : 'SHIPPED';
                const updated = await updateAdminOrderStatus(order.id, next);
                setOrders((prev) =>
                  prev.map((item) => (item.id === updated.id ? updated : item))
                );
              }}
            />
          ) : null}

          {!loading && section === 'users' ? <UsersTable users={users} /> : null}

          {!loading && section === 'marketing' ? <MarketingAdminSection /> : null}
        </section>
      </div>
    </Container>
  );
}

function Overview({ metrics, orders, products }) {
  const recentOrders = orders.slice(0, 5);
  const lowStock = (metrics?.lowStockProducts || products.filter((product) => product.stock <= 5)).slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Orders" value={metrics?.totalOrders ?? 0} accent="ink" />
        <StatCard label="Total Users" value={metrics?.totalUsers ?? 0} accent="volt" />
        <StatCard
          label="Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          accent="accent"
        />
        <StatCard label="Products" value={products.length} accent="ink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-base p-6">
          <h3 className="font-display text-lg font-semibold text-ink-950">Recent orders</h3>
          {recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <ul className="mt-4 divide-y divide-ink-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">#{order.id}</p>
                    <p className="text-xs text-ink-500">{order.customerEmail || 'Customer'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={ORDER_STATUS_VARIANTS[order.status] || 'default'}>{order.status}</Badge>
                    <span className="text-sm font-semibold text-ink-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-base p-6">
          <h3 className="font-display text-lg font-semibold text-ink-950">Low-stock alerts</h3>
          {lowStock.length === 0 ? (
            <EmptyState title="All stocked up" description="No products need attention." />
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStock.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-ink-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl bg-ink-100">
                      <ProductImage product={product} className="h-full w-full" rounded="rounded-xl" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{product.name}</p>
                      <p className="text-xs text-ink-500">{product.categoryName}</p>
                    </div>
                  </div>
                  <Badge variant="warning">{product.stock} left</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'ink' }) {
  const accentClass =
    accent === 'accent'
      ? 'before:bg-accent-500'
      : accent === 'volt'
      ? 'before:bg-volt-400'
      : 'before:bg-ink-950';
  return (
    <div
      className={classNames(
        'card-base relative overflow-hidden p-6',
        'before:absolute before:left-0 before:top-0 before:h-1 before:w-full',
        accentClass
      )}
    >
      <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold text-ink-950">{value}</p>
    </div>
  );
}

function ProductsTable({
  products,
  search,
  onSearch,
  categories,
  onProductSaved,
  onProductDeleted,
  onCatalogMutated
}) {
  const [editor, setEditor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [actionError, setActionError] = useState('');
  const selectAllRef = useRef(null);

  const visibleIds = useMemo(() => products.map((p) => Number(p.id)), [products]);

  useEffect(() => {
    setSelectedProducts((prev) => prev.filter((id) => products.some((p) => Number(p.id) === Number(id))));
  }, [products]);

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedProducts.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedProducts.includes(id));

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [someVisibleSelected, allVisibleSelected]);

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedProducts(visibleIds);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  }

  function handleSelectOne(id) {
    const nid = Number(id);
    setSelectedProducts((prev) =>
      prev.includes(nid) ? prev.filter((item) => item !== nid) : [...prev, nid]
    );
  }

  async function handleBulkDelete() {
    if (selectedProducts.length === 0) return;
    if (
      !globalThis.confirm(
        `Delete ${selectedProducts.length} product${selectedProducts.length === 1 ? '' : 's'}? This cannot be undone.`
      )
    ) {
      return;
    }
    setActionError('');
    setBulkDeleting(true);
    try {
      await deleteAdminProductsBulk(selectedProducts);
      const deletedSet = new Set(selectedProducts.map(Number));
      if (editor?.mode === 'edit' && deletedSet.has(Number(editor.product?.id))) {
        setEditor(null);
      }
      setSelectedProducts([]);
      onCatalogMutated();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Bulk delete failed.';
      setActionError(typeof msg === 'string' ? msg : 'Bulk delete failed.');
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleDelete(product) {
    if (!globalThis.confirm(`Delete "${product.name}" from the catalog?`)) return;
    setActionError('');
    setDeletingId(product.id);
    try {
      await deleteAdminProduct(product.id);
      setSelectedProducts((prev) => prev.filter((id) => Number(id) !== Number(product.id)));
      onProductDeleted(product.id);
      if (editor?.mode === 'edit' && Number(editor.product?.id) === Number(product.id)) {
        setEditor(null);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Delete failed.';
      setActionError(typeof msg === 'string' ? msg : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="card-base relative overflow-hidden">
      {editor ? (
        <ProductEditorSheet
          mode={editor.mode}
          product={editor.mode === 'edit' ? editor.product : null}
          categories={categories}
          onClose={() => setEditor(null)}
          onSaved={(saved) => {
            onProductSaved(saved);
            setEditor(null);
          }}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-5">
        <h3 className="font-display text-lg font-semibold text-ink-950">Catalog</h3>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-1 sm:justify-end">
          <Button type="button" size="sm" variant="primary" onClick={() => setEditor({ mode: 'create' })}>
            Add product
          </Button>
          <label className="relative w-full max-w-xs sm:w-64">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search products..."
              className="input-base pl-11"
            />
          </label>
        </div>
      </div>
      {actionError ? (
        <p className="px-5 pt-4 text-sm text-rose-600">{actionError}</p>
      ) : null}

      {selectedProducts.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-volt-400/10 px-5 py-3">
          <p className="text-sm font-semibold text-ink-900">
            {selectedProducts.length} item{selectedProducts.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedProducts([])}
              disabled={bulkDeleting}
            >
              Clear selection
            </Button>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => void handleBulkDelete()}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting…' : 'Delete selected'}
            </Button>
          </div>
        </div>
      ) : null}

      {products.length === 0 ? (
        <EmptyState title="No products" description="Try adjusting your search." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-2xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="w-12 px-3 py-3 text-left">
                  <span className="sr-only">Select all</span>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    title="Select all on this page"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                    disabled={visibleIds.length === 0 || bulkDeleting}
                    className="h-4 w-4 rounded border-ink-300 text-ink-950 focus:ring-2 focus:ring-ink-950/20 disabled:opacity-50"
                  />
                </th>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Brand</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-right">Rating</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={classNames(
                    'transition hover:bg-ink-50/50',
                    selectedProducts.includes(Number(product.id)) ? 'bg-accent-500/10' : ''
                  )}
                >
                  <td className="w-12 px-3 py-4 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(Number(product.id))}
                      onChange={() => handleSelectOne(product.id)}
                      disabled={
                        bulkDeleting || (deletingId !== null && Number(deletingId) === Number(product.id))
                      }
                      className="h-4 w-4 rounded border-ink-300 text-ink-950 focus:ring-2 focus:ring-ink-950/20 disabled:opacity-50"
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-ink-100">
                        <ProductImage product={product} className="h-full w-full" rounded="rounded-xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{product.name}</p>
                        <p className="text-xs text-ink-500">SKU SH-{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ink-700">{product.categoryName || '—'}</td>
                  <td className="max-w-[8rem] truncate px-6 py-4 text-ink-700">
                    {product.brand || '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-ink-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {product.stock <= 5 ? (
                      <Badge variant="warning">{product.stock} left</Badge>
                    ) : (
                      <span className="text-ink-700">{product.stock}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-ink-700">
                    {Number(product.rating || 0).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditor({ mode: 'edit', product })}
                        disabled={
                          bulkDeleting || Number(deletingId) === Number(product.id)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(product)}
                        disabled={
                          bulkDeleting || Number(deletingId) === Number(product.id)
                        }
                      >
                        {Number(deletingId) === Number(product.id) ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrdersTable({ orders, onUpdate }) {
  if (orders.length === 0) {
    return <EmptyState title="No orders yet" />;
  }
  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-50 text-2xs font-semibold uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-6 py-3 text-left">Order</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-ink-900">#{order.id}</p>
                  <p className="text-xs text-ink-500">
                    {order.placedAt ? new Date(order.placedAt).toLocaleString() : ''}
                  </p>
                </td>
                <td className="px-6 py-4 text-ink-700">{order.customerEmail || 'Guest'}</td>
                <td className="px-6 py-4">
                  <Badge variant={ORDER_STATUS_VARIANTS[order.status] || 'default'}>{order.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-ink-900">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4 text-right">
                  {['PLACED', 'PAID', 'SHIPPED'].includes(order.status) ? (
                    <Button size="sm" variant="primary" onClick={() => onUpdate(order)}>
                      Mark {order.status === 'SHIPPED' ? 'delivered' : 'shipped'}
                    </Button>
                  ) : (
                    <span className="text-2xs text-ink-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTable({ users }) {
  if (users.length === 0) {
    return <EmptyState title="No users yet" />;
  }
  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-50 text-2xs font-semibold uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((user) => (
              <tr key={user.email}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-2xs font-bold text-ink-700">
                      {user.email?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-ink-900">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.role === 'ADMIN' ? 'accent' : 'default'}>{user.role}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.enabled ? 'success' : 'danger'}>
                    {user.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;
