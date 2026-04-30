import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse, AuthTokensPayload } from '@/types/auth';
import { authPaths, isPublicAuthRequestUrl } from '@/lib/constants';
import { authStorage } from '@/features/auth/utils/auth-storage';

/**
 * Unified Axios client for the entire application.
 *
 * - In production: baseURL is empty — requests go to same origin,
 *   proxied by next.config rewrites to API Gateway.
 * - If NEXT_PUBLIC_BACKEND_BASE_URL is set: goes directly to that URL.
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

/* ─── Refresh-token singleton ─── */

let refreshPromise: Promise<string> | null = null;

function refreshUrl(): string {
  if (resolvedBaseUrl) return `${resolvedBaseUrl}${authPaths.refresh}`;
  if (typeof window !== 'undefined')
    return `${window.location.origin}${authPaths.refresh}`;
  return authPaths.refresh;
}

async function performRefreshToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    authStorage.clear();
    throw new Error('No refresh token');
  }

  try {
    const { data } = await axios.post<ApiResponse<AuthTokensPayload>>(
      refreshUrl(),
      { refreshToken },
      {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      },
    );

    const payload = data.result;
    if (data.code !== 1000 || !payload?.access_token || !payload?.refresh_token) {
      throw new Error(data.message || 'Refresh failed');
    }

    authStorage.setTokens(payload.access_token, payload.refresh_token);
    return payload.access_token;
  } catch {
    authStorage.clear();
    throw new Error('Token refresh failed');
  }
}

/* ─── Request interceptor: attach Bearer token ─── */

axiosClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getAccessToken();
    const url = config.url ?? '';
    const fullUrl = url.startsWith('http')
      ? url
      : `${config.baseURL ?? ''}${url}`;

    if (
      token &&
      !isPublicAuthRequestUrl(fullUrl) &&
      !isPublicAuthRequestUrl(url)
    ) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ─── Response interceptor: auto-refresh on 401/403 ─── */

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const isUnauthorized = status === 401 || status === 403;

    if (!isUnauthorized || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const reqUrl = originalRequest.url ?? '';
    const base = originalRequest.baseURL ?? '';
    const absolute = reqUrl.startsWith('http') ? reqUrl : `${base}${reqUrl}`;
    if (
      isPublicAuthRequestUrl(absolute) ||
      isPublicAuthRequestUrl(reqUrl)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = performRefreshToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const newToken = await refreshPromise;
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);
    } catch (e) {
      return Promise.reject(e);
    }
  },
);

export default axiosClient;
