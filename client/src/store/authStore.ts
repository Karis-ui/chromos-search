import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
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

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;

    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
    clearError: () => void;
    updateTokens: (accessToken: string, refreshToken: string) => void;
    updateSearchesToday: (count: number) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        immer((set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            accessToken: null,
            refreshToken: null,

            setAuth: (user, accessToken, refreshToken) => {
                set((state) => {
                    state.user = user;
                    state.accessToken = accessToken;
                    state.refreshToken = refreshToken;
                    state.isAuthenticated = true;
                    state.isLoading = false;
                    state.error = null;
                });

                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));
            },

            setUser: (user) => {
                set((state) => {
                    state.user = user;
                });
            },

            setLoading: (loading) => {
                set((state) => {
                    state.isLoading = loading;
                });
            },

            setError: (error) => {
                set((state) => {
                    state.error = error;
                    state.isLoading = false;
                });
            },

            logout: () => {
                set((state) => {
                    state.user = null;
                    state.isAuthenticated = false;
                    state.accessToken = null;
                    state.refreshToken = null;
                    state.error = null;
                    state.isLoading = false;
                });

                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.dispatchEvent(new CustomEvent('auth:logout'));
            },

            clearError: () => {
                set((state) => {
                    state.error = null;
                });
            },

            updateTokens: (accessToken, refreshToken) => {
                set((state) => {
                    state.accessToken = accessToken;
                    state.refreshToken = refreshToken;
                });
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
            },

            updateSearchesToday: (count) => {
                set((state) => {
                    if (state.user) {
                        state.user.searches_today = count;
                    }
                });
            },
        })),
        {
            name: 'chronos-auth-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

export default useAuthStore;