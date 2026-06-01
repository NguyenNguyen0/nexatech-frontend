import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';
import AppShell from '@/components/app-shell';
import GeneralError from '@/pages/errors/general-error';

export const accountant: RouteObject[] = [
    {
        path: '/accountant',
        element: (
            <ProtectedRoute allowedRoles={['ACCOUNTANT']}>
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
                    Component: (await import('@/pages/accountant/AccountantDashboard')).default,
                }),
            },
            {
                path: 'payment',
                lazy: async () => ({
                    Component: (await import('@/pages/accountant/payment')).default,
                }),
            },
            {
                path: 'audit',
                lazy: async () => ({
                    Component: (await import('@/pages/accountant/audit')).default,
                }),
            },
            {
                path: 'audit/trace',
                lazy: async () => ({
                    Component: (await import('@/pages/accountant/audit/components/AuditTrace')).AuditTrace,
                }),
            },
            {
                path: 'settings',
                lazy: async () => ({
                    Component: (await import('@/pages/accountant/settings')).default,
                }),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/accountant/settings/profile')).default,
                        }),
                    },
                    {
                        path: 'account',
                        lazy: async () => ({
                            Component: (await import('@/pages/accountant/settings/account')).default,
                        }),
                    },
                    {
                        path: 'appearance',
                        lazy: async () => ({
                            Component: (await import('@/pages/accountant/settings/appearance')).default,
                        }),
                    },
                    {
                        path: 'notifications',
                        lazy: async () => ({
                            Component: (await import('@/pages/accountant/settings/notifications')).default,
                        }),
                    },
                    {
                        path: 'sessions',
                        lazy: async () => ({
                            Component: (await import('@/pages/accountant/settings/sessions')).default,
                        }),
                    },
                ],
            },
        ],
    },
];
