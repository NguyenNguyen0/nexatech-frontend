/**
 * Cấu hình Auth.js (NextAuth v5) cho App Router.
 * @see https://authjs.dev/getting-started/installation?framework=Next.js
 */
import NextAuth, { CredentialsSignin, type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: 'RefreshTokenError' | 'AccountDisabled';
    otpStepUpPending?: boolean;
    requiresPasswordChange?: boolean;
    googleNewRegistration?: boolean;
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
    google_new_registration?: boolean;
    error?: 'RefreshTokenError' | 'AccountDisabled';
    email?: string;
    name?: string;
  }
}

class AccessDeniedError extends CredentialsSignin {
  code = 'AccessDenied';
}

class AccountDisabledError extends CredentialsSignin {
  code = 'AccountDisabled';
}

const ACCOUNT_DISABLED_CODE = 2036;
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

/** Base URL qua API Gateway, ví dụ http://localhost:8080/api/v1 */
const identityBase = () => {
  const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? '';
  return base ? `${base}/api/v1` : '';
};

type TokenBundle = {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  expires_in?: number;
  expiresIn?: number;
  requires_password_change?: boolean;
  requiresPasswordChange?: boolean;
  new_user?: boolean;
  newUser?: boolean;
};

function pickTokens(bundle: TokenBundle | undefined) {
  if (!bundle) return null;
  const access_token = bundle.access_token ?? bundle.accessToken;
  if (!access_token) return null;
  return {
    access_token,
    refresh_token: bundle.refresh_token ?? bundle.refreshToken,
    expires_in: bundle.expires_in ?? bundle.expiresIn,
    requires_password_change: bundle.requires_password_change ?? bundle.requiresPasswordChange,
  };
}

type ApiEnvelope<T> = {
  code?: number;
  success?: boolean;
  message?: string | null;
  result?: T;
  data?: T;
};

const CUSTOMER_ROLE = 'CUSTOMER';
const NON_CUSTOMER_ROLES = new Set(['ADMIN', 'MANAGER', 'STAFF', 'WAREHOUSE', 'ACCOUNTANT']);

