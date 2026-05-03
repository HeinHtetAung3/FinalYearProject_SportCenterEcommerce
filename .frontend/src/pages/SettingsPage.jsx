import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import { IconChevronLeft } from '../components/ui/Icon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/shadcn/card';
import { Button } from '../components/shadcn/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/shadcn/tabs';
import { Skeleton } from '../components/shadcn/skeleton';
import GeneralSettings from '../components/settings/GeneralSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import AccountSettings from '../components/settings/AccountSettings';
import ProfileSettingsSection from '../components/settings/ProfileSettingsSection';
import { useUI } from '../context/UIContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  EMPTY_USER_SETTINGS,
  fetchUserSettings,
  normalizeUserSettings,
  serializeSettingsForCompare,
  updateUserSettings
} from '../services/userSettingsService';
import { applyThemeDarkMode } from '../utils/theme';

const SETTINGS_TABS = ['profile', 'general', 'notifications', 'privacy', 'security', 'account'];

function SettingsSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/**
 * @param {{ variant?: 'customer' | 'admin' }} [props]
 */
export default function SettingsPage({ variant = 'customer' } = {}) {
  const isAdminShell = variant === 'admin';
  const { showToast } = useUI();
  const { syncFromSavedSettings } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const initialTab =
    tabFromUrl && SETTINGS_TABS.includes(tabFromUrl) ? tabFromUrl : 'general';

  const [settings, setSettings] = useState(EMPTY_USER_SETTINGS);
  const [baselineJson, setBaselineJson] = useState(() => serializeSettingsForCompare(EMPTY_USER_SETTINGS));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  const dirty = useMemo(
    () => serializeSettingsForCompare(settings) !== baselineJson,
    [settings, baselineJson]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchUserSettings();
      setSettings(data);
      setBaselineJson(serializeSettingsForCompare(data));
    } catch (err) {
      setLoadError(err.message || 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tabFromUrl && SETTINGS_TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = useCallback(
    (value) => {
      setActiveTab(value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === 'general') {
            next.delete('tab');
          } else {
            next.set('tab', value);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const handleProfileSaved = useCallback((normalizedProfile) => {
    setSettings((prev) => {
      const merged = normalizeUserSettings({
        ...prev,
        promotions: Boolean(normalizedProfile.marketingEmailOptIn)
      });
      setBaselineJson(serializeSettingsForCompare(merged));
      return merged;
    });
  }, []);

  useEffect(() => {
    if (loading || loadError) return;
    applyThemeDarkMode(settings.darkMode);
  }, [settings.darkMode, loading, loadError]);

  const patchSettings = useCallback((partial) => {
    setSettings((prev) => normalizeUserSettings({ ...prev, ...partial }));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateUserSettings(settings);
      setSettings(updated);
      setBaselineJson(serializeSettingsForCompare(updated));
      syncFromSavedSettings(updated);
      showToast('Settings saved.', { variant: 'success' });
    } catch (err) {
      showToast(err.message || 'Could not save settings.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[60vh] bg-bone py-10 dark:bg-ink-950">
      <Container className="max-w-[1000px]">
        {isAdminShell ? (
          <div className="mb-6">
            <Button variant="ghost" size="sm" className="-ml-2 gap-1.5 text-ink-700 dark:text-ink-300" asChild>
              <Link to="/admin/profile">
                <IconChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                Back to My account
              </Link>
            </Button>
          </div>
        ) : null}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-950 dark:text-ink-50">
            {isAdminShell ? 'Account preferences' : 'Settings'}
          </h1>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            {isAdminShell
              ? 'Manage your profile and personal preferences here without leaving the admin console. Store-wide configuration remains under Admin system settings.'
              : 'Manage your profile, preferences, notifications, privacy, security, and your account.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isAdminShell ? 'Your preferences' : 'Customer preferences'}</CardTitle>
            <CardDescription>
              Profile and addresses save from the Profile tab; other sections use Save changes below when shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <p>{loadError}</p>
                <Button type="button" variant="outline" className="mt-3" onClick={load}>
                  Retry
                </Button>
              </div>
            ) : loading ? (
              <SettingsSkeleton />
            ) : (
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="flex w-full flex-wrap justify-start gap-1 h-auto min-h-10 py-1">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 pt-2">
                  <ProfileSettingsSection onProfileSaved={handleProfileSaved} />
                </TabsContent>

                <TabsContent value="general">
                  <GeneralSettings settings={settings} onChange={patchSettings} disabled={saving} />
                </TabsContent>
                <TabsContent value="notifications">
                  <NotificationSettings settings={settings} onChange={patchSettings} disabled={saving} />
                </TabsContent>
                <TabsContent value="privacy">
                  <PrivacySettings settings={settings} onChange={patchSettings} disabled={saving} />
                </TabsContent>
                <TabsContent value="security">
                  <SecuritySettings showToast={showToast} />
                </TabsContent>
                <TabsContent value="account">
                  <AccountSettings showToast={showToast} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          {!loading && !loadError && ['general', 'notifications', 'privacy'].includes(activeTab) ? (
            <CardFooter className="flex justify-end border-t border-ink-100 bg-ink-50/50 py-4">
              <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </Container>
    </div>
  );
}
