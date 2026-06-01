import {
    IconBrandProducthunt,
    IconChecklist,
    IconCreditCard,
    IconHexagonNumber1,
    IconHistory,
    IconKey,
    IconLayoutDashboard,
    IconMessages,
    IconNews,
    IconRosetteDiscount,
    IconSettings,
    IconShieldLock,
    IconShoppingCart,
    IconSparkles,
    IconTimeline,
    IconTruck,
    IconUsers,
} from '@tabler/icons-react';
import type { SideLink } from './types';

const P = '/admin';

export const adminSidelinks: SideLink[] = [
    {
        title: 'Dashboard',
        href: `${P}/dashboard`,
        icon: <IconLayoutDashboard size={18} />,
    },
    {
        title: 'Users',
        href: '',
        icon: <IconUsers size={18} />,
        sub: [
            { title: 'User List', href: `${P}/users`, icon: <IconUsers size={18} /> },
            { title: 'Role List', href: `${P}/roles`, icon: <IconShieldLock size={18} /> },
            { title: 'Permission List', href: `${P}/permissions`, icon: <IconKey size={18} /> },
        ],
    },
    {
        title: 'Products',
        href: '',
        icon: <IconChecklist size={18} />,
        sub: [
            { title: 'Product List', href: `${P}/product/products`, icon: <IconBrandProducthunt size={18} /> },
            { title: 'Categories', href: `${P}/product/categories`, icon: <IconChecklist size={18} /> },
            { title: 'Brands', href: `${P}/product/brands`, icon: <IconChecklist size={18} /> },
            { title: 'Stock Management', href: `${P}/product/stock`, icon: <IconShoppingCart size={18} /> },
            { title: 'Add Product', href: `${P}/product/add-product`, icon: <IconHexagonNumber1 size={18} /> },
        ],
    },
    {
        title: 'Warehouse',
        href: `${P}/warehouse`,
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'News',
        href: `${P}/news`,
        icon: <IconNews size={18} />,
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
        title: 'Promotions',
        href: '',
        icon: <IconRosetteDiscount size={18} />,
        sub: [
            { title: 'Flash Sales', href: `${P}/promotions/flash-sales`, icon: <IconRosetteDiscount size={18} /> },
        ],
    },
    {
        title: 'Order',
        href: `${P}/order`,
        icon: <IconShoppingCart size={18} />,
    },
    {
        title: 'Payment',
        href: `${P}/payment`,
        icon: <IconCreditCard size={18} />,
    },
    {
        title: 'Shipping',
        href: `${P}/shipping`,
        icon: <IconTruck size={18} />,
    },
    {
        title: 'Audit Logs',
        href: '',
        icon: <IconHistory size={18} />,
        sub: [
            { title: 'Audit Log', href: `${P}/audit`, icon: <IconHistory size={18} /> },
            { title: 'Trace Log', href: `${P}/audit/trace`, icon: <IconTimeline size={18} /> },
        ],
    },
    {
        title: 'Settings',
        href: `${P}/settings`,
        icon: <IconSettings size={18} />,
    },
];
