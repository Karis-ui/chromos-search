import type { Platform, PlatformInfo } from "../types/search.types";

export const PLATFORMS: PlatformInfo[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        color: '#E4405F',
        icon: 'instagram',
        enabled: true,
        requiresAuth: true,
        rateLimit: 200,
    },
    {
        id: 'facebook',
        name: 'Facebook',
        color: '#1877F2',
        icon: 'facebook',
        enabled: true,
        requiresAuth: true,
        rateLimit: 200,
    },
    {
        id: 'twitter',
        name: 'Twitter / X',
        color: '#1DA1F2',
        icon: 'twitter',
        enabled: true,
        requiresAuth: true,
        rateLimit: 300,
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        color: '#000000',
        icon: 'tiktok',
        enabled: true,
        requiresAuth: true,
        rateLimit: 150,
    },
    {
        id: 'youtube',
        name: 'YouTube',
        color: '#FF0000',
        icon: 'youtube',
        enabled: true,
        requiresAuth: true,
        rateLimit: 100,
    },
    {
        id: 'telegram',
        name: 'Telegram',
        color: '#26A5E4',
        icon: 'telegram',
        enabled: true,
        requiresAuth: false,
        rateLimit: 30,
    },
    {
        id: 'reddit',
        name: 'Reddit',
        color: '#FF4500',
        icon: 'reddit',
        enabled: true,
        requiresAuth: true,
        rateLimit: 60,
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: 'linkedin',
        enabled: false,
        requiresAuth: true,
        rateLimit: 100,
    },
    {
        id: 'snapchat',
        name: 'Snapchat',
        color: '#FFFC00',
        icon: 'snapchat',
        enabled: false,
        requiresAuth: true,
        rateLimit: 50,
    },
    {
        id: 'pinterest',
        name: 'Pinterest',
        color: '#E60023',
        icon: 'pinterest',
        enabled: false,
        requiresAuth: true,
        rateLimit: 100,
    },
    {
        id: 'discord',
        name: 'Discord',
        color: '#5865F2',
        icon: 'discord',
        enabled: false,
        requiresAuth: true,
        rateLimit: 50,
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        color: '#25D366',
        icon: 'whatsapp',
        enabled: false,
        requiresAuth: true,
        rateLimit: 20,
    },
];

export const PLATFORM_MAP: Record<Platform, PlatformInfo> = PLATFORMS.reduce(
    (acc, platform) => {
        acc[platform.id] = platform;
        return acc;
    },
    {} as Record<Platform, PlatformInfo>
);

export const ENABLED_PLATFORMS = PLATFORMS.filter((p) => p.enabled);
export const DISABLED_PLATFORMS = PLATFORMS.filter((p) => !p.enabled);

export const getPlatformInfo = (id: Platform): PlatformInfo | undefined =>
    PLATFORM_MAP[id];

export const getPlatformColor = (id: Platform): string =>
    PLATFORM_MAP[id]?.color || '#94a3b8';

export const getPlatformIcon = (id: Platform): string =>
    PLATFORM_MAP[id]?.icon || 'globe';

export const isPlatformEnabled = (id: Platform): boolean =>
    PLATFORM_MAP[id]?.enabled ?? false;

export const getPlatformName = (id: Platform): string =>
    PLATFORM_MAP[id]?.name || id;