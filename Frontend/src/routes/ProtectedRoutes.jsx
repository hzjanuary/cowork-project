import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoutes = ({ children }) => {
    const { account, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated || !account) {
        alert('You must be logged in to access this page.');
        return <Navigate to="/login" state={{ from: useLocation() }} replace />;
    }

    return children;
};

export default ProtectedRoutes;