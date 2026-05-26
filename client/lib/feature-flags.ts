/**
 * Feature Flags Configuration
 *
 * Control feature behavior via environment variables.
 * Format: NEXT_PUBLIC_FEATURE_FLAG_<NAME>=true|false
 */

export const featureFlags = {
  /**
   * USE_MOCK_API: Toggle between mock API and real product service
   * - true: Use local mock API routes (Next.js /api/v1/[...path]/route.ts)
   * - false: Use real API Gateway (via NEXT_PUBLIC_BACKEND_BASE_URL or localhost:8080)
   *
   * Default: false (use real API service by default)
   * Environment variable: NEXT_PUBLIC_FEATURE_FLAG_USE_MOCK_API
   */
  USE_MOCK_API: process.env.NEXT_PUBLIC_FEATURE_FLAG_USE_MOCK_API === 'true',

  /**
   * ENABLE_RECOMMENDATION: Toggle recommendation API integration rollout.
   * - true (default): Use recommendation endpoints for home/PDP.
   * - false: Skip recommendation calls and fall back to legacy product flows.
   *
   * Environment variable: NEXT_PUBLIC_FEATURE_FLAG_ENABLE_RECOMMENDATION
   */
  ENABLE_RECOMMENDATION: process.env.NEXT_PUBLIC_FEATURE_FLAG_ENABLE_RECOMMENDATION !== 'false',

  /**
   * ENABLE_BEHAVIOR_TRACKING: Toggle behavior event collection rollout.
   * - true (default): Collect and send behavior events.
   * - false: Disable behavior tracking and guest queue flush.
   *
   * Environment variable: NEXT_PUBLIC_FEATURE_FLAG_ENABLE_BEHAVIOR_TRACKING
   */
  ENABLE_BEHAVIOR_TRACKING: process.env.NEXT_PUBLIC_FEATURE_FLAG_ENABLE_BEHAVIOR_TRACKING !== 'false',
} as const;

/**
 * Get mock API indicator string for debugging/logging
 */
export function getMockApiIndicator(): string {
  return featureFlags.USE_MOCK_API ? '[MOCK API]' : '[REAL API]';
}