async function readApiEnvelope<T>(res: Response): Promise<ApiEnvelope<T> | null> {
  const raw = await res.text();
  if (!raw.trim()) return null;

  try {
    return JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getTokenBundle<T>(envelope: ApiEnvelope<T> | null): T | undefined {
  return envelope?.result ?? envelope?.data;
}

function isSuccessEnvelope(envelope: ApiEnvelope<unknown> | null): boolean {
  return envelope?.code === 1000 || envelope?.success === true;
}

function extractRolesFromClaims(claims: Record<string, unknown> | null): string[] {
  if (!claims) return [];

  const roles = new Set<string>();
  const addRoles = (value: unknown) => {
    if (!Array.isArray(value)) return;
    value.forEach((role) => {
      if (typeof role === 'string') roles.add(role.toUpperCase());
    });
  };

  addRoles((claims.realm_access as { roles?: unknown } | undefined)?.roles);

  const resourceAccess = claims.resource_access as Record<string, { roles?: unknown }> | undefined;
  if (resourceAccess && typeof resourceAccess === 'object') {
    Object.values(resourceAccess).forEach((resource) => addRoles(resource?.roles));
  }

  return [...roles];
}

function canUseCustomerFrontend(claims: Record<string, unknown> | null): boolean {
  const roles = extractRolesFromClaims(claims);
  if (roles.includes(CUSTOMER_ROLE)) return true;
  return !roles.some((role) => NON_CUSTOMER_ROLES.has(role));
}

type GoogleSocialProfile = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
};

type SocialTokenResult =
  | ({ ok: true } & TokenBundle & { new_user?: boolean })
  | { ok: false; reason: 'disabled' | 'failed' };

async function exchangeGoogleEmailForTokens(
  profile: GoogleSocialProfile,
): Promise<SocialTokenResult> {
  const base = identityBase();
  if (!base) return { ok: false, reason: 'failed' };

  const res = await fetch(`${base}/auth/social-media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'GOOGLE',
      username: profile.email,
      firstName: profile.firstName ?? undefined,
      lastName: profile.lastName ?? undefined,
      avatarUrl: profile.avatarUrl ?? undefined,
    }),
  });

  const data = await readApiEnvelope<TokenBundle>(res);
  if (data?.code === ACCOUNT_DISABLED_CODE) {
    return { ok: false, reason: 'disabled' };
  }
  const tokens = pickTokens(getTokenBundle(data));
  if (!res.ok || !isSuccessEnvelope(data) || !tokens) {
    return { ok: false, reason: 'failed' };
  }
  const payload = getTokenBundle(data);
  const new_user = payload?.new_user ?? payload?.newUser;
  return { ok: true, ...tokens, new_user: new_user === true };
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenBundle | null | 'ACCOUNT_DISABLED'> {
  const base = identityBase();
  if (!base) return null;

  const res = await fetch(`${base}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await readApiEnvelope<TokenBundle>(res);
  if (data?.code === ACCOUNT_DISABLED_CODE) {
    return 'ACCOUNT_DISABLED';
  }
  const tokens = pickTokens(getTokenBundle(data));
  if (!res.ok || !isSuccessEnvelope(data) || !tokens) {
    return null;
  }
  return tokens;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username / Email / Phone' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;
        const base = identityBase();

        if (!identifier || !password || !base) {
          return null;
        }

        const res = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: identifier.trim(), password }),
        });

        const data = await readApiEnvelope<TokenBundle>(res);
        if (data?.code === ACCOUNT_DISABLED_CODE) {
          throw new AccountDisabledError();
        }
        const tokens = pickTokens(getTokenBundle(data));
        if (!res.ok || !isSuccessEnvelope(data) || !tokens) {
          return null;
        }

        const { access_token, refresh_token, expires_in, requires_password_change } = tokens;
        const claims = decodeJwtPayload(access_token);
        const sub = (claims?.sub as string) ?? identifier;
        const name = (claims?.name as string) ?? (claims?.preferred_username as string) ?? identifier;
        const email = (claims?.email as string) ?? undefined;

        if (!canUseCustomerFrontend(claims)) {
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        return !!user.email;
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Google OAuth: dùng email Google → POST /auth/social-media → Keycloak JWT
      if (account?.provider === 'google' && user?.email) {
        const email = user.email.trim().toLowerCase();
        const googleUser = user as {
          name?: string | null;
          image?: string | null;
          given_name?: string | null;
          family_name?: string | null;
        };
        let firstName = googleUser.given_name?.trim() || undefined;
        let lastName = googleUser.family_name?.trim() || undefined;
        if (!firstName && user.name) {
          const parts = user.name.trim().split(/\s+/);
          firstName = parts[0];
          lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
        }
        const tokens = await exchangeGoogleEmailForTokens({
          email,
          firstName,
          lastName,
          avatarUrl: googleUser.image?.trim() || undefined,
        });
        if (!tokens.ok) {
          return {
            ...token,
            error: tokens.reason === 'disabled' ? ('AccountDisabled' as const) : ('RefreshTokenError' as const),
          };
        }

        const { access_token, refresh_token, expires_in, requires_password_change, new_user } = tokens;
        if (!access_token) {
          return { ...token, error: 'RefreshTokenError' as const };
        }
        const claims = decodeJwtPayload(access_token);
        const sub = (claims?.sub as string) ?? user.id;
        if (!canUseCustomerFrontend(claims)) {
          return { ...token, error: 'RefreshTokenError' as const };
        }

        return {
          ...token,
          sub,
          name: user.name ?? token.name,
          email,
          access_token,
          refresh_token,
          expires_at: Math.floor(Date.now() / 1000 + (expires_in ?? 300)),
          otp_step_up_pending: false,
          requires_password_change: !!requires_password_change,
          google_new_registration: new_user === true,
          error: undefined,
        };
      }

      if (user && account?.provider === 'credentials') {
        const u = user as {
          id: string;
          access_token: string;
          refresh_token?: string;
          requires_password_change: boolean;
          expires_at: number;
        };
        return {
          ...token,
          sub: u.id,
          access_token: u.access_token,
          refresh_token: u.refresh_token,
          expires_at: u.expires_at,
          otp_step_up_pending: true,
          requires_password_change: u.requires_password_change,
          error: undefined,
        };
      }

      if (trigger === 'update') {
        const s = session as { otpStepUpComplete?: boolean; passwordChangeComplete?: boolean } | null;
        if (s?.otpStepUpComplete === true) {
          return { ...token, otp_step_up_pending: false };
        }
        if (s?.passwordChangeComplete === true) {
          return {
            ...token,
            requires_password_change: false,
            requiresPasswordChange: false,
          };
        }
      }

      const exp = token.expires_at as number | undefined;
      if (exp && Date.now() < exp * 1000 - 15_000) {
        return token;
      }

      const rt = token.refresh_token as string | undefined;
      if (!rt && !token.access_token) {
        return token;
      }
      if (!rt) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { access_token: _a, refresh_token: _r, expires_at: _e, ...rest } = token;
        return { ...rest, error: 'RefreshTokenError' as const };
      }

      const refreshed = await refreshAccessToken(rt);
      if (refreshed === 'ACCOUNT_DISABLED') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { access_token: _a, refresh_token: _r, expires_at: _e, ...rest } = token;
        return { ...rest, error: 'AccountDisabled' as const };
      }
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
        otp_step_up_pending: token.otp_step_up_pending,
        google_new_registration: token.google_new_registration,
        requires_password_change: token.requires_password_change,
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
      session.error = token.error as 'RefreshTokenError' | 'AccountDisabled' | undefined;
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (typeof token.name === 'string') {
          session.user.name = token.name;
        }
        if (typeof token.email === 'string') {
          session.user.email = token.email;
        }
      }
      session.otpStepUpPending = token.otp_step_up_pending === true;
      session.requiresPasswordChange = token.requires_password_change === true;
      session.googleNewRegistration = token.google_new_registration === true;
      return session;
    },
    authorized() {
      return true;
    },
  },
});
