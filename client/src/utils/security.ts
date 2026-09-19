export const generateNonce = (length = 16): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const encodeBase64 = (text: string): string => {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch {
        return '';
    }
};

export const decodeBase64 = (text: string): string => {
    try {
        return decodeURIComponent(escape(atob(text)));
    } catch {
        return '';
    }
};

export const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&': '&amp',
        '<': '&lt',
        '>': '&gt',
        '"': '&quot',
        "'": '&apos',
        '/': '&#x2F'
    }
    return text.replace(/[&<>"'\/]/g, (match) => map[match]);
};

export const unescapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&amp': '&',
        '&lt': '<',
        '&gt': '>',
        '&quot': '"',
        "&apos": "'",
        '&#x2F': "/",
    };
    return text.replace(/&amp|&lt|&gt|&quot|&apos|&#x2F/g, (match) => map[match]);
};

export const removeHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
};

export const isSecureContext = (): boolean => {
    return window.isSecureContext && typeof window !== 'undefined';
};

export const hashSha256 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

export const generateFingerprint = (): string => {
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
    ];
    return components.join('|');
};

export const makeSensitiveData = (data: string, visibleChars = 4): string => {
    if (data.length <= visibleChars * 2) return data;
    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const masked = '*'.repeat(Math.min(8, data.length - visibleChars * 2));
    return `${start}${masked}${end}`;
};

export const redactPII = (text: string): string => {
    return text
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL_ADDRESS]')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[CREDIT_CARD]')
        .replace(/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g, '[NUMBER]')
        .replace(/\b\d{9,16}\b/g, '[NUMBER]')
        .replace(/\b(?:19|20)\d{2}-\d{2}-\d{2}\b/g, '[DATE]')
        .replace(/\b[A-Z][a-z]+(?: [A-Z][a-z]+){1,2}\b/g, '[NAME]')
        .replace(/\b(?:0x[0-9a-fA-F]+|\b[0-9a-fA-F]+)\b/g, '[HEX]')
}


export const generateStrongPassword = (length = 16): string => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
};

export const validateCSRFToken = async (token: string, storedToken: string): Promise<boolean> => {
    if (!token || !storedToken) return false;
    if (token.length !== storedToken.length) return false;

    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return hash === storedToken;
};