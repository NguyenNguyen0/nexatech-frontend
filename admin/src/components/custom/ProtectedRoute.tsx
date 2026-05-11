import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
    canAccessByPath,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    getDefaultPathByRole,
    getRolesFromAccessToken,
    isAccessTokenExpired,
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
        const isNotImplemented =
            location.pathname.startsWith('/admin') &&
            location.pathname !== '/admin/users' &&
            location.pathname !== '/admin/settings' &&
            location.pathname !== '/admin/settings/account';

        if (isNotImplemented) {
            alert('CHÚ Ý: Chào Developer! Trang này hiện đang sử dụng dữ liệu mẫu (Mock data) và chưa được triển khai gọi API thực tế.');
            alert(
                "*** Nếu bạn đã hoàn thành trang team Leader giao thì vào \n nexatech-frontend/admin/src/components/custom/ProtectedRoute.tsx \n (example: && location.pathname !== '/admin/users') \n tắt Alert. \n Thanks! ***",
            );
        }
    }, [location.pathname]);

    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    const isAuthenticated = !!token || !!refreshToken;

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    const roles = getRolesFromAccessToken(token);
    const primaryPath = getDefaultPathByRole(roles);

    if (!canAccessByPath(location.pathname, roles)) {
        return <Navigate to={primaryPath} replace />;
    }

    return <>{children}</>;
};
