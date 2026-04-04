'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { authStorage } from '@/lib/authStorage';
import { fetchUserInfo, getApiErrorMessage, logout } from '@/lib/authApi';
import type { UserInfoResult } from '@/types/auth';

/**
 * Trang chủ demo: chưa login → chào khách; đã login → tên user (userinfo).
 */
export function HomeClient() {
    const router = useRouter();
    const [hasToken, setHasToken] = useState(false);
    const [profile, setProfile] = useState<UserInfoResult | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const token = authStorage.getAccessToken();
        if (!token) {
            setHasToken(false);
            setProfile(null);
            setLoadError(null);
            setLoadingProfile(false);
            return;
        }

        setHasToken(true);
        setLoadingProfile(true);
        setLoadError(null);
        let cancelled = false;
        (async () => {
            try {
                const info = await fetchUserInfo();
                if (!cancelled) setProfile(info);
            } catch (e) {
                if (!cancelled) setLoadError(getApiErrorMessage(e, 'Không tải được thông tin tài khoản'));
            } finally {
                if (!cancelled) setLoadingProfile(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    async function handleLogout() {
        const rt = authStorage.getRefreshToken();
        setLoggingOut(true);
        try {
            if (rt) {
                try {
                    await logout(rt);
                } catch {
                    /* vẫn xóa session local */
                }
            }
        } finally {
            authStorage.clear();
            setLoggingOut(false);
            setHasToken(false);
            setProfile(null);
            router.refresh();
        }
    }

    const displayName =
        typeof profile?.name === 'string'
            ? profile.name
            : typeof profile?.preferred_username === 'string'
              ? profile.preferred_username
              : null;

    return (
        <div className="max-w-md w-full space-y-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Demo</p>
            <h1 className="text-2xl font-semibold">Chào mừng đến Nexatech</h1>

            {!hasToken && (
                <p className="text-muted-foreground">
                    Xin chào! Bạn chưa đăng nhập — đây là trang chủ demo.
                </p>
            )}

            {hasToken && loadingProfile && !loadError && (
                <p className="text-sm text-muted-foreground">Đang tải hồ sơ…</p>
            )}

            {hasToken && loadError && <p className="text-sm text-destructive">{loadError}</p>}

            {hasToken && !loadingProfile && displayName && (
                <p className="text-lg text-muted-foreground">
                    Xin chào, <span className="font-semibold text-foreground">{displayName}</span>
                </p>
            )}

            {hasToken && !loadingProfile && !displayName && !loadError && (
                <p className="text-muted-foreground">Bạn đã đăng nhập.</p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {hasToken ? (
                    <Button type="button" variant="outline" onClick={handleLogout} disabled={loggingOut}>
                        {loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
                    </Button>
                ) : (
                    <Button type="button" asChild variant="default">
                        <Link href="/auth/login">Đăng nhập</Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
