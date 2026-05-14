import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/app/auth/login/components/login-form';
import { BrandIllustration, BackgroundBranding } from '@/components/custom/auth/brand-illustration';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
    title: 'Đăng nhập - Nexatech | Thương mại điện tử số 1 Việt Nam',
    description: 'Đăng nhập vào Nexatech để trải nghiệm mua sắm trực tuyến tuyệt vời với hàng ngàn ưu đãi hấp dẫn.',
    openGraph: {
        title: 'Đăng nhập - Nexatech',
        description: 'Nền tảng thương mại điện tử yêu thích ở Việt Nam',
        images: ['/brand/nexatech-logo-transparent-bg.png'],
    },
};

export default function LoginPage() {
    return (
        <section className="relative w-full min-h-[600px] flex items-center justify-center bg-primary overflow-hidden sm:px-6 lg:px-8">
            <BackgroundBranding />

            <div className="z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
                <BrandIllustration />

                <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-500">
                    <Suspense fallback={<div className="w-full max-w-[450px] h-96 rounded-[20px] bg-card/40 animate-pulse" />}>
                        <LoginForm />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}
