export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

export const rgbToHex = (r: number, g: number, b: number): string =>
    '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

export const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
};

export const lighten = (color: string, amount: number): string => {
    const hsl = hexToHsl(color);
    if (!hsl) return color;
    return hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + amount));
};

export const darken = (color: string, amount: number): string => {
    const hsl = hexToHsl(color);
    if (!hsl) return color;
    return hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - amount));
};

export const withOpacity = (color: string, opacity: number): string => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, Math.min(1, opacity))})`;
};

export const mixColors = (color1: string, color2: string, ratio = 0.5): string => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return color1;
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
    return rgbToHex(r, g, b);
};

export const adjustBrightness = (color: string, factor: number): string => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return rgbToHex(
        Math.min(255, Math.max(0, rgb.r * factor)),
        Math.min(255, Math.max(0, rgb.g * factor)),
        Math.min(255, Math.max(0, rgb.b * factor))
    );
};

export const getContrastColor = (bgColor: string): '#ffffff' | '#000000' => {
    const rgb = hexToRgb(bgColor);
    if (!rgb) return '#ffffff';
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const getReadableTextColor = getContrastColor;

export const isLightColor = (color: string): boolean => {
    const rgb = hexToRgb(color);
    if (!rgb) return false;
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.7;
};

export const isDarkColor = (color: string): boolean => !isLightColor(color);

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1;
    const f = Math.max(0, Math.min(1, factor));
    return rgbToHex(
        c1.r + (c2.r - c1.r) * f,
        c1.g + (c2.g - c1.g) * f,
        c1.b + (c2.b - c1.b) * f
    );
};


export const generatePalette = (baseColor: string): Record<string, string> => {
    const hsl = hexToHsl(baseColor);
    if (!hsl) return {};
    return {
        50: hslToHex(hsl.h, hsl.s, 95),
        100: hslToHex(hsl.h, hsl.s, 90),
        200: hslToHex(hsl.h, hsl.s, 80),
        300: hslToHex(hsl.h, hsl.s, 70),
        400: hslToHex(hsl.h, hsl.s, 60),
        500: baseColor,
        600: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 10)),
        700: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)),
        800: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 30)),
        900: hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 40)),
    };
};

export const randomColor = (): string => {
    const hue = Math.floor(Math.random() * 360);
    const sat = 60 + Math.random() * 30;
    const light = 45 + Math.random() * 20;
    return hslToHex(hue, sat, light);
};