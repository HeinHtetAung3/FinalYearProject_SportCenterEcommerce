import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import { Button } from '../components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/shadcn/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/shadcn/dialog';
import { Input } from '../components/shadcn/input';
import { Label } from '../components/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/shadcn/select';
import { Skeleton } from '../components/shadcn/skeleton';
import { Switch } from '../components/shadcn/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/shadcn/tabs';
import { useUI } from '../context/UIContext';
import {
  EMPTY_SYSTEM_SETTINGS,
  fetchAdminSettings,
  normalizeAdminSettings,
  serializeAdminSettingsForCompare,
  updateAdminSettings
} from '../services/adminService';
import AdminBackToStorefrontButton from '../components/admin/AdminBackToStorefrontButton';

const SETTINGS_TABS = [
  { value: 'general', label: 'General' },
  { value: 'payments', label: 'Payments' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'tax', label: 'Tax' },
  { value: 'product', label: 'Product Settings' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'THB', 'JPY'];
const LANGUAGES = ['en', 'es', 'fr', 'de', 'th'];

function AdminSettingsSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-10 w-full max-w-2xl" />
      <Skeleton className="h-52 w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>
      {children}
    </label>
  );
}

function SwitchRow({ id, title, description, checked, onCheckedChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 p-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium text-ink-900">
          {title}
        </Label>
        {description ? <p className="text-sm text-ink-500">{description}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { showToast } = useUI();
  const [settings, setSettings] = useState(EMPTY_SYSTEM_SETTINGS);
  const [baseline, setBaseline] = useState(() => serializeAdminSettingsForCompare(EMPTY_SYSTEM_SETTINGS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [stripeSecretDialogOpen, setStripeSecretDialogOpen] = useState(false);
  const [stripeSecretInput, setStripeSecretInput] = useState('');

  const dirty = useMemo(
    () => serializeAdminSettingsForCompare(settings) !== baseline,
    [settings, baseline]
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirty]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await fetchAdminSettings();
        if (cancelled) return;
        setSettings(data);
        setBaseline(serializeAdminSettingsForCompare(data));
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Unable to load system settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (section, partial) => {
    setSettings((prev) => normalizeAdminSettings({ ...prev, [section]: { ...prev[section], ...partial } }));
  };

  const setRegionFromText = (value) => {
    const regions = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    patch('shipping', { deliveryRegions: regions.length ? regions : ['United States'] });
  };

  const setTaxRulesFromText = (value) => {
    const regionTaxRules = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [region, rateRaw] = line.split(':').map((s) => s.trim());
        const rate = Number(rateRaw);
        if (!region || Number.isNaN(rate)) return null;
        return { region, taxRatePercent: rate };
      })
      .filter(Boolean);
    patch('tax', { regionTaxRules });
  };

  const taxRulesText = (settings.tax.regionTaxRules || [])
    .map((r) => `${r.region}: ${r.taxRatePercent}`)
    .join('\n');

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        payments: {
          ...settings.payments,
          stripeSecretKey: stripeSecretInput.trim()
        }
      };
      const updated = await updateAdminSettings(payload);
      setSettings(updated);
      setBaseline(serializeAdminSettingsForCompare(updated));
      setStripeSecretInput('');
      showToast('System settings updated.', { variant: 'success' });
    } catch (err) {
      showToast(err.message || 'Failed to save system settings.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[60vh] bg-bone py-10 dark:bg-ink-950">
      <Container className="max-w-[1100px]">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-950 dark:text-ink-50">
              Admin System Settings
            </h1>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
              Configure store-wide behavior for commerce, operations, and security.
            </p>
          </div>
          <AdminBackToStorefrontButton className="shrink-0 sm:mt-0" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System configuration</CardTitle>
            <CardDescription>
              These settings affect all customers and administrative workflows across the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {loadError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</div>
            ) : loading ? (
              <AdminSettingsSkeleton />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
                  {SETTINGS_TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="general" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field label="Store Name">
                        <Input
                          value={settings.general.storeName}
                          onChange={(e) => patch('general', { storeName: e.target.value })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Contact Email">
                        <Input
                          type="email"
                          value={settings.general.contactEmail}
                          onChange={(e) => patch('general', { contactEmail: e.target.value })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Store Logo URL">
                        <Input
                          value={settings.general.logoUrl || ''}
                          onChange={(e) => patch('general', { logoUrl: e.target.value })}
                          placeholder="https://cdn.example.com/logo.png"
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Default Currency">
                        <Select
                          value={settings.general.defaultCurrency}
                          onValueChange={(defaultCurrency) => patch('general', { defaultCurrency })}
                          disabled={saving}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Default Language">
                        <Select
                          value={settings.general.defaultLanguage}
                          onValueChange={(defaultLanguage) => patch('general', { defaultLanguage })}
                          disabled={saving}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <SwitchRow
                        id="pay-credit-card"
                        title="Credit Card"
                        checked={settings.payments.creditCardEnabled}
                        onCheckedChange={(creditCardEnabled) => patch('payments', { creditCardEnabled })}
                        disabled={saving}
                      />
                      <SwitchRow
                        id="pay-cod"
                        title="Cash on Delivery"
                        checked={settings.payments.cashOnDeliveryEnabled}
                        onCheckedChange={(cashOnDeliveryEnabled) => patch('payments', { cashOnDeliveryEnabled })}
                        disabled={saving}
                      />
                      <SwitchRow
                        id="pay-stripe"
                        title="Stripe"
                        checked={settings.payments.stripeEnabled}
                        onCheckedChange={(stripeEnabled) => patch('payments', { stripeEnabled })}
                        disabled={saving}
                      />
                      <Field label="Stripe Public Key">
                        <Input
                          value={settings.payments.stripePublicKey || ''}
                          onChange={(e) => patch('payments', { stripePublicKey: e.target.value })}
                          placeholder="pk_live_..."
                          disabled={saving}
                        />
                      </Field>
                      <div className="flex items-center justify-between rounded-lg border border-ink-100 p-4">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">Stripe Secret Key</p>
                          <p className="text-xs text-ink-500">
                            {settings.payments.stripeSecretConfigured
                              ? 'Secret configured. It is stored securely and never returned to UI.'
                              : 'No Stripe secret key configured yet.'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStripeSecretDialogOpen(true)}
                          disabled={saving}
                        >
                          {settings.payments.stripeSecretConfigured ? 'Update Secret' : 'Set Secret'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field label="Flat Shipping Fee">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={settings.shipping.flatShippingFee}
                          onChange={(e) => patch('shipping', { flatShippingFee: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Free Shipping Threshold">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={settings.shipping.freeShippingThreshold}
                          onChange={(e) => patch('shipping', { freeShippingThreshold: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Estimated Delivery Time">
                        <Input
                          value={settings.shipping.estimatedDeliveryTime}
                          onChange={(e) => patch('shipping', { estimatedDeliveryTime: e.target.value })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Delivery Regions (one per line)">
                        <textarea
                          className="min-h-28 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
                          value={settings.shipping.deliveryRegions.join('\n')}
                          onChange={(e) => setRegionFromText(e.target.value)}
                          disabled={saving}
                        />
                      </Field>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tax" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Field label="Tax Percentage (VAT)">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={settings.tax.taxRatePercent}
                          onChange={(e) => patch('tax', { taxRatePercent: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Region Tax Rules (Region: Rate)">
                        <textarea
                          className="min-h-28 w-full rounded-md border border-ink-200 px-3 py-2 text-sm"
                          value={taxRulesText}
                          onChange={(e) => setTaxRulesFromText(e.target.value)}
                          disabled={saving}
                          placeholder={'California: 8.25\nBangkok: 7.00'}
                        />
                      </Field>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="product" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Field label="Default Stock Threshold">
                        <Input
                          type="number"
                          min="0"
                          value={settings.product.defaultStockThreshold}
                          onChange={(e) => patch('product', { defaultStockThreshold: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <SwitchRow
                        id="product-low-stock"
                        title="Low Stock Alerts"
                        checked={settings.product.lowStockAlertsEnabled}
                        onCheckedChange={(lowStockAlertsEnabled) => patch('product', { lowStockAlertsEnabled })}
                        disabled={saving}
                      />
                      <SwitchRow
                        id="product-reviews"
                        title="Enable Product Reviews"
                        checked={settings.product.reviewsEnabled}
                        onCheckedChange={(reviewsEnabled) => patch('product', { reviewsEnabled })}
                        disabled={saving}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <SwitchRow
                        id="notify-orders"
                        title="New Orders"
                        checked={settings.notifications.alertNewOrders}
                        onCheckedChange={(alertNewOrders) => patch('notifications', { alertNewOrders })}
                        disabled={saving}
                      />
                      <SwitchRow
                        id="notify-stock"
                        title="Low Stock"
                        checked={settings.notifications.alertLowStock}
                        onCheckedChange={(alertLowStock) => patch('notifications', { alertLowStock })}
                        disabled={saving}
                      />
                      <SwitchRow
                        id="notify-users"
                        title="New User Registration"
                        checked={settings.notifications.alertNewUserRegistration}
                        onCheckedChange={(alertNewUserRegistration) =>
                          patch('notifications', { alertNewUserRegistration })
                        }
                        disabled={saving}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4 pt-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <Field label="Password Min Length">
                        <Input
                          type="number"
                          min="6"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => patch('security', { passwordMinLength: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Session Timeout (minutes)">
                        <Input
                          type="number"
                          min="5"
                          value={settings.security.sessionTimeoutMinutes}
                          onChange={(e) => patch('security', { sessionTimeoutMinutes: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="Max Login Attempts">
                        <Input
                          type="number"
                          min="3"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => patch('security', { maxLoginAttempts: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <Field label="JWT Expiration (minutes)">
                        <Input
                          type="number"
                          min="5"
                          value={settings.security.jwtExpirationMinutes}
                          onChange={(e) => patch('security', { jwtExpirationMinutes: Number(e.target.value) })}
                          disabled={saving}
                        />
                      </Field>
                      <SwitchRow
                        id="pass-uppercase"
                        title="Require Uppercase"
                        checked={settings.security.passwordRequireUppercase}
                        onCheckedChange={(passwordRequireUppercase) =>
                          patch('security', { passwordRequireUppercase })
                        }
                        disabled={saving}
                      />
                      <SwitchRow
                        id="pass-number"
                        title="Require Number"
                        checked={settings.security.passwordRequireNumber}
                        onCheckedChange={(passwordRequireNumber) => patch('security', { passwordRequireNumber })}
                        disabled={saving}
                      />
                      <SwitchRow
                        id="pass-special"
                        title="Require Special Character"
                        checked={settings.security.passwordRequireSpecialCharacter}
                        onCheckedChange={(passwordRequireSpecialCharacter) =>
                          patch('security', { passwordRequireSpecialCharacter })
                        }
                        disabled={saving}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          {!loading && !loadError ? (
            <div className="flex justify-end border-t border-ink-100 bg-ink-50/40 px-6 py-4">
              <Button onClick={handleSave} disabled={!dirty || saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          ) : null}
        </Card>
      </Container>

      <Dialog open={stripeSecretDialogOpen} onOpenChange={setStripeSecretDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Stripe Secret Key</DialogTitle>
            <DialogDescription>
              This value is write-only. It is encrypted on the server and cannot be viewed again.
            </DialogDescription>
          </DialogHeader>
          <Field label="Stripe Secret Key">
            <Input
              type="password"
              value={stripeSecretInput}
              onChange={(e) => setStripeSecretInput(e.target.value)}
              placeholder="sk_live_..."
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStripeSecretDialogOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                patch('payments', { stripeSecretConfigured: stripeSecretInput.trim().length > 0 || settings.payments.stripeSecretConfigured });
                setStripeSecretDialogOpen(false);
              }}
            >
              Use This Secret
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
