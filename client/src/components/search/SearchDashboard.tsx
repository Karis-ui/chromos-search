import React, {
    useState,
    useCallback,
    useRef,
    useEffect,
    useMemo,
    Suspense,
    lazy,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
    FiUpload,
    FiFile,
    FiImage,
    FiVideo,
    FiX,
    FiSearch,
    FiSliders,
    FiTarget,
    FiCalendar,
    FiClock,
    FiGlobe,
    FiMapPin,
    FiBarChart2,
    FiTrendingUp,
    FiActivity,
    FiAward,
    FiZap,
    FiCpu,
    FiEye,
    FiMaximize2,
    FiMinimize2,
    FiGrid,
    FiLayers,
    FiDownload,
    FiShare2,
    FiMoreVertical,
    FiChevronDown,
    FiChevronUp,
    FiPlay,
    FiPause,
    FiRotateCcw,
    FiZoomIn,
    FiZoomOut,
    FiUser,
    FiLogOut,
    FiSettings,
    FiBell,
    FiMenu,

    FiWifi,
    FiWifiOff,
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
    FiHeart,
    FiStar,
    FiRadio,
    FiMessageCircle,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { NeonBorder } from '../common/NeonBorder';
import { CyberGrid } from '../common/CyberGrid';
import { Scanline } from '../common/Scanline';
import { AnimatedContainer } from '../common/AnimatedContainer';
import { TypewriterText } from '../common/TypewriterText';
import { HolographicCard } from '../common/HolographicCard';
import { NotificationContainer, useNotification } from '../common/Notification';

import { UploadZone } from './UploadZone';
import { TimeScrubber } from './TimeScrubber';
import { PlatformFilter } from './PlatformFilter';
import { SearchStats } from './SearchStats';
import { ConfidenceGauge } from './ConfidenceGauge';
import { ResultCard } from './ResultCard';
import { TimelineAxis } from './TimelineAxis';
import { ConfidenceDistribution } from './ConfidenceDistribution';
import { PlatformDistribution } from '../analytics/PlatfromDistribution';
import { SearchTimeline } from './SearchTimeline';
import { RealTimeScanner } from './RealTimeScanner';

import { Header } from '../layout/Header';
import { Sidebar } from '../layout/Sidebar';
import { StatusBar } from '../layout/StatusBar';

const ChronosSpiral = lazy(() =>
    import('./ChronosSpiral').then((m) => ({ default: m.ChronosSpiral }))
);
const MorphingGrid = lazy(() =>
    import('./MorphingGrid').then((m) => ({ default: m.MorphingGrid }))
);
const HeatMap = lazy(() =>
    import('./HeatMap').then((m) => ({ default: m.HeatMap }))
);
const TemporalHeatmap = lazy(() =>
    import('./TemporalHeatmap').then((m) => ({ default: m.TemporalHeatmap }))
);
const NeuralNetworkVisualizer = lazy(() =>
    import('./NeuralNetworkVisualizer').then((m) => ({ default: m.NeuralNetworkVisualizer }))
);
const BiometricVisualizer = lazy(() =>
    import('./BiometricVisualizer').then((m) => ({ default: m.BiometricVisualizer }))
);
const ResultDetailModal = lazy(() =>
    import('./ResultDetailModal').then((m) => ({ default: m.ResultDetailModal }))
);

import { useSearch } from '../../hooks/useSearch';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../providers';

import { useSearchStore } from '../../store/searchStore';
import { useUIStore } from '../../store/uiStore';

import { healthApi } from '../../api/endpoints/health';

import {
    formatTimeAgo,
    formatConfidence,
    formatFileSize,
    formatNumber,
    getPlatformColor,
    getConfidenceColor,
} from '../../utils/formatters';

type ViewMode = 'spiral' | 'grid' | 'morphing' | 'heatmap' | 'timeline' | 'network' | 'temporal';
type PanelTab = 'parameters' | 'statistics' | 'distributions' | 'analytics' | 'history';
type ResultsSort = 'similarity' | 'date' | 'platform' | 'confidence';

interface SearchResult {
    id?: string;
    post_id?: string;
    platform: string;
    url: string;
    thumbnail: string;
    posted_at: string;
    similarity: number;
    confidence: number;
    confidence_level?: string;
    caption?: string;
    author_username?: string;
    author_full_name?: string;
    match_type?: string;
}

interface AppNotification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    time: number;
}

interface DashboardState {
    uploadedFile: File | null;
    preview: string | null;
    timeRange: number;
    selectedPlatforms: string[];
    minConfidence: number;
    viewMode: ViewMode;
    panelTab: PanelTab;
    sortBy: ResultsSort;
    isFullscreen: boolean;
    showAdvanced: boolean;
    selectedResult: SearchResult | null;
    isModalOpen: boolean;
    isSidebarOpen: boolean;
    // ── New UI state ──
    favorites: Set<string>;
    showFavoritesOnly: boolean;
    showNotifications: boolean;
    notifications: AppNotification[];
    showSettings: boolean;
    showUserMenu: boolean;
    zoomLevel: number;
    isPreviewPlaying: boolean;
}

const VisualizerSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading visualizer' }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
        />
        <span className="text-xs text-gray-500 font-mono">{label}...</span>
    </div>
);

const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    2: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    3: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    4: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    5: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8',
};

