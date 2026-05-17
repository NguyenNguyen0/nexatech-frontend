'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '@/lib/axios-client';
import { authPaths } from '@/lib/constants';
import type { ApiResponse } from '@/types/auth';

export function ForgotPasswordForm() {
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) {
            toast.error('Vui lòng nhập Email hoặc Tên đăng nhập');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axiosClient.post<ApiResponse<void>>(
                authPaths.forgotPassword,
                { identifier: identifier.trim() },
            );
            if (data.code !== 1000) {
                throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
            }
            setIsSuccess(true);
            toast.success('Yêu cầu đã được gửi!');
        } catch (error: unknown) {
            console.error('Forgot password error:', error);
            const message =
                error instanceof Error
                    ? error.message
                    : (error as { response?: { data?: { message?: string } } })?.response?.data
                          ?.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden rounded-[20px]">
                <CardContent className="p-8 sm:p-10 space-y-6 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ArrowLeft className="h-8 w-8 text-primary rotate-180" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">Kiểm tra email của bạn</h2>
                    <p className="text-muted-foreground">
                        Nếu tài khoản tồn tại, chúng tôi đã gửi một mật khẩu mới đến email của bạn. 
                        Vui lòng kiểm tra hộp thư đến (và cả thư rác).
                    </p>
                    <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl">
                        <Link href="/auth/login">Quay lại đăng nhập</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden rounded-[20px]">
            <CardContent className="p-8 sm:p-10 space-y-8 relative">
                <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-foreground">Đặt lại mật khẩu</h2>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label htmlFor="forgot-identifier" className="sr-only">
                            Email / Số điện thoại / Tên đăng nhập
                        </label>
                        <Input
                            id="forgot-identifier"
                            type="text"
                            placeholder="Email / Số điện thoại / Tên đăng nhập"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            'Gửi yêu cầu'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
