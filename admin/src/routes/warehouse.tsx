import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';
import AppShell from '@/components/app-shell';
import GeneralError from '@/pages/errors/general-error';

export const warehouse: RouteObject[] = [
    {
        path: '/warehouse',
        element: (
            <ProtectedRoute allowedRoles={['WAREHOUSE']}>
                <LazyWrapper>
                    <AppShell />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        errorElement: <GeneralError />,
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            {
                path: 'dashboard',
                lazy: async () => ({
                    Component: (await import('@/pages/warehouse/WarehouseDashboard')).default,
                }),
            },
            {
                path: 'stock',
                lazy: async () => ({
                    Component: (await import('@/pages/warehouse/WarehouseDashboard')).default,
                }),
            },
            {
                path: 'shipping',
                lazy: async () => ({
                    Component: (await import('@/pages/warehouse/shipping')).default,
                }),
            },
            {
                path: 'settings',
                lazy: async () => ({
                    Component: (await import('@/pages/warehouse/settings')).default,
                }),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/settings/profile')).default,
                        }),
                    },
                    {
                        path: 'account',
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/settings/account')).default,
                        }),
                    },
                    {
                        path: 'appearance',
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/settings/appearance')).default,
                        }),
                    },
                    {
                        path: 'notifications',
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/settings/notifications')).default,
                        }),
                    },
                    {
                        path: 'sessions',
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/settings/sessions')).default,
                        }),
                    },
                ],
            },
        ],
    },
];
