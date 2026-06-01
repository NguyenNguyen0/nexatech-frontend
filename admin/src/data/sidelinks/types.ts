import type { ReactNode } from 'react';

export interface NavLink {
    title: string;
    label?: string;
    href: string;
    icon: ReactNode;
}

export interface SideLink extends NavLink {
    sub?: NavLink[];
}

export type RolePrefix = '/admin' | '/accountant' | '/manager' | '/staff' | '/warehouse';

export interface RoleNavConfig {
    prefix: RolePrefix;
    title: string;
    links: SideLink[];
}
