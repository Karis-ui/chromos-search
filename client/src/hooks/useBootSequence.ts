import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';

const BOOT_SEEN_KEY = 'chronos_boot_seen';
const BOOT_COUNT_KEY = 'chronos_boot_count';
const BOOT_SKIP_ALWAYS_KEY = 'chronos_boot_skip_always';

export const useBootSequence = (username?: string) => {
    const [shouldShowBoot, setShouldShowBoot] = useState(false);
    const [bootType, setBootType] = useState<'welcome' | 'new-user' | 'short'>('welcome');
    const [bootCount, setBootCount] = useState(0);

    useEffect(() => {
        if (!username) {
            setShouldShowBoot(false);
            return;
        }

        const skipAlways = storage.get<boolean>(BOOT_SKIP_ALWAYS_KEY, false);
        if (skipAlways) {
            setShouldShowBoot(false);
            return;
        }

        const count = storage.get<number>(BOOT_COUNT_KEY, 0);
        setBootCount(count);

        if (count === 0) {
            setBootType('new-user');
            setShouldShowBoot(true);
        } else if (count < 3) {
            setBootType('welcome');
            setShouldShowBoot(true);
        } else {
            setBootType('short');
            setShouldShowBoot(true);
        }
    }, [username]);

    const markBootComplete = useCallback(() => {
        const count = storage.get<number>(BOOT_COUNT_KEY, 0);
        storage.set(BOOT_COUNT_KEY, count + 1);
        storage.set(BOOT_SEEN_KEY, new Date().toISOString());
        setShouldShowBoot(false);
    }, []);

    const skipAlways = useCallback(() => {
        storage.set(BOOT_SKIP_ALWAYS_KEY, true);
        setShouldShowBoot(false);
    }, []);

    const reset = useCallback(() => {
        storage.remove(BOOT_SEEN_KEY);
        storage.remove(BOOT_COUNT_KEY);
        storage.remove(BOOT_SKIP_ALWAYS_KEY);
        setBootCount(0);
    }, []);

    return {
        shouldShowBoot,
        bootType,
        bootCount,
        markBootComplete,
        skipAlways,
        reset,
    };
};