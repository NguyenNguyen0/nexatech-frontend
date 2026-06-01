import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';
import AppShell from '@/components/app-shell';
import GeneralError from '@/pages/errors/general-error';

export const manager: RouteObject[] = [
    {
        path: '/manager',
        element: (
            <ProtectedRoute allowedRoles={['MANAGER']}>
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
                    Component: (await import('@/pages/manager/dashboard')).default,
                }),
            },
            {
                path: 'dashboard/analytics',
                element: <Navigate to="/manager/dashboard?tab=analytics" replace />,
            },
            {
                path: 'order',
                lazy: async () => ({
                    Component: (await import('@/pages/manager/order')).default,
                }),
            },
            {
                path: 'promotions/flash-sales',
                lazy: async () => ({
                    Component: (await import('@/pages/manager/promotions/flash-sales')).default,
                }),
            },
            {
                path: 'shipping',
                lazy: async () => ({
                    Component: (await import('@/pages/manager/shipping')).default,
                }),
            },
            {
                path: 'settings',
                lazy: async () => ({
                    Component: (await import('@/pages/manager/settings')).default,
                }),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/manager/settings/profile')).default,
                        }),
                    },
                    {
                        path: 'account',
                        lazy: async () => ({
                            Component: (await import('@/pages/manager/settings/account')).default,
                        }),
                    },
                    {
                        path: 'appearance',
                        lazy: async () => ({
                            Component: (await import('@/pages/manager/settings/appearance')).default,
                        }),
                    },
                    {
                        path: 'notifications',
                        lazy: async () => ({
                            Component: (await import('@/pages/manager/settings/notifications')).default,
                        }),
                    },
                    {
                        path: 'sessions',
                        lazy: async () => ({
                            Component: (await import('@/pages/manager/settings/sessions')).default,
                        }),
                    },
                ],
            },
        ],
    },
];
