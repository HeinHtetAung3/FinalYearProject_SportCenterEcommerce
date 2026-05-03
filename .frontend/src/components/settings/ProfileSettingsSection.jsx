import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import Button from '../ui/Button';
import { IconUser } from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import {
  createProfileAddress,
  deleteProfileImage,
  deleteProfileAddress,
  fetchProfile,
  uploadProfileImage,
  updateProfileImage,
  updateProfile,
  updateProfileAddress
} from '../../services/commerceService';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../shadcn/dialog';
import { createCroppedImageFile, readFileAsDataUrl } from '../../utils/imageCrop';

const EMPTY_ADDRESS_FORM = {
  label: '',
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'United States',
  makeDefault: false
};

export function normalizeProfilePayload(data) {
  return {
    email: data.email ?? '',
    fullName: data.fullName ?? '',
    phoneNumber: data.phoneNumber === 'N/A' ? '' : data.phoneNumber ?? '',
    address: data.address === 'N/A' ? '' : data.address ?? '',
    profileImageUrl: data.profileImageUrl ?? '',
    marketingEmailOptIn: data.marketingEmailOptIn ?? true,
    addresses: Array.isArray(data.addresses) ? data.addresses : []
  };
}

/**
 * @param {object} props
 * @param {React.ReactNode} [props.secondaryColumn] — optional second column (e.g. extra forms in a two-column layout).
 * @param {(normalizedProfile: object) => void} [props.onProfileSaved] — after successful profile field save (e.g. sync promotions in Settings).
 */
