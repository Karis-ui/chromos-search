import type { Pagination } from './common.types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    status: number;
    timestamp?: string;
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        status: number;
        details?: Record<string, any>;
    };
}

export interface ApiErrorResponse {
    error: string;
    message: string;
    status: number;
    details?: Record<string, any>;
    requestId?: string;
    correlationId?: string;
}

export interface ApiPaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: Pagination;
}

export interface ApiListResponse<T> {
    items: T[];
    total: number;
    page?: number;
    limit?: number;
}

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
    withCredentials: boolean;
    retryAttempts: number;
    retryDelay: number;
}

export interface ApiClientConfig extends Partial<ApiConfig> {
    onRequest?: (config: RequestConfig) => RequestConfig;
    onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T>;
    onError?: (error: ApiError) => void;
}

export interface ApiInterceptor {
    onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    onResponse?: <T>(response: T) => T | Promise<T>;
    onError?: (error: any) => any;
}

export interface RequestConfig {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    signal?: AbortSignal;
    responseType?: 'json' | 'blob' | 'text' | 'arraybuffer';
    onUploadProgress?: (progress: number) => void;
    onDownloadProgress?: (progress: number) => void;
}

export interface ResponseHeaders {
    'content-type': string;
    'content-length': string;
    'x-request-id': string;
    'x-correlation-id': string;
    'x-response-time': string;
    'x-rate-limit-limit': string;
    'x-rate-limit-remaining': string;
    'x-rate-limit-reset': string;
    [key: string]: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
    speed: number;
    timeRemaining?: number;
}

export interface UploadOptions {
    onProgress?: (progress: UploadProgress) => void;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
    abortSignal?: AbortSignal;
    maxRetries?: number;
    chunkSize?: number;
}

export interface DownloadOptions {
    filename?: string;
    onProgress?: (progress: number) => void;
    onComplete?: (response: any) => void;
    onError?: (error: any) => void;
    abortSignal?: AbortSignal;
}

export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: string;
    id?: string;
}

export interface WebSocketConfig<T = any> {
    url: string;
    protocols?: string[];
    headers?: Record<string, string>;
    timeout?: number;
    data?: T;
}

export interface WebSocketHandler<T = any> {
    onMessage: (event: WebSocketMessage<T>) => void;
    onOpen?: (event: WebSocketEvent<T>) => void;
    onClose?: (event: WebSocketEvent<T>) => void;
    onError?: (event: WebSocketEvent<T>) => void;
}

export interface WebSocketEvent<T = any> {
    type: 'open' | 'close' | 'error' | 'message' | 'reconnect' | 'heartbeat';
    data?: T;
    timestamp: number;
}

export interface HealthCheck {
    status: 'healthy' | 'unhealthy' | 'degraded';
    service: string;
    uptime: number;
    environment: string;
    timestamp: number;
    version: string;
    checks: {
        [key: string]: string;
    };
    metadata: Record<string, any>
}
export interface DetailedHealthCheck extends HealthCheck {
    response_time_ms: number;
    dependencies: {
        database: {
            healthy: boolean;
            details: Record<string, any>;
            response_time_ms: number;
        };
        redis: {
            healthy: boolean;
            details: Record<string, any>;
        };
        [key: string]: any;
    };
    system: {
        python_version?: string;
        node_version?: string;
        platform: string;
        cpu_count: number;
        cpu_percent: number;
        memory: {
            total: number;
            available: number;
            percent: number;
        };
        disk?: {
            total: number;
            used: number;
            free: number;
            percent: number;
        };
    };
}

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
        avgPerUser: number;
    };
    results: {
        total: number;
        avgPerSearch: number;
    };
    feedback: {
        total: number;
        positiveRate: number;
    };
}