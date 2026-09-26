import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import searchApi from '../api/endpoints/search';
import { useSearchStore } from '../store/searchStore';
import { useWebSocket } from '../providers';
import { useAuthStore } from '../store/authStore';

export const useSearch = () => {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();
    const {
        results,
        totalResults,
        progress,
        status,
        isSearching,
        addResults,
        clearResults,
        setProgress,
        setSearchTime,
        filters,
        setFilters,
    } = useSearchStore();
    const [taskId, setTaskId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const { isConnected } = useWebSocket();
    const hasNotifiedRef = useRef(false);

    const searchMutation = useMutation({
        mutationFn: async (data: {
            file: File;
            timeRange?: number;
            platforms?: string[];
            minConfidence?: number;
        }) => {
            if (!accessToken) {
                throw new Error('Autentication required.Please login again.');
            }
            const response = await searchApi.initiate({
                media_file: data.file,
                time_range_days: data.timeRange || filters.timeRange,
                platforms: data.platforms || filters.platforms,
                min_confidence: data.minConfidence || filters.minConfidence,
            });
            return response;
        },

        onSuccess: (data) => {
            setTaskId(data.task_id);
            clearResults();
            setProgress(0, 'queued', 'Search queued');
            toast.success('🔍 Search initiated! Tracking results..');
            queryClient.invalidateQueries({ queryKey: ['search', data.task_id] });
        },

        onError: (error: any) => {
            const message = error.response?.data?.error?.message || 'Search failed to start';
            toast.error(`❌ ${message}`);
            setProgress(0, 'failed', message);
        },
    });

    const statusQuery = useQuery({
        queryKey: ['search-status', taskId],
        queryFn: () => searchApi.getStatus(taskId!),
        enabled: !!taskId,
        refetchInterval: (data: any) => {
            const status = data?.status;
            if (status === 'completed' || status === 'failed') return false;
            return 2000;
        }
    });


    useEffect(() => {
        if (!statusQuery.data) return;

        setProgress(
            statusQuery.data.progress,
            statusQuery.data.status,
            statusQuery.data.status
        );

        if (statusQuery.data.results_count > 0) {
            queryClient.invalidateQueries({ queryKey: ['search-results', taskId] });

            if (!hasNotifiedRef.current) {
                hasNotifiedRef.current = true;
                toast.success(`${statusQuery.data.results_count} results found`);
            }
        }
    }, [statusQuery.data, queryClient, taskId]);

    const resultsQuery = useQuery({
        queryKey: ['search-results', taskId, filters],
        queryFn: () => searchApi.getResults(taskId!, {
            limit: 100,
            sort_by: filters.sortBy,
        }),
        enabled: !!taskId && statusQuery.data?.status === 'completed',
    });

    useEffect(() => {
        if (resultsQuery.data && resultsQuery.data.length > 0) {
            addResults(resultsQuery.data as any);
        }
    }, [resultsQuery.data, addResults]);

    const feedbackMutation = useMutation({
        mutationFn: (data: { resultId: string; feedback: any }) =>
            searchApi.submitFeedback(data.resultId, data.feedback),
        onSuccess: () => {
            toast.success('Feedback submitted');
        },
        onError: (error: any) => {
            toast.error('Failed to submit feedback', error);
        },
    });

    const exportResults = useCallback(
        async (formart: 'json' | 'csv') => {
            if (!taskId) {
                toast.error('No search results to export');
                return;
            }
            setIsExporting(true);
            try {
                const blob = await searchApi.exportResults(taskId, formart);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `search_results_${taskId}.${formart === 'json' ? 'json' : 'csv'}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success(`📊 Results exported as ${formart.toUpperCase()}`);
            } catch (error) {
                toast.error('Failed to export results');
            } finally {
                setIsExporting(false);
            }
        },
        [taskId]
    );

    const clearSearch = useCallback(() => {
        setTaskId(null);
        clearResults();
        setProgress(0, 'idle', '');
    }, [clearResults, setProgress]);

    const updateFilters = useCallback(
        (newFilters: Partial<typeof filters>) => {
            setFilters(newFilters);
        },
        [setFilters]
    );

    return {
        results,
        totalResults,
        progress,
        status,
        taskId,
        isConnected,
        filters,
        setSearchTime,
        initiateSearch: searchMutation.mutate,
        isSearching,
        isExporting,
        exportResults,
        submitFeedback: feedbackMutation.mutate,
        clearSearch,
        updateFilters,
        refreshStatus: statusQuery.refetch,
        refreshResults: resultsQuery.refetch,
    };
}