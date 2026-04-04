/** Gateway route: StripPrefix=2 → identity-service /auth/** */
export const AUTH_API_BASE = '/api/v1/auth';

export const authPaths = {
    login: `${AUTH_API_BASE}/login`,
    register: `${AUTH_API_BASE}/register`,
    refresh: `${AUTH_API_BASE}/refresh`,
    logout: `${AUTH_API_BASE}/logout`,
    userinfo: `${AUTH_API_BASE}/userinfo`,
    introspect: `${AUTH_API_BASE}/introspect`,
} as const;

export function isPublicAuthRequestUrl(url: string | undefined): boolean {
    if (!url) return false;
    return (
        url.includes(authPaths.login) ||
        url.includes(authPaths.register) ||
        url.includes(authPaths.refresh)
    );
}
