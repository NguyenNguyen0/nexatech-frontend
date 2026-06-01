import { lazy } from "react";
import { Navigate, type RouteObject, Outlet } from "react-router-dom";
import { LazyWrapper } from "@/components/custom/LazyWrapper";
import { GuestRoute } from "@/components/custom/GuestRoute";
import { AuthRegisterRedirect } from "./auth-register-redirect";

const AuthPage = lazy(() => import("@/pages/auth/index"));

export const authRoutes: RouteObject[] = [
    {
        path: "/auth",
        element: (
            <GuestRoute>
                <LazyWrapper>
                    <Outlet />
                </LazyWrapper>
            </GuestRoute>
        ),
        children: [
            { index: true, element: <AuthPage /> },
            { path: "login", element: <Navigate to="/auth?mode=login" replace /> },
            { path: "register", element: <AuthRegisterRedirect /> },
        ],
    },
    // fallback routes
    { path: "login", element: <Navigate to="/auth?mode=login" replace /> },
    { path: "register", element: <AuthRegisterRedirect /> },
];
