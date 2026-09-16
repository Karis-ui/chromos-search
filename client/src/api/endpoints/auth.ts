import apiClient from "../client";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    full_name?: string
}

export interface RefreshRequest {
    refresh_token: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: {
        id: string;
        email: string;
        username: string;
        full_name?: string;
        role: string;
        is_active: boolean;
        is_verified: boolean;
        is_premium: boolean;
        premium_until?: string;
        created_at: string;
        last_login_at?: string;
        searches_today: number;
        daily_search_limit: number;
    };
}

export interface RegisterResponse {
    message: string;
    user_id: string;
    email: string;
    username: string;
}

export interface UserProfile {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    is_premium: boolean;
    premium_until?: string;
    created_at: string;
    last_login_at?: string;
    searches_today: number;
    daily_search_limit: number;
}

export const authApi = {
    login: (data: LoginRequest) => {
        return apiClient.post<LoginResponse>('/api/v1/auth/login', data, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams({
                username: data.username,
                password: data.password
            }),
        });
    },

    register: (data: RegisterRequest) => {
        return apiClient.post<RegisterResponse>('/api/v1/auth/register', data);
    },

    refresh: (refreshToken: string) => {
        return apiClient.post<LoginResponse>('/api/v1/auth/refresh', {
            refresh_token: refreshToken
        });
    },

    logout: () => {
        return apiClient.post('/api/v1/auth/logout');
    },

    getMe: () => {
        return apiClient.get<UserProfile>('/api/v1/auth/me');
    },

    changePassword: (data: { current_password: string; new_password: string }) => {
        return apiClient.post('/api/v1/auth/change-password', data);
    },

    requestPasswordReset: (email: string) => {
        return apiClient.post('/api/v1/auth/request-password-request', { email });
    },

    confirmPasswordReset: (data: { token: string; new_password: string }) => {
        return apiClient.post('/api/v1/auth/confirm-password-request', { data });
    },
};

export default authApi;