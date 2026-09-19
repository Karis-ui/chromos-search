export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
};

export const validateUsername = (username: string): boolean => {
    if (!username) return false;
    if (username.length < 3 || username.length > 50) return false;
    const pattern = /^[a-zA-Z0-9_]+$/;
    return pattern.test(username);
};

export const validatePassword = (password: string) => {
    return {
        minLength: password.length >= 8,
        maxLength: password.length <= 128,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=\[\]{};:,.<>?]/.test(password),
        noCommon: !['password', '12345678', 'qwerty123', 'admin123'].includes(
            password.toLowerCase()
        ),
    };
};

export const isPasswordStrong = (password: string): boolean => {
    if (!password) return false;
    const validate = validatePassword(password)
    return Object.values(validate).every((value) => value === true);
};

export const validateUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return ["http:", "https:", "ftp:", "mailto:"].includes(parsed.protocol);
    } catch (e) {
        return false;
    }
};

export const validateImageFile = (filename: string): boolean => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return allowed.includes(ext);
};

export const validateVideoFile = (filename: string): boolean => {
    const allowed = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.mpeg', '.wmv'];
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    return allowed.includes(ext);
};

export const validateMediaFile = (contentType: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' => {
    if (!contentType) return 'unknown';

    const prefix = contentType.split('/')[0].toLowerCase();
    const mimeType = contentType.split('/')[1].toLowerCase();

    if (prefix === 'image') return 'image';
    if (prefix === 'video') return 'video';
    if (prefix === 'audio') return 'audio';

    const docPatterns = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'csv', 'md', 'rtf'];
    if (docPatterns.includes(mimeType)) return 'document';

    return 'unknown';
};

export const validateFileCount = (files: File[], maxCount = 1): boolean => {
    if (!files || files.length === 0) return false;
    if (maxCount === 0) return true;
    return files.length <= maxCount;
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
    return startDate < endDate;
};

export const validateTimeRangeDays = (days: number, minDays = 1, maxDays = 180): boolean => {
    return Number.isInteger(days) && days >= minDays && days <= maxDays;
};

export const isValidISODate = (dateStr: string): boolean => {
    try {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
};


export const validateUUID = (uuid: string): boolean => {
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return pattern.test(uuid);
};

export const validateUUIDList = (uuids: string[]): boolean[] => {
    return uuids.map(validateUUID);
};

export const validateJson = (data: any): boolean => {
    try {
        JSON.stringify(data);
        return true;
    } catch {
        return false;
    }
};

export const validatePlatform = (platform: string): boolean => {
    const valid = [
        'instagram', 'facebook', 'twitter', 'tiktok',
        'telegram', 'reddit', 'youtube', 'snapchat',
        'linkedin', 'pinterest', 'discord', 'whatsapp',
    ];
    return valid.includes(platform.toLowerCase());
};

export const validatePlatforms = (platforms: string[]): string[] => {
    return platforms.filter(validatePlatform);
};

export const validateConfidence = (confidence: number): boolean => {
    return confidence >= 0 && confidence <= 1;
};

export const sanitizeInput = (text: string, maxLength = 1000): string => {
    if (!text) return '';
    let sanitized = text.trim();
    if (sanitized.length > maxLength) {
        sanitized = sanitized.slice(0, maxLength);
    }
    return sanitized;
};

export const sanitizeFilename = (filename: string): string => {
    if (!filename) return '';
    return filename
        .replace(/[\/\\]/g, '')
        .replace(/[^\w\-_.]/g, '')
        .slice(0, 255);
};

export const sanitizeEmail = (email: string): string => {
    if (!email) return '';
    return email.trim().toLowerCase();
};

export const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};