import {
    IconLayoutDashboard,
    IconRosetteDiscount,
    IconSettings,
    IconShoppingCart,
    IconTruck,
} from '@tabler/icons-react';
import type { SideLink } from './types';

const P = '/manager';

/** MANAGER: business overview, orders, promotions, shipping oversight */
export const managerSidelinks: SideLink[] = [
    {
        title: 'Dashboard',
        href: `${P}/dashboard`,
        icon: <IconLayoutDashboard size={18} />,
    },
    {
        title: 'Orders',
        href: `${P}/order`,
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'Flash Sales',
        href: `${P}/promotions/flash-sales`,
        icon: <IconRosetteDiscount size={18} />,
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
