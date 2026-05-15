'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn, signOut } from 'next-auth/react';
import { Eye, EyeOff, Loader2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { EmailOtpGate } from '@/features/auth/components/email-otp-gate';
import {
  register,
  requestEmailOtp,
  verifyEmailOtp,
  getApiErrorMessage,
} from '@/features/auth/services/auth-api';
import { authStorage } from '@/features/auth/utils/auth-storage';

type Step = 'credentials' | 'profile';

/** Tên đăng nhập Keycloak-friendly: chữ, số, dấu chấm, gạch. */
const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{2,48})[a-zA-Z0-9]$/;

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 2
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  // Submit + OTP
  const [submitting, setSubmitting] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!otpOpen || resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpOpen, resendCooldown]);

  // --- Step 1 ---
  function handleCredentialsNext(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setStep('profile');
  }

  // --- Step 2 submit: register + login + OTP ---
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const userNameNorm = normalizeUsername(username);
    if (!userNameNorm) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (userNameNorm.length < 3 || !USERNAME_PATTERN.test(userNameNorm)) {
      toast.error(
        'Tên đăng nhập 4–50 ký tự, chỉ gồm chữ/số, . _ - và bắt đầu/kết thúc bằng chữ hoặc số',
      );
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    setSubmitting(true);
    try {
      // Tạo tài khoản với toàn bộ thông tin đã thu thập
      await register({
        username: userNameNorm,
        email,
        enabled: true,
        role: 'CUSTOMER',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        dob: dob || undefined,
        gender: gender || undefined,
        credentials: [{ type: 'password', value: password, temporary: false }],
      });

      // Đăng nhập để lấy token
      const result = await signIn('credentials', {
        username: userNameNorm,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Tạo tài khoản thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập thủ công.');
        router.push('/auth/login');
        return;
      }

      const session = await getSession();
      if (session?.accessToken && session.refreshToken) {
        authStorage.setTokens(session.accessToken, session.refreshToken);
      }

      // Gửi OTP xác minh email (cơ chế có sẵn)
      await requestEmailOtp();
      setOtpCode('');
      setResendCooldown(30);
      setOtpOpen(true);
      toast.info('Kiểm tra email — nhập OTP 6 ký tự để hoàn tất đăng ký.');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Đăng ký thất bại');
      const low = msg.toLowerCase();
      if (low.includes('email') && (low.includes('exist') || low.includes('taken') || low.includes('đã'))) {
        setStep('credentials');
        toast.error('Email đã được sử dụng. Vui lòng dùng email khác.');
      } else if (low.includes('username') || low.includes('user name') || low.includes('tên đăng nhập')) {
        toast.error(msg.includes('đã') || low.includes('exist') || low.includes('taken')
          ? 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.'
          : msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // --- OTP handlers ---
  async function handleVerifyOtp() {
    if (otpCode.trim().length < 6) {
      toast.error('OTP cần đủ 6 ký tự');
      return;
    }
    setVerifyingOtp(true);
    try {
      await verifyEmailOtp(otpCode.trim());
      // Đăng ký hoàn tất — đăng xuất session tạm và yêu cầu user đăng nhập lại bằng password
      authStorage.clear();
      await signOut({ redirect: false });
      setOtpOpen(false);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      router.push('/auth/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'OTP không hợp lệ hoặc đã hết hạn'));
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setResendingOtp(true);
    try {
      await requestEmailOtp();
      setResendCooldown(30);
      toast.success('Đã gửi lại OTP tới email của bạn');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi lại OTP'));
    } finally {
      setResendingOtp(false);
    }
  }

  async function handleAbortOtp() {
    authStorage.clear();
    setOtpOpen(false);
    setOtpCode('');
    await signOut({ redirect: false });
    toast.info('Đã hủy đăng ký.');
  }

  return (
    <>
      <Card className="w-full max-w-[480px] shadow-2xl border-none overflow-hidden rounded-[20px] my-5">
        <CardContent className="p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="space-y-1">
            {step === 'profile' && (
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            )}
            <div className="flex items-center justify-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {step === 'credentials' ? 'Đăng ký NexaTech' : 'Hoàn thiện hồ sơ'}
              </h2>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {step === 'credentials'
                ? 'Bước 1 / 2 — Thông tin đăng nhập'
                : 'Bước 2 / 2 — Thông tin cá nhân'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'profile' ? 'bg-primary' : 'bg-border'}`} />
          </div>

          {/* Step 1: Credentials */}
          {step === 'credentials' && (
            <form className="space-y-4" onSubmit={handleCredentialsNext}>
              <div className="space-y-1">
                <label htmlFor="reg-email" className="sr-only">Email</label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1 relative">
                <label htmlFor="reg-password" className="sr-only">Mật khẩu</label>
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu (ít nhất 8 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="space-y-1 relative">
                <label htmlFor="reg-confirm" className="sr-only">Xác nhận mật khẩu</label>
                <Input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl pr-10"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
              >
                Tiếp theo
              </Button>

              <div className="relative flex items-center py-2" aria-hidden="true">
                <div className="grow border-t border-border/60" />
                <span className="shrink mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">Hoặc</span>
                <div className="grow border-t border-border/60" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={() => toast.info('Tính năng này chưa được triển khai')}
                  variant="outline"
                  className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                >
                  <FaFacebook className="h-5 w-5 text-[#1877F2]" />
                  Facebook
                </Button>
                <Button
                  type="button"
                  onClick={() => toast.info('Tính năng này chưa được triển khai')}
                  variant="outline"
                  className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                >
                  <FcGoogle className="h-5 w-5" />
                  Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
                Bạn đã có tài khoản?{' '}
                <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Profile */}
          {step === 'profile' && (
            <form className="space-y-4" onSubmit={(e) => void handleProfileSubmit(e)}>
              <div className="space-y-1">
                <label htmlFor="reg-username" className="text-sm font-medium text-foreground">
                  Tên đăng nhập <span className="text-destructive">*</span>
                </label>
                <Input
                  id="reg-username"
                  placeholder="vidu_nexatech"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 rounded-xl"
                  autoComplete="username"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Dùng để đăng nhập. 4–50 ký tự: chữ, số, dấu chấm, gạch ngang, gạch dưới.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="reg-lastname" className="text-sm font-medium text-foreground">
                    Họ <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="reg-lastname"
                    placeholder="Nguyễn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-firstname" className="text-sm font-medium text-foreground">
                    Tên <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="reg-firstname"
                    placeholder="Văn A"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-phone" className="text-sm font-medium text-foreground">
                  Số điện thoại
                </label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl"
                  autoComplete="tel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="reg-dob" className="text-sm font-medium text-foreground">
                    Ngày sinh
                  </label>
                  <Input
                    id="reg-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-11 rounded-xl"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="reg-gender" className="text-sm font-medium text-foreground">
                    Giới tính
                  </label>
                  <select
                    id="reg-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground space-y-0.5">
                <p>
                  <span className="font-medium text-foreground">Email:</span> {email}
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang tạo tài khoản…
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <EmailOtpGate
        open={otpOpen}
        verifying={verifyingOtp}
        resending={resendingOtp}
        resendCooldownSec={resendCooldown}
        otpCode={otpCode}
        onOtpChange={setOtpCode}
        onVerify={() => void handleVerifyOtp()}
        onResend={() => void handleResendOtp()}
        onAbort={() => void handleAbortOtp()}
        title="Xác minh email để hoàn tất đăng ký"
        description="Nhập mã OTP 6 ký tự vừa gửi tới email của bạn. Bước này chỉ cần một lần sau khi tạo tài khoản."
        abortLabel="Hủy và đăng xuất"
      />
    </>
  );
}
