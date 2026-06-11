import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getRoleHomePath, normalizeRole } from './roleRoutes.js';

const ProtectedRoutes = ({ children, roles }) => {
    const { account, isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles?.length) {
        const accountRole = normalizeRole(account?.role);
        const allowedRoles = roles.map(normalizeRole);

        if (!allowedRoles.includes(accountRole)) {
            return <Navigate to={getRoleHomePath(accountRole)} replace />;
        }
    }

    return children;
};

export default ProtectedRoutes;
