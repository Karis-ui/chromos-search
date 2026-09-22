import React, { useMemo, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { ROUTES } from '../constants/routes';

interface AdminRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'super_admin';
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
    children,
    requiredRole = 'admin',
}) => {
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useAuth();

    const hasAccess = useMemo(() => {
        if (!isAuthenticated || !user) return false;

        const role = user.role;
        if (requiredRole === 'super_admin') return role === 'super_admin';
        return role === 'admin' || role === 'super_admin';
    }, [isAuthenticated, user, requiredRole]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && user && !hasAccess) {
            toast.error('Access denied. Admin privileges required.');
        }
    }, [isLoading, isAuthenticated, user, hasAccess]);

    if (isLoading) {
        return <Loader fullScreen text="Verifying privileges..." />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                state={{ from: location }}
                replace
            />
        );
    }

    if (!hasAccess) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;