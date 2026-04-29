'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Chrome, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import {
    fetchOnboardingStatus,
    getApiErrorMessage,
    login,
    persistTokensFromExchange,
    requestEmailOtp,
    verifyEmailOtp,
} from '@/services/authApi';
import { authStorage } from '@/services/authStorage';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendingOtp, setResendingOtp] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (!otpDialogOpen || resendCooldown <= 0) return;
        const timer = window.setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [otpDialogOpen, resendCooldown]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await login({ username: username.trim(), password });
            persistTokensFromExchange(result);

            const onboarding = await fetchOnboardingStatus();
            if (!onboarding.onBoarded) {
                await requestEmailOtp();
                setOtpCode('');
                setResendCooldown(30);
                setOtpDialogOpen(true);
                toast.info('Vui lòng xác minh email bằng OTP để tiếp tục.');
                return;
            }

            toast.success('Đăng nhập thành công');
            // Full page reload is required so the host shell remounts the correct micro frontend.
            window.location.href = '/';
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Đăng nhập thất bại'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleVerifyOtp() {
        if (otpCode.trim().length < 6) {
            toast.error('OTP phải đủ 6 ký tự.');
            return;
        }
        setVerifyingOtp(true);
        try {
            await verifyEmailOtp(otpCode.trim());
            setOtpDialogOpen(false);
            toast.success('Xác minh email thành công');
            window.location.href = '/';
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'OTP không hợp lệ hoặc đã hết hạn.'));
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
            toast.success('Đã gửi lại OTP đến email của bạn.');
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Không thể gửi lại OTP.'));
        } finally {
            setResendingOtp(false);
        }
    }

    function handleLogoutFromOtpDialog() {
        authStorage.clear();
        setOtpDialogOpen(false);
        setOtpCode('');
        toast.info('Bạn đã đăng xuất. Vui lòng đăng nhập lại khi muốn xác minh email.');
    }

    return (
        <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden rounded-[20px]">
            <CardContent className="p-8 sm:p-10 space-y-6 relative">
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-foreground">Đăng nhập NexaTech</h2>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label htmlFor="auth-identifier" className="sr-only">
                            Email/Số điện thoại/Tên đăng nhập
                        </label>
                        <Input
                            id="auth-identifier"
                            type="text"
                            placeholder="Email/Số điện thoại/Tên đăng nhập"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                            value={username}
                            onChange={(ev) => setUsername(ev.target.value)}
                            autoComplete="username"
                            disabled={submitting}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="auth-password" className="sr-only">
                            Mật khẩu
                        </label>
                        <Input
                            id="auth-password"
                            type="password"
                            placeholder="Mật khẩu"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                            autoComplete="current-password"
                            disabled={submitting}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
                        disabled={submitting}
                    >
                        {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
                    </Button>

                    <div className="flex justify-between text-xs text-primary font-medium">
                        <Link href="/auth/forgot-password" className="hover:underline">
                            Quên mật khẩu
                        </Link>
                        <Link
                            onClick={() => toast.info('Tính năng này chưa được triển khai')}
                            href="#"
                            className="hover:underline"
                        >
                            Đăng nhập với SMS
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

                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={() => toast.info('Tính năng này chưa được triển khai')}
                        variant="outline"
                        className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                        aria-label="Đăng nhập với Facebook"
                        type="button"
                    >
                        <Facebook className="h-5 w-5 text-[#1877F2] fill-current" />
                        Facebook
                    </Button>
                    <Button
                        onClick={() => toast.info('Tính năng này chưa được triển khai')}
                        variant="outline"
                        className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                        aria-label="Đăng nhập với Google"
                        type="button"
                    >
                        <Chrome className="h-5 w-5 text-destructive" />
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
            <Dialog open={otpDialogOpen} onOpenChange={() => {}}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Xác minh email</DialogTitle>
                        <DialogDescription>
                            Nhập mã OTP gồm 6 ký tự đã gửi đến email của bạn. Bạn cần hoàn tất bước này để tiếp tục sử dụng hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))}
                            placeholder="Nhập OTP"
                            maxLength={6}
                            autoFocus
                        />
                        <div className="text-xs text-muted-foreground">
                            {resendCooldown > 0
                                ? `Bạn có thể gửi lại OTP sau ${resendCooldown}s`
                                : 'Bạn có thể gửi lại OTP ngay bây giờ'}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleLogoutFromOtpDialog} disabled={verifyingOtp || resendingOtp}>
                            Đăng xuất
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResendOtp}
                            disabled={resendingOtp || verifyingOtp || resendCooldown > 0}
                        >
                            {resendingOtp ? 'Đang gửi lại...' : 'Gửi lại OTP'}
                        </Button>
                        <Button onClick={handleVerifyOtp} disabled={verifyingOtp || otpCode.trim().length < 6}>
                            {verifyingOtp ? 'Đang xác minh...' : 'Xác minh'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
