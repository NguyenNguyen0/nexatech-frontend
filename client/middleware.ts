import { auth } from '@/auth';

/**
 * - `otpStepUpPending`: chặn route bảo vệ cho đến khi verify OTP (vẫn cho xem /, /product).
 * - Guest: truy cập tự do storefront.
 */
const PROTECTED_CLIENT_ROUTES = ['/cart/checkout', '/user', '/checkout'];
const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const hasSession = !!session?.accessToken;
  const otpPending = session?.otpStepUpPending === true;

  const isProtectedRoute = PROTECTED_CLIENT_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (otpPending && hasSession && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  const googleRegistrationPending = session?.googleNewRegistration === true;

  if (isAuthPage && hasSession && !otpPending && !googleRegistrationPending) {
    return Response.redirect(new URL('/', req.url));
  }

  return undefined;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
