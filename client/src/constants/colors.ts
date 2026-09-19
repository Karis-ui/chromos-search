export const COLORS = {
    cyan: {
        50: '#ecfeff',
        100: '#cffafe',
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63',
        950: '#083344',
    },
    purple: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
        950: '#3b0764',
    },
    pink: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
        950: '#500724',
    },
    green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
    },
    yellow: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
        950: '#422006',
    },
    red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
    },
    orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        950: '#431407',
    },
    blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
    },
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        750: '#1a1a2e',
        800: '#1f2937',
        850: '#0f0f1a',
        900: '#111827',
        950: '#0a0a0f',
    },
} as const;

export const GRADIENTS = {
    primary: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
    cyber: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #ec4899 100%)',
    rainbow: 'linear-gradient(90deg, #06b6d4, #a855f7, #ec4899, #f43f5e, #06b6d4)',
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    warning: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    dark: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
    neonCyan: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
    neonPurple: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
    neonPink: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
} as const;

export const CONFIDENCE_COLORS = {
    high: {
        main: '#4ade80',
        bg: 'rgba(74, 222, 128, 0.1)',
        border: 'rgba(74, 222, 128, 0.3)',
        glow: 'rgba(74, 222, 128, 0.4)',
        gradient: 'linear-gradient(135deg, #4ade80, #22c55e)',
    },
    medium: {
        main: '#facc15',
        bg: 'rgba(250, 204, 21, 0.1)',
        border: 'rgba(250, 204, 21, 0.3)',
        glow: 'rgba(250, 204, 21, 0.4)',
        gradient: 'linear-gradient(135deg, #facc15, #eab308)',
    },
    low: {
        main: '#fb923c',
        bg: 'rgba(251, 146, 60, 0.1)',
        border: 'rgba(251, 146, 60, 0.3)',
        glow: 'rgba(251, 146, 60, 0.4)',
        gradient: 'linear-gradient(135deg, #fb923c, #f97316)',
    },
    negative: {
        main: '#f87171',
        bg: 'rgba(248, 113, 113, 0.1)',
        border: 'rgba(248, 113, 113, 0.3)',
        glow: 'rgba(248, 113, 113, 0.4)',
        gradient: 'linear-gradient(135deg, #f87171, #ef4444)',
    },
    unknown: {
        main: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.1)',
        border: 'rgba(148, 163, 184, 0.3)',
        glow: 'rgba(148, 163, 184, 0.4)',
        gradient: 'linear-gradient(135deg, #94a3b8, #64748b)',
    },
} as const;

export const STATUS_COLORS = {
    idle: '#94a3b8',
    loading: '#22d3ee',
    success: '#4ade80',
    warning: '#facc15',
    error: '#f87171',
    info: '#60a5fa',
    online: '#4ade80',
    offline: '#f87171',
    connecting: '#facc15',
} as const;

export const CHART_COLORS = [
    '#06b6d4',
    '#a855f7',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
    '#3b82f6',
    '#8b5cf6',
] as const;

export const getConfidenceColor = (similarity: number) => {
    if (similarity >= 0.85) return CONFIDENCE_COLORS.high;
    if (similarity >= 0.70) return CONFIDENCE_COLORS.medium;
    if (similarity >= 0.55) return CONFIDENCE_COLORS.low;
    return CONFIDENCE_COLORS.negative;
};

export const getStatusColor = (status: string): string =>
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.idle;

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
    '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');

export const withOpacity = (color: string, opacity: number): string => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
};