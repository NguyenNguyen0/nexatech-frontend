import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';
import AppShell from '@/components/app-shell';
import GeneralError from '@/pages/errors/general-error';

/**
 * All admin-area routes.
 *
 * Layout:   <AppShell /> (sidebar + main outlet)
 * Prefix:   /admin
 * Guard:    <ProtectedRoute /> (redirects unauthenticated users to /auth/login)
 *
 * Each page is lazy-loaded so the initial bundle stays small.
 */
export const admin: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute>
                <LazyWrapper>
                    <AppShell />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        errorElement: <GeneralError />,
        children: [
            /** Default landing → dashboard */
            { index: true, element: <Navigate to="dashboard" replace /> },

            /** Dashboard (overview + analytics + reports + more) */
            {
                path: 'dashboard',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/dashboard')).default,
                }),
            },
            {
                path: 'dashboard/overview',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/dashboard/overview')).default,
                }),
            },
            {
                path: 'dashboard/analytics',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/dashboard/analytics')).default,
                }),
            },

            /** Kanban board */
            {
                path: 'kanban',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/kanban')).default,
                }),
            },

            /** Products: list + add form (nested) */
            {
                path: 'product',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/product')).default,
                }),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/list')).default,
                        }),
                    },
                    {
                        path: 'add-product',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/add')).default,
                        }),
                    },
                ],
            },

            /** Chats */
            {
                path: 'chats',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/chats')).default,
                }),
            },

            /** Orders */
            {
                path: 'order',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/order')).default,
                }),
            },

            /** Calendar (fullcalendar-based) */
            {
                path: 'calendar',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/calendar')).default,
                }),
            },

            /** Emails (list + composer) */
            {
                path: 'emails',
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/email/list')).default,
                        }),
                    },
                    {
                        path: 'send',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/email/send')).default,
                        }),
                    },
                ],
            },

            /** Tasks */
            {
                path: 'tasks',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/tasks')).default,
                }),
            },

            /** Support */
            {
                path: 'supports',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/support')).default,
                }),
            },

            /** Users management */
            {
                path: 'users',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/users')).default,
                }),
            },

            /** Roles management */
            {
                path: 'roles',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/roles')).default,
                }),
            },

            /** Permissions management */
            {
                path: 'permissions',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/permissions')).default,
                }),
            },

            /** Settings with sub-sections (profile/account/appearance/...) */
            {
                path: 'settings',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/settings')).default,
                }),
                errorElement: <GeneralError />,
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/settings/profile')).default,
                        }),
                    },
                    {
                        path: 'account',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/settings/account')).default,
                        }),
                    },
                    {
                        path: 'appearance',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/settings/appearance')).default,
                        }),
                    },
                    {
                        path: 'notifications',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/settings/notifications')).default,
                        }),
                    },
                    {
                        path: 'sessions',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/settings/sessions')).default,
                        }),
                    },
                ],
            },
        ],
    },
];
