import { createBrowserRouter, Navigate } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import GeneralError from '@/pages/errors/general-error';
import NotFoundError from '@/pages/errors/not-found-error';
import MaintenanceError from '@/pages/errors/maintenance-error';
import UnauthorisedError from '@/pages/errors/unauthorised-error';

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

    // Status pages
    { path: '/500', element: <GeneralError /> },
    { path: '/404', element: <NotFoundError /> },
    { path: '/503', element: <MaintenanceError /> },
    { path: '/401', element: <UnauthorisedError /> },

    { path: '*', element: <NotFoundPage /> },
]);
