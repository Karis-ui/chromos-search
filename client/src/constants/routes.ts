export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    PRICING: '/pricing',
    ABOUT: '/about',
    CONTACT: '/contact',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    NOT_FOUND: '/404',
    DASHBOARD: '/dashboard',
    SEARCH: '/search',
    SEARCH_RESULT: (taskId: string) => `/search/${taskId}`,
    RESULTS: '/results',
    RESULT_DETAIL: (id: string) => `/results/${id}`,
    HISTORY: '/history',
    HISTORY_DETAIL: (taskId: string) => `/history/${taskId}`,
    FAVORITES: '/favorites',
    UPLOADS: '/uploads',
    ANALYTICS: '/analytics',
    MONITORING: '/monitoring',
    SETTINGS: '/settings',
    SETTINGS_PROFILE: '/settings/profile',
    SETTINGS_SECURITY: '/settings/security',
    SETTINGS_NOTIFICATIONS: '/settings/notifications',
    SETTINGS_API: '/settings/api',
    PROFILE: (username: string) => `/u/${username}`,
    NOTIFICATIONS: '/notifications',
    BILLING: '/billing',
    SUBSCRIPTION: '/subscription',
    SUPPORT: '/support',
    EXPORTS: '/exports',

    ADMIN: '/admin',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
    ADMIN_SEARCHES: '/admin/searches',
    ADMIN_SEARCH_DETAIL: (id: string) => `/admin/searches/${id}`,
    ADMIN_PLATFORMS: '/admin/platforms',
    ADMIN_MODELS: '/admin/models',
    ADMIN_LOGS: '/admin/logs',
    ADMIN_SYSTEM: '/admin/system',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_ROLES: '/admin/roles',
    ADMIN_FEATURE_FLAGS: '/admin/feature-flags',
} as const;


export const PUBLIC_ROUTES: readonly string[] = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.VERIFY_EMAIL,
    ROUTES.PRICING,
    ROUTES.ABOUT,
    ROUTES.CONTACT,
    ROUTES.TERMS,
    ROUTES.PRIVACY,
    ROUTES.NOT_FOUND,
];

export const PROTECTED_ROUTES: readonly string[] = [
    ROUTES.DASHBOARD,
    ROUTES.SEARCH,
    ROUTES.RESULTS,
    ROUTES.HISTORY,
    ROUTES.FAVORITES,
    ROUTES.UPLOADS,
    ROUTES.ANALYTICS,
    ROUTES.MONITORING,
    ROUTES.SETTINGS,
    ROUTES.SETTINGS_PROFILE,
    ROUTES.SETTINGS_SECURITY,
    ROUTES.SETTINGS_NOTIFICATIONS,
    ROUTES.SETTINGS_API,
    ROUTES.NOTIFICATIONS,
    ROUTES.BILLING,
    ROUTES.SUBSCRIPTION,
    ROUTES.SUPPORT,
    ROUTES.EXPORTS,
];

export const ADMIN_ROUTES: readonly string[] = [
    ROUTES.ADMIN,
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_SEARCHES,
    ROUTES.ADMIN_PLATFORMS,
    ROUTES.ADMIN_MODELS,
    ROUTES.ADMIN_LOGS,
    ROUTES.ADMIN_SYSTEM,
    ROUTES.ADMIN_SETTINGS,
    ROUTES.ADMIN_ROLES,
    ROUTES.ADMIN_FEATURE_FLAGS,
];

