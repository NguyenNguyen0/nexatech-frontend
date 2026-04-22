// import { Header } from 'host-app/components/home/Header';
import { AuthHeader } from '@/components/custom/auth/auth-header';
import { AuthFooter } from '@/components/custom/auth/auth-footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/10">
            <AuthHeader />
            <main className="grow flex flex-col items-center justify-center">{children}</main>
            <AuthFooter />
        </div>
    );
}
