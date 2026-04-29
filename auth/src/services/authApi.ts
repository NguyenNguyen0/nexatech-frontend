import { isAxiosError } from 'axios';
import axiosClient from '@/lib/axiosClient';
import { authPaths } from '@/services/authPaths';
import { authStorage } from '@/services/authStorage';
import type {
    ApiResponse,
    IntrospectResult,
    IntrospectTokenRequestBody,
    LoginRequestBody,
    LogoutRequestBody,
    RegisterRequestBody,
    RegisterRequestInput,
    TokenExchangeResult,
    UserInfoResult,
} from '@/types/auth';

const USER_API_BASE = '/api/v1/users';

export interface OnboardingStatusResult {
    userId: string;
    email?: string;
    onBoarded: boolean;
}

export function getApiErrorMessage(error: unknown, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.'): string {
    if (!isAxiosError(error)) return fallback;
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    const message = data?.message || error.message || '';
    const normalized = message.toLowerCase();
    if (normalized.includes('invalid_grant')) {
        return 'Your account is locked or the login information is incorrect.';
    }
    if (data?.message) return data.message;
    return error.message || fallback;
}

export async function login(body: LoginRequestBody): Promise<TokenExchangeResult> {
    const { data } = await axiosClient.post<ApiResponse<TokenExchangeResult>>(authPaths.login, body);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || 'Đăng nhập thất bại');
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
        throw new Error(data.message || 'Đăng ký thất bại');
    }
    return data.result;
}

export async function logout(refreshToken: string): Promise<void> {
    const body: LogoutRequestBody = { refreshToken };
    await axiosClient.post<ApiResponse<void>>(authPaths.logout, body);
}

export async function fetchUserInfo(): Promise<UserInfoResult> {
    const { data } = await axiosClient.get<ApiResponse<UserInfoResult>>(authPaths.userinfo);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || 'Không lấy được thông tin người dùng');
    }
    return data.result;
}

export async function introspectToken(token: string): Promise<IntrospectResult> {
    const body: IntrospectTokenRequestBody = { token };
    const { data } = await axiosClient.post<ApiResponse<IntrospectResult>>(authPaths.introspect, body);
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || 'Introspect thất bại');
    }
    return data.result;
}

export function persistTokensFromExchange(result: TokenExchangeResult): void {
    authStorage.setTokens(result.access_token, result.refresh_token);
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatusResult> {
    const { data } = await axiosClient.get<ApiResponse<OnboardingStatusResult>>(
        `${USER_API_BASE}/me/onboarding-status`,
    );
    if (data.code !== 1000 || !data.result) {
        throw new Error(data.message || 'Cannot fetch onboarding status');
    }
    return data.result;
}

export async function requestEmailOtp(): Promise<void> {
    const { data } = await axiosClient.post<ApiResponse<void>>(`${USER_API_BASE}/me/onboarding/request-otp`);
    if (data.code !== 1000) {
        throw new Error(data.message || 'Cannot request OTP');
    }
}

export async function verifyEmailOtp(otp: string): Promise<void> {
    const { data } = await axiosClient.post<ApiResponse<void>>(`${USER_API_BASE}/me/onboarding/verify-otp`, { otp });
    if (data.code !== 1000) {
        throw new Error(data.message || 'OTP verification failed');
    }
}

