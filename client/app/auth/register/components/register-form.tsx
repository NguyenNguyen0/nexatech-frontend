'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FaFacebook } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

export function RegisterForm() {
    return (
        <Card className="w-full max-w-[450px] shadow-2xl border-none overflow-hidden rounded-[20px] my-5">
            <CardContent className="p-8 sm:p-10 space-y-6">
                <div className="flex items-center justify-center">
                    <h2 className="text-2xl font-semibold text-foreground">Đăng ký NexaTech</h2>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                        <label htmlFor="reg-email" className="sr-only">
                            Số điện thoại / Email
                        </label>
                        <Input
                            id="reg-email"
                            type="text"
                            placeholder="Số điện thoại / Email"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="reg-password" className="sr-only">
                            Mật khẩu
                        </label>
                        <Input
                            id="reg-password"
                            type="password"
                            placeholder="Mật khẩu"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="reg-confirm-password" className="sr-only">
                            Nhập lại mật khẩu
                        </label>
                        <Input
                            id="reg-confirm-password"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            className="h-12 border-border focus-visible:ring-primary/20 transition-all rounded-xl"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98]"
                    >
                        Đăng ký
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
                    >
                        <FaFacebook className="h-5 w-5 text-[#1877F2]" />
                        Facebook
                    </Button>
                    <Button
                        onClick={() => toast.info('Tính năng này chưa được triển khai')}
                        variant="outline"
                        className="h-12 border-border/60 hover:bg-muted/50 transition-all gap-2 rounded-xl"
                        aria-label="Đăng ký với Google"
                    >
                        <FcGoogle className="h-5 w-5" />
                        Google
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/40">
                    Bạn đã có tài khoản?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
