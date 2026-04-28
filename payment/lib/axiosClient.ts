import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { authStorage } from '@/lib/authStorage';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

const REFRESH_URL = '/api/v1/auth/refresh';
let refreshPromise: Promise<string> | null = null;

const performRefreshToken = async (): Promise<string> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) {
    authStorage.clear();
    throw new Error('No refresh token');
  }

  try {
    const base = process.env.NEXT_PUBLIC_BACKEND_BASE_URL?.replace(/\/$/, '') ?? '';
    const res = await axios.post(`${base}${REFRESH_URL}`, { refreshToken }, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const body = res.data;
    const payload = body.result ?? body.data;
    if ((body.code !== undefined ? body.code !== 1000 : !body.success) || !payload?.access_token || !payload.refresh_token) {
      throw new Error(body.message || 'Refresh failed');
    }

    authStorage.setTokens(payload.access_token, payload.refresh_token);
    return payload.access_token;
  } catch {
    authStorage.clear();
    throw new Error('Refresh failed');
  }
};

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

axiosClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    const userId = getUserIdFromToken(token);
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = performRefreshToken().finally(() => { refreshPromise = null; });
      }

      try {
        const newToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
