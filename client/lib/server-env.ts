export function resolveBackendBaseUrl(): string {
  return (
    process.env.API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    'http://localhost:8080'
  ).replace(/\/$/, '');
}

export function resolvePromotionBaseUrl(): string {
  return (
    process.env.PROMOTION_SERVICE_URL ||
    'http://localhost:8093'
  ).replace(/\/$/, '');
}
