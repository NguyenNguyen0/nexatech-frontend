import { useLocation } from 'react-router-dom';
import { getRoleNavConfig, type RolePrefix } from '@/data/sidelinks';

/** Base path for the current role area, e.g. `/staff` or `/admin`. */
export function useRoleBasePath(): RolePrefix {
    const { pathname } = useLocation();
    return getRoleNavConfig(pathname).prefix;
}
