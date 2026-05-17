import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import type { ApiResponse, AuthTokensPayload } from '@/types/auth';
import { authPaths, isPublicAuthRequestUrl } from '@/lib/constants';
import { authStorage } from '@/features/auth/utils/auth-storage';

/**
 * Unified Axios client for the entire application.
 *
 * - In production: baseURL is empty — requests go to same origin,
 *   proxied by next.config rewrites to API Gateway.
 * - If NEXT_PUBLIC_BACKEND_BASE_URL is set: goes directly to that URL.
 *
 * Token lifecycle (localStorage `authStorage`, đồng bộ sau login NextAuth):
 * - Access sắp hết hạn (theo `exp` trong JWT): refresh **trước** khi gửi request.
 * - 401 trên API: thử refresh **một lần** rồi gửi lại request.
 * - Refresh thất bại **vĩnh viễn** (HTTP có response, API code ≠ 1000, không access_token):
 *   xóa storage + `signOut` (logout). Lỗi mạng tạm thời: **không** logout, request fail.
 */
const resolvedBaseUrl =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? '';

const axiosClient = axios.create({
  baseURL: resolvedBaseUrl || undefined,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

/* ─── JWT exp (seconds) ─── */

function decodeJwtExpSeconds(accessToken: string): number | null {
  try {
    const [, payload] = accessToken.split('.');
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    const json = atob(padded);
    const obj = JSON.parse(json) as { exp?: number };
    return typeof obj.exp === 'number' ? obj.exp : null;
  } catch {
    return null;
  }
}

/** true nếu access JWT đã hết hạn hoặc sắp hết (buffer). */
function accessTokenNeedsProactiveRefresh(
  accessToken: string,
  skewMs = 30_000,
): boolean {
  const expSec = decodeJwtExpSeconds(accessToken);
  if (expSec == null) return false;
  return Date.now() >= expSec * 1000 - skewMs;
}

/* ─── Refresh singleton (mọi request dùng chung một promise) ─── */

let refreshPromise: Promise<string> | null = null;

function refreshUrl(): string {
  if (resolvedBaseUrl) return `${resolvedBaseUrl}${authPaths.refresh}`;
  if (typeof window !== 'undefined')
    return `${window.location.origin}${authPaths.refresh}`;
  return authPaths.refresh;
}

function isPermanentRefreshFailure(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if (!error.response) return false;
  const status = error.response.status;
  if (status >= 500) return false;
  const data = error.response.data as ApiResponse<unknown> | undefined;
  if (data && typeof data.code === 'number' && data.code !== 1000) return true;
  return status === 400 || status === 401;
}

async function clearSessionAndSignOut(): Promise<void> {
  authStorage.clear();
  if (typeof window === 'undefined') return;
  const { signOut } = await import('next-auth/react');
  await signOut({ redirect: true, callbackUrl: '/auth/login' });
}

/**
 * Gọi gateway refresh; cập nhật storage. Keycloak có thể không trả refresh_token mới
 * → giữ refresh cũ (giống `auth.ts`).
 */
async function performRefreshToken(): Promise<string> {
  const storedRefresh = authStorage.getRefreshToken();
  if (!storedRefresh) {
    // No refresh token means the user was never authenticated (or already logged out).
    // Just clear any stale storage and reject — do NOT redirect to login.
    authStorage.clear();
    throw new Error('No refresh token');
  }

  try {
    const { data } = await axios.post<ApiResponse<AuthTokensPayload>>(
      refreshUrl(),
      { refreshToken: storedRefresh },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      },
    );

    const payload = data.result;
    if (data.code !== 1000 || !payload?.access_token) {
      await clearSessionAndSignOut();
      throw new Error(data.message || 'Refresh failed');
    }

    const newRefresh = payload.refresh_token ?? storedRefresh;
    authStorage.setTokens(payload.access_token, newRefresh);
    return payload.access_token;
  } catch (e) {
    if (isPermanentRefreshFailure(e)) {
      await clearSessionAndSignOut();
    }
    throw e;
  }
}

function ensureRefreshInFlight(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefreshToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function resolveRequestUrl(config: InternalAxiosRequestConfig): string {
  const url = config.url ?? '';
  const base = config.baseURL ?? '';
  return url.startsWith('http') ? url : `${base}${url}`;
}

/* ─── Request: refresh chủ động nếu access sắp hết hạn, rồi gắn Bearer ─── */

axiosClient.interceptors.request.use(
  async (config) => {
    const fullUrl = resolveRequestUrl(config);
    const pathOnly = config.url ?? '';

    if (isPublicAuthRequestUrl(fullUrl) || isPublicAuthRequestUrl(pathOnly)) {
      return config;
    }

    let token = authStorage.getAccessToken();
    const refresh = authStorage.getRefreshToken();

    if (refresh && (!token || accessTokenNeedsProactiveRefresh(token))) {
      try {
        token = await ensureRefreshInFlight();
      } catch {
        return Promise.reject(new Error('Proactive token refresh failed'));
      }
    }

    if (
      token &&
      !isPublicAuthRequestUrl(fullUrl) &&
      !isPublicAuthRequestUrl(pathOnly)
    ) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ─── Response: 401 → một lần refresh + retry (403 = phân quyền, không refresh) ─── */

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const isUnauthorized = status === 401;

    if (!isUnauthorized || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const absolute = resolveRequestUrl(originalRequest);
    const pathOnly = originalRequest.url ?? '';
    if (
      isPublicAuthRequestUrl(absolute) ||
      isPublicAuthRequestUrl(pathOnly)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await ensureRefreshInFlight();
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);
    } catch (e) {
      return Promise.reject(e);
    }
  },
);

export default axiosClient;
