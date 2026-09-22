import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUIStore } from "../store";
import type { Theme } from "../types/common.types";

interface ThemeContextValue {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    systemTheme: 'light' | 'dark';
    isSystemTheme: boolean;
    isMobile: boolean;
    isProMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { theme, isDark, setTheme, toggleTheme } = useUIStore();

    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') {
            return 'light';
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });

    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.innerWidth < 768;
    });

    const isSystemTheme = theme === systemTheme;

    const isProMode = theme === 'dark' && isMobile;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(
            '(prefers-color-scheme: dark)'
        );

        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (isSystemTheme) {
            setTheme(systemTheme);
        }
    }, [isSystemTheme, systemTheme, setTheme]);

    const value = useMemo(
        () => ({
            theme,
            isDark,
            setTheme,
            toggleTheme,
            systemTheme,
            isSystemTheme,
            isMobile,
            isProMode,
        }),
        [
            theme,
            isDark,
            setTheme,
            toggleTheme,
            systemTheme,
            isSystemTheme,
            isMobile,
            isProMode,
        ]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};