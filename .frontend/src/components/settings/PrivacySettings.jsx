import { Label } from '../shadcn/label';
import { Switch } from '../shadcn/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select';

export default function PrivacySettings({ settings, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-500 dark:text-ink-400">
        <strong className="font-medium text-ink-800 dark:text-ink-200">Profile visibility</strong> controls how your name
        appears on public reviews. <strong className="font-medium text-ink-800 dark:text-ink-200">Personalized offers</strong>{' '}
        toggles the &quot;You may also like&quot; recommendations on product pages.{' '}
        <strong className="font-medium text-ink-800 dark:text-ink-200">Product usage &amp; analytics</strong> toggles the
        &quot;Recently viewed&quot; rail (we stop surfacing that history when off).
      </p>
      <div className="divide-y divide-ink-100 rounded-lg border border-ink-100 px-4">
        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-ink-900">Profile visibility</p>
            <p className="text-sm text-ink-500">Who can see your display name on public surfaces (e.g. reviews).</p>
          </div>
          <div className="shrink-0 sm:min-w-[220px]">
            <Select
              value={settings.profileVisibility}
              onValueChange={(profileVisibility) => onChange({ profileVisibility })}
              disabled={disabled}
            >
              <SelectTrigger aria-label="Profile visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Label htmlFor="data-sharing" className="text-sm font-medium text-ink-900">
              Product usage & analytics
            </Label>
            <p className="text-sm text-ink-500">Help improve recommendations by sharing limited usage signals.</p>
          </div>
          <Switch
            id="data-sharing"
            checked={settings.dataSharing}
            onCheckedChange={(dataSharing) => onChange({ dataSharing })}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Label htmlFor="personalized-ads" className="text-sm font-medium text-ink-900">
              Personalized offers
            </Label>
            <p className="text-sm text-ink-500">Tailor promotions based on your activity on this site.</p>
          </div>
          <Switch
            id="personalized-ads"
            checked={settings.personalizedAds}
            onCheckedChange={(personalizedAds) => onChange({ personalizedAds })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