export default function ProfileSettingsSection({ secondaryColumn = null, onProfileSaved }) {
  const { isAuthenticated, setProfileImageUrl } = useAuth();
  const { showToast } = useUI();
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    profileImageUrl: '',
    email: '',
    marketingEmailOptIn: true,
    addresses: []
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imageCacheKey, setImageCacheKey] = useState(Date.now());
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropOriginalName, setCropOriginalName] = useState('avatar.jpg');
  const [cropPosition, setCropPosition] = useState({
    x: 0,
    y: 0
  });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState(null);
  const [processingCrop, setProcessingCrop] = useState(false);
  const [cropPreviewUrl, setCropPreviewUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadError('');
        const data = await fetchProfile();
        if (!cancelled) {
          const normalized = normalizeProfilePayload(data);
          setProfile(normalized);
          setProfileImageUrl(normalized.profileImageUrl);
          setImageCacheKey(Date.now());
        }
      } catch (apiError) {
        if (!cancelled) setLoadError(apiError.message || 'Unable to load profile.');
      }
    }
    if (isAuthenticated) load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setProfileImageUrl]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (cropPreviewUrl) {
        URL.revokeObjectURL(cropPreviewUrl);
      }
    };
  }, [cropPreviewUrl]);

  useEffect(() => {
    return () => {
      if (cropImageSrc && cropImageSrc.startsWith('data:')) {
        // no-op now, but keep a dedicated cleanup hook when source strategies evolve
      }
    };
  }, [cropImageSrc]);

  useEffect(() => {
    let cancelled = false;
    async function buildPreview() {
      if (!cropImageSrc || !cropPixels) {
        if (cropPreviewUrl) {
          URL.revokeObjectURL(cropPreviewUrl);
        }
        setCropPreviewUrl('');
        return;
      }
      try {
        const file = await createCroppedImageFile(cropImageSrc, cropPixels, cropOriginalName);
        if (cancelled) return;
        const url = URL.createObjectURL(file);
        setCropPreviewUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });
      } catch {
        if (!cancelled) {
          setCropPreviewUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return '';
          });
        }
      }
    }
    buildPreview();
    return () => {
      cancelled = true;
    };
  }, [cropImageSrc, cropPixels, cropOriginalName]);

  const persistedProfileImageUrl = resolveMediaUrl(profile.profileImageUrl || '');
  const resolvedProfileImageUrl = imagePreviewUrl || persistedProfileImageUrl;
  const profileImageWithTimestamp = resolvedProfileImageUrl
    ? `${resolvedProfileImageUrl}${resolvedProfileImageUrl.includes('?') ? '&' : '?'}t=${imageCacheKey}`
    : '';

  const openCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phoneNumber || ''
    });
    setAddressModalOpen(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label ?? '',
      fullName: addr.fullName ?? '',
      phone: addr.phone ?? '',
      email: addr.email ?? '',
      line1: addr.line1 ?? '',
      line2: addr.line2 ?? '',
      city: addr.city ?? '',
      region: addr.region ?? '',
      postalCode: addr.postalCode ?? '',
      country: addr.country ?? 'United States',
      makeDefault: Boolean(addr.isDefault)
    });
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
  };

  const handleSaveAddress = async (event) => {
    event.preventDefault();
    if (savingAddress) return;

    if (!addressForm.label?.trim()) {
      showToast('Please enter a label (e.g. Home, Office).', { variant: 'error' });
      return;
    }
    if (!addressForm.fullName?.trim() || !addressForm.phone?.trim()) {
      showToast('Full name and phone are required.', { variant: 'error' });
      return;
    }
    if (!addressForm.line1?.trim() || !addressForm.city?.trim() || !addressForm.postalCode?.trim()) {
      showToast('Street, city, and postal code are required.', { variant: 'error' });
      return;
    }
    if (!addressForm.country?.trim()) {
      showToast('Country is required.', { variant: 'error' });
      return;
    }

    const apiPayload = {
      label: addressForm.label.trim(),
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      email: addressForm.email?.trim() || null,
      line1: addressForm.line1.trim(),
      line2: addressForm.line2?.trim() || null,
      city: addressForm.city.trim(),
      region: addressForm.region?.trim() || null,
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country.trim(),
      makeDefault: addressForm.makeDefault
    };

    setSavingAddress(true);
    try {
      if (editingAddressId == null) {
        await createProfileAddress(apiPayload);
        showToast('Address added.', { variant: 'success' });
      } else {
        await updateProfileAddress(editingAddressId, apiPayload);
        showToast('Address updated.', { variant: 'success' });
      }
      const data = await fetchProfile();
      setProfile(normalizeProfilePayload(data));
      closeAddressModal();
    } catch (apiError) {
      showToast(apiError.message || 'Could not save address.', { variant: 'error' });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!globalThis.confirm('Delete this address from your account?')) return;
    setDeletingId(id);
    try {
      await deleteProfileAddress(id);
      showToast('Address removed.', { variant: 'success' });
      const data = await fetchProfile();
      setProfile(normalizeProfilePayload(data));
    } catch (apiError) {
      showToast(apiError.message || 'Could not delete address.', { variant: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await updateProfileAddress(addr.id, {
        label: addr.label,
        fullName: addr.fullName,
        phone: addr.phone,
        email: addr.email || null,
        line1: addr.line1,
        line2: addr.line2 || null,
        city: addr.city,
        region: addr.region || null,
        postalCode: addr.postalCode,
        country: addr.country,
        makeDefault: true
      });
      showToast('Default shipping address updated.', { variant: 'success' });
      const data = await fetchProfile();
      setProfile(normalizeProfilePayload(data));
    } catch (apiError) {
      showToast(apiError.message || 'Could not update default.', { variant: 'error' });
    }
  };

  const personalForm = (
    <form
      className="card-base space-y-4 p-6 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        if (savingProfile) return;
        if (!profile.fullName?.trim() || !profile.phoneNumber?.trim()) {
          showToast('Full name and phone are required.', { variant: 'error' });
          return;
        }
        setSavingProfile(true);
        try {
          const updated = await updateProfile({
            fullName: profile.fullName.trim(),
            phoneNumber: profile.phoneNumber.trim(),
            marketingEmailOptIn: profile.marketingEmailOptIn
          });
          const normalized = normalizeProfilePayload(updated);
          setProfile(normalized);
          showToast('Profile saved.', { variant: 'success' });
          onProfileSaved?.(normalized);
        } catch (apiError) {
          showToast(apiError.message || 'Unable to update profile.', { variant: 'error' });
        } finally {
          setSavingProfile(false);
        }
      }}
    >
      <h2 className="font-display text-xl font-semibold text-ink-950 dark:text-bone">Personal details</h2>
      <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-900/40">
        <p className="mb-3 text-sm font-semibold text-ink-900 dark:text-bone">Profile image</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-ink-200 bg-white dark:border-ink-600 dark:bg-ink-800">
            {profileImageWithTimestamp ? (
              <img src={profileImageWithTimestamp} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-500">
                <IconUser />
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="input-base"
              onChange={async(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png'].includes(file.type)) {
                  showToast('Please select a JPG or PNG image.', { variant: 'error' });
                  return;
                }
                if (file.size > 2 * 1024 * 1024) {
                  showToast('Image must be 2MB or smaller.', { variant: 'error' });
                  return;
                }
                try {
                  const dataUrl = await readFileAsDataUrl(file);
                  setCropImageSrc(dataUrl);
                  setCropOriginalName(file.name || 'avatar.jpg');
                  setCropPosition({
                    x: 0,
                    y: 0
                  });
                  setCropZoom(1);
                  setCropPixels(null);
                  setCropDialogOpen(true);
                } catch (error) {
                  showToast(error.message || 'Could not open crop editor.', { variant: 'error' });
                }
                event.target.value = '';
              }}
            />
            <p className="mt-1 text-2xs text-ink-500">JPG or PNG, maximum size 2MB.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedImageFile || uploadingImage}
            onClick={async () => {
              if (!selectedImageFile || uploadingImage) return;
              setUploadingImage(true);
              try {
                const response = profile.profileImageUrl
                  ? await updateProfileImage(selectedImageFile)
                  : await uploadProfileImage(selectedImageFile);
                const nextUrl = response?.profileImageUrl || '';
                setProfile((prev) => ({ ...prev, profileImageUrl: nextUrl }));
                setProfileImageUrl(nextUrl);
                setImageCacheKey(Date.now());
                setSelectedImageFile(null);
                if (imagePreviewUrl) {
                  URL.revokeObjectURL(imagePreviewUrl);
                }
                setImagePreviewUrl('');
                showToast(response?.message || 'Profile image saved.', { variant: 'success' });
              } catch (apiError) {
                showToast(apiError.message || 'Could not update profile image.', { variant: 'error' });
              } finally {
                setUploadingImage(false);
              }
            }}
          >
            {uploadingImage ? 'Uploading…' : profile.profileImageUrl ? 'Update image' : 'Upload image'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!profile.profileImageUrl || uploadingImage || deletingImage}
            onClick={async () => {
              if (!profile.profileImageUrl || deletingImage) return;
              if (!globalThis.confirm('Remove your profile image?')) return;
              setDeletingImage(true);
              try {
                const response = await deleteProfileImage();
                setProfile((prev) => ({ ...prev, profileImageUrl: '' }));
                setProfileImageUrl('');
                setImageCacheKey(Date.now());
                setSelectedImageFile(null);
                if (imagePreviewUrl) {
                  URL.revokeObjectURL(imagePreviewUrl);
                }
                setImagePreviewUrl('');
                showToast(response?.message || 'Profile image removed.', { variant: 'success' });
              } catch (apiError) {
                showToast(apiError.message || 'Could not remove profile image.', { variant: 'error' });
              } finally {
                setDeletingImage(false);
              }
            }}
          >
            {deletingImage ? 'Removing…' : 'Remove image'}
          </Button>
        </div>
      </div>
      <Field label="Email">
        <input className="input-base" value={profile.email} disabled />
      </Field>
      <Field label="Full name">
        <input
          className="input-base"
          required
          value={profile.fullName || ''}
          onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
        />
      </Field>
      <Field label="Phone">
        <input
          className="input-base"
          required
          value={profile.phoneNumber || ''}
          onChange={(event) => setProfile((prev) => ({ ...prev, phoneNumber: event.target.value }))}
        />
      </Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 bg-ink-50/50 p-4 dark:border-ink-700 dark:bg-ink-900/40">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-ink-300 text-accent-600 focus:ring-accent-500"
          checked={profile.marketingEmailOptIn}
          onChange={(event) =>
            setProfile((prev) => ({ ...prev, marketingEmailOptIn: event.target.checked }))
          }
        />
        <span>
          <span className="block text-sm font-semibold text-ink-900 dark:text-bone">Marketing emails</span>
          <span className="mt-0.5 block text-sm text-ink-600 dark:text-ink-300">
            Get occasional updates about new arrivals, offers, and events. You can turn this off anytime.
          </span>
        </span>
      </label>
      <Button type="submit" variant="primary" disabled={savingProfile}>
        {savingProfile ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );

  const addressSection = (
    <section className="card-base space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-950 dark:text-bone">Address book</h2>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
            Save delivery addresses for faster checkout. One address can be marked as default.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={openCreateAddress}>
          Add address
        </Button>
      </div>

      {!profile.addresses.length ? (
        <p className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 p-6 text-center text-sm text-ink-600 dark:border-ink-600 dark:bg-ink-900/30 dark:text-ink-300">
          No saved addresses yet. Add your home or office details to speed up future orders.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profile.addresses.map((addr) => (
            <li
              key={addr.id}
              className="flex flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-sm dark:border-ink-700 dark:bg-ink-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-950 dark:text-bone">{addr.label}</p>
                  {addr.isDefault ? (
                    <span className="mt-1 inline-block rounded-full bg-accent-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-accent-800">
                      Default
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-800 dark:text-ink-200">
                {addr.fullName}
                <br />
                {addr.line1}
                {addr.line2 ? (
                  <>
                    <br />
                    {addr.line2}
                  </>
                ) : null}
                <br />
                {addr.city}, {addr.postalCode}
                {addr.region ? `, ${addr.region}` : ''}
                <br />
                {addr.country}
              </p>
              <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
                {addr.phone}
                {addr.email ? (
                  <>
                    <br />
                    {addr.email}
                  </>
                ) : null}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!addr.isDefault ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleSetDefault(addr)}>
                    Set as default
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" onClick={() => openEditAddress(addr)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={deletingId === addr.id}
                  onClick={() => handleDeleteAddress(addr.id)}
                >
                  {deletingId === addr.id ? 'Removing…' : 'Delete'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  const addressModal =
    addressModalOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
        onClick={(e) => e.target === e.currentTarget && closeAddressModal()}
      >
        <div
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-ink-900 dark:text-bone"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="address-modal-title" className="font-display text-lg font-semibold text-ink-950 dark:text-bone">
            {editingAddressId == null ? 'Add address' : 'Edit address'}
          </h2>
          <form className="mt-4 space-y-3" onSubmit={handleSaveAddress}>
            <Field label="Label">
              <input
                className="input-base"
                placeholder="Home, Office…"
                value={addressForm.label}
                onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
              />
            </Field>
            <Field label="Full name">
              <input
                className="input-base"
                required
                value={addressForm.fullName}
                onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <input
                className="input-base"
                required
                value={addressForm.phone}
                onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Field>
            <Field label="Email (optional)">
              <input
                className="input-base"
                type="email"
                value={addressForm.email}
                onChange={(e) => setAddressForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Address line 1">
              <input
                className="input-base"
                required
                value={addressForm.line1}
                onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
              />
            </Field>
            <Field label="Address line 2 (optional)">
              <input
                className="input-base"
                value={addressForm.line2}
                onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="City">
                <input
                  className="input-base"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                />
              </Field>
              <Field label="Postal code">
                <input
                  className="input-base"
                  required
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Region / state (optional)">
              <input
                className="input-base"
                value={addressForm.region}
                onChange={(e) => setAddressForm((f) => ({ ...f, region: e.target.value }))}
              />
            </Field>
            <Field label="Country">
              <input
                className="input-base"
                required
                value={addressForm.country}
                onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-800 dark:text-ink-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-ink-300 text-accent-600 focus:ring-accent-500"
                checked={addressForm.makeDefault}
                onChange={(e) => setAddressForm((f) => ({ ...f, makeDefault: e.target.checked }))}
              />
              Save as default shipping address
            </label>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" variant="primary" disabled={savingAddress}>
                {savingAddress ? 'Saving…' : 'Save address'}
              </Button>
              <Button type="button" variant="ghost" onClick={closeAddressModal}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    ) : null;

  return (
    <>
      {loadError ? (
        <p className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {loadError}
        </p>
      ) : null}

      {secondaryColumn ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {personalForm}
          {secondaryColumn}
        </div>
      ) : (
        personalForm
      )}

      {addressSection}
      {addressModal}

      <Dialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!processingCrop) setCropDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust profile image</DialogTitle>
            <DialogDescription>
              Drag to reposition and use zoom for the perfect avatar crop.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative h-[340px] w-full overflow-hidden rounded-xl bg-ink-950">
              {cropImageSrc ? (
                <Cropper
                  image={cropImageSrc}
                  crop={cropPosition}
                  zoom={cropZoom}
                  aspect={1}
                  onCropChange={setCropPosition}
                  onZoomChange={setCropZoom}
                  onCropComplete={(_, croppedAreaPixels) => setCropPixels(croppedAreaPixels)}
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <label className="block flex-1">
                <span className="label-base">Zoom</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropZoom}
                  onChange={(event) => setCropZoom(Number(event.target.value))}
                  className="mt-2 w-full accent-accent-500"
                />
              </label>
              <div className="sm:pl-4">
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-ink-500">Live preview</p>
                <div className="h-16 w-16 overflow-hidden rounded-full border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
                  {cropPreviewUrl ? (
                    <img src={cropPreviewUrl} alt="Crop preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-400">
                      <IconUser />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={processingCrop}
              onClick={() => {
                setCropDialogOpen(false);
                setCropImageSrc('');
                setCropPixels(null);
                setCropPreviewUrl((previous) => {
                  if (previous) URL.revokeObjectURL(previous);
                  return '';
                });
                setCropPosition({
                  x: 0,
                  y: 0
                });
                setCropZoom(1);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={processingCrop || !cropImageSrc || !cropPixels}
              onClick={async() => {
                if (!cropImageSrc || !cropPixels) return;
                setProcessingCrop(true);
                try {
                  const croppedFile = await createCroppedImageFile(
                    cropImageSrc,
                    cropPixels,
                    cropOriginalName
                  );
                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                  }
                  setSelectedImageFile(croppedFile);
                  setImagePreviewUrl(URL.createObjectURL(croppedFile));
                  setCropDialogOpen(false);
                  setCropImageSrc('');
                  setCropPixels(null);
                  setCropPreviewUrl((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return '';
                  });
                  setCropPosition({
                    x: 0,
                    y: 0
                  });
                  setCropZoom(1);
                } catch (error) {
                  showToast(error.message || 'Could not apply crop.', { variant: 'error' });
                } finally {
                  setProcessingCrop(false);
                }
              }}
            >
              {processingCrop ? 'Applying…' : 'Apply crop'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label-base">{label}</span>
      {children}
    </label>
  );
}
