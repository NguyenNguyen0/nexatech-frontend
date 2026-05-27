'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { EmailOtpGate } from '@/features/auth/components/email-otp-gate';
import { getApiErrorMessage, requestEmailOtp, verifyEmailOtp } from '@/features/auth/services/auth-api';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') ?? '/';
    const { data: session, status, update } = useSession();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [pending, setPending] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendingOtp, setResendingOtp] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const googleErrorHandled = useRef(false);
    const otpBootstrapStarted = useRef(false);

    function otpSentStorageKey(userId: string | undefined) {
        return userId ? `nexatech:otp-sent:${userId}` : null;
    }

    function markOtpSent(userId: string | undefined) {
        const key = otpSentStorageKey(userId);
        if (key) sessionStorage.setItem(key, String(Date.now()));
    }

    function hasRecentOtpSent(userId: string | undefined, withinMs = 60_000) {
        const key = otpSentStorageKey(userId);
        if (!key) return false;
        const raw = sessionStorage.getItem(key);
        if (!raw) return false;
        const ts = Number(raw);
        return Number.isFinite(ts) && Date.now() - ts < withinMs;
    }

    function clearOtpSent(userId: string | undefined) {
        const key = otpSentStorageKey(userId);
        if (key) sessionStorage.removeItem(key);
    }

    function trustedDeviceStorageKey(userId: string | undefined) {
        return userId ? `nexatech:trusted-device:${userId}` : null;
    }

    function isTrustedDevice(userId: string | undefined) {
        if (typeof window === 'undefined') return false;
        const key = trustedDeviceStorageKey(userId);
        return key ? localStorage.getItem(key) === 'true' : false;
    }

    function trustCurrentDevice(userId: string | undefined) {
        if (typeof window === 'undefined') return;
        const key = trustedDeviceStorageKey(userId);
        if (key) localStorage.setItem(key, 'true');
    }

    useEffect(() => {
        if (!otpOpen || resendCooldown <= 0) return;
        const timer = window.setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [otpOpen, resendCooldown]);

    useEffect(() => {
        const authError = searchParams.get('error');
        const reason = searchParams.get('reason');
        if (reason === 'sessionRevoked' && !googleErrorHandled.current) {
            googleErrorHandled.current = true;
            toast.error('Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.');
        } else if (reason === 'accountDisabled' && !googleErrorHandled.current) {
            googleErrorHandled.current = true;
            toast.error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
        } else if (authError && !googleErrorHandled.current) {
            googleErrorHandled.current = true;
            if (authError === 'AccountDisabled') {
                toast.error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
            } else if (authError === 'AccessDenied') {
                toast.error('Tài khoản này không có quyền truy cập vào hệ thống khách hàng.');
            } else {
                toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
            }
        }
    }, [searchParams]);

    /** OTP chỉ sau đăng nhập mật khẩu (`otpStepUpPending`). Google không qua bước này. */
    useEffect(() => {
        if (status !== 'authenticated') {
            otpBootstrapStarted.current = false;
            return;
        }

        if (session?.googleNewRegistration) {
            return;
        }

        if (session?.error && !session.accessToken) {
            if (!googleErrorHandled.current) {
                googleErrorHandled.current = true;
                if (session.error === 'AccountDisabled') {
                    toast.error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
                } else {
                    toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
                }
            }
            void signOut({ redirect: false });
            return;
        }

        if (!session?.accessToken || !session.refreshToken) return;
        if (session.otpStepUpPending !== true) return;

        authStorage.setTokens(session.accessToken, session.refreshToken);

        const userId = session.user?.id;

        if (isTrustedDevice(userId) && !otpBootstrapStarted.current) {
            otpBootstrapStarted.current = true;
            void update({ otpStepUpComplete: true }).then(() => {
                finishLoginRedirect();
            });
            return;
        }

        if (hasRecentOtpSent(userId)) {
            setOtpOpen(true);
        }
    }, [
        status,
        session?.user?.id,
        session?.otpStepUpPending,
        session?.accessToken,
        session?.refreshToken,
        session?.error,
    ]);

    function finishLoginRedirect() {
        router.push(callbackUrl);
        router.refresh();
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        try {
            const result = await signIn('credentials', {
                username: identifier.trim(),
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                if (result.error.includes('AccountDisabled') || result.code === 'AccountDisabled') {
                    toast.error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
                } else if (result.error.includes('AccessDenied') || result.code === 'AccessDenied') {
                    toast.error('Tài khoản này không có quyền truy cập vào hệ thống khách hàng.');
                } else {
                    toast.error('Đăng nhập thất bại. Kiểm tra thông tin đăng nhập và mật khẩu.');
                }
                return;
            }

            const session = await getSession();
            if (session?.accessToken && session.refreshToken) {
                authStorage.setTokens(session.accessToken, session.refreshToken);
            } else {
                toast.error('Không lấy được phiên đăng nhập. Thử lại.');
                return;
            }

            if (session.otpStepUpPending !== true) {
                finishLoginRedirect();
                return;
            }

            const userId = session.user?.id;
            if (isTrustedDevice(userId)) {
                try {
                    await update({ otpStepUpComplete: true });
                } catch {
                    toast.error('Không thể cập nhật phiên đăng nhập. Vui lòng thử lại.');
                    return;
                }
                finishLoginRedirect();
                return;
            }

            if (hasRecentOtpSent(userId)) {
                setOtpOpen(true);
                return;
            }

            otpBootstrapStarted.current = true;
            markOtpSent(userId);
            await requestEmailOtp();
            setOtpCode('');
            setResendCooldown(30);
            setOtpOpen(true);
            toast.info('Kiểm tra email — nhập OTP 6 ký tự (bắt buộc mỗi lần đăng nhập).');
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Đăng nhập hoặc kiểm tra tài khoản thất bại'));
        } finally {
            setPending(false);
        }
    }

    async function handleVerifyOtp() {
        if (otpCode.trim().length < 6) {
            toast.error('OTP cần đủ 6 ký tự');
            return;
        }
        setVerifyingOtp(true);
        try {
            await verifyEmailOtp(otpCode.trim());
            try {
                await update({ otpStepUpComplete: true });
            } catch {
                toast.error('Đã xác minh OTP nhưng không cập nhật được phiên. F5 trang rồi thử lại.');
                return;
            }
            trustCurrentDevice(session?.user?.id);
            clearOtpSent(session?.user?.id);
            otpBootstrapStarted.current = false;
            setOtpOpen(false);
            toast.success('Xác minh email thành công');
            finishLoginRedirect();
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
            markOtpSent(session?.user?.id);
            setResendCooldown(30);
            toast.success('Đã gửi lại OTP tới email của bạn');
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Không thể gửi lại OTP'));
        } finally {
            setResendingOtp(false);
        }
    }

    function handleGoogleSignIn() {
        googleErrorHandled.current = false;
        otpBootstrapStarted.current = false;
        clearOtpSent(session?.user?.id);
        setOtpOpen(false);
        const loginCallback = `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        void signIn('google', { callbackUrl: loginCallback });
    }

    async function handleAbortOtp() {
        authStorage.clear();
        clearOtpSent(session?.user?.id);
        otpBootstrapStarted.current = false;
        setOtpOpen(false);
        setOtpCode('');
        await signOut({ redirect: false });
        toast.info('Đã hủy. Đăng nhập lại khi bạn sẵn sàng xác minh email.');
    }

    return (
        <>
            <Card className="w-full max-w-[450px] shadow-2xl border border-border/60 overflow-hidden rounded-md">
                <CardContent className="p-8 sm:p-10 space-y-6 relative">
                    <div className="flex items-center justify-center">
                        <h2 className="text-2xl font-semibold text-foreground">Đăng nhập NexaTech</h2>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <label htmlFor="auth-identifier" className="sr-only">
                                Tên đăng nhập, email hoặc số điện thoại
                            </label>
                            <Input
                                id="auth-identifier"
                                type="text"
                                name="username"
                                autoComplete="username"
                                placeholder="Tên đăng nhập / Email / Số điện thoại"
                                className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-sm"
                                required
                                value={identifier}
                                onChange={(ev) => setIdentifier(ev.target.value)}
                                disabled={pending || otpOpen}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="auth-password" className="sr-only">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Input
                                    id="auth-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Mật khẩu"
                                    className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-sm pr-12"
                                    required
                                    value={password}
                                    onChange={(ev) => setPassword(ev.target.value)}
                                    disabled={pending || otpOpen}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                                    onClick={() => setShowPassword((value) => !value)}
                                    disabled={pending || otpOpen}
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={pending || otpOpen}
                            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-sm transition-all active:scale-[0.98]"
                        >
                            {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
                        </Button>

                        <div className="flex justify-end text-xs text-primary font-medium">
                            <Link href="/auth/forgot-password" className="hover:underline">
                                Quên mật khẩu
                            </Link>
                        </div>
                    </form>

                    <div className="relative flex items-center py-2" aria-hidden="true">
                        <div className="grow border-t border-border/60"></div>
                        <span className="shrink mx-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            Hoặc
                        </span>
                        <div className="grow border-t border-border/60"></div>
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <Button
                            onClick={handleGoogleSignIn}
                            variant="outline"
                            className="w-full h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-sm"
                            aria-label="Đăng nhập với Google"
                            type="button"
                            disabled={pending || otpOpen}
                        >
                            <FcGoogle className="h-5 w-5" />
                            Google
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
                        Bạn mới biết đến Nexatech?{' '}
                        <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                            Đăng ký
                        </Link>
                    </div>
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
            />
        </>
    );
}
