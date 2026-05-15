import { auth } from '@/auth';

/**
 * Next.js middleware — Auth.js session + route UX.
 * - `otpStepUpPending`: sau credentials login, chặn mọi URL trừ `/auth/login` cho đến khi
 *   client gọi `update({ otpStepUpComplete: true })` sau verify OTP (tránh F5 bỏ qua OTP).
 */
const PROTECTED_CLIENT_ROUTES = ['/cart/checkout', '/user', '/checkout'];
const AUTH_PAGES = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const otpPending = session?.otpStepUpPending === true;

  const isProtectedRoute = PROTECTED_CLIENT_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  // 1. Chặn OTP: Chỉ chặn các route được bảo vệ nếu đang trong trạng thái chờ OTP
  if (otpPending && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  // 2. Chặn Guest: Nếu là route bảo vệ mà không có session, bắt login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return Response.redirect(loginUrl);
  }

  // 3. Chặn Auth Page: Nếu đã login và xong OTP, không cho vào trang login/register nữa
  if (isAuthPage && session && !otpPending) {
    return Response.redirect(new URL('/', req.url));
  }

  return undefined;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
