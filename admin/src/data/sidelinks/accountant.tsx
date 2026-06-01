import {
    IconCreditCard,
    IconHistory,
    IconLayoutDashboard,
    IconSettings,
    IconTimeline,
} from '@tabler/icons-react';
import type { SideLink } from './types';

const P = '/accountant';

/** ACCOUNTANT: payments, financial audit trace, profile settings */
export const accountantSidelinks: SideLink[] = [
    {
        title: 'Dashboard',
        href: `${P}/dashboard`,
        icon: <IconLayoutDashboard size={18} />,
    },
    {
        title: 'Payments',
        href: `${P}/payment`,
        icon: <IconCreditCard size={18} />,
    },
    {
        title: 'Audit Log',
        href: `${P}/audit`,
        icon: <IconHistory size={18} />,
    },
    {
        title: 'Payment Trace',
        href: `${P}/audit/trace`,
        icon: <IconTimeline size={18} />,
    },
    {
        title: 'Settings',
        href: `${P}/settings`,
        icon: <IconSettings size={18} />,
    },
];
