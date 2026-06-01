import { Navigate } from 'react-router-dom';
import { isInternalRegisterEnabled } from '@/config/features';

/** Routes /auth/register and /register — blocked in production when flag is off. */
export function AuthRegisterRedirect() {
    if (!isInternalRegisterEnabled()) {
        return <Navigate to="/auth?mode=login" replace />;
    }
    return <Navigate to="/auth?mode=register" replace />;
}
