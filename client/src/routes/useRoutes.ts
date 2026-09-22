import { useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { isPublicRoute, isProtectedRoute, isAdminRoute } from '../constants/routes';
import { ROUTE_CONFIG, type RouteConfig } from './routes.config';

export const useActiveRoute = () => {
    const location = useLocation();
    return useMemo(() => {
        const pathname = location.pathname;
        return {
            pathname,
            key: pathname,
            search: location.search,
            hash: location.hash,
            state: location.state,
            config: ROUTE_CONFIG[pathname] as RouteConfig | undefined,
            isPublic: isPublicRoute(pathname),
            isProtected: isProtectedRoute(pathname),
            isAdmin: isAdminRoute(pathname),
        }
    }, [location]);
};

export const useRouteParams = <T extends Record<string, string | undefined>>(): T => {
    const params = useParams();
    return params as T;
};

export const useQueryParam = (key: string, defaultValue = ' '): [string, (value: string) => void] => {
    const [searchParams, setSarchParams] = useSearchParams();
    const value = searchParams.get(key) ?? defaultValue;
    const setValue = useCallback(
        (newValue: string) => {
            const newParams = new URLSearchParams(searchParams);
            if (newValue) {
                newParams.set(key, newValue);
            } else {
                newParams.delete(key);
            }
            setSarchParams(newParams);
        },
        [key, searchParams, setSarchParams]
    );
    return [value, setValue];
};

export const useNavigateWithState = () => {
    const navigate = useNavigate();
    return useCallback(
        (path: string, state?: Record<string, any>) => {
            navigate(path, { state });
        },
        [navigate]
    );
};

export const useScrollRestoration = () => {
    const location = useLocation();

    useEffect(() => {
        const key = `scroll_${location.pathname}`;
        const savedPosition = sessionStorage.getItem(key);

        if (savedPosition) {
            window.scrollTo(0, parseInt(savedPosition, 10));
        } else {
            window.scrollTo(0, 0);
        }

        const handleScroll = () => {
            sessionStorage.setItem(key, window.scrollY.toString());
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [location.pathname]);
};

export const useRouteTitle = (suffix = 'Chronos Search') => {
    const location = useLocation();

    useEffect(() => {
        const config = ROUTE_CONFIG[location.pathname];
        const title = config?.title || 'Page';

        document.title = `${title} | ${suffix}`;
    }, [location.pathname, suffix]);
};

export const useRouteConfig = (): RouteConfig | null => {
    const location = useLocation();

    return useMemo(() => {
        return ROUTE_CONFIG[location.pathname] || null;
    }, [location.pathname]);
};

export const useRequireAuth = () => {
    const location = useLocation();

    return useMemo(() => {
        const config = ROUTE_CONFIG[location.pathname];
        return {
            requiresAuth: config?.requiresAuth ?? isProtectedRoute(location.pathname),
            requiresAdmin: config?.requiresAdmin ?? isAdminRoute(location.pathname),
            requiresPremium: config?.requiresPremium ?? false,
            requiresVerified: config?.requiresVerified ?? false,
        };
    }, [location.pathname]);
};

export const useGenerateUrl = () => {
    return useCallback(
        (route: string, params: Record<string, string | number> = {}, query: Record<string, string> = {}) => {
            let path = route;

            Object.entries(params).forEach(([key, value]) => {
                path = path.replace(`:${key}`, String(value));
            });
            if (Object.keys(query).length > 0) {
                const searchParams = new URLSearchParams(query);
                path += `?${searchParams.toString()}`;
            }

            return path;
        },
        []
    );
};