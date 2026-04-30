import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
};

export default function ForgotPasswordPage() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        {/* Brand side */}
        <div className="hidden lg:flex flex-col items-center justify-center text-white text-center animate-in fade-in slide-in-from-left-8 duration-700">
          <Image
            src="/logo/nexatech.png"
            alt="NexaTech"
            width={400}
            height={120}
            className="h-24 w-auto object-contain brightness-0 invert mb-8"
            priority
          />
          <p className="text-xl text-white/80 max-w-md">
            Nền tảng thương mại điện tử hàng đầu Việt Nam
          </p>
        </div>

        {/* Form side */}
        <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/nexatech.png"
              alt="NexaTech"
              className="h-14 w-auto object-contain mx-auto mb-5 lg:hidden"
            />
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Quên mật khẩu</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Nhập email để nhận hướng dẫn</p>
            <p className="text-center text-muted-foreground">Forgot password form — to be implemented</p>
          </div>
        </div>
      </div>
    </section>
  );
}
