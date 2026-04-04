import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse, AuthTokensPayload } from '@/types/auth';
import { authPaths, isPublicAuthRequestUrl } from '@/lib/authPaths';
import { authStorage } from '@/lib/authStorage';

/**
 * - Có NEXT_PUBLIC_BACKEND_BASE_URL → gọi thẳng gateway (CORS phải mở cho origin host).
 * - Không có → baseURL rỗng: gọi /api/v1/... cùng origin host; next.config rewrite proxy tới API_GATEWAY_URL.
 */
const resolvedBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? '';

const axiosClient = axios.create({
    baseURL: resolvedBaseUrl || undefined,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

let onTokenRefreshed: ((payload: AuthTokensPayload) => void) | null = null;
let onLogout: (() => void) | null = null;

export function setupAxiosInterceptors(opts: {
    onTokenRefreshed?: (payload: AuthTokensPayload) => void;
    onLogout?: () => void;
}) {
    onTokenRefreshed = opts.onTokenRefreshed ?? null;
    onLogout = opts.onLogout ?? null;
}

let refreshPromise: Promise<string> | null = null;

function refreshUrl(): string {
    if (resolvedBaseUrl) {
        return `${resolvedBaseUrl}${authPaths.refresh}`;
    }
    if (typeof window !== 'undefined') {
        return `${window.location.origin}${authPaths.refresh}`;
    }
    return authPaths.refresh;
}

const performRefreshToken = async (): Promise<string> => {
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
        authStorage.clear();
        onLogout?.();
        throw new Error('No refresh token');
    }

    try {
        const response = await axios.post<ApiResponse<AuthTokensPayload>>(refreshUrl(), { refreshToken }, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        });

        const payload = response.data.result;
        if (response.data.code !== 1000 || !payload?.access_token || !payload?.refresh_token) {
            throw new Error(response.data.message || 'Refresh failed');
        }

        authStorage.setTokens(payload.access_token, payload.refresh_token);
        onTokenRefreshed?.(payload);

        return payload.access_token;
    } catch (error) {
        authStorage.clear();
        onLogout?.();
        throw error;
    }
};

axiosClient.interceptors.request.use(
    (config) => {
        const token = authStorage.getAccessToken();
        const url = config.url ?? '';
        const fullUrl = url.startsWith('http') ? url : `${config.baseURL ?? ''}${url}`;

        if (token && !isPublicAuthRequestUrl(fullUrl) && !isPublicAuthRequestUrl(url)) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

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
        if (isPublicAuthRequestUrl(absolute) || isPublicAuthRequestUrl(reqUrl)) {
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
