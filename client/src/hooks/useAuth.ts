import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import authApi from '../api/endpoints/auth';

export const useAuth = () => {
    const navigate = useNavigate();
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        accessToken,
        refreshToken,
        setAuth,
        setUser,
        setLoading,
        setError,
        logout: storeLogout,
        clearError,
        updateTokens,
    } = useAuthStore();

    const login = useCallback(
        async (username: string, password: string) => {
            setLoading(true);
            clearError();

            try {
                const response = await authApi.login({ username, password });
                const { access_token, refresh_token, user: userData } = response;

                setAuth(userData, access_token, refresh_token);
                toast.success(`Welcome back, ${userData.full_name || userData.username}!`);
                return true;
            }
            catch (error: any) {
                const message = error.response?.data?.error?.message || 'Login failed';
                setError(message);
                toast.error(message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [setAuth, setLoading, setError, clearError]
    );

    const register = useCallback(
        async (data: { email: string, username: string, password: string, full_name?: string, acceptTerms: boolean }) => {
            setLoading(true);
            clearError();

            try {
                await authApi.register(data);
                toast.success('Registration successful! Please login.');
                navigate('/login');
                return true;
            }
            catch (error: any) {
                const message = error.response?.data?.error?.message || 'Registration failed';
                setError(message);
                toast.error(message);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate, setLoading, setError, clearError]
    );

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {

        } finally {
            storeLogout();
            toast.success('Logged out successfully');
            navigate('/login');
        }
    }, [storeLogout, navigate]);

    const refreshUser = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const userData = await authApi.getMe();
            setUser(userData);
            return userData;
        } catch (error) {
            storeLogout();
            toast.error('Session expired. Please login again');
            navigate('/login');
            return null;
        }
    }, [isAuthenticated, setUser, storeLogout, navigate]);

    useEffect(() => {
        if (isAuthenticated && !user) {
            refreshUser();
        }
    }, [isAuthenticated, user, refreshUser]);

    useEffect(() => {
        const handleLogout = () => {
            storeLogout();
            navigate('/login');
        }
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [storeLogout, navigate]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        accessToken,
        refreshToken,
        login,
        register,
        logout,
        refreshUser,
        clearError,
        updateTokens,
    };
};

export default useAuth;