import type { UUID, Timestamp, Coordinates } from './common.types';

export type BiometricType = 'face' | 'voice' | 'hybrid' | 'text';
export type MediaType = 'image' | 'video' | 'voice' | 'text' | 'gif' | 'story' | 'reel' | 'livestream' | 'poll' | 'article';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'negative' | 'unknown';
export type SearchStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'partial' | 'cancelled' | 'expired';
export type SearchViewMode = 'spiral' | 'grid' | 'morphing' | 'heatmap' | 'timeline' | 'network' | 'temporal';
export type SearchSortBy = 'similarity' | 'date' | 'platform' | 'confidence';
export type SearchPanelTab = 'parameters' | 'statistics' | 'distributions' | 'analytics' | 'history';

export type Platform =
    | 'instagram'
    | 'facebook'
    | 'twitter'
    | 'tiktok'
    | 'telegram'
    | 'reddit'
    | 'youtube'
    | 'snapchat'
    | 'linkedin'
    | 'pinterest'
    | 'discord'
    | 'whatsapp';

export interface PlatformInfo {
    id: Platform;
    name: string;
    color: string;
    icon: string;
    enabled: boolean;
    requiresAuth: boolean;
    rateLimit: number;
}

export interface SearchResult {
    id: string;
    post_id: string;
    platform: Platform;
    url: string;
    thumbnail: string;
    media_url?: string;
    media_type: MediaType;
    posted_at: Timestamp;
    crawled_at?: Timestamp;

    similarity: number;
    confidence: number;
    confidence_level: ConfidenceLevel;
    match_type: BiometricType;
    face_score?: number;
    voice_score?: number;

    caption?: string;
    content?: string;
    hashtags?: string[];
    mentions?: string[];

    author_username?: string;
    author_full_name?: string;
    author_id?: string;
    author_profile_url?: string;
    author_verified?: boolean;
    author_follower_count?: number;

    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    engagement_rate?: number;

    location?: {
        place_name?: string;
        city?: string;
        country?: string;
        coordinates?: Coordinates;
    };

    rank?: number;
    final_score?: number;
    recency_score?: number;
    engagement_score?: number;
    platform_score?: number;

    receivedAt?: number;
    isSelected?: boolean;
    isFlagged?: boolean;
    userFeedback?: 'match' | 'no_match' | null;
}

export interface SearchRequest {
    media_file?: File;
    media_url?: string;
    media_base64?: string;
    text_query?: string;
    biometric_type: BiometricType;
    time_range_days: number;
    platforms: Platform[];
    min_confidence: number;
    max_results?: number;
    include_text_search?: boolean;
    exclude_platforms?: Platform[];
}

export interface SearchResponse {
    task_id: string;
    status: SearchStatus;
    message: string;
    websocket_url: string;
    estimated_time: string;
    biometric_type: BiometricType;
    platforms_searched: Platform[];
    time_range_days: number;
}

export interface SearchProgress {
    task_id: string;
    progress: number;
    status: SearchStatus;
    stage: string;
    message: string;
    results_count: number;
    platforms_scanned: number;
    total_platforms: number;
    current_platform?: Platform;
    elapsed_ms: number;
    estimated_remaining_ms?: number;
}

export interface SearchFilters {
    platforms: Platform[];
    excludedPlatforms: Platform[];
    minConfidence: number;
    maxConfidence: number;
    timeRange: number;
    sortBy: SearchSortBy;
    sortOrder: 'asc' | 'desc';
    onlyHighConfidence: boolean;
    searchQuery: string;
    dateFrom?: Timestamp;
    dateTo?: Timestamp;
    mediaTypes: MediaType[];
    verifiedAuthorsOnly: boolean;
}

export interface SearchStats {
    total: number;
    platforms: Record<Platform, number>;
    confidenceDistribution: {
        high: number;
        medium: number;
        low: number;
        negative: number;
    };
    avgConfidence: number;
    maxConfidence: number;
    minConfidence: number;
    platformDistribution: Array<{
        platform: Platform;
        count: number;
        percentage: number;
        avgConfidence: number;
    }>;
    temporalDistribution: Array<{
        date: string;
        count: number;
        avgConfidence: number;
    }>;
    engagement: {
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        avgEngagement: number;
    };
}

export interface SearchHistory {
    id: UUID;
    taskId: string;
    userId: UUID;
    query: string;
    mediaUrl?: string;
    thumbnail?: string;
    resultCount: number;
    topConfidence: number;
    durationMs: number;
    status: SearchStatus;
    createdAt: Timestamp;
    completedAt?: Timestamp;
}

export interface FaceDetectionResult {
    embedding: number[];
    bbox: [number, number, number, number];
    landmarks: Record<string, [number, number]>;
    confidence: number;
    gender?: string;
    age?: number;
}

export interface VoiceDetectionResult {
    embedding: number[];
    duration: number;
    sampleRate: number;
    language?: string;
}

export interface BiometricMatch {
    score: number;
    type: BiometricType;
    faceScore?: number;
    voiceScore?: number;
    metadata?: Record<string, any>;
}