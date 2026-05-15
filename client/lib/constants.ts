/** Gateway route prefix: identity-service */
export const AUTH_API_BASE     = '/api/v1/auth';
export const USER_API_BASE     = '/api/v1/users';
export const PRODUCT_API_BASE  = '/api/v1/products';
export const CART_API_BASE     = '/api/v1/cart';
export const ORDER_API_BASE    = '/api/v1/orders';
export const CHECKOUT_API_BASE = '/api/v1/checkout';
export const PAYMENT_API_BASE  = '/api/v1/payments';
export const SHIPPING_API_BASE = '/api/v1/shipping';
export const RETURN_API_BASE   = '/api/v1/returns';

export const authPaths = {
  login: `${AUTH_API_BASE}/login`,
  register: `${AUTH_API_BASE}/register`,
  refresh: `${AUTH_API_BASE}/refresh`,
  logout: `${AUTH_API_BASE}/logout`,
  userinfo: `${AUTH_API_BASE}/userinfo`,
  introspect: `${AUTH_API_BASE}/introspect`,
  changePassword: `${AUTH_API_BASE}/change-password`,
  sessionsMe: `${AUTH_API_BASE}/sessions/me`,
  sessionsLogoutAll: `${AUTH_API_BASE}/sessions/logout-all`,
  sessionPing: `${AUTH_API_BASE}/session/ping`,
} as const;

export function sessionByIdPath(id: string): string {
  return `${AUTH_API_BASE}/sessions/${id}`;
}

/** Routes that do NOT require an Authorization header. */
export function isPublicAuthRequestUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes(authPaths.login) ||
    url.includes(authPaths.register) ||
    url.includes(authPaths.refresh) ||
    url.includes(authPaths.logout)
  );
}

/** Role hierarchy for the internal admin system. */
export const ROLE_PRIORITY: string[] = [
  'ADMIN',
  'MANAGER',
  'STAFF',
  'WAREHOUSE',
  'ACCOUNTANT',
  'CUSTOMER',
];

/** Default landing path per role. */
export function getDefaultPathByRole(roles: string[]): string {
  const roleSet = new Set(roles);
  if (roleSet.has('ADMIN')) return '/admin';
  if (roleSet.has('MANAGER')) return '/manager';
  if (roleSet.has('STAFF')) return '/staff';
  if (roleSet.has('WAREHOUSE')) return '/warehouse';
  if (roleSet.has('ACCOUNTANT')) return '/accountant';
  return '/';
}
