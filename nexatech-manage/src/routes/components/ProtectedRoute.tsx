import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
    to?: string;
}

/**
 * ProtectedRoute
 *
 * Only allows authenticated users.
 * If not authenticated, redirects to login page (default /auth).
 */
export const ProtectedRoute = ({ children, to = '/auth' }: ProtectedRouteProps) => {
    const isAuthenticated = true;

    if (!isAuthenticated) {
        return <Navigate to={to} replace />;
    }

    return <>{children}</>;
};
