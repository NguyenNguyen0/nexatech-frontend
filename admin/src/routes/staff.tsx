import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';
import AppShell from '@/components/app-shell';
import GeneralError from '@/pages/errors/general-error';

export const staff: RouteObject[] = [
    {
        path: '/staff',
        element: (
            <ProtectedRoute allowedRoles={['STAFF']}>
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
                    Component: (await import('@/pages/staff/StaffDashboard')).default,
                }),
            },
            {
                path: 'chats',
                lazy: async () => ({
                    Component: (await import('@/pages/staff/chats')).default,
                }),
            },
            {
                path: 'agent',
                lazy: async () => ({
                    Component: (await import('@/pages/staff/agent')).default,
                }),
            },
            {
                path: 'news',
                lazy: async () => ({
                    Component: (await import('@/pages/news/NewsList')).default,
                }),
            },
            {
                path: 'news/upsert',
                lazy: async () => ({
                    Component: (await import('@/pages/news/NewsUpsert')).default,
                }),
            },
            {
                path: 'news/upsert/:slug',
                lazy: async () => ({
                    Component: (await import('@/pages/news/NewsUpsert')).default,
                }),
            },
            {
                path: 'news/preview/:slug',
                lazy: async () => ({
                    Component: (await import('@/pages/news/NewsPreview')).default,
                }),
            },
            {
                path: 'order',
                lazy: async () => ({
                    Component: (await import('@/pages/staff/order')).default,
                }),
            },
            {
                path: 'settings',
                lazy: async () => ({
                    Component: (await import('@/pages/staff/settings')).default,
                }),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/staff/settings/profile')).default,
                        }),
                    },
                    {
                        path: 'account',
                        lazy: async () => ({
                            Component: (await import('@/pages/staff/settings/account')).default,
                        }),
                    },
                    {
                        path: 'appearance',
                        lazy: async () => ({
                            Component: (await import('@/pages/staff/settings/appearance')).default,
                        }),
                    },
                    {
                        path: 'notifications',
                        lazy: async () => ({
                            Component: (await import('@/pages/staff/settings/notifications')).default,
                        }),
                    },
                    {
                        path: 'sessions',
                        lazy: async () => ({
                            Component: (await import('@/pages/staff/settings/sessions')).default,
                        }),
                    },
                ],
            },
        ],
    },
];
