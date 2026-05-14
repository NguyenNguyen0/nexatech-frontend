import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

/** Base URL qua API Gateway, ví dụ http://localhost:8080/api/v1 */
const identityBase = () => process.env.IDENTITY_API_BASE_URL?.replace(/\/$/, '') ?? '';

type TokenBundle = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
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

        const { access_token, refresh_token, expires_in } = data.result;
        const claims = decodeJwtPayload(access_token);
        const sub = (claims?.sub as string) ?? username;
        const name = (claims?.name as string) ?? (claims?.preferred_username as string) ?? username;
        const email = (claims?.email as string) ?? undefined;

        return {
          id: sub,
          name,
          email,
          access_token,
          refresh_token,
          expires_at: Math.floor(Date.now() / 1000 + (expires_in ?? 300)),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string;
          access_token: string;
          refresh_token?: string;
          expires_at: number;
        };
        return {
          ...token,
          access_token: u.access_token,
          refresh_token: u.refresh_token,
          expires_at: u.expires_at,
        };
      }

      const exp = token.expires_at as number | undefined;
      if (exp && Date.now() < exp * 1000 - 15_000) {
        return token;
      }

      const rt = token.refresh_token as string | undefined;
      if (!rt) {
        return { ...token, error: 'RefreshTokenError' as const };
      }

      const refreshed = await refreshAccessToken(rt);
      if (!refreshed?.access_token) {
        return { ...token, error: 'RefreshTokenError' as const };
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
      }
      session.error = token.error as 'RefreshTokenError' | undefined;
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
