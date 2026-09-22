import React, { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
    requireVerified?: boolean;
    requireActive?: boolean
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    redirectTo = ROUTES.LOGIN,
    requireVerified = false,
    requireActive = true
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        isAuthenticated,
        user,
        isLoading
    } = useAuth();
    const isAuthReady = isAuthenticated !== undefined && !isLoading;
    const checkAccess = useMemo(() => {
        if (!isAuthenticated) return { allowed: false, reason: 'not_authenticated' };
        if (!user) return { allowed: false, reason: 'no_user' };
        if (requireActive && !user.is_active) return { allowed: false, reason: 'inactive' };
        if (requireVerified && !user.is_verified) return { allowed: false, reason: 'not_verified' };
        return { allowed: true, reason: null };
    }, [isAuthenticated, user, requireActive, requireVerified]);
    useEffect(() => {
        if (!isAuthReady && !isAuthenticated) {
            if (location.pathname !== ROUTES.LOGIN) {
                sessionStorage.setItem('redirectAfterLogin', location.pathname);
            }
            navigate(ROUTES.LOGIN, { replace: true });
        } else if (requireVerified && !user?.is_verified) {
            navigate(ROUTES.VERIFY_EMAIL, { replace: true });
        } else if (requireActive && user && !user.is_active) {
            toast.error('Your account is inactive');
            navigate(ROUTES.LOGIN, { replace: true });
        }
    }, [isAuthenticated, isAuthReady, location.pathname, navigate, user?.is_verified, user?.is_active, requireVerified, requireActive]);

    if (isLoading) {
        return <Loader fullScreen text='Authenticating...' />
    }
    if (checkAccess.allowed) {
        return (
            <Navigate to={redirectTo} state={{ from: location }} replace />

        );
    }

    if (!isAuthReady) {
        return <Loader fullScreen />;
    }

    return <>{children}</>
};

export default ProtectedRoute;