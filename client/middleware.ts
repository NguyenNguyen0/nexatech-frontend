import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — Client (storefront) only.
 *
 * Admin panel is a separate Vite+React SPA (in admin/),
 * so this middleware only handles client-side route protection.
 *
 * Checks for the `access_token` cookie as a UX guard.
 * Full JWT validation is done by the backend API.
 */

// DEV MODE: /cart/checkout accessible without login for mock testing
// Restore '/cart/checkout' and '/user' to PROTECTED_CLIENT_ROUTES when real auth is ready
const PROTECTED_CLIENT_ROUTES: string[] = [];
const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_CLIENT_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  const accessToken = request.cookies.get('access_token')?.value;

  // Redirect to login if accessing protected routes without auth
  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect away from auth pages if already logged in
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
