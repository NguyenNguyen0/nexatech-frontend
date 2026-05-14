'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
    return (
        <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden rounded-[20px]">
            <CardContent className="p-8 sm:p-10 space-y-8 relative">
                <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h2 className="text-2xl font-semibold text-foreground">Đặt lại mật khẩu NexaTech</h2>
                </div>

                <form className="space-y-6">
                    <div className="space-y-1">
                        <label htmlFor="forgot-identifier" className="sr-only">
                            Email / Số điện thoại / Tên đăng nhập
                        </label>
                        <Input
                            id="forgot-identifier"
                            type="text"
                            placeholder="Email / Số điện thoại / Tên đăng nhập"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                        />
                    </div>

                    <Button
                        onClick={() => toast.info('Tính năng này đang được phát triển')}
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
                    >
                        Gửi
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Đăng nhập
                    </Link>{' '}
                    |{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Đăng ký
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
