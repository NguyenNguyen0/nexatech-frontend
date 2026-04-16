import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/customize/ProtectedRoute';
import { LazyWrapper } from '@/components/customize/LazyWrapper';

const StaffDashboard = lazy(() => import('@/pages/staff/StaffDashboard'));

export const staff: RouteObject[] = [
    {
        path: '/staff',
        element: (
            <ProtectedRoute>
                <LazyWrapper>
                    <Outlet />
                </LazyWrapper>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <StaffDashboard /> },
        ],
    },
];
