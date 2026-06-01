import { useEffect } from 'react'
import axiosClient from '@/lib/axiosClient'
import { authPaths } from '@/services/authPaths'
import { getAccessToken, getRefreshToken, isOtpStepUpPending } from '@/services/authSession'

/**
 * Periodically pings the backend session liveness endpoint.
 *
 * If the current session has been remotely revoked (e.g. "Sign out this device"
 * from another browser), the backend returns 401. The axiosClient interceptor
 * then attempts a token refresh; since the Keycloak session is dead the refresh
 * fails with invalid_grant → tokens are cleared → user is redirected to /auth.
 *
 * This is the mechanism that makes remote session revocation feel "real-time"
 * to the user: they are redirected within `intervalMs` of being signed out.
 *
 * @param intervalMs  Poll interval in milliseconds (default 20 000 = 20 s)
 */
export function useSessionHeartbeat(intervalMs = 20_000) {
  useEffect(() => {
    const ping = () => {
      if (isOtpStepUpPending() || (!getAccessToken() && !getRefreshToken())) {
        return
      }

      axiosClient
        .get<void>(authPaths.sessionPing)
        .catch(() => {
          // Intentionally silent.
          // • 401 → axiosClient interceptor tries refresh → fails → clears tokens → /auth
          // • Network error → ignored, will retry next interval
        })
    }

    // Run once immediately, then on each interval.
    ping()
    const timer = setInterval(ping, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
}
