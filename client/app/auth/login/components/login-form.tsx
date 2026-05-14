'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

export function LoginForm() {
    return (
        <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden rounded-[20px]">
            <CardContent className="p-8 sm:p-10 space-y-6 relative">
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-foreground">Đăng nhập NexaTech</h2>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
                    >
                        Đăng nhập
                    </Button>

                    <div className="flex justify-between text-xs text-primary font-medium">
                        <Link href="/forgot-password" className="hover:underline">
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
                    >
                        <FaFacebook className="h-5 w-5 text-[#1877F2]" />
                        Facebook
                    </Button>
                    <Button
                        onClick={() => toast.info('Tính năng này chưa được triển khai')}
                        variant="outline"
                        className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                        aria-label="Đăng nhập với Google"
                    >
                        <FcGoogle className="h-5 w-5" />
                        Google
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
                    Bạn mới biết đến Nexatech?{' '}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Đăng ký
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
