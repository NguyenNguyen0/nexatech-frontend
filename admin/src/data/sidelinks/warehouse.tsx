import {
    IconLayoutDashboard,
    IconSettings,
    IconShoppingCart,
    IconTruck,
} from '@tabler/icons-react';
import type { SideLink } from './types';

const P = '/warehouse';

/** WAREHOUSE: inventory, stock, outbound shipping */
export const warehouseSidelinks: SideLink[] = [
    {
        title: 'Inventory',
        href: `${P}/dashboard`,
        icon: <IconLayoutDashboard size={18} />,
    },
    {
        title: 'Stock',
        href: `${P}/stock`,
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'Shipping',
        href: `${P}/shipping`,
        icon: <IconTruck size={18} />,
    },
    {
        title: 'Settings',
        href: `${P}/settings`,
        icon: <IconSettings size={18} />,
    },
];
