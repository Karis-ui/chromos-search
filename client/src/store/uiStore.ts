import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type Theme = 'light' | 'dark' | 'auto' | 'cyberpunk' | 'matrix';
export type ViewMode = 'spiral' | 'grid' | 'morphing' | 'heatmap' | 'timeline' | 'network' | 'temporal';
export type PanelTab = 'parameters' | 'statistics' | 'distributions' | 'analytics' | 'history';
export type ModalType = 'result' | 'settings' | 'feedback' | 'confirm' | 'info' | null;

export interface UIState {
    theme: Theme;
    isDark: boolean;
    accentColor: string;
    fontScale: number;
    reducedMotion: boolean;

    sidebarCollapsed: boolean;
    sidebarOpen: boolean;
    panelTab: PanelTab;
    viewMode: ViewMode;
    isFullscreen: boolean;

    activeModal: ModalType;
    modalData: any;

    notificationsEnabled: boolean;
    soundEnabled: boolean;

    particlesEnabled: boolean;
    scanlinesEnabled: boolean;
    glowEnabled: boolean;
    backgroundEffects: boolean;

    autoScrollResults: boolean;
    autoExport: boolean;
    compactMode: boolean;
    advancedMode: boolean;

    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    setAccentColor: (color: string) => void;
    setFontScale: (scale: number) => void;
    toggleReducedMotion: () => void;

    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setPanelTab: (tab: PanelTab) => void;
    setViewMode: (mode: ViewMode) => void;
    cycleViewMode: () => void;
    toggleFullscreen: () => void;

    openModal: (type: ModalType, data?: any) => void;
    closeModal: () => void;

    toggleParticles: () => void;
    toggleScanlines: () => void;
    toggleGlow: () => void;
    toggleBackgroundEffects: () => void;

    toggleAutoScroll: () => void;
    toggleAutoExport: () => void;
    toggleCompactMode: () => void;
    toggleAdvancedMode: () => void;
    toggleNotifications: () => void;
    toggleSound: () => void;

    reset: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDOM = (theme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'cyberprynk', 'matrix');
    let effectiveTheme: 'light' | 'dark' = 'dark';
    if (theme === 'auto') {
        effectiveTheme = getSystemTheme();
    } else if (theme === 'cyberpunk' || theme === 'matrix') {
        effectiveTheme = 'dark';
    } else {
        effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);
    if (theme === 'cyberpunk') root.classList.add('cyberprunk');
    if (theme === 'matrix') root.classList.add('matrix');
    const metaThemColor = document.querySelector('meta[namr="theme-color"]');
    if (metaThemColor) {
        metaThemColor.setAttribute(
            'content',
            effectiveTheme === 'dark' ? '#0a0a0f' : '#ffffff'
        );
    }
};

const initialState: UIState = {
    theme: 'dark',
    isDark: true,
    accentColor: '#06b6d4',
    fontScale: 1,
    reducedMotion: false,

    sidebarCollapsed: false,
    sidebarOpen: true,
    panelTab: 'parameters',
    viewMode: 'spiral',
    isFullscreen: false,

    activeModal: null,
    modalData: null,

    notificationsEnabled: true,
    soundEnabled: true,

    particlesEnabled: true,
    scanlinesEnabled: true,
    glowEnabled: true,
    backgroundEffects: true,

    autoScrollResults: true,
    autoExport: false,
    compactMode: false,
    advancedMode: false,

    setTheme: () => { },
    toggleTheme: () => { },
    setAccentColor: () => { },
    setFontScale: () => { },
    toggleReducedMotion: () => { },
    toggleSidebar: () => { },
    setSidebarOpen: () => { },
    setPanelTab: () => { },
    setViewMode: () => { },
    cycleViewMode: () => { },
    toggleFullscreen: () => { },
    openModal: () => { },
    closeModal: () => { },
    toggleParticles: () => { },
    toggleScanlines: () => { },
    toggleGlow: () => { },
    toggleBackgroundEffects: () => { },
    toggleAutoScroll: () => { },
    toggleAutoExport: () => { },
    toggleCompactMode: () => { },
    toggleAdvancedMode: () => { },
    toggleNotifications: () => { },
    toggleSound: () => { },
    reset: () => { },
};

