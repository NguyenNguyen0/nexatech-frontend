import type { ReactNode } from 'react';
import {
    IconBrandProducthunt,
    IconCalendarWeek,
    IconChecklist,
    IconHelpHexagon,
    IconHexagonNumber1,
    IconHome,
    IconLayoutDashboard,
    IconLayoutKanban,
    IconMessages,
    IconSettings,
    IconShoppingCart,
    IconMail,
    IconUsers,
    IconShieldLock,
    IconKey,
    IconNews,
    IconHistory,
    IconCreditCard,
    IconTruck,
    IconRosetteDiscount,
    IconTimeline,
} from '@tabler/icons-react';

export interface NavLink {
    title: string;
    label?: string;
    href: string;
    icon: ReactNode;
}

export interface SideLink extends NavLink {
    sub?: NavLink[];
}

export const sidelinks: SideLink[] = [
    {
        title: 'Dashboard',
        label: '',
        href: '/admin/dashboard',
        icon: <IconLayoutDashboard size={18} />,
    },
    {
        title: 'Users',
        label: '',
        href: '',
        icon: <IconUsers size={18} />,
        sub: [
            {
                title: 'User List',
                label: '',
                href: '/admin/users',
                icon: <IconUsers size={18} />,
            },
            {
                title: 'Role List',
                label: '',
                href: '/admin/roles',
                icon: <IconShieldLock size={18} />,
            },
            {
                title: 'Permission List',
                label: '',
                href: '/admin/permissions',
                icon: <IconKey size={18} />,
            },
        ],
    },
    {
        title: 'Kanban',
        label: '',
        href: '/admin/kanban',
        icon: <IconLayoutKanban size={18} />,
    },
    {
        title: 'Products',
        label: '',
        href: '',
        icon: <IconChecklist size={18} />,
        sub: [
            {
                title: 'Product List',
                label: '',
                href: '/admin/product/products',
                icon: <IconBrandProducthunt size={18} />,
            },
            {
                title: 'Categories',
                label: '',
                href: '/admin/product/categories',
                icon: <IconChecklist size={18} />,
            },
            {
                title: 'Brands',
                label: '',
                href: '/admin/product/brands',
                icon: <IconChecklist size={18} />,
            },
            {
                title: 'Stock Management',
                label: '',
                href: '/admin/product/stock',
                icon: <IconShoppingCart size={18} />,
            },
            {
                title: 'Add Product',
                label: '',
                href: '/admin/product/add-product',
                icon: <IconHexagonNumber1 size={18} />,
            },
        ],
    },
    {
        title: 'Warehouse',
        label: '',
        href: '/admin/warehouse',
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'News',
        label: '',
        href: '/admin/news',
        icon: <IconNews size={18} />,
    },
    {
        title: 'Chats',
        label: '',
        href: '/admin/chats',
        icon: <IconMessages size={18} />,
    },
    {
        title: 'Promotions',
        label: '',
        href: '',
        icon: <IconRosetteDiscount size={18} />,
        sub: [
            {
                title: 'Flash Sales',
                label: '',
                href: '/admin/promotions/flash-sales',
                icon: <IconRosetteDiscount size={18} />,
            },
        ],
    },
    {
        title: 'Order',
        label: '',
        href: '/admin/order',
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'Payment',
        label: '',
        href: '/admin/payment',
        icon: <IconCreditCard size={18} />,
    },
    {
        title: 'Shipping',
        label: '',
        href: '/admin/shipping',
        icon: <IconTruck size={18} />,
    },
    {
        title: 'Calendar',
        label: '',
        href: '/admin/calendar',
        icon: <IconCalendarWeek size={18} />,
    },
    {
        title: 'Email',
        label: '',
        href: '/admin/emails',
        icon: <IconMail size={18} />,
        sub: [
            {
                title: 'Inbox',
                label: '',
                href: '/admin/emails',
                icon: <IconBrandProducthunt size={18} />,
            },
            {
                title: 'Send Email',
                label: '',
                href: '/admin/emails/send',
                icon: <IconHexagonNumber1 size={18} />,
            },
        ],
    },
    {
        title: 'Tasks',
        label: '',
        href: '/admin/tasks',
        icon: <IconChecklist size={18} />,
    },
    {
        title: 'Supports',
        label: '',
        href: '/admin/supports',
        icon: <IconHelpHexagon size={18} />,
    },
    {
        title: 'Audit Logs',
        label: '',
        href: '',
        icon: <IconHistory size={18} />,
        sub: [
            {
                title: 'Audit Log',
                label: '',
                href: '/admin/audit',
                icon: <IconHistory size={18} />,
            },
            {
                title: 'Trace Log',
                label: '',
                href: '/admin/audit/trace',
                icon: <IconTimeline size={18} />,
            },
        ],
    },
    {
        title: 'Settings',
        label: '',
        href: '/admin/settings',
        icon: <IconSettings size={18} />,
    },
];