export interface NavigationItem {
    label: string;
    path: string;
    icon: string;
    badge?: string;
    children?: NavigationItem[];
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    dividerAfter?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        label: 'Dashboard',
        path: ROUTES.DASHBOARD,
        icon: 'FiHome',
        requiresAuth: true,
    },
    {
        label: 'Search',
        path: ROUTES.SEARCH,
        icon: 'FiSearch',
        requiresAuth: true,
    },
    {
        label: 'Results',
        path: ROUTES.RESULTS,
        icon: 'FiTarget',
        requiresAuth: true,
    },
    {
        label: 'History',
        path: ROUTES.HISTORY,
        icon: 'FiClock',
        requiresAuth: true,
        dividerAfter: true,
    },
    {
        label: 'Favorites',
        path: ROUTES.FAVORITES,
        icon: 'FiStar',
        requiresAuth: true,
    },
    {
        label: 'Uploads',
        path: ROUTES.UPLOADS,
        icon: 'FiUpload',
        requiresAuth: true,
        dividerAfter: true,
    },
    {
        label: 'Analytics',
        path: ROUTES.ANALYTICS,
        icon: 'FiBarChart2',
        requiresAuth: true,
    },
    {
        label: 'Monitoring',
        path: ROUTES.MONITORING,
        icon: 'FiActivity',
        requiresAuth: true,
        badge: 'LIVE',
        dividerAfter: true,
    },
    {
        label: 'Settings',
        path: ROUTES.SETTINGS,
        icon: 'FiSettings',
        requiresAuth: true,
        children: [
            {
                label: 'Profile',
                path: ROUTES.SETTINGS_PROFILE,
                icon: 'FiUser',
                requiresAuth: true,
            },
            {
                label: 'Security',
                path: ROUTES.SETTINGS_SECURITY,
                icon: 'FiLock',
                requiresAuth: true,
            },
            {
                label: 'Notifications',
                path: ROUTES.SETTINGS_NOTIFICATIONS,
                icon: 'FiBell',
                requiresAuth: true,
            },
            {
                label: 'API Keys',
                path: ROUTES.SETTINGS_API,
                icon: 'FiKey',
                requiresAuth: true,
            },
        ],
    },
    {
        label: 'Admin',
        path: ROUTES.ADMIN,
        icon: 'FiShield',
        requiresAdmin: true,
        children: [
            {
                label: 'Dashboard',
                path: ROUTES.ADMIN_DASHBOARD,
                icon: 'FiGrid',
                requiresAdmin: true,
            },
            {
                label: 'Users',
                path: ROUTES.ADMIN_USERS,
                icon: 'FiUsers',
                requiresAdmin: true,
            },
            {
                label: 'Searches',
                path: ROUTES.ADMIN_SEARCHES,
                icon: 'FiSearch',
                requiresAdmin: true,
            },
            {
                label: 'Platforms',
                path: ROUTES.ADMIN_PLATFORMS,
                icon: 'FiGlobe',
                requiresAdmin: true,
            },
            {
                label: 'Models',
                path: ROUTES.ADMIN_MODELS,
                icon: 'FiCpu',
                requiresAdmin: true,
            },
            {
                label: 'Logs',
                path: ROUTES.ADMIN_LOGS,
                icon: 'FiFileText',
                requiresAdmin: true,
            },
            {
                label: 'System',
                path: ROUTES.ADMIN_SYSTEM,
                icon: 'FiServer',
                requiresAdmin: true,
            },
            {
                label: 'Feature Flags',
                path: ROUTES.ADMIN_FEATURE_FLAGS,
                icon: 'FiToggleRight',
                requiresAdmin: true,
            },
        ],
    },
];
export const generateRoute = (
    route: string | ((...args: any[]) => string),
    ...args: any[]
): string => {
    if (typeof route === 'function') {
        return route(...args);
    }
    return route;
};

const normalizePathname = (pathname: string): string => {
    let normalized = pathname.replace(/\/+$/, '') || '/';
    normalized = normalized.replace(
        /\/[0-9a-f]{8,}(-[0-9a-f-]+)?|\/\d+/gi,
        '/:id'
    );
    return normalized;
};


const matchesAnyPrefix = (
    pathname: string,
    routes: readonly string[]
): boolean => {
    const clean = pathname.split('?')[0].split('#')[0];

    return routes.some((route) => {
        if (route === clean) return true;

        if (route === ROUTES.HOME) return clean === '/';

        if (clean === route) return true;
        if (clean.startsWith(`${route}/`)) return true;

        const normalizedClean = normalizePathname(clean);
        if (normalizedClean === route) return true;

        return false;
    });
};

export const isPublicRoute = (pathname: string): boolean =>
    matchesAnyPrefix(pathname, PUBLIC_ROUTES);

export const isProtectedRoute = (pathname: string): boolean =>
    matchesAnyPrefix(pathname, PROTECTED_ROUTES);

export const isAdminRoute = (pathname: string): boolean =>
    matchesAnyPrefix(pathname, ADMIN_ROUTES);

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];