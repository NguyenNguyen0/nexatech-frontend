import axios, { AxiosHeaders } from "axios";
import { authPaths } from "@/services/authPaths";
import { clearAuthTokens, getRefreshToken, setAuthTokens } from "@/services/authSession";
import type { ApiResponse, TokenExchangeResult } from "@/types/auth";

const USER_API_BASE = "/api/v1/users";

const PUBLIC_AUTH_PATHS = [
    authPaths.login,
    authPaths.register,
    authPaths.refresh,
    authPaths.logout,
    authPaths.forgotPassword,
];

const OTP_STEP_UP_PATHS = [
    `${USER_API_BASE}/me/onboarding/request-otp`,
    `${USER_API_BASE}/me/onboarding/verify-otp`,
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
        const err = new Error("No refresh token");
        (err as Error & { code?: string }).code = "NO_REFRESH_TOKEN";
        throw err;
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
        throw new Error(data.message || "Refresh token failed");
    }

    setAuthTokens(data.result.access_token, data.result.refresh_token);
    return data.result.access_token;
};

function shouldLogoutAfterRefreshFailure(error: unknown): boolean {
    const e = error as Error & { code?: string };
    if (e?.code === "NO_REFRESH_TOKEN") return false;

    if (!axios.isAxiosError(error)) return false;
    const status = error.response?.status;
    const payload = error.response?.data as { message?: string; error?: string; error_description?: string } | undefined;
    const reason = `${payload?.message ?? ""} ${payload?.error ?? ""} ${payload?.error_description ?? ""} ${error.message ?? ""}`
        .toLowerCase();

    if (status === 400 || status === 401) {
        return reason.includes("invalid_grant")
            || reason.includes("invalid_token")
            || reason.includes("refresh token")
            || reason.includes("session")
            || reason.includes("token is not active");
    }
    return false;
}

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
        const isUnauthorized = status === 401;

        if (!isUnauthorized || !originalRequest) {
            return Promise.reject(error);
        }

        const url = originalRequest.url ?? "";
        const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
        const isOtpStepUpRequest = OTP_STEP_UP_PATHS.some((path) => url.includes(path));
        // Do not force logout for login/register/refresh errors or non-expiry retried failures.
        if (isPublicAuthRequest || isOtpStepUpRequest || originalRequest._retry) {
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
            if (shouldLogoutAfterRefreshFailure(refreshError)) {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    // Call logout API to clear session on server
                    // Use plain axios to avoid interceptor loop
                    axios.post(
                        `${import.meta.env.VITE_BACKEND_BASE_URL}${authPaths.logout}`,
                        { refreshToken },
                        { withCredentials: true }
                    ).catch(() => {
                        console.error("Logout API failed during refresh failure");
                    });
                }
                clearAuthTokens();
                window.location.href = "/auth";
            }
            return Promise.reject(refreshError);
        }
    },
);

export default axiosClient;
