import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { oauthApi, type OAuthProvider, type OAuthProviderInfo } from '../api/endpoints/oauth';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/endpoints/auth';
import { ROUTES } from '../constants/routes';

export const useOAuth = () => {
    const navigate = useNavigate();
    const { setAuth, isAuthenticated } = useAuthStore();
    const [providers, setProviders] = useState<OAuthProviderInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const providers = await oauthApi.getProviders();
                setProviders(providers);
            } catch (error) {
                console.error("failed to fetch OAuth providers:", error);
            }
        };
        fetchProviders();
    }, []);

    const loginWithProvider = useCallback(
        (provider: OAuthProvider) => {
            try {
                const url = oauthApi.getAuthorizeUrl(provider);
                window.location.href = url;
            } catch (error) {
                toast.error('Failed to initiate OAuth login');
            }
        },
        []
    );

    const linkProvider = useCallback(
        (provider: OAuthProvider) => {
            if (!isAuthenticated) {
                toast.error("PLease login first");
                return;
            }
            try {
                const url = oauthApi.getAuthorizeUrl(provider);
                window.location.href = url;
            } catch (error) {
                toast.error("Failed to initate account linking");
            }
        },
        [isAuthenticated]
    );

    const unlinkProvider = useCallback(
        async (provider: OAuthProvider) => {
            setIsLoading(true);
            try {
                await oauthApi.unlinkAccount(provider);
                toast.success(`Successfully unlinked ${provider}`);
                return true;
            } catch (error: any) {
                const message = error.response?.data?.error?.message || 'Failed to unlink account';
                toast.error(message);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const handleCallback = useCallback(
        async (params: URLSearchParams) => {
            setIsLoading(true);
            try {
                const error = params.get('error');
                if (error) {
                    const errorDescription = params.get('error_description') || error;
                    throw new Error(errorDescription);
                }

                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const provider = params.get('provider');
                const isNewUser = params.get('is_new_user') === 'true';
                if (!accessToken || !refreshToken) {
                    throw new Error("missing authentication tokens");
                }
                localStorage.setItem("access_token", accessToken);
                localStorage.setItem("refresh_token", refreshToken);
                const user = await authApi.getMe();
                setAuth(user, accessToken, refreshToken);
                if (isNewUser) {
                    toast.success(`Welcome to Chronos! Account created with ${provider}`);
                } else {
                    toast.success(`Welcome back, ${user.full_name || user.username}!`);
                }
                navigate(ROUTES.HOME, { replace: true });
                return true;
            } catch (error: any) {
                const message = error.message || "OAuth authentication failed";
                toast.error(message);
                navigate(ROUTES.LOGIN, { replace: true });
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [setAuth, navigate]
    );

    return {
        providers,
        isLoading,
        linkProvider,
        handleCallback,
        unlinkProvider,
        loginWithProvider
    };
};