import {
    IconLayoutDashboard,
    IconMessages,
    IconNews,
    IconSettings,
    IconShoppingCart,
    IconSparkles,
} from '@tabler/icons-react';
import type { SideLink } from './types';

const P = '/staff';

/** STAFF: customer support (chats, agent), content (news), order assistance */
export const staffSidelinks: SideLink[] = [
    {
        title: 'Dashboard',
        href: `${P}/dashboard`,
        icon: <IconLayoutDashboard size={18} />,
    },
    {
        title: 'Chats',
        href: `${P}/chats`,
        icon: <IconMessages size={18} />,
    },
    {
        title: 'Agent',
        href: `${P}/agent`,
        icon: <IconSparkles size={18} />,
    },
    {
        title: 'News',
        href: `${P}/news`,
        icon: <IconNews size={18} />,
    },
    {
        title: 'Orders',
        href: `${P}/order`,
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'Settings',
        href: `${P}/settings`,
        icon: <IconSettings size={18} />,
    },
];
