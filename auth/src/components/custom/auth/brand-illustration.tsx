import Image from 'next/image';

export function BrandIllustration() {
    return (
        <div className="hidden lg:flex flex-col items-center justify-center text-white space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="relative group">
                <div
                    className="absolute -inset-4 bg-white/20 blur-3xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity"
                    aria-hidden="true"
                />
                <Image
                    src="/brand/nexatech-logo-transparent-bg.png"
                    alt="Nexatech Branding Illustration"
                    width={450}
                    height={450}
                    className="relative drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-transform hover:scale-105"
                    priority
                />
            </div>
            <div className="text-center space-y-4 max-w-md">
                <h2 className="text-4xl font-bold tracking-tight drop-shadow-lg">
                    Nền tảng thương mại chuyên đồ công nghệ
                </h2>
            </div>
        </div>
    );
}

export function BackgroundBranding() {
    return (
        <div
            className="absolute inset-0 flex items-center justify-start pointer-events-none opacity-10 blur-[1px]"
            aria-hidden="true"
        >
            <div className="transform -translate-x-[15%] scale-[1.5]">
                <Image src="/brand/nexatech-logo-transparent-bg.png" alt="" width={800} height={800} priority />
            </div>
        </div>
    );
}
