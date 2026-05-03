import { Label } from '../shadcn/label';
import { Switch } from '../shadcn/switch';

function ToggleRow({ id, label, description, checked, onCheckedChange, disabled }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-100 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium text-ink-900">
          {label}
        </Label>
        {description ? <p className="text-sm text-ink-500">{description}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export default function NotificationSettings({ settings, onChange, disabled }) {
  return (
    <div className="divide-y divide-ink-100 rounded-lg border border-ink-100 px-4">
      <ToggleRow
        id="order-updates"
        label="Order updates"
        description="Shipping, delivery, and status changes for your purchases."
        checked={settings.orderUpdates}
        onCheckedChange={(orderUpdates) => onChange({ orderUpdates })}
        disabled={disabled}
      />
      <ToggleRow
        id="promotions"
        label="Promotions & marketing"
        description="Deals, launches, and tips. Syncs with your profile marketing preference."
        checked={settings.promotions}
        onCheckedChange={(promotions) => onChange({ promotions })}
        disabled={disabled}
      />
      <ToggleRow
        id="email-notifications"
        label="Transactional email"
        description="Receipts, password resets, and important account messages."
        checked={settings.emailNotifications}
        onCheckedChange={(emailNotifications) => onChange({ emailNotifications })}
        disabled={disabled}
      />
      <ToggleRow
        id="sms-notifications"
        label="SMS notifications"
        description="Text messages for critical order updates where available."
        checked={settings.smsNotifications}
        onCheckedChange={(smsNotifications) => onChange({ smsNotifications })}
        disabled={disabled}
      />
    </div>
  );
}
