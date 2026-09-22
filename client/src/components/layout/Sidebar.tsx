import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
    FiHome,
    FiSearch,
    FiBarChart2,
    FiSettings,
    FiShield,
    FiClock,
    FiX,
    FiLayers,
    FiStar,
    FiUpload,
    FiActivity,
    FiUser,
    FiLock,
    FiBell,
    FiKey,
    FiGrid,
    FiUsers,
    FiGlobe,
    FiCpu,
    FiFileText,
    FiServer,
    FiToggleRight,
} from 'react-icons/fi';
import { NAVIGATION_ITEMS, type NavigationItem } from '../../constants/routes';
import { formatTimeAgo } from '../../utils/formatters';

const ICON_REGISTRY: Record<string, React.ComponentType<{ className?: string }>> = {
    FiHome,
    FiSearch,
    FiBarChart2,
    FiSettings,
    FiShield,
    FiClock,
    FiStar,
    FiUpload,
    FiActivity,
    FiUser,
    FiLock,
    FiBell,
    FiKey,
    FiGrid,
    FiUsers,
    FiGlobe,
    FiCpu,
    FiFileText,
    FiServer,
    FiToggleRight,
    FiLayers,
};

const resolveIcon = (
    name: string
): React.ComponentType<{ className?: string }> =>
    ICON_REGISTRY[name] ?? FiHome;

interface HistoryEntry {
    taskId: string;
    query: string;
    timestamp: number;
    resultCount: number;
    thumbnail?: string;
}

interface SidebarUser {
    username?: string;
    fullName?: string;
    email?: string;
    role?: 'user' | 'admin' | 'super_admin' | string;
    avatar?: string;
}

interface SidebarProps {
    isOpen?: boolean;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
    onClose?: () => void;

    activeTab?: string;
    onTabChange?: (tab: string) => void;

    onNavigate?: (path: string) => void;

    onSelectHistory?: (taskId: string) => void;
    onHistorySelect?: (taskId: string) => void;

    history?: HistoryEntry[];
    user?: SidebarUser | null;
}

const PANEL_TABS = [
    { id: 'parameters', label: 'Parameters' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'distributions', label: 'Distributions' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'history', label: 'History' },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen = true,
    isMobileOpen = false,
    onMobileClose,
    onClose,
    activeTab,
    onTabChange,
    onNavigate,
    onSelectHistory,
    onHistorySelect,
    history = [],
    user,
}) => {
    const navItems = useMemo(() => {
        const isAdmin = !!user?.role && ['admin', 'super_admin'].includes(user.role);

        return NAVIGATION_ITEMS
            .filter((item) => {
                if (item.requiresAdmin && !isAdmin) return false;
                return true;
            })
            .map((item: NavigationItem) => ({
                path: item.path,
                label: item.label,
                icon: resolveIcon(item.icon),
                badge: item.badge,
            }));
    }, [user?.role]);

    const handleClose = () => {
        onMobileClose?.();
        onClose?.();
    };

    const handleHistoryClick = (taskId: string) => {
        onSelectHistory?.(taskId);
        onHistorySelect?.(taskId);
        handleClose();
    };

    const renderNavItems = (collapse = false, onItemClick?: () => void) =>
        navItems.map((item) => {
            const Icon = item.icon;
            return (
                <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                        onNavigate?.(item.path);
                        onItemClick?.();
                    }}
                    title={collapse ? item.label : undefined}
                    className={({ isActive }) =>
                        [
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5',
                            collapse ? 'justify-center' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')
                    }
                >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapse && <span>{item.label}</span>}
                    {!collapse && item.badge && (
                        <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            {item.badge}
                        </span>
                    )}
                </NavLink>
            );
        });

    const renderPanelTabs = () => {
        if (!isOpen || !activeTab || !onTabChange) return null;
        return (
            <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 mb-2 text-xs font-mono uppercase text-gray-500 tracking-wider">
                    <FiLayers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Panels</span>
                </div>
                {PANEL_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors ${activeTab === tab.id
                            ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    };

    const renderHistory = () => {
        if (!isOpen || !history.length) return null;
        return (
            <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 mb-2 text-xs font-mono uppercase text-gray-500 tracking-wider">
                    <FiClock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Recent</span>
                </div>
                <div className="space-y-0.5">
                    {history.slice(0, 5).map((entry) => (
                        <button
                            key={entry.taskId}
                            type="button"
                            onClick={() => handleHistoryClick(entry.taskId)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors group"
                            title={entry.query}
                        >
                            {entry.thumbnail ? (
                                <img
                                    src={entry.thumbnail}
                                    alt=""
                                    className="w-7 h-7 rounded object-cover flex-shrink-0 border border-white/10"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <FiSearch className="w-3 h-3 text-gray-500" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-300 truncate group-hover:text-white">
                                    {entry.query}
                                </p>
                                <p className="text-[10px] text-gray-500 font-mono truncate">
                                    {entry.resultCount} • {formatTimeAgo(new Date(entry.timestamp))}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const sidebarContent = (
        <aside
            className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col bg-gray-950/90 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 ${isOpen ? 'w-[280px]' : 'w-[80px]'
                }`}
        >
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {renderNavItems(!isOpen)}
                {renderPanelTabs()}
                {renderHistory()}
            </div>

            {isOpen && (
                <div className="p-3 border-t border-white/5 text-[11px] font-mono text-gray-500 text-center">
                    CHRONOS MATRIX // v2.4.0
                </div>
            )}
        </aside>
    );

    return (
        <>
            <div className="hidden md:block">{sidebarContent}</div>

            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <div className="relative z-10 w-[280px] bg-gray-950 border-r border-cyan-500/20 shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <span className="font-mono text-sm text-cyan-400 font-bold">
                                NAVIGATION
                            </span>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {user && (
                            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt=""
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        (user.username?.[0] || user.email?.[0] || 'U').toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">
                                        {user.fullName || user.username || 'User'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-mono truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-3 space-y-1">
                            {renderNavItems(false, handleClose)}
                            {history.length > 0 && (
                                <div className="pt-6 border-t border-white/5 mt-4">
                                    <div className="flex items-center gap-2 px-3 mb-2 text-xs font-mono uppercase text-gray-500 tracking-wider">
                                        <FiClock className="w-3.5 h-3.5 text-purple-400" />
                                        <span>Recent</span>
                                    </div>
                                    {history.slice(0, 5).map((entry) => (
                                        <button
                                            key={entry.taskId}
                                            type="button"
                                            onClick={() => handleHistoryClick(entry.taskId)}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5"
                                        >
                                            <FiSearch className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-300 truncate">
                                                    {entry.query}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-mono">
                                                    {entry.resultCount} •{' '}
                                                    {formatTimeAgo(new Date(entry.timestamp))}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;