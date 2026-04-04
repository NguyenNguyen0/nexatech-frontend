'use client';

/**
 * Sau đăng nhập: về trang chủ host (/ trên origin host).
 * - Truy cập auth qua host rewrite (cùng origin): dùng `window.location.origin`.
 * - Chạy auth riêng cổng 3001: đặt NEXT_PUBLIC_HOST_APP_ORIGIN=http://localhost:3000
 */
export function goToHostHomeAfterLogin(): void {
    if (typeof window === 'undefined') return;
    const explicit = process.env.NEXT_PUBLIC_HOST_APP_ORIGIN?.replace(/\/$/, '');
    const base = explicit || window.location.origin;
    window.location.assign(`${base}/`);
}
