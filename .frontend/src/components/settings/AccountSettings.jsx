import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shadcn/button';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../shadcn/dialog';
import { deactivateAccount, deleteAccount } from '../../services/accountService';
import { useAuth } from '../../context/AuthContext';

export default function AccountSettings({ showToast }) {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleDeactivate() {
    setBusy(true);
    try {
      await deactivateAccount();
      showToast('Your account has been deactivated.', { variant: 'success' });
      clearSession();
      setDeactivateOpen(false);
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Unable to deactivate account.', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deletePassword) {
      showToast('Enter your password to confirm.', { variant: 'error' });
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(deletePassword);
      showToast('Your account has been closed.', { variant: 'success' });
      clearSession();
      setDeleteOpen(false);
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Unable to delete account.', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-6">
        <h3 className="text-sm font-semibold text-amber-950">Account status</h3>
        <p className="mt-2 text-sm text-amber-900/90">
          Deactivate stops sign-in until support re-enables your account. Delete permanently closes your profile and
          anonymizes personal data; order history may be retained for records.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setDeactivateOpen(true)}>
            Deactivate account
          </Button>
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </div>
      </div>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate account?</DialogTitle>
            <DialogDescription>
              You will be signed out and will not be able to log in until your account is re-enabled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeactivateOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" variant="secondary" onClick={handleDeactivate} disabled={busy}>
              {busy ? 'Working…' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeletePassword('');
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription>
              This cannot be undone from the app. Enter your password to confirm. You will be signed out immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="delete-password">Password</Label>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={busy}>
              {busy ? 'Working…' : 'Delete my account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
