import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessByPath, clearAuthTokens, getAccessToken, getDefaultPathByRole, getRolesFromAccessToken, isAccessTokenExpired } from '@/services/authSession';

interface ProtectedRouteProps {
    children: ReactNode;
    to?: string;
}

/**
 * ProtectedRoute
 *
 * Only allows authenticated users.
 * If not authenticated, redirects to login page (default /auth/login).
 */
export const ProtectedRoute = ({ children, to = '/auth/login' }: ProtectedRouteProps) => {
    const location = useLocation();

    const token = getAccessToken();
    const isAuthenticated = !!token && !isAccessTokenExpired(token);

    if (!isAuthenticated) {
        clearAuthTokens();
        return <Navigate to="/auth" replace />;
    }

    const roles = getRolesFromAccessToken(token);
    const primaryPath = getDefaultPathByRole(roles);

    if (!canAccessByPath(location.pathname, roles)) {
        return <Navigate to={primaryPath} replace />;
    }

    return <>{children}</>;
};
