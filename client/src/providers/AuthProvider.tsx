import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore, type User } from '../store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import authApi from '../api/endpoints/auth';
import type { LoginCredentials, RegisterData } from '../types/auth.types';

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        setAuth,
        setUser,
        setLoading,
        setError,
        logout: storeLogout,
        clearError,
    } = useAuthStore();
    const login = useCallback(
        async (credentials: LoginCredentials): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const response = await authApi.login(credentials);
                const { access_token, refresh_token, user: UserData } = response;
                setAuth(UserData as User, access_token, refresh_token);
                toast.success('Logged in successfully');
                navigate('/login');
                return true;
            } catch (err) {
                setError(err as string);
                return false;
            } finally {
                setLoading(false);
            }
        }, [setLoading, setError, setAuth, navigate]
    );

    const register = useCallback(
        async (data: RegisterData): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                await authApi.register(data);
                toast.success('Registered successfully');
                navigate('/login');
                return true;
            } catch (err) {
                setError(err as string);
                return false;
            } finally {
                setLoading(false);
            }
        }, [setLoading, setError, navigate]
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (err) {
            setError(err as string);
        } finally {
            storeLogout();
            queryClient.clear();
            navigate('/');
            toast.success('Logged out successfully');
        }
    }, [storeLogout, queryClient, navigate])

    const refreshUser = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const data = await authApi.getMe();
            setUser(data as User);
        } catch (err) {
            setError(err as string);
            toast.error('Failed to refresh user');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, setUser, setLoading, setError]);

    useEffect(() => {
        if (isAuthenticated && !user) {
            refreshUser();
        }
    }, [isAuthenticated, user, refreshUser]);

    useEffect(() => {
        const handleLogout = () => {
            storeLogout();
            queryClient.clear();
            navigate('/login');
        };
        const handleTokenRefreshed = () => {
            toast.success('Token refreshed');
            refreshUser();
        };
        window.addEventListener('auth:logout', handleLogout);
        window.addEventListener('auth:token-refreshed', handleTokenRefreshed);

        return () => {
            window.removeEventListener('auth:logout', handleLogout);
            window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
        }
    }, [storeLogout, queryClient, navigate]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
    }), [user, isAuthenticated, isLoading, error, login, register, logout, refreshUser, clearError]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthProvider;