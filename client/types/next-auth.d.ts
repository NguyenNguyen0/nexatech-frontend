import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    /** Chỉ để đồng bộ axios `authStorage` sau login; tránh lưu nơi khác. */
    refreshToken?: string;
    /** Chưa nhập OTP step-up — middleware chặn mọi route trừ /auth/login. */
    otpStepUpPending?: boolean;
    error?: 'RefreshTokenError';
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    error?: 'RefreshTokenError';
    /** true sau credentials login; false sau `update({ otpStepUpComplete: true })`. */
    otp_step_up_pending?: boolean;
  }
}
