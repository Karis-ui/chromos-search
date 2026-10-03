import apiClient from "../client";

export interface SearchInitiateRequest {
    media_file: File;
    time_range_days?: number;
    platforms?: string[];
    min_confidence?: number;
}

export interface SearchInitiateResponse {
    task_id: string;
    status: string;
    message: string;
    websocket_url: string;
    estimated_time: string;
    biometric_type: string;
    platforms_searched: string[];
    time_range_days: number;
}

export interface SearchStatusResponse {
    task_id: string;
    status: string;
    progress: number;
    results_count: number;
    completed_at?: string;
    error?: string;
    celery_task_id?: string;
}

export interface SearchResult {
    id: string;
    post_id: string;
    platform: string;
    url: string;
    thumbnail: string;
    posted_at: string;
    similarity: number;
    confidence: number;
    confidence_level: 'high' | 'medium' | 'low' | 'negative' | 'unknown';
    caption?: string;
    author_username?: string;
    match_type?: string;
}

export interface SearchFeedback {
    is_match: boolean;
    confidence_correct?: boolean;
    actual_similarity?: number;
    rating?: number;
    feedback_text?: string;
    feedback_category?: string;
}

export interface SearchStats {
    total: number;
    platforms: Record<string, number>;
    confidence_distribution: {
        high: number;
        medium: number;
        low: number;
        negative: number;
    };
    avg_confidence: number;
    max_confidence: number;
    min_confidence: number;
}

export interface UnifiedResult {
    source: 'consent' | 'social';
    similarity: number;
    confidence_level: string;
    rank: number;
    final_score: number;

    profile_id?: string;
    user_id?: string;
    display_name?: string;
    bio?: string;
    location?: string;
    occupation?: string;
    company?: string;
    social_links?: Record<string, string>;
    is_verified?: boolean;
    is_featured?: boolean;
    allow_direct_messages?: boolean;

    post_id?: string;
    platform?: string;
    url?: string;
    posted_at?: string;
    caption?: string;
    author_username?: string;
    likes?: number;
    shares?: number;
    comments?: number;

    thumbnail?: string;
    face_score?: number;
    voice_score?: number;
    match_type?: string;
}

export interface UnifiedResultsResponse {
    task_id: string;
    status: string;
    source: 'consent' | 'social' | 'all';
    total_count: number;
    consent_count: number;
    social_count: number;
    duration_ms: number;
    results: UnifiedResult[];
}

export const SearchApi = {
    initiate: async (data: SearchInitiateRequest): Promise<SearchInitiateResponse> => {
        const formData = new FormData();
        formData.append('media_file', data.media_file);

        if (data.time_range_days !== undefined) {
            formData.append('time_range_days', String(data.time_range_days));
        }

        if (data.min_confidence !== undefined) {
            formData.append('min_confidence', String(data.min_confidence));
        }

        if (data.platforms && data.platforms.length > 0) {
            formData.append('platforms', data.platforms.join(','));
        }

        return apiClient.post<SearchInitiateResponse>(
            '/api/v1/search/initiate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
        }
        );
    },

    getStatus: (taskId: string) => {
        return apiClient.get<SearchStatusResponse>(`/api/v1/search/status/${taskId}`);
    },

    getResults: (taskId: string, params?: { limit?: number; offset?: number; sort_by?: string }) => {
        return apiClient.get<SearchResult[]>(`/api/v1/search/results/${taskId}`, {
            params: {
                limit: params?.limit || 50,
                offset: params?.offset || 0,
                sort_by: params?.sort_by || 'similarity',
            },
        });
    },

    submitFeedback: (resultId: string, feedback: SearchFeedback) => {
        return apiClient.post(`/api/v1/search/feedback/${resultId}`, feedback);
    },

    exportResults: (taskId: string, format: 'json' | 'csv') => {
        return apiClient.get(`/api/v1/search/export/${taskId}`, {
            params: { format },
            responseType: 'blob',
        });
    },

    getStats: (taskId: string) => {
        return apiClient.get<SearchStats>(`/api/v1/search/stats/${taskId}`);
    },

    getUnifiedResults: (taskId: string, params?: { limit?: number; offset?: number; sort_by?: string }) => {
        return apiClient.get<UnifiedResultsResponse>(`/api/v1/search/unified-results/${taskId}`, {
            params: {
                limit: params?.limit || 50,
                offset: params?.offset || 0,
                sort_by: params?.sort_by || 'similarity',
            },
        });
    },
};

export default SearchApi;