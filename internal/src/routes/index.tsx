import { createBrowserRouter, Navigate } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';

import { admin } from './admin';
import { accountant } from './accountant';
import { manager } from './manager';
import { staff } from './staff';
import { warehouse } from './warehouse';
import { authRoutes } from './auth';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/auth" replace />,
    },
    ...authRoutes,
    ...admin,
    ...accountant,
    ...manager,
    ...staff,
    ...warehouse,
    { path: '*', element: <NotFoundPage /> },
]);
