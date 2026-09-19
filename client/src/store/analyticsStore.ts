import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AnalyticsData {
    dailySearches: Array<{ date: string; count: number }>;
    dailyResults: Array<{ date: string; count: number }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;

    platformStats: Array<{
        platform: string;
        count: number;
        avgConfidence: number;
        percentage: number;
    }>;

    confidenceDistribution: Array<{
        bucket: string;
        count: number;
        percentage: number;
    }>;
    avgConfidence: number;
    maxConfidence: number;
    minConfidence: number;

    engagement: {
        totalLikes: number;
        totalShares: number;
        totalComments: number;
        avgEngagement: number;
    };

    performance: {
        avgSearchTime: number;
        maxSearchTime: number;
        minSearchTime: number;
        avgResultsPerSearch: number;
        totalSearches: number;
        totalResults: number;
    };
}

export interface AnalyticsState {
    data: AnalyticsData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: number | null;

    timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';

    setData: (data: AnalyticsData) => void;
    updatePartialData: (updates: Partial<AnalyticsData>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setTimeRange: (range: AnalyticsState['timeRange']) => void;
    reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
    subscribeWithSelector(
        immer((set) => ({
            data: null,
            isLoading: false,
            error: null,
            lastUpdated: null,
            timeRange: 'week',

            setData: (data) => {
                set((state) => {
                    state.data = data;
                    state.isLoading = false;
                    state.error = null;
                    state.lastUpdated = Date.now();
                });
            },

            updatePartialData: (updates) => {
                set((state) => {
                    if (state.data) {
                        state.data = { ...state.data, ...updates };
                    } else {
                        state.data = updates as AnalyticsData;
                    }
                    state.lastUpdated = Date.now();
                });
            },

            setLoading: (loading) => {
                set((state) => {
                    state.isLoading = loading;
                });
            },

            setError: (error) => {
                set((state) => {
                    state.error = error;
                    state.isLoading = false
                });
            },

            setTimeRange: (range) => {
                set((state) => {
                    state.timeRange = range;
                });
            },


            reset: () => {
                set((state) => {
                    state.data = null;
                    state.isLoading = false;
                    state.error = null;
                    state.lastUpdated = null;
                    state.timeRange = 'week';
                });
            },
        }))
    )
);

export default useAnalyticsStore;