import type { Metadata } from 'next';
import { HomeClient } from './home-client';

export const metadata: Metadata = {
    title: 'Trang chủ - Nexatech',
    description: 'Nexatech host — trang chủ sau đăng nhập',
};

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
            <HomeClient />
        </div>
    );
}
