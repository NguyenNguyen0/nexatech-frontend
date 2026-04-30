type JwtPayload = {
  exp?: number;
  realm_access?: {
    roles?: string[];
  };
};

function base64UrlDecodeToString(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return atob(base64 + pad);
}

function decodeJwtPayload(token: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(base64UrlDecodeToString(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract realm roles from a JWT access token.
 */
export function getRolesFromAccessToken(token: string | null): string[] {
  if (!token) return [];
  const payload = decodeJwtPayload(token);
  const roles = payload?.realm_access?.roles ?? [];
  return roles
    .filter((r): r is string => typeof r === 'string')
    .map((r) => r.toUpperCase());
}

/**
 * Check whether a JWT token is expired.
 */
export function isAccessTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const exp = decodeJwtPayload(token)?.exp;
  if (!exp) return false;
  return exp <= Math.floor(Date.now() / 1000);
}

const ROLE_PRIORITY = ['ADMIN', 'MANAGER', 'STAFF', 'WAREHOUSE', 'ACCOUNTANT', 'CUSTOMER'];

/**
 * Pick the highest-priority role from a list.
 */
export function pickPrimaryRole(roles: string[]): string | null {
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return r;
  }
  return roles.length > 0 ? roles[0] : null;
}

/**
 * Check whether a user with `roles` can access a given `pathname`.
 */
export function canAccessByPath(pathname: string, roles: string[]): boolean {
  if (!pathname) return false;
  const roleSet = new Set(roles);
  if (pathname.startsWith('/admin')) return roleSet.has('ADMIN');
  if (pathname.startsWith('/manager')) return roleSet.has('MANAGER');
  if (pathname.startsWith('/staff')) return roleSet.has('STAFF');
  if (pathname.startsWith('/warehouse')) return roleSet.has('WAREHOUSE');
  if (pathname.startsWith('/accountant')) return roleSet.has('ACCOUNTANT');
  return true;
}
