import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';
import AppShell from '@/components/app-shell';
import GeneralError from '@/pages/errors/general-error';
import ProductLayout from '@/pages/admin/product';

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
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <LazyWrapper>
                    <AppShell />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        errorElement: <GeneralError />,
        children: [
            /** Default landing -> dashboard */
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

            /** Warehouse inventory dashboard */
            {
                path: 'warehouse',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <LazyWrapper>
                            <Outlet />
                        </LazyWrapper>
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/WarehouseDashboard')).default,
                        }),
                    },
                ],
            },

            /** Products: list + add form (nested) */
            {
                path: 'product',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <LazyWrapper>
                            <ProductLayout />
                        </LazyWrapper>
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <Navigate to="products" replace />,
                    },
                    {
                        path: 'products',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/list')).default,
                        }),
                    },
                    {
                        path: 'categories',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/categories')).default,
                        }),
                    },
                    {
                        path: 'brands',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/brands')).default,
                        }),
                    },
                    {
                        path: 'stock',
                        lazy: async () => ({
                            Component: (await import('@/pages/warehouse/WarehouseDashboard')).default,
                        }),
                    },
                    {
                        path: 'add-product',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/add')).default,
                        }),
                    },
                    {
                        path: 'edit/:id',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/product/add')).default,
                        }),
                    },
                ],
            },

            /** News management */
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

            /** Chats */
            {
                path: 'chats',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/chats')).default,
                }),
            },

            /** Agent */
            {
                path: 'agent',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/agent')).default,
                }),
            },

            /** Promotions */
            {
                path: 'promotions/flash-sales',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/promotions/flash-sales')).default,
                }),
            },

            /** Orders */
            {
                path: 'order',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/order')).default,
                }),
            },

            /** Payment management */
            {
                path: 'payment',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/payment')).default,
                }),
            },

            /** Shipping management */
            {
                path: 'shipping',
                lazy: async () => ({
                    Component: (await import('@/pages/admin/shipping')).default,
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

            /** Audit logs (Kafka-consumed audit-service) */
            {
                path: 'audit',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <LazyWrapper>
                            <Outlet />
                        </LazyWrapper>
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/audit')).default,
                        }),
                    },
                    {
                        path: 'trace',
                        lazy: async () => ({
                            Component: (await import('@/pages/admin/audit/components/AuditTrace')).AuditTrace,
                        }),
                    },
                ],
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
