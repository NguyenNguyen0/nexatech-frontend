export interface ApiResponse<T> {
    code: number;
    message?: string;
    result?: T;
}

export interface TokenExchangeResult {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    id_token?: string;
    "not-before-policy"?: number;
    session_state?: string;
    scope?: string;
}

export interface LoginRequestBody {
    username: string;
    password: string;
}

export type UserGender = "MALE" | "FEMALE" | "OTHER";

export interface RegisterCredential {
    type: "password";
    value: string;
    temporary: boolean;
}

export interface RegisterRequestBody {
    username: string;
    email: string;
    enabled: boolean;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dob?: string;
    gender?: UserGender;
    onBoarded?: boolean;
    /**
     * Keycloak realm role name to assign at registration time.
     * - client register defaults to `customer`
     * - internal register chooses a role excluding `customer`
     */
    role?: string;
    credentials: RegisterCredential[];
}

export type RegisterRequestInput = Omit<RegisterRequestBody, "emailVerified">;

export interface UserInfoResult {
    sub: string;
    email_verified?: boolean;
    name?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
}

export interface RealmAccess {
    roles: string[];
}

export interface ResourceAccessItem {
    roles: string[];
}

export type ResourceAccess = Record<string, ResourceAccessItem>;

export interface IntrospectResult extends UserInfoResult {
    exp: number;
    iat: number;
    jti: string;
    iss: string;
    aud: string;
    typ: string;
    azp: string;
    sid: string;
    "allowed-origins"?: string[];
    realm_access?: RealmAccess;
    resource_access?: ResourceAccess;
    scope?: string;
    client_id?: string;
    username?: string;
    zone_info?: string;
    active: boolean;
}
