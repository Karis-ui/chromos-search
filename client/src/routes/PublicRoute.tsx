import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { ROUTES } from '../constants/routes';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children, redirectTo = ROUTES.HOME }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loader fullScreen text='Loading...' />
    }

    if (isAuthenticated) {
        const locationTo = location.state as { from: Location } | null;
        return <Navigate to={locationTo?.from || redirectTo} state={{ from: location }} replace />
    }

    return <>{children}</>
};

export default PublicRoute;