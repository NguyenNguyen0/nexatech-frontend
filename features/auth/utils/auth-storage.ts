const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

/**
 * Unified auth token storage.
 * Uses localStorage — safe because auth is client-side only.
 */
export const authStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS);
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS, accessToken);
    localStorage.setItem(REFRESH, refreshToken);
  },

  clear(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};
