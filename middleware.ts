import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — runs on every matched request.
 *
 * Replaces 3+ client-side ProtectedRoute wrappers with a single server-side
 * redirect check. Checks for the `access_token` cookie (not localStorage,
 * since middleware runs on the edge). For client-side flows that use
 * localStorage, auth state is checked in provider/component code.
 *
 * Note: full JWT validation (expiry/roles) is NOT done here because:
 *   1. Edge Runtime doesn't support most crypto libs needed for JWT verify
 *   2. The backend API already validates tokens on every request
 *   3. Role-based access is enforced at the API layer
 *
 * This middleware only checks for the PRESENCE of a token as a UX guard.
 */

const ADMIN_PREFIXES = [
  '/admin',
  '/manager',
  '/staff',
  '/warehouse',
  '/accountant',
];

const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing a protected admin route
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  // We check the cookie `access_token` for server-side redirect.
  // For localStorage-based auth, client-side AuthProvider handles it.
  const accessToken = request.cookies.get('access_token')?.value;

  if (isAdminRoute && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and visiting auth pages, redirect to home
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
