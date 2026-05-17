export interface SessionItem {
    id: string;
    userId: string;
    username: string;
    /** "REGULAR" or "OFFLINE" */
    type: string;
    /** ISO-8601 string, e.g. "2026-05-15T12:29:29.000Z" */
    started: string;
    lastAccess: string;
    ipAddress: string;
    clients: string[];
    /** true when this session matches the current access token */
    current: boolean;
    rememberMe: boolean;
}
