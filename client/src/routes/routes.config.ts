import { ROUTES } from '../constants/routes';

export interface RouteConfig {
    path: string;
    name: string;
    title: string;
    description?: string;
    requiresAuth: boolean;
    requiresAdmin?: boolean;
    requiresPremium?: boolean;
    requiresVerified?: boolean;
    showInNav?: boolean;
    showInSidebar?: boolean;
    icon?: string;
    badge?: string | number;
    parent?: string;
    redirect?: string;
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
    [ROUTES.HOME]: {
        path: ROUTES.HOME,
        name: 'home',
        title: 'Dashboard',
        description: 'Search dashboard',
        requiresAuth: true,
        showInNav: true,
        showInSidebar: true,
        icon: 'FiHome',
    },
    [ROUTES.LOGIN]: {
        path: ROUTES.LOGIN,
        name: 'login',
        title: 'Login',
        description: 'Sign in to your account',
        requiresAuth: false,
    },
    [ROUTES.REGISTER]: {
        path: ROUTES.REGISTER,
        name: 'register',
        title: 'Register',
        description: 'Create a new account',
        requiresAuth: false,
    },
    [ROUTES.SEARCH]: {
        path: ROUTES.SEARCH,
        name: 'search',
        title: 'Search',
        description: 'Search across platforms',
        requiresAuth: true,
        showInNav: true,
        showInSidebar: true,
        icon: 'FiSearch',
    },
    [ROUTES.ANALYTICS]: {
        path: ROUTES.ANALYTICS,
        name: 'analytics',
        title: 'Analytics',
        description: 'Search analytics dashboard',
        requiresAuth: true,
        requiresPremium: true,
        showInNav: true,
        showInSidebar: true,
        icon: 'FiBarChart2',
    },
    [ROUTES.HISTORY]: {
        path: ROUTES.HISTORY,
        name: 'history',
        title: 'History',
        description: 'Your search history',
        requiresAuth: true,
        showInSidebar: true,
        icon: 'FiClock',
    },
    [ROUTES.FEEDBACK]: {
        path: ROUTES.FEEDBACK,
        name: 'feedback',
        title: 'Feedback',
        description: 'Submit feedback',
        requiresAuth: true,
        showInSidebar: true,
        icon: 'FiMessageSquare',
    },
    [ROUTES.PROFILE('default')]: {
        path: '/u/:username',
        name: 'profile',
        title: 'Profile',
        description: 'Your profile',
        requiresAuth: true,
        showInSidebar: true,
        icon: 'FiUser',
    },
    [ROUTES.SETTINGS]: {
        path: ROUTES.SETTINGS,
        name: 'settings',
        title: 'Settings',
        description: 'Application settings',
        requiresAuth: true,
        showInSidebar: true,
        icon: 'FiSettings',
    },
    [ROUTES.ADMIN]: {
        path: ROUTES.ADMIN,
        name: 'admin',
        title: 'Admin',
        description: 'Admin panel',
        requiresAuth: true,
        requiresAdmin: true,
        showInSidebar: true,
        icon: 'FiShield',
    },
    [ROUTES.ADMIN_USERS]: {
        path: ROUTES.ADMIN_USERS,
        name: 'admin-users',
        title: 'User Management',
        description: 'Manage users',
        requiresAuth: true,
        requiresAdmin: true,
        showInSidebar: true,
        icon: 'FiUsers',
        parent: ROUTES.ADMIN,
    },
    [ROUTES.ADMIN_SYSTEM]: {
        path: ROUTES.ADMIN_SYSTEM,
        name: 'admin-system',
        title: 'System',
        description: 'System configuration',
        requiresAuth: true,
        requiresAdmin: true,
        showInSidebar: true,
        icon: 'FiCpu',
        parent: ROUTES.ADMIN,
    },
    [ROUTES.PREMIUM]: {
        path: ROUTES.PREMIUM,
        name: 'premium',
        title: 'Premium',
        description: 'Premium features',
        requiresAuth: true,
        showInSidebar: true,
        icon: 'FiStar',
    },
    [ROUTES.PRICING]: {
        path: ROUTES.PRICING,
        name: 'premium-upgrade',
        title: 'Upgrade to Premium',
        description: 'Unlock premium features',
        requiresAuth: true,
        showInSidebar: false,
        icon: 'FiAward',
    },
};

export const ROUTE_METADATA = {
    [ROUTES.HOME]: {
        title: 'Dashboard | Chronos Search',
        description: 'AI-powered social media search platform',
        keywords: ['search', 'social media', 'face recognition', 'chronos'],
    },
    [ROUTES.LOGIN]: {
        title: 'Login | Chronos Search',
        description: 'Sign in to access your Chronos Search account',
        keywords: ['login', 'sign in', 'authentication'],
    },
    [ROUTES.REGISTER]: {
        title: 'Register | Chronos Search',
        description: 'Create your Chronos Search account',
        keywords: ['register', 'sign up', 'create account'],
    },
    [ROUTES.ANALYTICS]: {
        title: 'Analytics | Chronos Search',
        description: 'Advanced analytics dashboard',
        keywords: ['analytics', 'statistics', 'insights'],
    },
} as const;