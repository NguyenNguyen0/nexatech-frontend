const TOKEN_KEY = 'nexatech_access_token';
const REFRESH_KEY = 'nexatech_refresh_token';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export const authStorage = {
  getAccessToken: (): string | null => (isBrowser() ? localStorage.getItem(TOKEN_KEY) : null),
  getRefreshToken: (): string | null => (isBrowser() ? localStorage.getItem(REFRESH_KEY) : null),
  setTokens: (access: string, refresh: string) => {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
