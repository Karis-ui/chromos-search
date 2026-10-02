import apiClient from "../client";
export interface ConsentGrantData {
    display_name: string;
    bio?: string;
    location?: string;
    occupation?: string;
    company?: string;
    contact_email?: string;
    allow_direct_messages: boolean;
    allow_email_contact: boolean;
    allow_phone_contact: boolean;
    consent_version: string;
    accept_terms: boolean;
}

export interface ConsentProfile {
    id: string;
    user_id: string;
    display_name: string;
    bio?: string;
    location?: string;
    occupation?: string;
    company?: string;
    consent_given: boolean;
    consent_version: string;
    consent_given_at?: string;
    is_active: boolean;
    is_verified: boolean;
    is_featured: boolean;
    face_count: number;
    face_thumbnail_url?: string;
    social_links: Record<string, string>;
    contact_email?: string;
    allow_direct_messages: boolean;
    allow_email_contact: boolean;
    allow_phone_contact: boolean;
    profile_views: number;
    search_appearances: number;
    click_throughs: number;
    lifetime_searches: number;
    monthly_searches: number;
    total_earnings: number;
    pending_earnings: number;
    created_at: string;
    updated_at: string;
    last_searched_at?: string;
    revoked_at?: string;
}

export interface ConsentPhoto {
    id: string;
    photo_url: string;
    thumbnail_url?: string;
    is_primary: boolean;
    is_active: boolean;
    face_confidence?: number;
    face_quality_score?: number;
    created_at: string;
}

export interface ConsentStats {
    profile_id: string;
    is_active: boolean;
    is_verified: boolean;
    face_count: number;
    total_searches: number;
    searches_last_30_days: number;
    profile_views: number;
    click_throughs: number;
    total_earnings: number;
    pending_earnings: number;
    member_since?: string;
    last_searched_at?: string;
}

export interface ConsentStatus {
    has_profile: boolean;
    consent_given: boolean;
    is_active: boolean;
    face_count: number;
    profile: ConsentProfile | null;
}

export interface SocialLinks {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    telegram?: string;
    reddit?: string;
    snapchat?: string;
    pinterest?: string;
}

export interface ConsentSearchResult {
    profile_id: string;
    user_id: string;
    display_name: string;
    bio?: string;
    location?: string;
    occupation?: string;
    company?: string;
    thumbnail?: string;
    social_links: Record<string, string>;
    is_verified: boolean;
    is_featured: boolean;
    similarity: number;
    confidence_level: string;
    allow_direct_messages: boolean;
    source: string;
}

export interface ConsentSearchResponse {
    status: string;
    total: number;
    matches: ConsentSearchResult[];
    duration_ms: number;
}

export const consentApi = {
    getStatus: async (): Promise<ConsentStatus> => {
        return apiClient.get<ConsentStatus>('/api/v1/consent/status');
    },
    grantConsent: async (data: ConsentGrantData): Promise<ConsentProfile> => {
        return apiClient.post<ConsentProfile>('/api/v1/consent/grant', data);
    },
    uploadPhoto: async (
        profileId: string,
        file: File,
        isPrimary?: boolean,
    ): Promise<ConsentPhoto> => {
        const formData = new FormData();
        formData.append('profile_id', profileId);
        formData.append('is_primary', String(isPrimary));
        formData.append('file', file);
        return apiClient.post<ConsentPhoto>('/api/v1/consent/photos', formData, {
            headers: { 'Content-Type': "multipart/form-data" }, timeout: 30000,
        });
    },
    getStats: async (): Promise<ConsentStats> => {
        return apiClient.get<ConsentStats>('/api/v1/consent/stats');
    },
    updateSocialLinks: async (links: SocialLinks): Promise<ConsentProfile> => {
        return apiClient.patch<ConsentProfile>('/api/v1/consent/social-links', links);
    },
    revokeConsent: async (reason?: string): Promise<ConsentStatus> => {
        return apiClient.delete('/api/v1/consent/revoke', {
            data: { reason, confirm: true },
        });
    },
    search: async (
        file: File,
        minSimilarity: number = 0.68,
        limit: number = 50
    ): Promise<ConsentSearchResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('min_similarity', minSimilarity.toString());
        formData.append('limit', limit.toString());
        return apiClient.post<ConsentSearchResponse>('/api/v1/consent/search', formData, {
            headers: { 'Content-Type': "multipart/form-data" }
        });
    },
};

export default consentApi;