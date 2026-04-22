import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/customize/ProtectedRoute';
import { LazyWrapper } from '@/components/customize/LazyWrapper';

const WarehouseDashboard = lazy(() => import('@/pages/warehouse/WarehouseDashboard'));

export const warehouse: RouteObject[] = [
    {
        path: '/warehouse',
        element: (
            <ProtectedRoute>
                <LazyWrapper>
                    <Outlet />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <WarehouseDashboard /> },
        ],
    },
];
