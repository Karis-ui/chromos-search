type StorageKind = 'local' | 'session';

const getStorage = (kind: StorageKind): Storage | null => {
    if (typeof window === 'undefined') return null;
    try {
        return kind === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
        return null;
    }
};

const read = <T>(kind: StorageKind, key: string, fallback: T): T => {
    const storage = getStorage(kind);
    if (!storage) return fallback;

    try {
        const raw = storage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        try { storage.removeItem(key); } catch { /* noop */ }
        return fallback;
    }
};

const write = <T>(kind: StorageKind, key: string, value: T): boolean => {
    const storage = getStorage(kind);
    if (!storage) return false;

    try {
        storage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

const remove = (kind: StorageKind, key: string): void => {
    const storage = getStorage(kind);
    if (!storage) return;
    try { storage.removeItem(key); } catch { /* noop */ }
};

const clear = (kind: StorageKind): void => {
    const storage = getStorage(kind);
    if (!storage) return;
    try { storage.clear(); } catch { /* noop */ }
};

const has = (kind: StorageKind, key: string): boolean => {
    const storage = getStorage(kind);
    if (!storage) return false;
    return storage.getItem(key) !== null;
};

export const storage = {
    get: <T>(key: string, fallback: T): T => read('local', key, fallback),
    set: <T>(key: string, value: T): boolean => write('local', key, value),
    remove: (key: string): void => remove('local', key),
    clear: (): void => clear('local'),
    has: (key: string): boolean => has('local', key),

    session: {
        get: <T>(key: string, fallback: T): T => read('session', key, fallback),
        set: <T>(key: string, value: T): boolean => write('session', key, value),
        remove: (key: string): void => remove('session', key),
        clear: (): void => clear('session'),
        has: (key: string): boolean => has('session', key),
    },
};

export const STORAGE_KEYS = {
    THEME: 'chronos:theme',
    AUTH_TOKEN: 'chronos:auth:token',
    AUTH_USER: 'chronos:auth:user',
    SIDEBAR_COLLAPSED: 'chronos:ui:sidebarCollapsed',
    RECENT_SEARCHES: 'chronos:search:recent',
    LAST_TASK_ID: 'chronos:search:lastTaskId',
} as const;

export default storage;