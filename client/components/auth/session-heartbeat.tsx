'use client';

import { useSessionHeartbeat } from '@/features/auth/hooks/use-session-heartbeat';

/** Global session liveness check — đăng ký trên toàn app khi user đã login. */
export function SessionHeartbeat() {
  useSessionHeartbeat();
  return null;
}
