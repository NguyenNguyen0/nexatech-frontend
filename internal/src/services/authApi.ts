import { isAxiosError } from "axios";
import axiosClient from "@/lib/axiosClient";
import { authPaths } from "@/services/authPaths";
import { authStorage } from "@/services/authStorage";
import type {
    ApiResponse,
    IntrospectResult,
    LoginRequestBody,
    LogoutRequestBody,
    RegisterRequestBody,
    RegisterRequestInput,
    TokenExchangeResult,
    UserInfoResult,
} from "@/types/auth";

export function getApiErrorMessage(error: unknown, fallback = "Co loi xay ra. Vui long thu lai."): string {
    if (!isAxiosError(error)) return fallback;
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.message) return data.message;
    return error.message || fallback;
}

export async function login(body: LoginRequestBody): Promise<TokenExchangeResult> {
    const { data } = await axiosClient.post<ApiResponse<TokenExchangeResult>>(authPaths.login, body);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Dang nhap that bai");
    }
    return data.result;
}

export async function register(body: RegisterRequestInput): Promise<string> {
    const payload: RegisterRequestBody = {
        ...body,
        emailVerified: false,
    };

    const { data } = await axiosClient.post<ApiResponse<string>>(authPaths.register, payload);
    if (data.code !== 1000 || data.result == null) {
        throw new Error(data.message || "Dang ky that bai");
    }
    return data.result;
}

export async function fetchUserInfo(): Promise<UserInfoResult> {
    const { data } = await axiosClient.get<ApiResponse<UserInfoResult>>(authPaths.userinfo);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Khong lay duoc thong tin nguoi dung");
    }
    return data.result;
}

export async function logout(refreshToken: string): Promise<void> {
    const body: LogoutRequestBody = { refreshToken };
    await axiosClient.post<ApiResponse<void>>(authPaths.logout, body);
}

export async function introspectToken(token: string): Promise<IntrospectResult> {
    const { data } = await axiosClient.post<ApiResponse<IntrospectResult>>(authPaths.introspect, { token });
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || "Introspect that bai");
    }
    return data.result;
}

export function persistTokensFromExchange(result: TokenExchangeResult): void {
    authStorage.setTokens(result.access_token, result.refresh_token);
}
