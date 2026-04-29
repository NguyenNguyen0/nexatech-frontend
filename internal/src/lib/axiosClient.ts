import axios, { AxiosHeaders } from "axios";
import { authPaths } from "@/services/authPaths";
import { clearAuthTokens, getRefreshToken, setAuthTokens } from "@/services/authSession";
import type { ApiResponse, TokenExchangeResult } from "@/types/auth";

const PUBLIC_AUTH_PATHS = [
    authPaths.login,
    authPaths.register,
    authPaths.refresh,
];

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

let refreshPromise: Promise<string> | null = null;

const refreshTokenRequest = async (): Promise<string> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        clearAuthTokens();
        throw new Error("No refresh token");
    }

    const { data } = await axios.post<ApiResponse<TokenExchangeResult>>(
        `${import.meta.env.VITE_BACKEND_BASE_URL}${authPaths.refresh}`,
        { refreshToken },
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
        },
    );

    if (data.code !== 1000 || !data.result?.access_token || !data.result?.refresh_token) {
        clearAuthTokens();
        throw new Error(data.message || "Refresh token failed");
    }

    setAuthTokens(data.result.access_token, data.result.refresh_token);
    return data.result.access_token;
};

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    const url = config.url ?? "";
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));

    if (token && !isPublicAuthRequest) {
        config.headers = config.headers ?? new AxiosHeaders();
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config as { _retry?: boolean; url?: string; headers?: AxiosHeaders | Record<string, string> };
        const status = error?.response?.status;
        const isUnauthorized = status === 401 || status === 403;

        if (!isUnauthorized || !originalRequest) {
            return Promise.reject(error);
        }

        const url = originalRequest.url ?? "";
        const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
        if (isPublicAuthRequest || originalRequest._retry) {
            clearAuthTokens();
            window.location.href = "/auth";
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!refreshPromise) {
            refreshPromise = refreshTokenRequest().finally(() => {
                refreshPromise = null;
            });
        }

        try {
            const newAccessToken = await refreshPromise;
            const headers = originalRequest.headers ?? {};
            if (headers instanceof AxiosHeaders) {
                headers.set("Authorization", `Bearer ${newAccessToken}`);
                originalRequest.headers = headers;
            } else {
                originalRequest.headers = {
                    ...headers,
                    Authorization: `Bearer ${newAccessToken}`,
                };
            }
            return axiosClient(originalRequest);
        } catch (refreshError) {
            clearAuthTokens();
            window.location.href = "/auth";
            return Promise.reject(refreshError);
        }
    },
);

export default axiosClient;
