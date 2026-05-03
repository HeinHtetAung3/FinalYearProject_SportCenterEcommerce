import { Label } from '../shadcn/label';
import { Switch } from '../shadcn/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' }
];

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' }
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London' }
];

function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-100 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {description ? <p className="text-sm text-ink-500">{description}</p> : null}
      </div>
      <div className="shrink-0 sm:min-w-[220px]">{children}</div>
    </div>
  );
}

export default function GeneralSettings({ settings, onChange, disabled }) {
  return (
    <div className="divide-y divide-ink-100 rounded-lg border border-ink-100 px-4">
      <SettingRow label="Language" description="Used for emails and the storefront where supported.">
        <Select
          value={settings.language}
          onValueChange={(language) => onChange({ language })}
          disabled={disabled}
        >
          <SelectTrigger aria-label="Language">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Currency" description="Display and checkout currency preference.">
        <Select
          value={settings.currency}
          onValueChange={(currency) => onChange({ currency })}
          disabled={disabled}
        >
          <SelectTrigger aria-label="Currency">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Time zone" description="Used for order timestamps and reminders.">
        <Select
          value={settings.timezone}
          onValueChange={(timezone) => onChange({ timezone })}
          disabled={disabled}
        >
          <SelectTrigger aria-label="Time zone">
            <SelectValue placeholder="Time zone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Label htmlFor="dark-mode" className="text-sm font-medium text-ink-900">
            Dark mode
          </Label>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Applies across the storefront (navigation, pages, and forms). Syncs to your account when you save changes
            below; leaving this page without saving restores the last saved theme.
          </p>
        </div>
        <Switch
          id="dark-mode"
          checked={settings.darkMode}
          onCheckedChange={(darkMode) => onChange({ darkMode })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
