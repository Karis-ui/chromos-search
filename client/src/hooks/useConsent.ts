import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import consentApi, { type ConsentGrantData, type SocialLinks } from '../api/endpoints/consent';
import { useConsentStore } from '../store/consentStore';

export const useConsent = () => {
    const queryClient = useQueryClient();
    const {
        profile,
        stats,
        hasConsent,
        isActive,
        faceCount,
        isLoading,
        isGranting,
        isUploading,
        isRevoking,
        error,
        setProfile,
        setStats,
        setStatus,
        setLoading,
        setError,
    } = useConsentStore();
    const statusQuery = useQuery({
        queryKey: ['consent', 'status'],
        queryFn: async () => {
            const data = await consentApi.getStatus();
            setStatus(data);
            return data;
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const grantMutation = useMutation({
        mutationFn: (data: ConsentGrantData) => consentApi.grantConsent(data),
        onSuccess: (data) => {
            setProfile(data);
            setLoading('isGranting', false);
            queryClient.invalidateQueries({ queryKey: ['consent'] });
            toast.success('Consent granted');
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || error.message || 'Failed to grant consent';
            setError(message);
            setLoading('isGranting', false);
            toast.error(message);
        },
    });

    const uploadPhotoMutation = useMutation({
        mutationFn: ({
            profile_id,
            file,
            is_primary
        }: {
            profile_id: string;
            file: File;
            is_primary: boolean;
        }) => consentApi.uploadPhoto(profile_id, file, is_primary),
        onSuccess: (data) => {
            setLoading('isUploading', false);
            queryClient.invalidateQueries({ queryKey: ['consent', 'status'] });
            if (!useConsentStore.getState().profile?.face_thumbnail_url) {
                setProfile({
                    ...useConsentStore.getState().profile!,
                    face_thumbnail_url: data.thumbnail_url,
                    face_count: useConsentStore.getState().profile?.face_count + 1 || 1,
                });
            } else {
                const p = useConsentStore.getState().profile!;
                setProfile({
                    ...p,
                    face_count: (p.face_count || 0) + 1
                });
            }
            toast.success('Photo uploaded');
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || error.message || 'Failed to upload photo';
            setError(message);
            setLoading('isUploading', false);
            toast.error(message);
        },
    });

    const revokeMutation = useMutation({
        mutationFn: (reason?: string) => consentApi.revokeConsent(reason),
        onSuccess: (data) => {
            setStatus(data);
            setProfile(null);
            setLoading('isRevoking', false);
            queryClient.invalidateQueries({ queryKey: ['consent'] });
            toast.success('Consent revoked');
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || error.message || 'Failed to revoke consent';
            setError(message);
            setLoading('isRevoking', false);
            toast.error(message);
        },
    });

    const socialLinksMutation = useMutation({
        mutationFn: (links: SocialLinks) => consentApi.updateSocialLinks(links),
        onSuccess: (data) => {
            setProfile(data);
            queryClient.invalidateQueries({ queryKey: ['consent'] });
            toast.success('Social links updated');
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || error.message || 'Failed to update social links';
            setError(message);
            toast.error(message);
        },
    });

    const searchMutation = useMutation({
        mutationFn: ({
            file,
            min_similarity,
            limit
        }: {
            file: File;
            min_similarity: number;
            limit: number;
        }) => consentApi.search(file, min_similarity, limit),
        onSuccess: () => {
            toast.success('Search completed');
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || error.message || 'Failed to search';
            setError(message);
            toast.error(message);
        },
    });

    const grantConsent = useCallback((data: ConsentGrantData) => {
        setLoading('isGranting', true);
        setError(null);
        grantMutation.mutate(data);
    }, []);

    const updateSocialLinks = useCallback((links: SocialLinks) => {
        setLoading('isUpdating', true);
        setError(null);
        socialLinksMutation.mutate(links);
    }, []);

    const revokeConsent = useCallback((reason?: string) => {
        setLoading('isRevoking', true);
        setError(null);
        revokeMutation.mutate(reason);
    }, []);

    const uploadPhoto = useCallback((profile_id: string, file: File, is_primary: boolean) => {
        setLoading('isUploading', true);
        setError(null);
        return uploadPhotoMutation.mutateAsync({ profile_id, file, is_primary });
    }, []);

    const search = useCallback((file: File, min_similarity: number, limit: number) => {
        setError(null);
        searchMutation.mutate({ file, min_similarity, limit });
    }, []);

    const refreshStatus = useCallback(
        (reason?: string) => {
            setLoading('isRevoking', true);
            return revokeMutation.mutateAsync(reason)
        },
        [revokeMutation]
    );

    useEffect(() => {
        if (!statusQuery.isSuccess && !statusQuery.isLoading) {
            statusQuery.refetch();
        }
    }, []);

    return {
        profile,
        stats,
        hasConsent,
        isActive,
        faceCount,
        isLoading,
        isGranting,
        isUploading,
        isRevoking,
        error,
        grantConsent,
        updateSocialLinks,
        revokeConsent,
        uploadPhoto,
        search,
        refreshStatus,
        setStats,
        statusQuery,
    }
}