import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconBrandGoogle } from '@tabler/icons-react';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage, login, persistTokensFromExchange, requestEmailOtp, verifyEmailOtp } from '@/services/authApi';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useNavigate } from 'react-router-dom';
import { clearAuthTokens, getAccessToken, getDefaultPathByRole, getRolesFromAccessToken, isOtpStepUpPending, setOtpStepUpPending, clearOtpStepUpPending, setPasswordChangeRequired } from '@/services/authSession';

interface LoginFormProps {
    /** Omitted when internal registration is disabled (production). */
    toggleMode?: () => void;
}

export function LoginForm({ toggleMode }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [resendingOtp, setResendingOtp] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (getAccessToken() && isOtpStepUpPending()) {
            setOtpDialogOpen(true);
        }
    }, []);

    useEffect(() => {
        if (!otpDialogOpen || resendCooldown <= 0) return;
        const timer = window.setInterval(() => {
            setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [otpDialogOpen, resendCooldown]);

    function continueAfterLoginChecks() {
        const token = getAccessToken();
        const roles = getRolesFromAccessToken(token);
        if (roles.includes('CUSTOMER')) {
            clearAuthTokens();
            toast.error('Your action is not allowed with role CUSTOMER');
            navigate('/auth', { replace: true });
            return;
        }

        const path = getDefaultPathByRole(roles);
        navigate(path, { replace: true });
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await login({
                username: username.trim(),
                password,
            });
            persistTokensFromExchange(result);

            if (result.requires_password_change) {
                setPasswordChangeRequired(true);
            }
            await requestEmailOtp();
            setOtpStepUpPending();
            setOtpCode('');
            setResendCooldown(30);
            setOtpDialogOpen(true);
            toast.info('Nhập OTP email vừa gửi để xác minh chính chủ (bắt buộc mỗi lần đăng nhập).');
        } catch (err) {
            clearAuthTokens();
            toast.error(getApiErrorMessage(err, 'Login failed'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleVerifyOtp() {
        if (otpCode.trim().length < 6) {
            toast.error('OTP phai du 6 ky tu');
            return;
        }
        setVerifyingOtp(true);
        try {
            await verifyEmailOtp(otpCode.trim());
            clearOtpStepUpPending();
            setOtpDialogOpen(false);
            toast.success('Email verification successful');
            continueAfterLoginChecks();
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'OTP khong hop le hoac da het han'));
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
            toast.success('Da gui lai OTP den email cua ban');
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Khong the gui lai OTP'));
        } finally {
            setResendingOtp(false);
        }
    }

    function handleLogoutFromOtpDialog() {
        clearAuthTokens();
        setOtpDialogOpen(false);
        setOtpCode('');
        toast.info('Ban da dang xuat. Vui long dang nhap lai khi muon xac minh email');
        navigate('/auth', { replace: true });
    }

    return (
        <>
            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username / Email</Label>
                            <Input
                                id="username"
                                placeholder="name@example.com"
                                type="text"
                                autoCapitalize="none"
                                autoComplete="username"
                                autoCorrect="off"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={submitting}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <ForgotPasswordModal />
                            </div>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={submitting} />
                        </div>
                        <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-light)]"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>
                </form>
                {toggleMode && (
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <button type="button" onClick={toggleMode} className="font-medium text-primary underline-offset-4 hover:underline hover:text-[var(--color-primary-light)]">
                            Sign up
                        </button>
                    </p>
                )}
            </div>
            <Dialog open={otpDialogOpen} onOpenChange={() => {}}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Verify Email</DialogTitle>
                        <DialogDescription>
                            Mỗi lần đăng nhập cần nhập mã OTP 6 ký tự gửi tới email của bạn (xác minh chính chủ).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ''))} placeholder="Enter OTP" maxLength={6} autoFocus />
                        <div className="text-xs text-muted-foreground">{resendCooldown > 0 ? `You can resend OTP in ${resendCooldown}s` : 'You can resend OTP now'}</div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleLogoutFromOtpDialog} disabled={verifyingOtp || resendingOtp}>
                            Hủy (xóa phiên)
                        </Button>
                        <Button variant="outline" onClick={handleResendOtp} disabled={resendingOtp || verifyingOtp || resendCooldown > 0}>
                            {resendingOtp ? 'Resending...' : 'Resend OTP'}
                        </Button>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-light)]"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otpCode.trim().length < 6}
                        >
                            {verifyingOtp ? 'Verifying...' : 'Verify'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
