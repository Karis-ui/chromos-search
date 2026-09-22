import React from 'react';
import { FiMenu, FiLogOut, FiSearch, FiUser, FiActivity } from 'react-icons/fi';
import { GlitchText } from '../common/GlitchText';

interface HeaderProps {
    user?: any;
    isScrolled?: boolean;
    onMenuToggle?: () => void;
    onLogout?: () => void;
    activeView?: string;
    onViewChange?: (view: any) => void;
    searchQuery?: string;
    onSearchChange?: (q: string) => void;
    onSearchSubmit?: (e: React.FormEvent) => void;
    isSearching?: boolean;
    viewModes?: any[];
    systemHealth?: any;
    isConnected?: boolean;
    onNavigate?: (path: any) => void | Promise<any>;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    isScrolled = false,
    onMenuToggle,
    onLogout,
    activeView,
    onViewChange,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    isSearching = false,
    viewModes = [],
}) => {
    return (
        <header
            className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
                isScrolled
                    ? 'bg-black/80 backdrop-blur-xl border-cyan-500/20 shadow-lg shadow-black/40'
                    : 'bg-black/40 backdrop-blur-md border-white/5'
            }`}
        >
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    {onMenuToggle && (
                        <button
                            type="button"
                            onClick={onMenuToggle}
                            className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
                            aria-label="Toggle navigation menu"
                        >
                            <FiMenu className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                        <span className="font-mono font-bold tracking-wider text-cyan-400 text-lg">
                            <GlitchText text="CHRONOS" />
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            OSINT
                        </span>
                    </div>
                </div>

                {onSearchChange && (
                    <form
                        onSubmit={onSearchSubmit}
                        className="hidden md:flex flex-1 max-w-md mx-6 relative items-center"
                    >
                        <FiSearch className="absolute left-3 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Quantum deep search..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                        />
                        {isSearching && (
                            <FiActivity className="absolute right-3 w-4 h-4 text-cyan-400 animate-pulse" />
                        )}
                    </form>
                )}

                {viewModes.length > 0 && onViewChange && (
                    <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        {viewModes.map((mode) => (
                            <button
                                key={mode.id}
                                type="button"
                                onClick={() => onViewChange(mode.id)}
                                className={`px-2.5 py-1 text-xs rounded-lg transition-colors font-mono ${
                                    activeView === mode.id
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {user && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 text-xs">
                                {user.username?.[0]?.toUpperCase() || <FiUser className="w-3 h-3" />}
                            </div>
                            <span className="text-xs text-gray-300 font-mono hidden sm:inline">
                                {user.username || user.email}
                            </span>
                        </div>
                    )}

                    {onLogout && (
                        <button
                            type="button"
                            onClick={onLogout}
                            title="Sign out"
                            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <FiLogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
