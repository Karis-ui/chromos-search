export const ENV = {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '3.0.0',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Chronos Search',
    APP_DESCRIPTION:
        import.meta.env.VITE_APP_DESCRIPTION ||
        'Digital Echo Locator - Advanced Search Engine',
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
} as const;

export const IS_DEV = ENV.DEV;
export const IS_PROD = ENV.PROD;
export const IS_TEST = ENV.MODE === 'test';

export const APP_CONFIG = {
    name: ENV.APP_NAME,
    version: ENV.APP_VERSION,
    description: ENV.APP_DESCRIPTION,
    author: 'Chronos Engineering',
    repository: 'https://github.com/chronos/search',
    supportEmail: 'support@chronos.com',
    docsUrl: 'https://docs.chronos.com',
    changelogUrl: 'https://github.com/chronos/search/releases',
} as const;

export const API_CONFIG = {
    baseURL: ENV.API_URL,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    retryBackoff: 2,
    maxRetryDelay: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    endpoints: {
        auth: {
            login: '/api/v1/auth/login',
            register: '/api/v1/auth/register',
            refresh: '/api/v1/auth/refresh',
            logout: '/api/v1/auth/logout',
            me: '/api/v1/auth/me',
            changePassword: '/api/v1/auth/change-password',
            resetPassword: '/api/v1/auth/reset-password',
        },
        search: {
            initiate: '/api/v1/search/initiate',
            status: '/api/v1/search/status',
            results: '/api/v1/search/results',
            feedback: '/api/v1/search/feedback',
            export: '/api/v1/search/export',
            stats: '/api/v1/search/stats',
        },
        feedback: {
            submit: '/api/v1/feedback',
            my: '/api/v1/feedback/my',
            stats: '/api/v1/feedback/stats',
        },
        admin: {
            stats: '/api/v1/admin/stats',
            users: '/api/v1/admin/users',
            config: '/api/v1/admin/config',
            cleanup: '/api/v1/admin/maintenance/cleanup',
        },
        health: {
            check: '/api/v1/health',
            detailed: '/api/v1/health/detailed',
            ready: '/api/v1/health/ready',
            live: '/api/v1/health/live',
        },
    },
} as const;

export const WS_CONFIG = {
    baseURL: ENV.WS_URL,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    reconnectBackoff: 1.5,
    heartbeatInterval: 30000,
    heartbeatTimeout: 10000,
    messageTimeout: 10000,
    maxMessageQueue: 100,
    endpoints: {
        search: (taskId: string) => `/api/v1/ws/search/${taskId}`,
        admin: '/api/v1/ws/admin',
    },
} as const;

export const SEARCH_CONFIG = {
    defaults: {
        timeRangeDays: 180,
        minConfidence: 0.68,
        maxResults: 1000,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        platforms: [],
    },
    limits: {
        minTimeRange: 1,
        maxTimeRange: 180,
        minConfidence: 0.5,
        maxConfidence: 0.95,
        maxConcurrentSearches: 3,
        maxResultsPerPage: 100,
        resultsBatchSize: 50,
    },
    thresholds: {
        high: 0.85,
        medium: 0.7,
        low: 0.55,
        negative: 0.0,
    },
    timeouts: {
        initiation: 30000,
        polling: 5000,
        results: 15000,
        export: 60000,
    },
    acceptedTypes: {
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'],
        video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    },
} as const;

export const RETENTION_CONFIG = {
    dataRetentionDays: 180,
    sweeperCron: '0 0 * * *',
    sweeperBatchSize: 10000,
    archiveEnabled: true,
    deleteEnabled: false,
} as const;

export const LIMITS = {
    auth: {
        usernameMinLength: 3,
        usernameMaxLength: 50,
        passwordMinLength: 8,
        passwordMaxLength: 128,
        emailMaxLength: 255,
        loginAttempts: 5,
        loginLockoutMinutes: 15,
    },
    search: {
        queryMaxLength: 500,
        captionMaxLength: 10000,
        hashtagMaxLength: 100,
        fileMaxSize: 50 * 1024 * 1024,
        maxPlatforms: 12,
        maxResultsPerSearch: 10000,
    },
    ui: {
        notificationsMax: 5,
        historyMax: 50,
        recentSearchesMax: 20,
        chartDataPointsMax: 1000,
        tableRowsPerPage: 25,
    },
    api: {
        requestRateLimit: 100,
        requestRatePeriod: 60,
        maxRequestSize: 50 * 1024 * 1024,
        maxResponseSize: 100 * 1024 * 1024,
    },
} as const;

export const TIMEOUTS = {
    apiShort: 5000,
    apiDefault: 30000,
    apiLong: 60000,
    apiUpload: 300000,

    debounceShort: 150,
    debounceDefault: 300,
    debounceLong: 500,
    throttleDefault: 100,
    tooltipDelay: 300,
    notificationDuration: 4000,

    searchPolling: 2000,
    searchTimeout: 300000,

    wsHeartbeat: 30000,
    wsReconnect: 3000,
    wsTimeout: 10000,
    sessionCheck: 60000,
    sessionRefresh: 300000,
    inactivityTimeout: 1800000,
} as const;

export const FEATURE_FLAGS = {
    enableSearch: true,
    enableFaceRecognition: true,
    enableVoiceRecognition: true,
    enableHybridSearch: true,
    enableTextSearch: true,

    enableAdvancedSearch: true,
    enableBatchSearch: true,
    enableExport: true,
    enableAnalytics: true,
    enableRealTimeUpdates: true,

    enableDarkMode: true,
    enableCyberpunkTheme: true,
    enableAnimations: true,
    enableParticles: true,
    enableScanlines: true,
    enableGlow: true,
    enableHaptics: false,

    enableVoiceInput: false,
    enableImageAnnotations: false,
    enableCollaboration: false,
    enableAIAssistant: false,
    enablePredictiveSearch: false,

    enableAdminPanel: true,
    enableUserManagement: true,
    enableSystemConfig: true,
    enableMaintenance: true,

    enableDebugPanel: IS_DEV,
    enableMockData: IS_DEV,
    enablePerformanceMonitoring: IS_PROD,
    enableErrorReporting: IS_PROD,
} as const;

export const STORAGE_KEYS = {
    authStore: 'chronos-auth-store',
    accessToken: 'access_token',
    refreshToken: 'refresh_token',

    searchStore: 'chronos-search-store',
    uiStore: 'chronos-ui-store',
    notificationStore: 'chronos-notification-store',

    theme: 'chronos-theme',
    language: 'chronos-language',
    fontSize: 'chronos-font-size',

    searchCache: 'chronos-search-cache',
    userCache: 'chronos-user-cache',

    lastActivity: 'chronos-last-activity',
    correlationId: 'correlation_id',

    hasSeenWelcome: 'chronos-welcome-seen',
    hasSeenTour: 'chronos-tour-seen',
} as const;