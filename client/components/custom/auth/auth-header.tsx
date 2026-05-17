import Image from 'next/image';
import Link from 'next/link';

export function AuthHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="flex items-center transition-opacity hover:opacity-80"
                    aria-label="Nexatech Home"
                >
                    <Image
                        src="/brand/nexatech-logo-transparent-bg.png"
                        alt="Nexatech Logo"
                        width={140}
                        height={40}
                        className="h-10 w-auto"
                        priority
                    />
                </Link>
                <Link href="/help" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                    Bạn cần giúp đỡ?
                </Link>
            </div>
        </header>
    );
}
