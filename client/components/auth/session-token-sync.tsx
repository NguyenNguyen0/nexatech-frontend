'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { authStorage } from '@/features/auth/utils/auth-storage';
import { flushGuestBehaviors } from '@/features/behavior/services/behavior-api';
import { featureFlags } from '@/lib/feature-flags';

/** Đồng bộ Bearer token khi đã đăng nhập (kể cả lúc chờ OTP — cần gọi API gửi/verify OTP). */
export function SessionTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.accessToken || !session.refreshToken) {
      return;
    }

    authStorage.setTokens(session.accessToken, session.refreshToken);

    if (!featureFlags.ENABLE_BEHAVIOR_TRACKING) {
      return;
    }

    void flushGuestBehaviors().catch(() => {
      // Keep the user session intact even if behavior replay fails.
    });
  }, [status, session?.accessToken, session?.refreshToken, session?.otpStepUpPending]);

  return null;
}
