import apiClient from '../client';

export interface Feedback {
    id: string;
    user_id: string;
    result_id: string;
    is_match: boolean;
    confidence_correct?: boolean;
    actual_similarity?: number;
    rating?: number;
    feedback_text?: string;
    feedback_category?: string;
    feedback_tags?: string[];
    created_at: string;
}

export interface FeedbackStats {
    total_feedback: number;
    match_count: number;
    match_rate: number;
    average_rating: number;
    categories: {
        face_quality: number;
        wrong_person: number;
    };
}

export const feedbackApi = {
    // ── Submit Feedback ──
    submit: (resultId: string, data: {
        is_match: boolean;
        confidence_correct?: boolean;
        actual_similarity?: number;
        rating?: number;
        feedback_text?: string;
        feedback_category?: string;
        feedback_tags?: string[];
    }) => {
        return apiClient.post(`/api/v1/feedback/${resultId}`, data);
    },

    getMyFeedback: (params?: { skip?: number; limit?: number }) => {
        return apiClient.get<Feedback[]>('/api/v1/feedback/my', {
            params: {
                skip: params?.skip || 0,
                limit: params?.limit || 50,
            },
        });
    },

    getStats: () => {
        return apiClient.get<FeedbackStats>('/api/v1/feedback/stats');
    },
};

export default feedbackApi;