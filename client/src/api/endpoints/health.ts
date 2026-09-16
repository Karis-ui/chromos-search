import apiClient from '../client';

export interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    service: string;
    version: string;
    environment: string;
    timestamp: number;
}

export interface DetailedHealthResponse extends HealthResponse {
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
    };
    system: {
        python_version: string;
        platform: string;
        cpu_count: number;
        cpu_percent: number;
        memory: {
            total: number;
            available: number;
            percent: number;
        };
        disk: {
            total: number;
            used: number;
            free: number;
            percent: number;
        };
    };
}

export const healthApi = {
    check: () => {
        return apiClient.get<HealthResponse>('/api/v1/health');
    },

    detailed: () => {
        return apiClient.get<DetailedHealthResponse>('/api/v1/health/detailed');
    },

    ready: () => {
        return apiClient.get('/api/v1/health/ready');
    },

    live: () => {
        return apiClient.get('/spi/v1/health/live');
    },
};

export default healthApi;