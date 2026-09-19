export const measurePerformance = <T>(name: string, fn: () => T): { result: T; duration: number } => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
};

export const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
};

export const memoize = <Args extends any[], R>(fn: (...args: Args) => R): ((...args: Args) => R) => {
    const cache = new Map<string, R>();
    return (...args: Args): R => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key)!;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

export const lazyLoad = <T>(loader: () => Promise<T>): (() => Promise<T>) => {
    let promise: Promise<T> | null = null;
    return () => {
        if (!promise) promise = loader();
        return promise;
    };
};

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export const preloadImages = async (srcs: string[]): Promise<HTMLImageElement[]> => {
    return Promise.all(srcs.map(preloadImage));
};

export const requestIdleCallback = (callback: () => void, options?: { timeout: number }): number => {
    if ('requestIdleCallback' in window) {
        return (window as any).requestIdleCallback(callback, options);
    }
    return setTimeout(callback, 1);
};

export const cancelIdleCallback = (id: number): void => {
    if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(id);
    } else {
        clearTimeout(id);
    }
};

export const batchUpdates = <T>(items: T[], batchSize: number, callback: (batch: T[]) => void): void => {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        requestIdleCallback(() => callback(batch));
    }
};

export const rafThrottle = <T extends (...args: any[]) => void>(fn: T): ((...args: Parameters<T>) => void) => {
    let rafId: number | null = null;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        lastArgs = args;
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
            if (lastArgs) fn(...lastArgs);
            rafId = null;
            lastArgs = null;
        });
    };
};

export const createObserver = (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
): IntersectionObserver | null => {
    if (typeof IntersectionObserver === 'undefined') return null;
    return new IntersectionObserver(callback, options);
};

export const useIntersectionObserver = (): typeof IntersectionObserver | null => {
    if (typeof window === 'undefined') return null;
    return 'IntersectionObserver' in window ? IntersectionObserver : null;
};

export const isLowEndDevice = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    return (memory && memory < 4) || (cores && cores < 4);
};

export const getPerformanceScore = (): number => {
    if (typeof window === 'undefined' || !window.performance) return 0;
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!nav) return 0;

    const loadTime = nav.loadEventEnd - nav.startTime;
    const domReady = nav.domContentLoadedEventEnd - nav.startTime;
    const ttfb = nav.responseStart - nav.startTime;

    let score = 100;
    if (loadTime > 3000) score -= 30;
    else if (loadTime > 2000) score -= 15;
    else if (loadTime > 1000) score -= 5;

    if (domReady > 2000) score -= 20;
    if (ttfb > 500) score -= 20;
    else if (ttfb > 200) score -= 10;

    return Math.max(0, score);
};