export const SearchDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const { user, logout, isAuthenticated } = useAuth();

    const notification = useNotification();

    const {
        initiateSearch,
        isSearching: isSearchingMutation,
        results,
        totalResults,
        progress,
        status,
        taskId,
        isConnected,
        filters,
        exportResults,
        clearSearch,
        submitFeedback,
        isExporting,
        refreshStatus,
        refreshResults,
    } = useSearch();

    const {
        searchTime,
        setSearchTime,
        clearResults,
        totalResults: storeTotalResults,
    } = useSearchStore();
    const { isDark, setTheme } = useUIStore();

    const [state, setState] = useState<DashboardState>({
        uploadedFile: null,
        preview: null,
        timeRange: 180,
        selectedPlatforms: [],
        minConfidence: 0.68,
        viewMode: 'spiral',
        panelTab: 'parameters',
        sortBy: 'similarity',
        isFullscreen: false,
        showAdvanced: false,
        selectedResult: null,
        isModalOpen: false,
        isSidebarOpen: true,
        favorites: new Set<string>(),
        showFavoritesOnly: false,
        showNotifications: false,
        notifications: [],
        showSettings: false,
        showUserMenu: false,
        zoomLevel: 3,
        isPreviewPlaying: false,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const resultsSectionRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const parallaxX = useTransform(springX, [-1, 1], [-5, 5]);
    const parallaxY = useTransform(springY, [-1, 1], [-5, 5]);

    const [systemHealth, setSystemHealth] = useState<{ status: string; version: string } | null>(null);

    const { isConnected: wsConnected } = useWebSocket();

    const hasResults = results.length > 0;
    const canSearch = !!state.uploadedFile && !isSearchingMutation;
    const resultsCount = totalResults || storeTotalResults;

    const displayedResults = useMemo(() => {
        return state.showFavoritesOnly
            ? results.filter((r) => state.favorites.has(r.id ?? r.url))
            : results;
    }, [results, state.showFavoritesOnly, state.favorites]);

    const pushNotification = useCallback(
        (type: AppNotification['type'], message: string) => {
            setState((prev) => ({
                ...prev,
                notifications: [
                    { id: `${Date.now()}-${Math.random()}`, type, message, time: Date.now() },
                    ...prev.notifications,
                ].slice(0, 20),
            }));
        },
        []
    );

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const health = await healthApi.check();
                setSystemHealth({
                    status: health.status,
                    version: health.version,
                });
            } catch (error) {
                console.error('Health check failed:', error);
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set('view', state.viewMode);
        if (taskId) params.set('task', taskId);
        setSearchParams(params, { replace: true });
    }, [state.viewMode, taskId, setSearchParams]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setState((prev) => ({ ...prev, isSidebarOpen: false }));
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
            'video/*': ['.mp4', '.mov', '.webm'],
        },
        maxFiles: 1,
        maxSize: 100 * 1024 * 1024,
        noClick: true,
        noKeyboard: true,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles[0]) handleUpload(acceptedFiles[0]);
        },
        onDropRejected: (rejections) => {
            const reason = rejections[0]?.errors[0]?.message || 'File rejected';
            notification.error(reason);
            pushNotification('error', reason);
        },
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canSearch) {
                e.preventDefault();
                handleSearch();
            }

            if (e.key === 'Escape') {
                if (state.isModalOpen) {
                    setState((prev) => ({ ...prev, isModalOpen: false, selectedResult: null }));
                } else if (hasResults) {
                    handleClear();
                }
            }

            if (e.key === 'v' && !e.ctrlKey && !e.metaKey && hasResults) {
                const modes: ViewMode[] = ['spiral', 'grid', 'morphing', 'heatmap', 'timeline', 'network', 'temporal'];
                const currentIndex = modes.indexOf(state.viewMode);
                const nextIndex = (currentIndex + 1) % modes.length;
                setState((prev) => ({ ...prev, viewMode: modes[nextIndex] }));
                notification.info(`View: ${modes[nextIndex]}`);
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                toggleFullscreen();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'e' && hasResults) {
                e.preventDefault();
                handleExport('json');
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                fileInputRef.current?.click();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canSearch, hasResults, state.viewMode, state.isModalOpen]);

    const handleUpload = useCallback(
        (file: File) => {
            setState((prev) => ({
                ...prev,
                uploadedFile: file,
                preview: URL.createObjectURL(file),
                isPreviewPlaying: false,
            }));
            clearResults();
            notification.success(`File "${file.name}" ready for search`);
            pushNotification('success', `File "${file.name}" ready for search`);
        },
        [clearResults, notification, pushNotification]
    );

    const handleClear = useCallback(() => {
        if (state.preview) URL.revokeObjectURL(state.preview);
        setState((prev) => ({
            ...prev,
            uploadedFile: null,
            preview: null,
            selectedResult: null,
            isModalOpen: false,
            isPreviewPlaying: false,
        }));
        clearSearch();
        notification.info('Search cleared');
    }, [state.preview, clearSearch, notification]);

    const handleSearch = useCallback(async () => {
        if (!state.uploadedFile) {
            notification.error('Please upload a file first');
            return;
        }

        try {
            const startTime = performance.now();

            await initiateSearch({
                file: state.uploadedFile,
                timeRange: state.timeRange,
                platforms: state.selectedPlatforms.length > 0 ? state.selectedPlatforms : undefined,
                minConfidence: state.minConfidence,
            });

            const duration = performance.now() - startTime;
            setSearchTime(duration);

            notification.success('Search initiated! Tracking results...');
            pushNotification('success', 'Search initiated! Tracking results...');

            setTimeout(() => {
                resultsSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 500);
        } catch (error: any) {
            notification.error(error.message || 'Search failed to start');
            pushNotification('error', error.message || 'Search failed to start');
        }
    }, [
        state.uploadedFile,
        state.timeRange,
        state.selectedPlatforms,
        state.minConfidence,
        initiateSearch,
        setSearchTime,
        notification,
        pushNotification,
    ]);

    const handleExport = useCallback(
        async (format: 'json' | 'csv') => {
            if (!taskId) {
                notification.error('No search to export');
                return;
            }
            try {
                await exportResults(format);
                notification.success(`Exported as ${format.toUpperCase()}`);
                pushNotification('success', `Exported as ${format.toUpperCase()}`);
            } catch (error) {
                notification.error('Export failed');
                pushNotification('error', 'Export failed');
            }
        },
        [taskId, exportResults, notification, pushNotification]
    );

    const handleManualRefresh = useCallback(async () => {
        if (!taskId) {
            notification.info('No active search to refresh');
            return;
        }
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['search', taskId] }),
                queryClient.invalidateQueries({ queryKey: ['search-results', taskId] }),
            ]);
            await refreshStatus();
            await refreshResults();
            notification.success('Refreshed');
        } catch {
            notification.error('Refresh failed');
        }
    }, [taskId, queryClient, refreshStatus, refreshResults, notification]);

    const handleResultClick = useCallback((result: SearchResult) => {
        setState((prev) => ({
            ...prev,
            selectedResult: result,
            isModalOpen: true,
        }));
    }, []);

    const toggleFavorite = useCallback(
        (resultId: string) => {
            setState((prev) => {
                const next = new Set(prev.favorites);
                if (next.has(resultId)) {
                    next.delete(resultId);
                    notification.info('Removed from favorites');
                } else {
                    next.add(resultId);
                    notification.success('Added to favorites');
                }
                return { ...prev, favorites: next };
            });
        },
        [notification]
    );

    const handleShare = useCallback(
        async (result: SearchResult) => {
            try {
                await navigator.clipboard.writeText(result.url);
                notification.success('Link copied to clipboard');
            } catch {
                notification.error('Failed to copy');
            }
        },
        [notification]
    );

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setState((prev) => ({ ...prev, isFullscreen: true }));
        } else {
            document.exitFullscreen();
            setState((prev) => ({ ...prev, isFullscreen: false }));
        }
    }, []);

    const handleViewModeChange = useCallback(
        (mode: ViewMode) => {
            setState((prev) => ({ ...prev, viewMode: mode }));
            notification.info(`View: ${mode}`);
        },
        [notification]
    );

    const handlePanelTabChange = useCallback((tab: PanelTab) => {
        setState((prev) => ({ ...prev, panelTab: tab }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setState((prev) => ({
            ...prev,
            timeRange: 180,
            selectedPlatforms: [],
            minConfidence: 0.68,
        }));
        notification.info('Filters reset');
    }, [notification]);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            notification.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            notification.error('Logout failed');
        }
    }, [logout, navigate, notification]);

    const handleSubmitFeedback = useCallback(
        async (resultId: string, feedback: any) => {
            try {
                await submitFeedback({ resultId, feedback });
                notification.success('Feedback recorded');
            } catch (error) {
                notification.error('Failed to submit feedback');
            }
        },
        [submitFeedback, notification]
    );

    const ResultWithActions = useCallback(
        ({ result, index }: { result: SearchResult; index: number }) => {
            const isFav = state.favorites.has(result.id ?? result.url);
            const platformColor = getPlatformColor(result.platform);
            const confColor = getConfidenceColor(result.similarity);

            return (
                <div className="relative group">
                    <ResultCard result={result} index={index} onClick={() => handleResultClick(result)} />

                    <div
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold backdrop-blur pointer-events-none"
                        style={{ backgroundColor: `${platformColor}33`, color: platformColor }}
                    >
                        {result.platform.toUpperCase()}
                    </div>
                    <div
                        className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold backdrop-blur pointer-events-none"
                        style={{ backgroundColor: `${confColor}33`, color: confColor }}
                    >
                        {formatConfidence(result.similarity)}
                    </div>

                    {/* Hover actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(result.id ?? result.url);
                            }}
                            className="p-1.5 bg-black/60 backdrop-blur rounded-lg hover:bg-black/80"
                            title="Favorite"
                        >
                            <FiHeart
                                className={`w-3 h-3 ${isFav ? 'text-red-400 fill-red-400' : 'text-white'
                                    }`}
                            />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShare(result);
                            }}
                            className="p-1.5 bg-black/60 backdrop-blur rounded-lg hover:bg-black/80"
                            title="Share"
                        >
                            <FiShare2 className="w-3 h-3 text-white" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleResultClick(result);
                            }}
                            className="p-1.5 bg-black/60 backdrop-blur rounded-lg hover:bg-black/80"
                            title="More"
                        >
                            <FiMoreVertical className="w-3 h-3 text-white" />
                        </button>
                    </div>
                </div>
            );
        },
        [state.favorites, toggleFavorite, handleShare, handleResultClick]
    );

    const renderViewContent = useMemo(() => {
        if (!hasResults) return null;

        switch (state.viewMode) {
            case 'spiral':
                return (
                    <div className="h-[600px] rounded-2xl overflow-hidden border border-white/5 relative">
                        <Suspense fallback={<VisualizerSkeleton label="Loading spiral" />}>
                            <ChronosSpiral results={displayedResults as any[]} onResultClick={handleResultClick as any} />
                        </Suspense>
                    </div>
                );

            case 'grid':
                return (
                    <Suspense fallback={<VisualizerSkeleton label="Loading grid" />}>
                        <MorphingGrid results={displayedResults} onResultClick={handleResultClick} />
                    </Suspense>
                );

            case 'morphing':
                return (
                    <div className={`grid ${GRID_COLS[state.zoomLevel] || GRID_COLS[3]} gap-4`}>
                        {displayedResults.slice(0, 50).map((result, index) => (
                            <ResultWithActions key={result.id || index} result={result} index={index} />
                        ))}
                    </div>
                );

            case 'heatmap':
                return (
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <Suspense fallback={<VisualizerSkeleton label="Loading heatmap" />}>
                                <HeatMap
                                    results={displayedResults}
                                    onCellClick={(date, platform) => {
                                        notification.info(`${date} • ${platform}`);
                                    }}
                                />
                            </Suspense>
                        </GlassCard>
                    </div>
                );

            case 'timeline':
                return (
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <TimelineAxis results={displayedResults} onPointClick={handleResultClick} />
                        </GlassCard>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard className="p-6">
                                <SearchTimeline results={displayedResults} onPointClick={handleResultClick} />
                            </GlassCard>
                            <GlassCard className="p-6">
                                <ConfidenceGauge
                                    value={displayedResults[0]?.similarity || 0}
                                    label="Top Match"
                                    size="lg"
                                    status={
                                        (displayedResults[0]?.similarity || 0) > 0.85
                                            ? 'high'
                                            : (displayedResults[0]?.similarity || 0) > 0.7
                                                ? 'medium'
                                                : 'low'
                                    }
                                />
                            </GlassCard>
                        </div>
                    </div>
                );

            case 'temporal':
                return (
                    <div className="space-y-6">
                        <GlassCard className="p-6">
                            <Suspense fallback={<VisualizerSkeleton label="Loading temporal heatmap" />}>
                                <TemporalHeatmap results={displayedResults} />
                            </Suspense>
                        </GlassCard>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard className="p-6">
                                <ConfidenceDistribution results={displayedResults} />
                            </GlassCard>
                            <GlassCard className="p-6">
                                <PlatformDistribution results={displayedResults} />
                            </GlassCard>
                        </div>
                    </div>
                );

            case 'network':
                return (
                    <div className="space-y-6">
                        <div className="h-[600px] rounded-2xl overflow-hidden border border-white/5">
                            <Suspense fallback={<VisualizerSkeleton label="Loading neural network" />}>
                                <NeuralNetworkVisualizer
                                    isActive={isSearchingMutation}
                                    mode="hybrid"
                                    confidence={displayedResults[0]?.similarity || 0.85}
                                    features={['Face', 'Voice', 'Match', 'Score']}
                                />
                            </Suspense>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <GlassCard className="p-4">
                                <Suspense fallback={<VisualizerSkeleton label="Loading biometric" />}>
                                    <BiometricVisualizer
                                        type="face"
                                        confidence={displayedResults[0]?.similarity || 0.85}
                                        isActive={isSearchingMutation}
                                        size="sm"
                                    />
                                </Suspense>
                            </GlassCard>
                            <GlassCard className="p-4">
                                <Suspense fallback={<VisualizerSkeleton label="Loading biometric" />}>
                                    <BiometricVisualizer
                                        type="voice"
                                        confidence={displayedResults[1]?.similarity || 0.75}
                                        isActive={isSearchingMutation}
                                        size="sm"
                                    />
                                </Suspense>
                            </GlassCard>
                            <GlassCard className="p-4">
                                <Suspense fallback={<VisualizerSkeleton label="Loading biometric" />}>
                                    <BiometricVisualizer
                                        type="hybrid"
                                        confidence={displayedResults[0]?.similarity || 0.8}
                                        isActive={isSearchingMutation}
                                        size="sm"
                                    />
                                </Suspense>
                            </GlassCard>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }, [
        state.viewMode,
        state.zoomLevel,
        displayedResults,
        hasResults,
        isSearchingMutation,
        notification,
        handleResultClick,
        ResultWithActions,
    ]);
    const renderPanelContent = useMemo(() => {
        switch (state.panelTab) {
            case 'parameters':
                return (
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-400 flex items-center gap-2">
                                    <FiCalendar className="text-cyan-400" />
                                    Time Window
                                </label>
                                <span className="text-sm font-mono text-cyan-400">
                                    {state.timeRange} days
                                </span>
                            </div>
                            <TimeScrubber
                                min={1}
                                max={180}
                                value={state.timeRange}
                                onChange={(value) => setState((prev) => ({ ...prev, timeRange: value }))}
                                marks={[30, 60, 90, 120, 180]}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 flex items-center gap-2 mb-2">
                                <FiGlobe className="text-purple-400" />
                                Platforms ({state.selectedPlatforms.length || 'All'})
                            </label>
                            <PlatformFilter
                                selected={state.selectedPlatforms}
                                onChange={(platforms) =>
                                    setState((prev) => ({ ...prev, selectedPlatforms: platforms }))
                                }
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-400 flex items-center gap-2">
                                    <FiTarget className="text-green-400" />
                                    Min Confidence
                                </label>
                                <span className="text-sm font-mono text-green-400">
                                    {(state.minConfidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="0.95"
                                step="0.01"
                                value={state.minConfidence}
                                onChange={(e) =>
                                    setState((prev) => ({ ...prev, minConfidence: parseFloat(e.target.value) }))
                                }
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r
                  [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500
                  [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-500/25"
                            />
                        </div>

                        {/* Advanced */}
                        <button
                            onClick={() =>
                                setState((prev) => ({ ...prev, showAdvanced: !prev.showAdvanced }))
                            }
                            className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-gray-400 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <FiSliders className="text-cyan-400" />
                                Advanced Options
                            </span>
                            {state.showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
                        </button>

                        <AnimatePresence>
                            {state.showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    {['Face Detection', 'Voice Recognition', 'Emotion Analysis', 'Age Estimation'].map(
                                        (option, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">{option}</span>
                                                <button className="w-8 h-4 bg-cyan-400/20 rounded-full relative">
                                                    <motion.div
                                                        className="absolute top-0.5 w-3 h-3 bg-cyan-400 rounded-full"
                                                        animate={{ left: idx < 2 ? 'calc(100% - 14px)' : '2px' }}
                                                    />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-2 mt-4">
                            <GradientButton
                                onClick={handleSearch}
                                disabled={!canSearch}
                                loading={isSearchingMutation}
                                loadingText="Initializing..."
                                variant="rainbow"
                                fullWidth
                                pulse={!isSearchingMutation && canSearch}
                            >
                                {canSearch ? (
                                    <>
                                        <FiSearch className="w-4 h-4" />
                                        Start Search
                                    </>
                                ) : (
                                    <>
                                        <FiUpload className="w-4 h-4" />
                                        Upload File First
                                    </>
                                )}
                            </GradientButton>

                            <button
                                onClick={handleResetFilters}
                                className="px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                                title="Reset filters"
                            >
                                <FiRotateCcw className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {hasResults && (
                            <GradientButton onClick={handleClear} variant="ghost" fullWidth size="sm">
                                <FiX className="w-3.5 h-3.5" />
                                Clear Results
                            </GradientButton>
                        )}

                        <div className="flex justify-center gap-3 text-[9px] text-gray-600 font-mono pt-2">
                            <span>⌘+Enter search</span>
                            <span>•</span>
                            <span>Esc clear</span>
                            <span>•</span>
                            <span>V view</span>
                        </div>
                    </div>
                );

            case 'statistics':
                return (
                    <div className="space-y-4">
                        {hasResults ? (
                            <>
                                <SearchStats results={displayedResults} />

                                <div className="flex justify-center">
                                    <ConfidenceGauge
                                        value={
                                            displayedResults.reduce((sum, r) => sum + r.similarity, 0) /
                                            displayedResults.length
                                        }
                                        label="Average"
                                        size="md"
                                        status={
                                            displayedResults.reduce((sum, r) => sum + r.similarity, 0) /
                                                displayedResults.length >
                                                0.85
                                                ? 'high'
                                                : displayedResults.reduce((sum, r) => sum + r.similarity, 0) /
                                                    displayedResults.length >
                                                    0.7
                                                    ? 'medium'
                                                    : 'low'
                                        }
                                    />
                                </div>

                                {isSearchingMutation && (
                                    <div className="h-[200px] rounded-xl overflow-hidden border border-white/5">
                                        <RealTimeScanner
                                            isActive={isSearchingMutation}
                                            progress={progress}
                                            status={status}
                                            message="Scanning platforms"
                                            resultsCount={resultsCount}
                                        />
                                    </div>
                                )}

                                {state.uploadedFile && (
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] text-gray-500 font-mono">FILE SIZE</span>
                                            <FiFile className="w-3 h-3 text-cyan-400" />
                                        </div>
                                        <p className="text-sm font-mono text-white">
                                            {formatFileSize(state.uploadedFile.size)}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FiBarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No stats yet</p>
                                <p className="text-xs text-gray-600 mt-1">Run a search to see analytics</p>
                            </div>
                        )}
                    </div>
                );

            case 'distributions':
                return (
                    <div className="space-y-4">
                        {hasResults ? (
                            <>
                                <GlassCard padding="sm" variant="dark">
                                    <ConfidenceDistribution results={displayedResults} />
                                </GlassCard>

                                <GlassCard padding="sm" variant="dark">
                                    <PlatformDistribution
                                        results={displayedResults}
                                        onPlatformClick={(platform) =>
                                            notification.info(`Filter by: ${platform}`)
                                        }
                                    />
                                </GlassCard>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FiActivity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No distributions yet</p>
                            </div>
                        )}
                    </div>
                );

            case 'analytics':
                return (
                    <div className="space-y-4">
                        {hasResults ? (
                            <>
                                <GlassCard padding="sm" variant="dark">
                                    <SearchTimeline results={displayedResults} onPointClick={handleResultClick} />
                                </GlassCard>

                                <GlassCard padding="sm" variant="dark">
                                    <Suspense fallback={<VisualizerSkeleton label="Loading temporal heatmap" />}>
                                        <TemporalHeatmap results={displayedResults} />
                                    </Suspense>
                                </GlassCard>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] text-gray-500 font-mono">AVG CONF</span>
                                            <FiTrendingUp className="w-3 h-3 text-cyan-400" />
                                        </div>
                                        <p className="text-lg font-bold font-mono text-white">
                                            {formatConfidence(
                                                displayedResults.reduce((sum, r) => sum + r.similarity, 0) /
                                                displayedResults.length
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] text-gray-500 font-mono">BEST</span>
                                            <FiAward className="w-3 h-3 text-yellow-400" />
                                        </div>
                                        <p className="text-lg font-bold font-mono text-white">
                                            {formatConfidence(
                                                Math.max(...displayedResults.map((r) => r.similarity))
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] text-gray-500 font-mono">TOTAL</span>
                                        <FiActivity className="w-3 h-3 text-purple-400" />
                                    </div>
                                    <p className="text-lg font-bold font-mono text-white">
                                        {formatNumber(resultsCount)}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FiTrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No analytics yet</p>
                            </div>
                        )}
                    </div>
                );

            case 'history':
                return (
                    <div className="space-y-3">
                        <div className="text-center py-8">
                            <FiClock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Search History</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Your recent searches will appear here
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }, [
        state.panelTab,
        state.timeRange,
        state.selectedPlatforms,
        state.minConfidence,
        state.showAdvanced,
        state.uploadedFile,
        displayedResults,
        hasResults,
        isSearchingMutation,
        progress,
        status,
        resultsCount,
        canSearch,
        handleSearch,
        handleClear,
        handleResultClick,
        handleResetFilters,
        notification,
    ]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-x-hidden"
        >
            <AnimatePresence>
                {isDragActive && (
                    <div {...getRootProps()} className="fixed inset-0 z-[100]">
                        <input {...getInputProps()} />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center"
                        >
                            <div className="p-12 rounded-3xl border-2 border-dashed border-cyan-400 bg-black/60 backdrop-blur-xl">
                                <FiUpload className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-bounce" />
                                <p className="text-xl font-bold text-white">Drop file to search</p>
                                <p className="text-sm text-gray-400 mt-1">Image or video, up to 100MB</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══ CYBERPUNK BACKGROUND LAYERS ═══ */}
            <CyberGrid
                cellSize={40}
                lineColor="#06b6d4"
                glowColor="#a855f7"
                opacity={0.03}
                animated
                speed={0.3}
            />
            <Scanline speed={0.5} color="#06b6d4" intensity={0.3} animated />

            {/* ═══ PARALLAX ORBS ═══ */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)',
                    x: parallaxX,
                    y: parallaxY,
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
                    x: useTransform(springX, [-1, 1], [5, -5]),
                    y: useTransform(springY, [-1, 1], [5, -5]),
                }}
            />

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HEADER */}
            {/* ═══════════════════════════════════════════════════════ */}
            <Header
                user={user}
                systemHealth={systemHealth}
                isConnected={isConnected}
                onLogout={handleLogout}
                onMenuToggle={() => setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))}
                onNavigate={(path) => navigate(path)}
            />

            {/* ═══════════════════════════════════════════════════════ */}
            {/* FLOATING: NOTIFICATIONS BELL + USER MENU */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="fixed top-20 right-4 z-40 flex items-center gap-2">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() =>
                            setState((prev) => ({ ...prev, showNotifications: !prev.showNotifications }))
                        }
                        className="relative p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <FiBell className="w-5 h-5 text-gray-300" />
                        {state.notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                {state.notifications.length}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {state.showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                            >
                                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-xs font-mono text-gray-400">NOTIFICATIONS</span>
                                    <button
                                        onClick={() =>
                                            setState((prev) => ({ ...prev, notifications: [] }))
                                        }
                                        className="text-[10px] text-gray-500 hover:text-white"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {state.notifications.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <FiBell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">No notifications</p>
                                        </div>
                                    ) : (
                                        state.notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className="p-3 border-b border-white/5 hover:bg-white/5 flex gap-2"
                                            >
                                                {n.type === 'success' && (
                                                    <FiCheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                )}
                                                {n.type === 'error' && (
                                                    <FiAlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                                )}
                                                {n.type === 'info' && (
                                                    <FiInfo className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                                )}
                                                {n.type === 'warning' && (
                                                    <FiAlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-300 break-words">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                                        {formatTimeAgo(new Date(n.time))}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative hidden lg:block">
                    <button
                        onClick={() => setState((prev) => ({ ...prev, showUserMenu: !prev.showUserMenu }))}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <FiMenu className="w-4 h-4 text-gray-400" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-black">
                            {user?.username?.[0]?.toUpperCase() || <FiUser className="w-3 h-3" />}
                        </div>
                    </button>

                    <AnimatePresence>
                        {state.showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                            >
                                <div className="p-4 border-b border-white/5">
                                    <p className="text-sm font-medium text-white">
                                        {user?.full_name || user?.username || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {user?.email || 'user@chronos.ai'}
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setState((prev) => ({
                                            ...prev,
                                            showUserMenu: false,
                                            showSettings: true,
                                        }))
                                    }
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                >
                                    <FiSettings className="w-4 h-4 text-gray-500" />
                                    Settings
                                </button>
                                <button
                                    onClick={() => handleSubmitFeedback}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                >
                                    <FiMessageCircle className="w-4 h-4" />
                                    Feedback
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                >
                                    <FiLogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {state.isSidebarOpen && (
                    <Sidebar
                        isOpen={state.isSidebarOpen}
                        onClose={() => setState((prev) => ({ ...prev, isSidebarOpen: false }))}
                        onNavigate={(path) => {
                            navigate(path);
                            setState((prev) => ({ ...prev, isSidebarOpen: false }));
                        }}
                        user={user}
                        history={[]}
                        onSelectHistory={() => {
                            setState((prev) => ({ ...prev, isSidebarOpen: false }));
                        }}
                    />
                )}
            </AnimatePresence>

            <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <AnimatedContainer animation="slide" delay={0.1}>
                            <UploadZone
                                onUpload={handleUpload}
                                onClear={handleClear}
                                isUploading={isSearchingMutation}
                                progress={progress}
                                error={null}
                            />
                        </AnimatedContainer>

                        {state.uploadedFile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                        {state.uploadedFile.type.startsWith('image/') && (
                                            <FiImage className="text-cyan-400" />
                                        )}
                                        {state.uploadedFile.type.startsWith('video/') && (
                                            <FiVideo className="text-purple-400" />
                                        )}
                                        {!state.uploadedFile.type.startsWith('image/') &&
                                            !state.uploadedFile.type.startsWith('video/') && (
                                                <FiFile className="text-gray-400" />
                                            )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {state.uploadedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            {formatFileSize(state.uploadedFile.size)}
                                            {' • '}
                                            {state.uploadedFile.type || 'unknown'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                                        <FiMapPin className="w-3 h-3 text-pink-400" />
                                        <span>EXIF</span>
                                    </div>
                                </div>

                                {state.uploadedFile.type.startsWith('video/') && state.preview && (
                                    <GlassCard className="p-4">
                                        <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                                            <video
                                                ref={videoRef}
                                                src={state.preview}
                                                className="w-full h-full object-contain"
                                                loop
                                                muted
                                                playsInline
                                            />
                                            <button
                                                onClick={() => {
                                                    if (!videoRef.current) return;
                                                    if (state.isPreviewPlaying) {
                                                        videoRef.current.pause();
                                                    } else {
                                                        videoRef.current.play();
                                                    }
                                                    setState((prev) => ({
                                                        ...prev,
                                                        isPreviewPlaying: !prev.isPreviewPlaying,
                                                    }));
                                                }}
                                                className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-black/60 backdrop-blur rounded-full hover:bg-black/80 transition-colors"
                                            >
                                                {state.isPreviewPlaying ? (
                                                    <FiPause className="w-5 h-5 text-white" />
                                                ) : (
                                                    <FiPlay className="w-5 h-5 text-white" />
                                                )}
                                            </button>
                                        </div>
                                    </GlassCard>
                                )}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {isSearchingMutation && progress > 0 && progress < 100 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <GlassCard className="p-5" glow="cyan" glowIntensity="low">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: 'linear',
                                                        }}
                                                    >
                                                        <FiSearch className="text-cyan-400 text-sm" />
                                                    </motion.div>
                                                </div>
                                                <div>
                                                    <TypewriterText
                                                        text={status || 'Processing...'}
                                                        speed={30}
                                                        className="text-sm font-medium text-gray-300"
                                                        cursor={false}
                                                        loop={false}
                                                    />
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        {resultsCount} results found
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-mono text-cyan-400 font-bold">
                                                    {Math.round(progress)}%
                                                </span>
                                                {taskId && (
                                                    <button
                                                        onClick={() => handleExport('json')}
                                                        disabled={isExporting}
                                                        className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                                    >
                                                        <FiDownload className="inline mr-1 w-3 h-3" />
                                                        Export
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                            <motion.div
                                                className="absolute top-0 bottom-0 w-8 bg-white/20 blur-sm"
                                                style={{ left: `${Math.min(progress, 95)}%` }}
                                            />
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={resultsSectionRef}>
                            <AnimatePresence mode="wait">
                                {hasResults ? (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold flex items-center gap-3">
                                                    <span className="shimmer-text">Search Results</span>
                                                    <span className="text-sm font-normal text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                        {resultsCount} matches
                                                    </span>
                                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] font-mono">
                                                        {wsConnected ? (
                                                            <>
                                                                <FiWifi className="w-3 h-3 text-green-400" />
                                                                <span className="text-green-400">LIVE</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiWifiOff className="w-3 h-3 text-red-400" />
                                                                <span className="text-red-400">OFFLINE</span>
                                                            </>
                                                        )}
                                                        {isSearchingMutation && (
                                                            <FiRadio className="w-3 h-3 text-cyan-400 animate-pulse ml-1" />
                                                        )}
                                                    </span>
                                                </h2>
                                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                                    {searchTime > 0 &&
                                                        `Completed in ${searchTime.toFixed(0)}ms`}
                                                    {' • '}
                                                    Sorted by {filters.sortBy}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={() =>
                                                        setState((prev) => ({
                                                            ...prev,
                                                            showFavoritesOnly: !prev.showFavoritesOnly,
                                                        }))
                                                    }
                                                    className={`p-2 rounded-xl transition-colors border border-white/5 ${state.showFavoritesOnly
                                                        ? 'bg-yellow-400/20 text-yellow-400'
                                                        : 'bg-white/5 text-gray-400 hover:text-white'
                                                        }`}
                                                    title="Show favorites only"
                                                >
                                                    <FiStar className="w-4 h-4" />
                                                </button>

                                                <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                                                    <button
                                                        onClick={() =>
                                                            setState((prev) => ({
                                                                ...prev,
                                                                zoomLevel: Math.max(1, prev.zoomLevel - 1),
                                                            }))
                                                        }
                                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                                        title="Zoom out"
                                                    >
                                                        <FiZoomOut className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-[10px] font-mono text-gray-500 px-1">
                                                        {state.zoomLevel}x
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            setState((prev) => ({
                                                                ...prev,
                                                                zoomLevel: Math.min(5, prev.zoomLevel + 1),
                                                            }))
                                                        }
                                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                                        title="Zoom in"
                                                    >
                                                        <FiZoomIn className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                                                    {[
                                                        { mode: 'spiral', icon: <FiZap className="w-3.5 h-3.5" /> },
                                                        { mode: 'grid', icon: <FiGrid className="w-3.5 h-3.5" /> },
                                                        { mode: 'morphing', icon: <FiLayers className="w-3.5 h-3.5" /> },
                                                        { mode: 'heatmap', icon: <FiActivity className="w-3.5 h-3.5" /> },
                                                        { mode: 'timeline', icon: <FiClock className="w-3.5 h-3.5" /> },
                                                        { mode: 'temporal', icon: <FiCalendar className="w-3.5 h-3.5" /> },
                                                        { mode: 'network', icon: <FiCpu className="w-3.5 h-3.5" /> },
                                                    ].map(({ mode, icon }) => (
                                                        <button
                                                            key={mode}
                                                            onClick={() => handleViewModeChange(mode as ViewMode)}
                                                            className={`p-2 rounded-lg transition-all ${state.viewMode === mode
                                                                ? 'bg-cyan-400/20 text-cyan-400'
                                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={handleManualRefresh}
                                                    disabled={!taskId}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 disabled:opacity-50"
                                                    title="Refresh"
                                                >
                                                    <FiRotateCcw className="w-4 h-4 text-gray-400" />
                                                </button>

                                                <button
                                                    onClick={toggleFullscreen}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                                                    title={state.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                                                >
                                                    {state.isFullscreen ? (
                                                        <FiMinimize2 className="w-4 h-4 text-cyan-400" />
                                                    ) : (
                                                        <FiMaximize2 className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>

                                                <div className="relative group">
                                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs transition-colors flex items-center gap-2 border border-white/5">
                                                        <FiDownload className="text-cyan-400 w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Export</span>
                                                        <FiChevronDown className="w-3 h-3" />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-32 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-white/5 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-20">
                                                        <button
                                                            onClick={() => handleExport('json')}
                                                            className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 transition-colors"
                                                        >
                                                            📄 JSON
                                                        </button>
                                                        <button
                                                            onClick={() => handleExport('csv')}
                                                            className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-white/5 transition-colors"
                                                        >
                                                            📊 CSV
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleClear}
                                                    className="p-2 bg-white/5 hover:bg-red-500/20 rounded-xl transition-colors border border-white/5"
                                                    title="Clear"
                                                >
                                                    <FiX className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                                </button>
                                            </div>
                                        </div>

                                        {renderViewContent}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-20"
                                    >
                                        <HolographicCard
                                            className="inline-block p-8 rounded-2xl"
                                            intensity={0.8}
                                        >
                                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                                <FiEye className="w-10 h-10 text-gray-600" />
                                            </div>
                                            <p className="text-gray-400 font-medium text-lg mb-1">
                                                Ready to Search
                                            </p>
                                            <p className="text-sm text-gray-500 max-w-md mx-auto">
                                                Upload a photo or video to begin searching across social
                                                media platforms
                                            </p>

                                            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FiImage className="text-cyan-400 w-3 h-3" />
                                                    Images
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiVideo className="text-purple-400 w-3 h-3" />
                                                    Videos
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiCpu className="text-green-400 w-3 h-3" />
                                                    AI Powered
                                                </span>
                                            </div>
                                        </HolographicCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24 space-y-4">
                            <GlassCard padding="sm" className="p-1">
                                <div className="flex items-center gap-1">
                                    {[
                                        { tab: 'parameters', icon: <FiSliders className="w-3.5 h-3.5" />, label: 'Params' },
                                        { tab: 'statistics', icon: <FiBarChart2 className="w-3.5 h-3.5" />, label: 'Stats' },
                                        { tab: 'distributions', icon: <FiActivity className="w-3.5 h-3.5" />, label: 'Dist' },
                                        { tab: 'analytics', icon: <FiTrendingUp className="w-3.5 h-3.5" />, label: 'Trends' },
                                        { tab: 'history', icon: <FiClock className="w-3.5 h-3.5" />, label: 'History' },
                                    ].map(({ tab, icon, label }) => (
                                        <button
                                            key={tab}
                                            onClick={() => handlePanelTabChange(tab as PanelTab)}
                                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg text-[9px] font-medium transition-all ${state.panelTab === tab
                                                ? 'bg-cyan-400/20 text-cyan-400'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {icon}
                                            <span className="hidden xl:inline">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-5" glow="cyan" glowIntensity="low">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={state.panelTab}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {renderPanelContent}
                                    </motion.div>
                                </AnimatePresence>
                            </GlassCard>

                            {state.uploadedFile && (
                                <NeonBorder color="cyan" intensity="medium">
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] text-gray-500 font-mono">
                                                BIOMETRIC SCAN
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-[9px] text-gray-500 font-mono">LIVE</span>
                                            </div>
                                        </div>
                                        <Suspense fallback={<VisualizerSkeleton label="Loading biometric" />}>
                                            <BiometricVisualizer
                                                type="hybrid"
                                                confidence={displayedResults[0]?.similarity || 0.85}
                                                isActive={isSearchingMutation}
                                                size="sm"
                                            />
                                        </Suspense>
                                    </div>
                                </NeonBorder>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {state.showSettings && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setState((prev) => ({ ...prev, showSettings: false }))}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-6 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <FiSettings className="text-cyan-400" />
                                    Settings
                                </h3>
                                <button
                                    onClick={() =>
                                        setState((prev) => ({ ...prev, showSettings: false }))
                                    }
                                    className="p-1.5 hover:bg-white/10 rounded-lg"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <span className="text-sm text-gray-300">Dark Mode</span>
                                    <button
                                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-cyan-400' : 'bg-gray-600'
                                            }`}
                                    >
                                        <motion.div
                                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full"
                                            animate={{ left: isDark ? 'calc(100% - 18px)' : '2px' }}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <span className="text-sm text-gray-300">Auto-scroll to results</span>
                                    <input type="checkbox" defaultChecked className="accent-cyan-400" />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <span className="text-sm text-gray-300">Real-time updates</span>
                                    <input type="checkbox" defaultChecked className="accent-cyan-400" />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                    <span className="text-sm text-gray-300">Sound on complete</span>
                                    <input type="checkbox" className="accent-cyan-400" />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Suspense fallback={null}>
                <ResultDetailModal
                    result={state.selectedResult}
                    isOpen={state.isModalOpen}
                    onClose={() =>
                        setState((prev) => ({ ...prev, isModalOpen: false, selectedResult: null }))
                    }
                />
            </Suspense>

            <StatusBar />

            <NotificationContainer />
        </div>
    );
};

export default SearchDashboard;