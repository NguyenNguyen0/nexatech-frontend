/** Matches identity-service ApiResponse<T> (Jackson default field names). */
export interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}

/** Keycloak token payload; Java UserTokenExchangeResponse uses snake_case JSON. */
export interface TokenExchangeResult {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    id_token?: string;
    'not-before-policy'?: number;
    session_state?: string;
    scope?: string;
}

/** Alias for interceptors / store callbacks. */
export type AuthTokensPayload = TokenExchangeResult;

export interface LoginRequestBody {
    username: string;
    password: string;
}

export interface RefreshTokenRequestBody {
    refreshToken: string;
}

export interface LogoutRequestBody {
    refreshToken: string;
}

export interface IntrospectTokenRequestBody {
    token: string;
}

export interface RegisterCredential {
    type: string;
    value: string;
    temporary: boolean;
}

/** Matches UserCreationParam — register via gateway (JSON gửi server). */
export interface RegisterRequestBody {
    username: string;
    email: string;
    enabled: boolean;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
    /**
     * Keycloak realm role name to assign at registration time.
     * Client register defaults to `customer`.
     */
    role?: string;
    credentials: RegisterCredential[];
}

/** Dữ liệu từ form / client — không gồm emailVerified; API luôn gắn false (user xác minh sau). */
export type RegisterRequestInput = Omit<RegisterRequestBody, 'emailVerified'>;

export type UserInfoResult = Record<string, unknown>;
