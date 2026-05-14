import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/app/forgot-password/components/forgot-password-form';
import { BrandIllustration, BackgroundBranding } from '@/components/custom/auth/brand-illustration';

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'),
    title: 'Đặt lại mật khẩu - Nexatech | Thương mại điện tử số 1 Việt Nam',
    description: 'Khôi phục mật khẩu Nexatech để tiếp tục trải nghiệm mua sắm trực tuyến tuyệt vời.',
    openGraph: {
        title: 'Đặt lại mật khẩu - Nexatech',
        description: 'Khôi phục mật khẩu tài khoản Nexatech của bạn',
        images: ['/brand/nexatech-logo-transparent-bg.png'],
    },
};

export default function ForgotPasswordPage() {
    return (
        <section className="relative w-full min-h-[600px] flex items-center justify-center bg-primary overflow-hidden sm:px-6 lg:px-8">
            <BackgroundBranding />

            <div className="z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
                <BrandIllustration />

                <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-500">
                    <ForgotPasswordForm />
                </div>
            </div>
        </section>
    );
}
