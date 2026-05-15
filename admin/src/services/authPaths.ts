export const AUTH_API_BASE = "/api/v1/auth";

export const authPaths = {
    login: `${AUTH_API_BASE}/login`,
    register: `${AUTH_API_BASE}/register`,
    refresh: `${AUTH_API_BASE}/refresh`,
    logout: `${AUTH_API_BASE}/logout`,
    userinfo: `${AUTH_API_BASE}/userinfo`,
    introspect: `${AUTH_API_BASE}/introspect`,
    changePassword: `${AUTH_API_BASE}/change-password`,
    sessionsMe: `${AUTH_API_BASE}/sessions/me`,
    sessionsLogoutAll: `${AUTH_API_BASE}/sessions/logout-all`,
    sessionById: (id: string) => `${AUTH_API_BASE}/sessions/${id}`,
} as const;
