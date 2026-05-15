import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
    canAccessByPath,
    getAccessToken,
    getRefreshToken,
    getDefaultPathByRole,
    getRolesFromAccessToken,
    isOtpStepUpPending,
} from '@/services/authSession';

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

    /* 
    *** Developer Note ***
    TODO: Thêm Path URL vào để tắt alert cảnh báo mocks data (tránh sai sót)
    */
    useEffect(() => {
        // Danh sách các trang đã được triển khai (không hiện alert)
        const implementedPaths = ['/admin/users', '/admin/settings', '/admin/settings/account', '/admin/settings/appearance', '/admin/roles', '/admin/permissions'];

        const isImplemented = implementedPaths.includes(location.pathname);
        const isAdminPath = location.pathname.startsWith('/admin');

        if (isAdminPath && !isImplemented) {
            alert('Mock Data Page');
            alert(
                '*** Go to nexatech-frontend/admin/src/components/custom/ProtectedRoute.tsx \n (thêm path vào mảng implementedPaths) \n để tắt Alert.***',
            );
        }
    }, [location.pathname]);

    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    const isAuthenticated = !!token || !!refreshToken;

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    if (isOtpStepUpPending()) {
        return <Navigate to="/auth" replace />;
    }

    const roles = getRolesFromAccessToken(token);
    const primaryPath = getDefaultPathByRole(roles);

    if (!canAccessByPath(location.pathname, roles)) {
        return <Navigate to={primaryPath} replace />;
    }

    return <>{children}</>;
};
