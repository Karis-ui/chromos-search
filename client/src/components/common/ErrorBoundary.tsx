import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiBell as FiBug } from 'react-icons/fi';
import { GlitchText } from './GlitchText';
import { GradientButton } from './GradientButton';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    isVisible: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            isVisible: true,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            errorInfo,
        });

        // Log error to monitoring service
        console.error('🔴 ErrorBoundary caught an error:', error, errorInfo);

        // Call onError callback
        this.props.onError?.(error, errorInfo);

        // Report to Sentry or similar
        if (import.meta.env.PROD) {
            // Sentry.captureException(error, { extra: errorInfo });
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            isVisible: true,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        const { hasError, error, errorInfo, isVisible } = this.state;
        const { children, fallback } = this.props;

        if (!hasError) {
            return children;
        }

        if (fallback) {
            return fallback;
        }

        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
                    >
                        {/* ── Background Effects ── */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 opacity-5">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="error-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#error-grid)" />
                                </svg>
                            </div>
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5"
                                animate={{
                                    x: ['-100%', '100%'],
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />
                        </div>

                        {/* ── Main Error Card ── */}
                        <motion.div
                            className="relative max-w-2xl w-full bg-gray-900/90 backdrop-blur-2xl rounded-3xl border border-red-500/20 shadow-2xl shadow-red-500/10 overflow-hidden"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                        >
                            {/* ── Glow Header ── */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-red-500 animate-pulse" />

                            {/* ── Header ── */}
                            <div className="p-6 border-b border-red-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                        <FiAlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <GlitchText
                                            className="text-xl font-bold text-red-400"
                                            glitchInterval={3000}
                                            intensity={0.5}
                                        >
                                            System Exception
                                        </GlitchText>
                                        <p className="text-sm text-gray-400 font-mono">
                                            The Chronos Engine encountered an unexpected error
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Error Details ── */}
                            <div className="p-6 space-y-4">
                                <div className="bg-black/50 rounded-xl p-4 border border-red-500/10 font-mono">
                                    <div className="flex items-start gap-2">
                                        <FiBug className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-red-400/70 font-semibold mb-1">ERROR MESSAGE</p>
                                            <p className="text-sm text-red-300 break-all">
                                                {error?.message || 'Unknown error occurred'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {errorInfo?.componentStack && (
                                    <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-gray-500 font-mono mb-2">COMPONENT STACK</p>
                                        <pre className="text-[10px] text-gray-400 font-mono overflow-auto max-h-32 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
                                            {errorInfo.componentStack}
                                        </pre>
                                    </div>
                                )}

                                {/* ── Error Code ── */}
                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                                    <span className="px-2 py-0.5 bg-white/5 rounded border border-white/5">
                                        ERROR_0x{Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {new Date().toLocaleTimeString('en-US', { hour12: false })}
                                    </span>
                                </div>
                            </div>

                            {/* ── Actions ── */}
                            <div className="p-6 bg-white/5 border-t border-white/5 flex flex-wrap gap-3">
                                <GradientButton
                                    onClick={this.handleReset}
                                    variant="cyan"
                                    className="flex-1 min-w-[120px]"
                                >
                                    <FiRefreshCw className="w-4 h-4" />
                                    Try Again
                                </GradientButton>

                                <GradientButton
                                    onClick={this.handleReload}
                                    variant="purple"
                                    className="flex-1 min-w-[120px]"
                                >
                                    <FiHome className="w-4 h-4" />
                                    Reload Application
                                </GradientButton>
                            </div>

                            {/* ── Footer ── */}
                            <div className="px-6 py-3 bg-black/30 text-center text-[10px] text-gray-600 font-mono border-t border-white/5">
                                If this issue persists, please contact support with the error code above.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }
}

// ── Fallback component for use with lazy loading ──
export const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
    error,
    resetErrorBoundary,
}) => {
    return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20">
            <FiAlertTriangle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-400">Something went wrong</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md">{error.message}</p>
            <button
                onClick={resetErrorBoundary}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm text-red-400 transition-colors border border-red-500/20"
            >
                Try again
            </button>
        </div>
    );
};