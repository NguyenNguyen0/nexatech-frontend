export function resolveBackendBaseUrl(): string {
  return (
    process.env.API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    'http://localhost:8080'
  ).replace(/\/$/, '');
}
