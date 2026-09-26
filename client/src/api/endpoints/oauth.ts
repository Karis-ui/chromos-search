import apiClient from "../client";

export type OAuthProvider = "google" | "github" | "microsoft" | "apple" | "linkedin";
export interface OAuthProviderInfo {
    id: OAuthProvider
    name: string;
    enable: boolean;
    icon: string
}

export interface LinkedAccount {
    id: string;
    provider: OAuthProvider;
    provider_email: string;
    provider_username?: string;
    linked_at: string;
    last_used_at?: string;
}

export interface LinkedAccountResponse {
    accounts: LinkedAccount[];
    has_password: boolean;
    total: number;
}

export const oauthApi = {
    getProviders: async (): Promise<OAuthProviderInfo[]> => {
        const response = await apiClient.get<{ providers: OAuthProviderInfo[] }>(
            '/api/v1/oauth/providers'
        );
        return response.providers;
    },
    getAuthorizeUrl: (provider: OAuthProvider, redirectUri?: string): string => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const params = new URLSearchParams();
        if (redirectUri) params.set('redirect_uri', redirectUri);
        const queryString = params.toString();
        return `${baseUrl}/api/v1/oauth/${provider}/authorize${queryString ? `?${queryString}` : ''}`;
    },

    getLinkUrl: (provider: OAuthProvider, returnUrl: string): string => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const params = new URLSearchParams();
        params.set('return_url', returnUrl);
        const queryString = params.toString();
        return `${baseUrl}/api/v1/oauth/${provider}/link${queryString ? `?${queryString}` : ''}`;
    },
    getLinkedAccounts: async (): Promise<LinkedAccount[]> => {
        const response = await apiClient.get<{ accounts: LinkedAccount[] }>(`/api/v1/oauth/accounts`);
        return response.accounts;
    },

    unlinkAccount: async (provider: OAuthProvider): Promise<void> => {
        await apiClient.delete<void>(`/api/v1/oauth/${provider}/unlink`);
    },

    unlinkAll: async (): Promise<void> => {
        await apiClient.delete<void>(`/api/v1/oauth/unlink-all`);
    },
}