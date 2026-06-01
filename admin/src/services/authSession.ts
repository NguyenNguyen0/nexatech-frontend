type JwtPayload = {
    sub?: string;
    exp?: number; // seconds since epoch
    realm_access?: {
        roles?: string[];
    };
    resource_access?: Record<string, { roles?: string[] }>;
};

function base64UrlDecodeToString(input: string): string {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return atob(base64 + pad);
}

function decodeJwtPayload(token: string): JwtPayload | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
        return JSON.parse(base64UrlDecodeToString(parts[1])) as JwtPayload;
    } catch {
        return null;
    }
}

export function getAccessToken(): string | null {
    return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
}

const OTP_STEP_UP_PENDING = "nexatech_admin_otp_step_pending";
const OTP_STEP_UP_SENT_AT = "nexatech_admin_otp_step_sent_at";
const OTP_STEP_UP_TTL_MS = 5 * 60 * 1000;

/** Sau login, chưa verify OTP — chặn vào dashboard (sessionStorage, F5 vẫn giữ). */
export function setOtpStepUpPending(): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(OTP_STEP_UP_PENDING, "1");
    sessionStorage.setItem(OTP_STEP_UP_SENT_AT, String(Date.now()));
}

export function clearOtpStepUpPending(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(OTP_STEP_UP_PENDING);
    sessionStorage.removeItem(OTP_STEP_UP_SENT_AT);
}

export function isOtpStepUpPending(): boolean {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem(OTP_STEP_UP_PENDING) !== "1") return false;

    const sentAt = Number(sessionStorage.getItem(OTP_STEP_UP_SENT_AT));
    if (!Number.isFinite(sentAt) || sentAt <= 0) {
        clearOtpStepUpPending();
        return false;
    }

    if (Date.now() - sentAt > OTP_STEP_UP_TTL_MS) {
        clearOtpStepUpPending();
        return false;
    }

    return true;
}

const PASSWORD_CHANGE_REQUIRED = "nexatech_admin_password_change_required";

export function setPasswordChangeRequired(required: boolean): void {
    if (typeof window === "undefined") return;
    if (required) {
        sessionStorage.setItem(PASSWORD_CHANGE_REQUIRED, "1");
    } else {
        sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED);
    }
}

export function isPasswordChangeRequired(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(PASSWORD_CHANGE_REQUIRED) === "1";
}

export function clearAuthTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    clearOtpStepUpPending();
    setPasswordChangeRequired(false);
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
}

export function getRolesFromAccessToken(token: string | null): string[] {
    if (!token) return [];
    const payload = decodeJwtPayload(token);
    const roles = [
        ...(payload?.realm_access?.roles ?? []),
        ...Object.values(payload?.resource_access ?? {}).flatMap((access) => access.roles ?? []),
    ];
    return Array.from(
        new Set(
            roles
                .filter((r): r is string => typeof r === "string")
                .map(normalizeRoleName)
                .filter(Boolean),
        ),
    );
}

export function getUserIdFromAccessToken(token: string | null): string | null {
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    return typeof payload?.sub === "string" ? payload.sub : null;
}

export function isAccessTokenExpired(token: string | null): boolean {
    if (!token) return true;
    const exp = decodeJwtPayload(token)?.exp;
    if (!exp) return false;
    return exp <= Math.floor(Date.now() / 1000);
}

const ROLE_PRIORITY: string[] = ["ADMIN", "MANAGER", "STAFF", "WAREHOUSE", "ACCOUNTANT", "CUSTOMER"];

function normalizeRoleName(role: string): string {
    return role.trim().toUpperCase().replace(/^ROLE_/, "").replace(/^SCOPE_/, "");
}

export function pickPrimaryRole(roles: string[]): string | null {
    for (const r of ROLE_PRIORITY) {
        if (roles.includes(r)) return r;
    }
    return roles.length > 0 ? roles[0] : null;
}

export function getDefaultPathByRole(roles: string[]): string {
    const role = pickPrimaryRole(roles);
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "MANAGER":
            return "/manager";
        case "STAFF":
            return "/staff";
        case "WAREHOUSE":
            return "/warehouse";
        case "ACCOUNTANT":
            return "/accountant";
        case "CUSTOMER":
        default:
            return "/auth";
    }
}

export function canAccessByPath(pathname: string, roles: string[]): boolean {
    if (!pathname) return false;
    const roleSet = new Set(roles);
    if (roleSet.has("CUSTOMER")) return pathname.startsWith("/auth");
    if (pathname.startsWith("/admin")) return roleSet.has("ADMIN");
    if (pathname.startsWith("/manager")) return roleSet.has("MANAGER");
    if (pathname.startsWith("/staff")) return roleSet.has("STAFF");
    if (pathname.startsWith("/warehouse")) return roleSet.has("WAREHOUSE");
    if (pathname.startsWith("/accountant")) return roleSet.has("ACCOUNTANT");
    return true;
}

