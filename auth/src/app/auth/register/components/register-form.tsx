'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Chrome, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage, register } from '@/lib/authApi';
import type { RegisterRequestInput } from '@/types/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<'' | 'MALE' | 'FEMALE' | 'OTHER'>('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const u = username.trim();
        const em = email.trim();
        const fn = firstName.trim();
        const ln = lastName.trim();

        if (!u) {
            toast.error('Vui lòng nhập tên đăng nhập.');
            return;
        }
        if (!EMAIL_RE.test(em)) {
            toast.error('Vui lòng nhập email hợp lệ.');
            return;
        }
        if (!fn || !ln) {
            toast.error('Vui lòng nhập họ và tên.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Mật khẩu nhập lại không khớp.');
            return;
        }

        const body: RegisterRequestInput = {
            username: u,
            email: em,
            enabled: true,
            firstName: fn,
            lastName: ln,
            phone: phone.trim() || undefined,
            dob: dob || undefined,
            gender: gender || undefined,
            onBoarded: false,
            credentials: [{ type: 'password', value: password, temporary: false }],
        };

        setSubmitting(true);
        try {
            const userId = await register(body);
            toast.success(`Đăng ký thành công. Mã người dùng: ${userId}`);
            router.push('/auth/login');
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Đăng ký thất bại'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card className="w-full max-w-[480px] shadow-2xl border-none overflow-hidden rounded-[20px] my-5">
            <CardContent className="p-8 sm:p-10 space-y-6">
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-foreground">Đăng ký NexaTech</h2>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="reg-username">Tên đăng nhập</Label>
                        <Input
                            id="reg-username"
                            type="text"
                            placeholder="username"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                            value={username}
                            onChange={(ev) => setUsername(ev.target.value)}
                            autoComplete="username"
                            disabled={submitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                            id="reg-email"
                            type="email"
                            placeholder="email@example.com"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                            value={email}
                            onChange={(ev) => setEmail(ev.target.value)}
                            autoComplete="email"
                            disabled={submitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reg-firstname">Tên</Label>
                            <Input
                                id="reg-firstname"
                                type="text"
                                placeholder="Minh"
                                className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                                required
                                value={firstName}
                                onChange={(ev) => setFirstName(ev.target.value)}
                                autoComplete="given-name"
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-lastname">Họ</Label>
                            <Input
                                id="reg-lastname"
                                type="text"
                                placeholder="Nguyen"
                                className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                                required
                                value={lastName}
                                onChange={(ev) => setLastName(ev.target.value)}
                                autoComplete="family-name"
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-password">Mật khẩu</Label>
                        <Input
                            id="reg-password"
                            type="password"
                            placeholder="Mật khẩu"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                            autoComplete="new-password"
                            disabled={submitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-confirm-password">Nhập lại mật khẩu</Label>
                        <Input
                            id="reg-confirm-password"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                            value={confirmPassword}
                            onChange={(ev) => setConfirmPassword(ev.target.value)}
                            autoComplete="new-password"
                            disabled={submitting}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reg-phone">Số điện thoại</Label>
                        <Input
                            id="reg-phone"
                            type="tel"
                            placeholder="098xxxxxxx"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            value={phone}
                            onChange={(ev) => setPhone(ev.target.value)}
                            autoComplete="tel"
                            disabled={submitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reg-dob">Ngày sinh</Label>
                            <Input
                                id="reg-dob"
                                type="date"
                                className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                                value={dob}
                                onChange={(ev) => setDob(ev.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-gender">Giới tính</Label>
                            <select
                                id="reg-gender"
                                className="h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                                value={gender}
                                onChange={(ev) => setGender(ev.target.value as '' | 'MALE' | 'FEMALE' | 'OTHER')}
                                disabled={submitting}
                            >
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
                        disabled={submitting}
                    >
                        {submitting ? 'Đang đăng ký…' : 'Đăng ký'}
                    </Button>
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
                        aria-label="Đăng ký với Facebook"
                        type="button"
                    >
                        <Facebook className="h-5 w-5 text-[#1877F2] fill-current" />
                        Facebook
                    </Button>
                    <Button
                        onClick={() => toast.info('Tính năng này chưa được triển khai')}
                        variant="outline"
                        className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                        aria-label="Đăng ký với Google"
                        type="button"
                    >
                        <Chrome className="h-5 w-5 text-destructive" />
                        Google
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
                    Bạn đã có tài khoản?{' '}
                    <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
