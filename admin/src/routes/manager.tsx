import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/custom/ProtectedRoute';
import { LazyWrapper } from '@/components/custom/LazyWrapper';

const ManagerDashboard = lazy(() => import('@/pages/manager/ManagerDashboard'));

export const manager: RouteObject[] = [
    {
        path: '/manager',
        element: (
            <ProtectedRoute>
                <LazyWrapper>
                    <Outlet />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <ManagerDashboard /> },
        ],
    },
];
