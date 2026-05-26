'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { changePassword, getApiErrorMessage, logout } from '@/features/auth/services/auth-api';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { signOut } from 'next-auth/react';

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">{label}</label>
      <div className="relative mt-1">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-sm border border-border bg-bg-base px-4 py-2.5 pr-10 text-sm text-text-primary outline-none focus:border-primary transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-text-tertiary">{hint}</p>}
    </div>
  );
}

export default function AccountPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công. Đang đăng xuất...');

      // Keycloak invalidates all sessions on password change — force local logout too
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await logout(refreshToken).catch(() => {});
      }
      authStorage.clear();
      await signOut({ callbackUrl: '/auth/login' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Đổi mật khẩu thất bại'));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-bg-elevated p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bảo mật</p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">Đổi mật khẩu</h2>
            <p className="mt-0.5 text-sm text-text-secondary">Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordInput
            label="Mật khẩu hiện tại"
            value={oldPassword}
            onChange={setOldPassword}
            placeholder="••••••••"
          />
          <PasswordInput
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="••••••••"
            hint="Ít nhất 8 ký tự, bao gồm chữ và số."
          />
          <PasswordInput
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </section>

      {/* Security tip */}
      <section className="rounded-md border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
          <ShieldAlert className="h-4 w-4" />
          Lưu ý bảo mật
        </p>
        <ul className="mt-2 list-disc pl-5 text-xs text-amber-700 space-y-1">
          <li>Không chia sẻ mật khẩu với bất kỳ ai.</li>
          <li>Sử dụng mật khẩu độc đáo, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.</li>
          <li>Sau khi đổi mật khẩu, tất cả các phiên đăng nhập khác sẽ bị yêu cầu đăng nhập lại.</li>
        </ul>
      </section>
    </div>
  );
}