export const useUIStore = create<UIState>()(
    subscribeWithSelector(
        persist(
            immer((set, get) => ({
                ...initialState,

                setTheme: (theme) => {
                    set((state) => {
                        state.theme = theme;
                        state.isDark = theme === 'auto' ? getSystemTheme() === 'dark' : theme !== 'light';
                    });

                    applyThemeToDOM(theme);
                },

                toggleTheme: () => {
                    const currentTheme = get().theme;
                    const themes: Theme[] = ['dark', 'light', 'cyberpunk', 'matrix', 'auto'];
                    const currentIndex = themes.indexOf(currentTheme);
                    const nextTheme = themes[(currentIndex + 1) % themes.length];
                    get().setTheme(nextTheme);
                },

                setAccentColor: (color) => {
                    set((state) => {
                        state.accentColor = color;
                    });

                    if (typeof document !== 'undefined') {
                        document.documentElement.style.setProperty('--accent-color', color);
                    }
                },

                setFontScale: (scale) => {
                    const clampedScale = Math.max(0.75, Math.min(1.5, scale));
                    set((state) => {
                        state.fontScale = clampedScale;
                    });

                    if (typeof document !== 'undefined') {
                        document.documentElement.style.fontSize = `${clampedScale * 16}px`;
                    }
                },

                toggleReducedMotion: () => {
                    set((state) => {
                        state.reducedMotion = !state.reducedMotion;
                    });
                },

                toggleSidebar: () => {
                    set((state) => {
                        state.sidebarOpen = !state.sidebarOpen;
                        state.sidebarCollapsed = !state.sidebarOpen;
                    });
                },

                setSidebarOpen: (open) => {
                    set((state) => {
                        state.sidebarOpen = open;
                        state.sidebarCollapsed = !open;
                    });
                },

                setPanelTab: (tab) => {
                    set((state) => {
                        state.panelTab = tab;
                    });
                },

                setViewMode: (mode) => {
                    set((state) => {
                        state.viewMode = mode;
                    });
                },

                cycleViewMode: () => {
                    const modes: ViewMode[] = ['spiral', 'grid', 'morphing', 'heatmap', 'timeline', 'network', 'temporal'];
                    const currentMode = get().viewMode;
                    const currentIndex = modes.indexOf(currentMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];

                    set((state) => {
                        state.viewMode = nextMode;
                    });
                },

                toggleFullscreen: () => {
                    if (typeof document === 'undefined') return;

                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                        set((state) => {
                            state.isFullscreen = true;
                        });
                    } else {
                        document.exitFullscreen();
                        set((state) => {
                            state.isFullscreen = false;
                        });
                    }
                },

                openModal: (type, data) => {
                    set((state) => {
                        state.activeModal = type;
                        state.modalData = data || null;
                    });
                },

                closeModal: () => {
                    set((state) => {
                        state.activeModal = null;
                        state.modalData = null;
                    });
                },

                toggleParticles: () => {
                    set((state) => {
                        state.particlesEnabled = !state.particlesEnabled;
                    });
                },

                toggleScanlines: () => {
                    set((state) => {
                        state.scanlinesEnabled = !state.scanlinesEnabled;
                    });
                },

                toggleGlow: () => {
                    set((state) => {
                        state.glowEnabled = !state.glowEnabled;
                    });
                },

                toggleBackgroundEffects: () => {
                    set((state) => {
                        state.backgroundEffects = !state.backgroundEffects;
                    });
                },

                toggleAutoScroll: () => {
                    set((state) => {
                        state.autoScrollResults = !state.autoScrollResults;
                    });
                },

                toggleAutoExport: () => {
                    set((state) => {
                        state.autoExport = !state.autoExport;
                    });
                },

                toggleCompactMode: () => {
                    set((state) => {
                        state.compactMode = !state.compactMode;
                    });
                },

                toggleAdvancedMode: () => {
                    set((state) => {
                        state.advancedMode = !state.advancedMode;
                    });
                },

                toggleNotifications: () => {
                    set((state) => {
                        state.notificationsEnabled = !state.notificationsEnabled;
                    });
                },

                toggleSound: () => {
                    set((state) => {
                        state.soundEnabled = !state.soundEnabled;
                    });
                },

                reset: () => {
                    set(initialState);
                    applyThemeToDOM('dark');
                },
            })),
            {
                name: 'chronos-ui-store',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    theme: state.theme,
                    isDark: state.isDark,
                    accentColor: state.accentColor,
                    fontScale: state.fontScale,
                    reducedMotion: state.reducedMotion,
                    sidebarCollapsed: state.sidebarCollapsed,
                    panelTab: state.panelTab,
                    viewMode: state.viewMode,
                    notificationsEnabled: state.notificationsEnabled,
                    soundEnabled: state.soundEnabled,
                    particlesEnabled: state.particlesEnabled,
                    scanlinesEnabled: state.scanlinesEnabled,
                    glowEnabled: state.glowEnabled,
                    backgroundEffects: state.backgroundEffects,
                    autoScrollResults: state.autoScrollResults,
                    autoExport: state.autoExport,
                    compactMode: state.compactMode,
                    advancedMode: state.advancedMode,
                }),
                version: 1,
            }
        )
    )
);

if (typeof window !== 'undefined') {
    const state = useUIStore.getState();
    applyThemeToDOM(state.theme);

    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
            const currentState = useUIStore.getState();
            if (currentState.theme === 'auto') {
                useUIStore.setState({ isDark: e.matches });
                applyThemeToDOM('auto');
            }
        });

    window
        .matchMedia('(prefers-reduced-motion: reduce)')
        .addEventListener('change', (e) => {
            useUIStore.setState({ reducedMotion: e.matches });
        });

    document.addEventListener('fullscreenchange', () => {
        useUIStore.setState({ isFullscreen: !!document.fullscreenElement });
    });
}

export default useUIStore;
