import { Navigate } from 'react-router-dom';

/** Legacy route — analytics lives on the main dashboard tab (same data as ADMIN). */
export default function ManagerAnalyticsRedirect() {
    return <Navigate to="/manager/dashboard?tab=analytics" replace />;
}
