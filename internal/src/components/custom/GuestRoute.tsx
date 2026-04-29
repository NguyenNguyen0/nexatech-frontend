import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { clearAuthTokens, getAccessToken, getDefaultPathByRole, getRolesFromAccessToken, isAccessTokenExpired } from '@/lib/authRouting';

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
    const token = getAccessToken();
    const isAuthenticated = !!token && !isAccessTokenExpired(token);

    if (isAuthenticated) {
        const roles = getRolesFromAccessToken(token);
        if (roles.includes("CUSTOMER")) {
            // CUSTOMER không được phép dùng internal.
            clearAuthTokens();
            return <>{children}</>;
        }
        return <Navigate to={getDefaultPathByRole(roles)} replace />;
    }

    return <>{children}</>;
};
