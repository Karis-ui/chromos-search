import { useAuth } from "../providers";
import { Loader } from "../components/common";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import React, { useMemo, useEffect } from "react";
import toast from "react-hot-toast";

interface PremiumRouteProps {
    children: React.ReactNode;
    allowAdmins?: boolean;
}

export const PremiumRoute: React.FC<PremiumRouteProps> = ({ children, allowAdmins = true }) => {
    const location = useLocation();
    const { isAuthenticated, isLoading, user } = useAuth();
    const hasAccess = useMemo(() => {
        if (!isAuthenticated || !user) return false;

        if (allowAdmins && (user.role === 'admin' || user.role === 'super_admin')) {
            return true;
        }

        if (user.premium_until) {
            return new Date(user.premium_until) > new Date();
        }
        return true
    }, [isAuthenticated, user, allowAdmins]);

    useEffect(() => {
        if (!isLoading && isAuthenticated && user && !hasAccess) {
            toast.error('Premium subscription required. Upgrade to continue.', { id: 'no-access' })
        }
        else {
            toast.dismiss()
        }
    }, [isLoading, isAuthenticated, user, hasAccess]);

    if (isLoading) {
        return <Loader fullScreen text='Loading...' />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    }

    if (!hasAccess) {
        return <Navigate to={ROUTES.PRICING} state={{ from: location }} replace />
    }

    return <>{children}</>
};

export default PremiumRoute;