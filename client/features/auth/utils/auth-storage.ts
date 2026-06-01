const ACCESS = 'access_token';
const REFRESH = 'refresh_token';
const OTP_STEP_UP_PENDING = 'nexatech:otp-step-up-pending';

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

  setOtpStepUpPending(pending: boolean): void {
    if (typeof window === 'undefined') return;
    if (pending) {
      localStorage.setItem(OTP_STEP_UP_PENDING, '1');
    } else {
      localStorage.removeItem(OTP_STEP_UP_PENDING);
    }
  },

  isOtpStepUpPending(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(OTP_STEP_UP_PENDING) === '1';
  },

  clear(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(OTP_STEP_UP_PENDING);
  },
};
