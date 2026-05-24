import type { ApiEnvelope } from '@/types/api-envelope'

export function unwrapApiEnvelope<T>(payload: ApiEnvelope<T>, fallbackMessage: string): T {
  if (payload.data !== undefined) {
    return payload.data
  }

  if (payload.result !== undefined) {
    return payload.result
  }

  throw new Error(payload.message ?? fallbackMessage)
}

export function ensureApiSuccess(payload: ApiEnvelope<unknown>, fallbackMessage: string): void {
  const hasPayload = payload.data !== undefined || payload.result !== undefined
  if (hasPayload || payload.success === true || payload.code === 1000) {
    return
  }

  throw new Error(payload.message ?? fallbackMessage)
}
