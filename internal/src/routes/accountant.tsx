import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/customize/ProtectedRoute';
import { LazyWrapper } from '@/components/customize/LazyWrapper';

const AccountantDashboard = lazy(() => import('@/pages/accountant/AccountantDashboard'));

export const accountant: RouteObject[] = [
    {
        path: '/accountant',
        element: (
            <ProtectedRoute>
                <LazyWrapper>
                    <Outlet />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <AccountantDashboard /> },
        ],
    },
];
