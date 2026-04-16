import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/customize/ProtectedRoute';
import { LazyWrapper } from '@/components/customize/LazyWrapper';
import DashboardPage from '@/pages/admin/DashboardPage';

export const admin: RouteObject[] = [
    {
        path: '/admin',
        element: (
            <ProtectedRoute>
                <LazyWrapper>
                    <Outlet />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <DashboardPage /> },
        ],
    },
];
