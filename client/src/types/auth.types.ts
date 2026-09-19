import type { UUID, Timestamp, Metadata } from './common.types';

export type UserRole = 'user' | 'premium' | 'moderator' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto' | 'cyberpunk' | 'matrix';
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
    privacy: {
        showProfile: boolean;
        showActivity: boolean;
        allowAnalytics: boolean;
    };
    search: {
        defaultTimeRange: number;
        defaultPlatforms: string[];
        defaultConfidence: number;
        autoSave: boolean;
    };
}

export interface User {
    id: UUID;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    phone_number?: string;
    role: UserRole;
    status: UserStatus;
    is_active: boolean;
    is_verified: boolean;
    is_premium: boolean;
    premium_until?: Timestamp;
    premium_features?: string[];
    permissions?: Permission[];
    preferences?: UserPreferences;
    created_at: Timestamp;
    updated_at: Timestamp;
    last_login_at?: Timestamp;
    last_seen_at?: Timestamp;
    searches_today: number;
    daily_search_limit: number;
    searches_remaining?: number;
    metadata?: Metadata;
}

export interface UserSession {
    id: UUID;
    userId: UUID;
    accessToken: string;
    refreshToken: string;
    expiresAt: Timestamp;
    createdAt: Timestamp;
    lastActivity: Timestamp;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: {
        type: string;
        os: string;
        browser: string;
    };
    isActive: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    acceptTerms: boolean;
}

export interface PasswordReset {
    email: string;
}

export interface PasswordChange {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordResetConfirm {
    token: string;
    newPassword: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface TokenPayload {
    sub: UUID;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
    jti: string;
    type: 'access' | 'refresh';
}

export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    sessionExpiry: number | null;
    lastActivity: number | null;
}

export interface AuthContext {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

// ── Permissions ──
export type Permission =
    | 'search:create'
    | 'search:view'
    | 'search:delete'
    | 'search:export'
    | 'search:advanced'
    | 'results:view'
    | 'results:feedback'
    | 'results:flag'
    | 'analytics:view'
    | 'analytics:export'
    | 'admin:users'
    | 'admin:system'
    | 'admin:config'
    | 'admin:cleanup'
    | 'apikey:create'
    | 'apikey:revoke'
    | 'premium:access'
    | 'premium:unlimited'
    | 'premium:priority';

export interface RolePermissions {
    role: UserRole;
    permissions: Permission[];
}

export interface ApiKey {
    id: UUID;
    name: string;
    key?: string;
    keyHash: string;
    userId: UUID;
    scopes: Permission[];
    rateLimit: number;
    callsToday: number;
    isActive: boolean;
    expiresAt?: Timestamp;
    lastUsedAt?: Timestamp;
    createdAt: Timestamp;
    revokedAt?: Timestamp;
    revokedReason?: string;
}

export interface ApiKeyCreate {
    name: string;
    scopes: Permission[];
    expiresInDays?: number;
    rateLimit?: number;
}

export interface ApiKeyResponse {
    id: UUID;
    name: string;
    key: string;
    scopes: Permission[];
    expiresAt?: Timestamp;
    createdAt: Timestamp;
}