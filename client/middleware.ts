import { auth } from '@/auth';

/**
 * Next.js middleware — Auth.js session + route UX.
 * Bảo vệ route storefront; JWT access vẫn do backend xác thực khi gọi API.
 */
const PROTECTED_CLIENT_ROUTES = ['/cart/checkout', '/user'];
const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtectedRoute = PROTECTED_CLIENT_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const session = req.auth;

  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return Response.redirect(new URL('/', req.url));
  }

  return undefined;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
