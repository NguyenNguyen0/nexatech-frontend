'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type EmailOtpGateProps = {
  open: boolean;
  verifying: boolean;
  resending: boolean;
  resendCooldownSec: number;
  otpCode: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onAbort: () => void;
  /** Mặc định: copy đăng nhập. Truyền khi dùng sau bước đăng ký. */
  title?: string;
  description?: string;
  abortLabel?: string;
};

/**
 * Bước xác minh email (OTP 6 số) sau **mỗi** lần đăng nhập (step-up).
 * API: POST /api/v1/users/me/onboarding/request-otp | verify-otp
 * (`onBoarded` trên user vẫn được backend set `true` lần đầu verify thành công.)
 */
export function EmailOtpGate({
  open,
  verifying,
  resending,
  resendCooldownSec,
  otpCode,
  onOtpChange,
  onVerify,
  onResend,
  onAbort,
  title = 'Xác minh email',
  description = 'Mỗi lần đăng nhập cần nhập mã OTP 6 ký tự vừa gửi tới email của bạn.',
  abortLabel = 'Hủy (xóa phiên đăng nhập)',
}: EmailOtpGateProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-otp-title"
    >
      <Card className="w-full max-w-md border-border shadow-2xl">
        <CardHeader className="space-y-1 pb-2">
          <h2 id="email-otp-title" className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-text-tertiary">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={otpCode}
            onChange={(e) => onOtpChange(e.target.value.replace(/\s+/g, ''))}
            placeholder="Nhập OTP"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            className="h-11 text-center text-lg tracking-widest"
          />
          <p className="text-xs text-text-tertiary">
            {resendCooldownSec > 0
              ? `Gửi lại OTP sau ${resendCooldownSec}s`
              : 'Bạn có thể gửi lại OTP ngay bây giờ'}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onAbort} disabled={verifying || resending}>
              {abortLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onResend}
              disabled={resending || verifying || resendCooldownSec > 0}
            >
              {resending ? 'Đang gửi…' : 'Gửi lại OTP'}
            </Button>
            <Button type="button" onClick={onVerify} disabled={verifying || otpCode.trim().length < 6}>
              {verifying ? 'Đang xác minh…' : 'Xác minh'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
