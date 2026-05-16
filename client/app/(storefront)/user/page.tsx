'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Mail, User, Calendar, Loader2, ShieldCheck, Pencil, X, Save } from 'lucide-react';
import {
  getUserById,
  updateUserProfile,
  getApiErrorMessage,
  type UserProfileResult,
} from '@/features/auth/services/auth-api';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { AddressBookSection } from '@/features/storefront/account/components/address-book-section';
import { AvatarUploadField } from '@/components/custom/avatar-upload-field';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

function decodeJwtSub(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

function DisabledRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">{label}</label>
      <input
        value={value ?? ''}
        disabled
        className="mt-1 w-full rounded-xl border border-border bg-bg-base/60 px-4 py-2.5 text-sm text-text-tertiary opacity-70 cursor-not-allowed"
        readOnly
      />
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-base px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">
        {value || <span className="italic text-text-tertiary">Chưa cập nhật</span>}
      </p>
    </div>
  );
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfileResult | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    dob: '',
  });

  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const sub = decodeJwtSub(token);
    if (!sub) {
      setLoading(false);
      return;
    }
    setUserId(sub);

    getUserById(sub)
      .then((data) => {
        setProfile(data);
        setForm({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          phone: data.phone ?? '',
          gender: data.gender ?? '',
          dob: data.dob ?? '',
        });
      })
      .catch(() => toast.error('Không thể tải thông tin tài khoản'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateUserProfile(userId, form);
      setProfile((prev) => prev ? { ...prev, ...form } : prev);
      toast.success('Cập nhật hồ sơ thành công');
      setEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        gender: profile.gender ?? '',
        dob: profile.dob ?? '',
      });
    }
    setPendingAvatarFile(null);
    if (avatarPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
    || profile?.username
    || 'Người dùng';

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-border bg-bg-elevated p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Hồ sơ cá nhân</p>
            <h2 className="mt-2 text-2xl font-bold text-text-primary">{fullName}</h2>
            {profile?.role && (
              <p className="mt-1 text-sm text-text-secondary">Vai trò: {profile.role}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Đã xác minh
            </span>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-base px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-primary hover:text-primary transition"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-base px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-error hover:text-error transition"
              >
                <X className="h-3.5 w-3.5" />
                Hủy
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-border/60 pt-6">
          <AvatarUploadField
            currentUrl={avatarPreviewUrl ?? profile?.avatarUrl}
            displayName={fullName}
            disabled={!editing}
            onFileSelected={(file, preview) => {
              setPendingAvatarFile(file);
              setAvatarPreviewUrl(preview);
            }}
          />
          {pendingAvatarFile && editing && (
            <p className="mt-2 text-xs text-amber-700">
              Đã chọn: {pendingAvatarFile.name} — sẽ tải lên khi storage-service sẵn sàng.
            </p>
          )}
        </div>

        {/* View mode */}
        {!editing ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoField label="Tên đăng nhập" value={profile?.username} />
            <InfoField label="Email" value={profile?.email} />
            <InfoField label="Họ" value={profile?.lastName} />
            <InfoField label="Tên" value={profile?.firstName} />
            <InfoField label="Số điện thoại" value={profile?.phone} />
            <InfoField label="Giới tính" value={profile?.gender ? GENDER_LABELS[profile.gender] ?? profile.gender : undefined} />
            <InfoField label="Ngày sinh" value={profile?.dob} />
          </div>
        ) : (
          /* Edit mode */
          <div className="mt-5 space-y-4">
            {/* Disabled: username + email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <DisabledRow label="Tên đăng nhập" value={profile?.username} />
              <DisabledRow label="Email" value={profile?.email} />
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">Tên đăng nhập và email không thể thay đổi.</p>
            </div>

            {/* Editable fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Họ</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition"
                  placeholder="Nguyễn"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Tên</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition"
                  placeholder="Văn A"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Số điện thoại</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition"
                  placeholder="09xx xxx xxx"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Giới tính</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition"
                >
                  <option value="">-- Chọn --</option>
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">Ngày sinh</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
      </section>

      <AddressBookSection enabled={!!userId} />
    </div>
  );
}
