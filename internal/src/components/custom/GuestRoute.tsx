import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface GuestRouteProps {
    children: ReactNode;
    to?: string;
}

/**
 * GuestRoute
 *
 * Only allows unauthenticated users (guests).
 * If authenticated, redirects to dashboard (default /admin/dashboard).
 */
export const GuestRoute = ({ children, to = '/staff/dashboard' }: GuestRouteProps) => {
    // Replace with real auth logic
    const isAuthenticated = false;

    if (isAuthenticated) {
        return <Navigate to={to} replace />;
    }

    return <>{children}</>;
};
