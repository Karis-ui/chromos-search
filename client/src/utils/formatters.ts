import { formatDistanceToNow, format, parseISO, isValid } from "date-fns";

export const formatTimeAgo = (date: string | Date): string => {
    if (!date) return 'unknown';
    try {
        const parsed = typeof date === 'string' ? parseISO(date) : date;
        if (isValid(parsed)) {
            return formatDistanceToNow(parsed, { addSuffix: true });
        }
    } catch {
        return 'invalid date';
    }
    return 'unknown'
};

export const formatDateShort = (date: string | Date): string => {
    if (!date) return 'N/A';
    try {
        const parsed = typeof date === 'string' ? parseISO(date) : date;
        if (isValid(parsed)) {
            return format(parsed, 'MMM dd, yyyy');
        }
    } catch {
        return 'invalid date'
    }
    return 'N/A'
};

export const formatDateFull = (date: string | Date): string => {
    if (!date) return 'N/A'
    try {
        const parsed = typeof date === 'string' ? parseISO(date) : date;
        if (isValid(parsed)) {
            return format(parsed, 'MMMM dd, yyyy HH:mm:ss');
        }
    } catch {
        return 'invalid date'
    }
    return 'N/A'
};

export const formatDateISO = (date: string | Date): string => {
    if (!date) return 'N/A'
    try {
        const parsed = typeof date === 'string' ? parseISO(date) : date;
        if (isValid(parsed)) {
            return parsed.toISOString();
        }
    } catch {
        return '';
    }
    return '';
};

export const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24) return `${hours}h ${remainingMinutes}m`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
};

export const formatNumber = (num: number | null | undefined): string => {
    if (num == null) return '0';
    if (num < 1000) return num.toString();
    if (num < 1_000_000) return `${(num / 1_000).toFixed(0)}K`;
    if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num < 1_000_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    return `${(num / 1_000_000_000_000).toFixed(1)}T`;
};

export const formatCurrency = (amount: number, currency = 'KSH'): string => {
    if (amount == null) return `${currency}0.00`;
    return `${currency}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
    if (value == null) return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
};

export const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

export const formatFileSize = formatBytes;


export const formatConfidence = (score: number | null | undefined): string => {
    if (score == null) return '0%';
    return `${(score * 100).toFixed(1)}%`;
};

export const getConfidenceLevel = (score: number): 'high' | 'medium' | 'low' | 'negative' => {
    if (score >= 0.85) return 'high';
    if (score >= 0.70) return 'medium';
    if (score >= 0.55) return 'low';
    return 'negative';
};

export const getConfidenceColor = (score: number): string => {
    const level = getConfidenceLevel(score);
    const colors = {
        high: '#4ade80',
        medium: '#facc15',
        low: '#fb923c',
        negative: '#f87171',
    };
    return colors[level];
};


const PLATFORM_ICONS: Record<string, string> = {
    instagram: '📸',
    facebook: '👍',
    twitter: '🐦',
    tiktok: '🎵',
    telegram: '✈️',
    reddit: '🤖',
    youtube: '▶️',
    linkedin: '💼',
    snapchat: '👻',
    pinterest: '📌',
    discord: '🎮',
    whatsapp: '💬',
};

const PLATFORM_COLORS: Record<string, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    tiktok: '#000000',
    telegram: '#26A5E4',
    reddit: '#FF4500',
    youtube: '#FF0000',
    linkedin: '#0A66C2',
    snapchat: '#FFFC00',
    pinterest: '#E60023',
    discord: '#5865F2',
    whatsapp: '#25D366',
};

export const getPlatformIcon = (platform: string): string =>
    PLATFORM_ICONS[platform.toLowerCase()] || '🌐';

export const getPlatformColor = (platform: string): string =>
    PLATFORM_COLORS[platform.toLowerCase()] || '#94a3b8';


export const prettyJson = (data: any): string => {
    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return String(data);
    }
};

export const safeJsonParse = <T = any>(jsonStr: string): T | null => {
    try {
        return JSON.parse(jsonStr);
    } catch {
        return null;
    }
};

export const truncateText = (text: string, maxLength = 100, suffix = '...'): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
};

export const truncateMiddle = (text: string, maxLength = 100, suffix = '...'): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    const half = Math.floor((maxLength - suffix.length) / 2);
    return text.slice(0, half) + suffix + text.slice(-half);
};

export const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

export const formatUrl = (url: string, maxLength = 50): string => {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        const display = `${parsed.hostname}${parsed.pathname}`;
        return truncateMiddle(display, maxLength);
    } catch {
        return truncateMiddle(url, maxLength);
    }
};