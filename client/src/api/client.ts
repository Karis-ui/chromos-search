import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosError,
    type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'react-hot-toast';

interface ApiError {
    message?: string;
    detail?: string | Array<{ msg?: string; loc?: Array<string | number> }>;
    error: {
        code: string;
        message: string;
        status: number;
        details?: Record<string, any>;
    };
}

interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
}

interface PendingRequest {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    config: InternalAxiosRequestConfig;
}

class ApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private pendingRequests: PendingRequest[] = [];
    private subscribers: ((token: string) => void)[] = [];

    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: true,
        });
        this.setupInterceptors();
    }
    setTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }
    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    private onTokenRefreshed(token: string) {
        this.subscribers.forEach(callback => callback(token));
        this.subscribers = [];
    }
    private setupInterceptors() {
        this.client.interceptors.request.use(
            (config) => {
                const accessToken = localStorage.getItem('access_token');
                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                const correlationId = this.generateCorrelationId();
                config.headers['X-Correlation-ID'] = correlationId;
                config.headers['X-Client-Version'] = import.meta.env.VITE_APP_BERSION || '3.0.0';
                config.headers['X-Client-Type'] = 'web';
                config.headers['X-Request-Time'] = Date.now().toString();
                return config;
            },
            (error) => Promise.reject(error)
        );
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<ApiError>) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
                const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

                if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
                    originalRequest._retry = true;
                    const refreshToken = localStorage.getItem('refresh_token');

                    if (refreshToken && !this.isRefreshing) {
                        this.isRefreshing = true;

                        try {
                            const response = await this.client.post('/api/v1/auth/refresh', {
                                refresh_token: refreshToken,
                            });

                            const { access_token, refresh_token } = response.data;
                            this.setTokens(access_token, refresh_token);

                            originalRequest.headers.Authorization = `Bearer ${access_token}`;

                            this.onTokenRefreshed(access_token);

                            this.isRefreshing = false;
                            this.pendingRequests.forEach(({ resolve, reject, config }) => {
                                this.client.request(config)
                                    .then(resolve)
                                    .catch(reject);
                            });
                            this.pendingRequests = [];

                            return this.client(originalRequest);

                        } catch (refreshError) {
                            this.clearTokens();
                            this.isRefreshing = false;

                            window.dispatchEvent(new CustomEvent('auth:logout'));

                            toast.error('Session expired. Please login again.');
                            return Promise.reject(refreshError);
                        }
                    }

                    // Queue pending requests while refreshing
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.pendingRequests.push({
                                resolve,
                                reject,
                                config: originalRequest,
                            });
                        });
                    }
                }

                const errorMessage = this.getErrorMessage(error);

                if (error.response?.status !== 404 && error.response?.status !== 422) {
                    toast.error(errorMessage);
                }

                return Promise.reject(error);
            }
        );
    }
    private getErrorMessage(error: AxiosError<ApiError>): string {
        if (error.response?.data?.error?.message) {
            return error.response.data.error.message;
        }
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (typeof error.response?.data?.detail === 'string') {
            return error.response.data.detail;
        }
        if (Array.isArray(error.response?.data?.detail)) {
            return error.response.data.detail
                .map((issue) => issue.msg)
                .filter(Boolean)
                .join(', ');
        }
        if (error.response?.statusText) {
            return error.response.statusText;
        }
        return 'An unexpected error occurred';
    }
    private generateCorrelationId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    async get<T = any>(urlt: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(urlt, config);
        return response.data;
    }
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }
    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
    async upload<T = any>(
        url: string, file: string, data?: Record<string, any>, config?: AxiosRequestConfig, onProgress?: (progress: number) => void
    ): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, String(value))
            });
        }
        const response = await this.client.post<T>(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return response.data;
    }
    getWebSocketUrl(path: string): string {
        const baseURL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
        return `${baseURL}${path}`;
    }
}
export const apiClient = new ApiClient();
export type { ApiResponse, ApiError };
export default apiClient;