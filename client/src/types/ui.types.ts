import type { Timestamp } from './common.types';

export type ModalType =
    | 'result'
    | 'settings'
    | 'feedback'
    | 'confirm'
    | 'info'
    | 'error'
    | 'login'
    | 'register'
    | 'success'
    | null;

export interface ModalState {
    type: ModalType;
    data: any;
    isOpen: boolean;
    onClose?: () => void;
    onConfirm?: () => void;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;
    priority: NotificationPriority;
    action?: {
        label: string;
        onClick: () => void;
    };
    dismissible: boolean;
    createdAt: Timestamp;
    metadata?: Record<string, any>;
}

export interface ToastOptions {
    position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
    duration?: number;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
}

export interface SidebarState {
    isOpen: boolean;
    isCollapsed: boolean;
    width: number;
    activeItem: string | null;
    expandedGroups: string[];
}

export interface PanelState {
    isOpen: boolean;
    width: number;
    activeTab: string;
    position: 'left' | 'right' | 'bottom' | 'top';
}

export interface LayoutState {
    sidebar: SidebarState;
    panel: PanelState;
    isFullscreen: boolean;
    isHeaderVisible: boolean;
    isFooterVisible: boolean;
    contentWidth: 'full' | 'contained' | 'narrow';
}

export type AnimationVariant =
    | 'fade'
    | 'slide'
    | 'scale'
    | 'glitch'
    | 'cyber'
    | 'neon'
    | 'holographic'
    | 'matrix'
    | 'explode'
    | 'morph'
    | 'blur'
    | 'rotate'
    | 'flip'
    | 'bounce'
    | 'stagger';

export interface AnimationConfig {
    variant: AnimationVariant;
    duration: number;
    delay: number;
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
    stagger?: number;
    repeat?: number;
    repeatType?: 'loop' | 'reverse' | 'mirror';
}

export interface LoadingState {
    isLoading: boolean;
    message?: string;
    progress?: number;
    skeleton?: boolean;
}

export interface ErrorState {
    hasError: boolean;
    message?: string;
    code?: string;
    details?: Record<string, any>;
    retry?: () => void;
}

export interface EmptyState {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ComponentVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'ghost'
    | 'outline'
    | 'link';
export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error';

export interface IconProps {
    size?: number | string;
    color?: string;
    className?: string;
    onClick?: () => void;
}

export interface MenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
    children?: MenuItem[];
    permission?: string;
}

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: string | number;
    content?: React.ReactNode;
}

export interface BreadcrumbItem {
    id: string;
    label: string;
    path?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

export interface ThemeConfig {
    name: string;
    mode: 'light' | 'dark';
    colors: ThemeColors;
    fonts: {
        sans: string;
        mono: string;
        display: string;
    };
    radius: {
        sm: string;
        md: string;
        lg: string;
        full: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
        glow: string;
    };
}