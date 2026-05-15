/**
 * Cấu hình Auth.js (NextAuth v5) cho App Router.
 * Đặt ở thư mục gốc app (cạnh `app/`) là convention chính thức — import `@/auth` từ middleware, server, route handlers.
 * @see https://authjs.dev/getting-started/installation?framework=Next.js
 */
import NextAuth, { CredentialsSignin, type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: 'RefreshTokenError';
    otpStepUpPending?: boolean;
    requiresPasswordChange?: boolean;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    otp_step_up_pending?: boolean;
    requires_password_change?: boolean;
    error?: 'RefreshTokenError';
  }
}

class AccessDeniedError extends CredentialsSignin {
  code = 'AccessDenied';
}
import Credentials from 'next-auth/providers/credentials';

/** Base URL qua API Gateway, ví dụ http://localhost:8080/api/v1 */
const identityBase = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? '';
  return base ? `${base}/api/v1` : '';
};

type TokenBundle = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  requires_password_change?: boolean;
};

type ApiEnvelope<T> = {
  code: number;
  message?: string | null;
  result?: T;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<TokenBundle | null> {
  const base = identityBase();
  if (!base) return null;

  const res = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = (await res.json()) as ApiEnvelope<TokenBundle>;
  if (!res.ok || data.code !== 1000 || !data.result?.access_token) {
    return null;
  }
  return data.result;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        const base = identityBase();

        if (!username || !password || !base) {
          return null;
        }

        const res = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = (await res.json()) as ApiEnvelope<TokenBundle>;
        if (!res.ok || data.code !== 1000 || !data.result?.access_token) {
          return null;
        }

        const { access_token, refresh_token, expires_in, requires_password_change } = data.result;
        const claims = decodeJwtPayload(access_token);
        const sub = (claims?.sub as string) ?? username;
        const name = (claims?.name as string) ?? (claims?.preferred_username as string) ?? username;
        const email = (claims?.email as string) ?? undefined;

        // Chỉ có CUSTOMER mới được đăng nhập vào Client — chặn Staff/Admin ngay ở tầng server
        const realmRoles = ((claims?.realm_access as { roles?: string[] })?.roles ?? []).map(
          (r: string) => r.toUpperCase(),
        );
        if (!realmRoles.includes('CUSTOMER')) {
          throw new AccessDeniedError();
        }

        return {
          id: sub,
          name,
          email,
          access_token,
          refresh_token,
          requires_password_change: !!requires_password_change,
          expires_at: Math.floor(Date.now() / 1000 + (expires_in ?? 300)),
        };
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback (chạy mỗi lần session được đọc / cập nhật):
     *
     * 1) access còn hạn (theo `expires_at`, buffer 15s): giữ nguyên token.
     * 2) access sắp hết / hết: gọi `POST .../auth/refresh` với `refresh_token`.
     * 3) Refresh OK: cập nhật access/refresh/expires, bỏ cờ `error`.
     * 4) Không có refresh hoặc refresh lỗi: **không** gọi `signOut()` tự động (Auth.js
     *    không làm vậy trong jwt callback). Ta xóa access/refresh khỏi JWT và gán
     *    `error: 'RefreshTokenError'` — cookie session vẫn tồn tại nhưng không còn
     *    Bearer dùng được. UI/middleware nên đọc `session.error` và gọi `signOut()`
     *    hoặc redirect login nếu cần hành vi “logout hẳn”.
     * 5) Sau credentials login: `otp_step_up_pending: true` — middleware chỉ cho
     *    `/auth/login` cho đến khi client `update({ otpStepUpComplete: true })` sau verify OTP.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as {
          id: string;
          access_token: string;
          refresh_token?: string;
          requires_password_change: boolean;
          expires_at: number;
        };
        return {
          ...token,
          access_token: u.access_token,
          refresh_token: u.refresh_token,
          expires_at: u.expires_at,
          otp_step_up_pending: false,
          requires_password_change: u.requires_password_change,
        };
      }

      if (trigger === 'update') {
        const s = session as { otpStepUpComplete?: boolean; passwordChangeComplete?: boolean } | null;
        if (s?.otpStepUpComplete === true) {
          return { ...token, otp_step_up_pending: false };
        }
        if (s?.passwordChangeComplete === true) {
          return { ...token, requires_password_change: false };
        }
      }

      const exp = token.expires_at as number | undefined;
      if (exp && Date.now() < exp * 1000 - 15_000) {
        return token;
      }

      const rt = token.refresh_token as string | undefined;
      if (!rt) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { access_token: _a, refresh_token: _r, expires_at: _e, ...rest } = token;
        return { ...rest, error: 'RefreshTokenError' as const };
      }

      const refreshed = await refreshAccessToken(rt);
      if (!refreshed?.access_token) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { access_token: _a, refresh_token: _r, expires_at: _e, ...rest } = token;
        return { ...rest, error: 'RefreshTokenError' as const };
      }

      return {
        ...token,
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token ?? rt,
        expires_at: Math.floor(Date.now() / 1000 + (refreshed.expires_in ?? 300)),
        error: undefined,
      };
    },
    async session({ session, token }) {
      if (token.access_token) {
        session.accessToken = token.access_token as string;
      } else {
        delete session.accessToken;
      }
      if (token.refresh_token) {
        session.refreshToken = token.refresh_token as string;
      } else {
        delete session.refreshToken;
      }
      session.error = token.error as 'RefreshTokenError' | undefined;
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      session.otpStepUpPending = token.otp_step_up_pending === true;
      session.requiresPasswordChange = token.requires_password_change === true;
      return session;
    },
    /**
     * Authorized callback: Mặc định cho phép mọi request đi qua middleware.
     * Logic bảo vệ route sẽ được xử lý tập trung tại `middleware.ts`.
     */
    authorized({ auth }) {
      // Ta trả về true ở đây để middleware.ts không bị chặn mặc định bởi NextAuth.
      // Việc chặn route nào sẽ do logic trong middleware.ts quyết định.
      return true;
    },
  },
});
