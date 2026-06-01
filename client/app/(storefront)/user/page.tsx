'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { toast } from 'sonner';
import { Mail, Loader2, ShieldCheck, Pencil, X, Save, UserRound } from 'lucide-react';
import {
  getUserById,
  updateUserProfile,
  getApiErrorMessage,
  type UserProfileResult,
} from '@/features/auth/services/auth-api';
import { wasForbiddenToastShown } from '@/lib/axios-client';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { AddressBookSection } from '@/features/storefront/account/components/address-book-section';
import { AvatarUploadField } from '@/components/custom/avatar-upload-field';
import { uploadUserAvatar } from '@/features/auth/services/avatar-api';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

function decodeJwtSub(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

function DisabledRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <label className="inline-flex items-center gap-1.5 text-label-sm font-label-sm text-on-surface-variant">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </label>
      <input
        value={value ?? ''}
        disabled
        className="mt-1.5 w-full rounded-[8px] border border-outline-variant bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface-variant opacity-80 cursor-not-allowed"
        readOnly
      />
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
      .catch((err) => {
        if (!wasForbiddenToastShown(err)) {
          toast.error(getApiErrorMessage(err, 'Không thể tải thông tin tài khoản'));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      let avatarUrl = profile?.avatarUrl;
      if (pendingAvatarFile) {
        avatarUrl = await uploadUserAvatar(userId, pendingAvatarFile);
      }

      await updateUserProfile(userId, { ...form, avatarUrl });
      setProfile((prev) => (prev ? { ...prev, ...form, avatarUrl } : prev));
      setPendingAvatarFile(null);
      if (avatarPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(avatarUrl ?? null);
      toast.success('Cập nhật hồ sơ thành công');
      setEditing(false);
    } catch (err) {
      if (!wasForbiddenToastShown(err)) {
        toast.error(getApiErrorMessage(err, 'Cập nhật thất bại'));
      }
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
    <div className="space-y-6 font-body-md">
      <section className="rounded-[8px] border border-border bg-bg-elevated shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">Hồ sơ của tôi</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Quản lý thông tin hồ sơ để bảo mật tài khoản và cá nhân hóa trải nghiệm mua sắm.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-success/10 px-3 py-1.5 text-label-sm font-label-sm text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Đã xác minh
              </span>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 text-label-sm font-label-sm text-white hover:bg-primary/90 transition"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-outline-variant bg-surface px-4 py-2 text-label-sm font-label-sm text-on-surface-variant hover:border-error hover:text-error transition"
                >
                  <X className="h-3.5 w-3.5" />
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <div className="flex flex-col items-start">
              <AvatarUploadField
                currentUrl={avatarPreviewUrl ?? profile?.avatarUrl}
                displayName={fullName}
                disabled={!editing}
                className="items-start text-left sm:flex-col sm:items-start"
                onFileSelected={(file, preview) => {
                  setPendingAvatarFile(file);
                  setAvatarPreviewUrl(preview);
                }}
              />
              <p className="mt-3 text-label-sm font-label-sm text-on-surface-variant">
                Dung lượng tối đa 1MB
                <br />
                Định dạng: JPEG, PNG
              </p>
              {pendingAvatarFile && editing && (
                <p className="mt-3 w-full rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-label-sm font-label-sm text-amber-700">
                  Đã chọn: {pendingAvatarFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <p className="text-body-md text-on-surface-variant">Tên đăng nhập</p>
              <DisabledRow label="Tên đăng nhập" value={profile?.username} icon={UserRound} />
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <p className="text-body-md text-on-surface-variant">Email</p>
              <DisabledRow label="Email" value={profile?.email} icon={Mail} />
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <label className="text-body-md text-on-surface-variant">Họ</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                className="w-full rounded-[8px] border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Nguyễn"
                disabled={!editing}
              />
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <label className="text-body-md text-on-surface-variant">Tên</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                className="w-full rounded-[8px] border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Văn A"
                disabled={!editing}
              />
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <label className="text-body-md text-on-surface-variant">Số điện thoại</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-[8px] border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="09xx xxx xxx"
                disabled={!editing}
              />
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <label className="text-body-md text-on-surface-variant">Giới tính</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                className="w-full rounded-[8px] border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-70"
                disabled={!editing}
              >
                <option value="">-- Chọn --</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="grid items-center gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
              <label className="text-body-md text-on-surface-variant">Ngày sinh</label>
              <div className="max-w-xs">
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  className="w-full rounded-[8px] border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface outline-none focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!editing}
                />
              </div>
            </div>

            {editing ? (
              <>
                <div className="flex items-start gap-2 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-label-sm font-label-sm text-amber-700">Tên đăng nhập và email không thể thay đổi.</p>
                </div>
                <div className="flex justify-start">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-6 py-2.5 text-title-lg font-title-lg text-white hover:bg-primary/90 disabled:opacity-60 transition"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu thay đổi
                  </button>
                </div>
              </>
            ) : (
              <p className="text-label-sm font-label-sm text-on-surface-variant">Vai trò tài khoản: {profile?.role || 'CUSTOMER'}</p>
            )}
          </div>

        </div>
      </section>

      <AddressBookSection enabled={!!userId} />
    </div>
  );
}
