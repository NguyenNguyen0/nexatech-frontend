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

/** Alias used in interceptors / auth callbacks. */
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

export interface IntrospectResult {
  valid: boolean;
  [key: string]: unknown;
}

export interface RegisterCredential {
  type: string;
  value: string;
  temporary: boolean;
}

/** Matches UserCreationParam — register via gateway. */
export interface RegisterRequestBody {
  username: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  role?: string;
  credentials: RegisterCredential[];
}

/** Client-facing register input (emailVerified always false). */
export type RegisterRequestInput = Omit<RegisterRequestBody, 'emailVerified'>;

export type UserInfoResult = Record<string, unknown>;
