'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { isAxiosError } from 'axios';
import { pingSession } from '@/features/storefront/account/services/session-api';
import { authStorage } from '@/features/auth/utils/auth-storage';

const HEARTBEAT_INTERVAL_MS = 15_000;

async function forceClientLogout(reason?: 'sessionRevoked' | 'accountDisabled') {
  authStorage.clear();
  const { signOut } = await import('next-auth/react');
  await signOut({ redirect: false });
  const params = new URLSearchParams();
  if (reason) params.set('reason', reason);
  const qs = params.toString();
  window.location.href = qs ? `/auth/login?${qs}` : '/auth/login';
}

/**
 * Periodically pings /auth/session/ping to detect remote session revocation
 * (admin "Đăng xuất tất cả" or account disabled while user is online).
 * When the session sid is revoked in Redis, the next ping returns 401.
 */
export function useSessionHeartbeat() {
  const { status } = useSession();
  const handling = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      handling.current = false;
      return;
    }

    const tick = async () => {
      if (handling.current) return;
      if (!authStorage.getAccessToken()) return;

      try {
        await pingSession();
      } catch (err) {
        if (!isAxiosError(err) || err.response?.status !== 401) {
          return;
        }
        handling.current = true;
        const code = (err.response?.data as { code?: number } | undefined)?.code;
        await forceClientLogout(code === 2036 ? 'accountDisabled' : 'sessionRevoked');
      }
    };

    void tick();
    const id = setInterval(() => void tick(), HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status]);
}
