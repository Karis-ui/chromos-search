import apiClient from '../client';

export interface SystemStats {
    timestamp: string;
    users: {
        total: number;
        active: number;
        premium: number;
    };
    searches: {
        total: number;
        today: number;
    };
    results: {
        total: number;
    };
    feedback: {
        total: number;
    };
}

export interface UserListItem {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    role: string;
    is_active: boolean;
    is_premium: boolean;
    premium_until?: string;
    created_at: string;
    last_login_at?: string;
}

export const adminApi = {
    getStats: () => {
        return apiClient.get<SystemStats>('/api/v1/admin/stats');
    },

    listUsers: (params?: { skip?: number, limit?: number; search?: string }) => {
        return apiClient.get<UserListItem[]>('/api/v1/admin/users', {
            params: {
                skip: params?.skip ?? 0,
                limit: params?.limit ?? 50,
                search: params?.search,
            },
        });
    },

    updateUserRole: (userId: string, role: string) => {
        return apiClient.put(`/api/v1/admin/users/${userId}/role`, { role });
    },

    cleanupData: (days: number = 180) => {
        return apiClient.post('/api/v1/admin/maintenance/cleanup', null, {
            params: { days },
        });
    },

    getConfig: () => {
        return apiClient.get('/api/v1/admin/config');
    },
};

export default adminApi;