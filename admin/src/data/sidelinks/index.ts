import { adminSidelinks } from './admin';
import { accountantSidelinks } from './accountant';
import { managerSidelinks } from './manager';
import { staffSidelinks } from './staff';
import { warehouseSidelinks } from './warehouse';
import type { RoleNavConfig, RolePrefix, SideLink } from './types';

export type { NavLink, SideLink, RolePrefix, RoleNavConfig } from './types';
export { adminSidelinks, accountantSidelinks, managerSidelinks, staffSidelinks, warehouseSidelinks };

const ROLE_NAV: Record<RolePrefix, RoleNavConfig> = {
    '/admin': { prefix: '/admin', title: 'Admin', links: adminSidelinks },
    '/accountant': { prefix: '/accountant', title: 'Accountant', links: accountantSidelinks },
    '/manager': { prefix: '/manager', title: 'Manager', links: managerSidelinks },
    '/staff': { prefix: '/staff', title: 'Staff', links: staffSidelinks },
    '/warehouse': { prefix: '/warehouse', title: 'Warehouse', links: warehouseSidelinks },
};

export function resolveRolePrefix(pathname: string): RolePrefix | null {
    if (pathname.startsWith('/admin')) return '/admin';
    if (pathname.startsWith('/accountant')) return '/accountant';
    if (pathname.startsWith('/manager')) return '/manager';
    if (pathname.startsWith('/staff')) return '/staff';
    if (pathname.startsWith('/warehouse')) return '/warehouse';
    return null;
}

export function getRoleNavConfig(pathname: string): RoleNavConfig {
    const prefix = resolveRolePrefix(pathname) ?? '/admin';
    return ROLE_NAV[prefix];
}

/** @deprecated Use getRoleNavConfig or role-specific exports */
export const sidelinks: SideLink[] = adminSidelinks;
