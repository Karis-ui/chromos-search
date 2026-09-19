import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';

interface UseApiOptions {
    showSuccess?: boolean;
    showError?: boolean;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export const useApi = <T = any>() => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(
        async <R = T>(
            request: () => Promise<R>,
            options: UseApiOptions = {}
        ): Promise<R | null> => {
            const {
                showSuccess = false,
                showError = true,
                successMessage,
                errorMessage,
                onSuccess,
                onError,
            } = options;

            setLoading(true);
            setError(null);

            try {
                const response = await request();
                setData(response as any);

                if (showSuccess) {
                    toast.success(successMessage || 'Operation completed successfully');
                }

                onSuccess?.(response);
                return response;
            } catch (err: any) {
                const message = err.response?.data?.error?.message || err.message || 'An error occurred';
                setError(message);

                if (showError) {
                    toast.error(errorMessage || message);
                }

                onError?.(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    const get = useCallback(
        <R = T>(url: string, options?: UseApiOptions) => {
            return execute<R>(() => apiClient.get<R>(url), options);
        },
        [execute]
    );

    const post = useCallback(
        <R = T>(url: string, data?: any, options?: UseApiOptions) => {
            return execute<R>(() => apiClient.post<R>(url, data), options);
        },
        [execute]
    );

    const put = useCallback(
        <R = T>(url: string, data?: any, options?: UseApiOptions) => {
            return execute<R>(() => apiClient.put<R>(url, data), options);
        },
        [execute]
    );

    const patch = useCallback(
        <R = T>(url: string, data?: any, options?: UseApiOptions) => {
            return execute<R>(() => apiClient.patch<R>(url, data), options);
        },
        [execute]
    );

    const del = useCallback(
        <R = T>(url: string, options?: UseApiOptions) => {
            return execute<R>(() => apiClient.delete<R>(url), options);
        },
        [execute]
    );

    const upload = useCallback(
        <R = T>(
            url: string,
            file: File,
            data?: Record<string, any>,
            options?: UseApiOptions & { onProgress?: (progress: number) => void }
        ) => {
            const { onProgress, ...restOptions } = options || {};
            return execute<R>(
                () => apiClient.upload<R>(url, 'file', file, data, onProgress),
                restOptions
            );
        },
        [execute]
    );

    return {
        data,
        loading,
        error,
        execute,
        reset,
        get,
        post,
        put,
        patch,
        delete: del,
        upload,
        isSuccess: !!data && !error,
        isError: !!error,
    };
};

export default useApi;