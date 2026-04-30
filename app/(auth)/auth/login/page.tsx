import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào Nexatech để trải nghiệm mua sắm trực tuyến tuyệt vời.',
};

export default function LoginPage() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        {/* Brand side */}
        <div className="hidden lg:flex flex-col items-center justify-center text-white text-center animate-in fade-in slide-in-from-left-8 duration-700">
          <Image
            src="/logo/nexatech.png"
            alt="NexaTech"
            width={280}
            height={80}
            className="h-16 w-auto object-contain brightness-0 invert mb-6"
            priority
          />
          <p className="text-xl text-white/80 max-w-md">
            Nền tảng thương mại điện tử hàng đầu Việt Nam
          </p>
        </div>

        {/* Form side */}
        <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-500">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
