'use client';

import { useEffect } from 'react';
import { pingSession } from '@/features/storefront/account/services/session-api';

const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * Periodically pings /auth/session/ping to detect remote session revocation.
 * When the session is revoked on the server, the backend returns 401.
 * axiosClient's 401 interceptor will attempt a token refresh — which will
 * also fail — and then clear tokens and redirect to /auth/login.
 */
export function useSessionHeartbeat() {
  useEffect(() => {
    const id = setInterval(() => {
      pingSession().catch(() => {});
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
