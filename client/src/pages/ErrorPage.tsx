import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiAlertTriangle,
    FiHome,
    FiArrowLeft,
    FiRefreshCw,
    FiMail,
    FiCopy,
    FiCheck,
    FiTerminal,
    FiCpu,
    FiZap,
    FiShield,
    FiInfo,
    FiChevronDown,
    FiChevronUp,
} from 'react-icons/fi';

import { GradientButton } from '../components/common/GradientButton';
import { GlitchText } from '../components/common/GlitchText';
import { NeonBorder } from '../components/common/NeonBorder';
import { CyberGrid } from '../components/common/CyberGrid';
import { Scanline } from '../components/common/Scanline';
import { ParticleBackground } from '../components/common/ParticleBackground';
import { copyText } from '../utils/clipboard';
import { formatDateFull } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import { APP_CONFIG, ENV, IS_DEV } from '../constants/config';

interface ErrorDetails {
    message: string;
    stack?: string;
    code?: string;
    status?: number;
    statusText?: string;
    timestamp: string;
    path: string;
    userAgent: string;
    correlationId: string;
}


export const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [errorDetails] = useState<ErrorDetails>(() => {
        const state = location.state as { error?: any } | null;
        const error = state?.error;

        return {
            message: error?.message || 'An unexpected error occurred',
            stack: error?.stack,
            code: error?.code || 'UNKNOWN_ERROR',
            status: error?.status,
            statusText: error?.statusText,
            timestamp: new Date().toISOString(),
            path: location.pathname,
            userAgent: navigator.userAgent,
            correlationId: `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        };
    });
    const [showStack, setShowStack] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 150);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = useCallback(async () => {
        const details = `
ERROR REPORT
============
Code: ${errorDetails.code}
Message: ${errorDetails.message}
Path: ${errorDetails.path}
Timestamp: ${errorDetails.timestamp}
Correlation ID: ${errorDetails.correlationId}
User Agent: ${errorDetails.userAgent}
${errorDetails.stack ? `\nStack Trace:\n${errorDetails.stack}` : ''}
    `.trim();

        const success = await copyText(details);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [errorDetails]);

    const handleReport = useCallback(async () => {
        setIsReporting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setTimeout(() => setIsReporting(false), 1000);
        } catch {
            setIsReporting(false);
        }
    }, []);

    const getSeverity = () => {
        if (errorDetails.status && errorDetails.status >= 500) {
            return { level: 'CRITICAL', color: '#f87171', bg: 'rgba(248,113,113,0.1)' };
        }
        if (errorDetails.status && errorDetails.status >= 400) {
            return { level: 'WARNING', color: '#facc15', bg: 'rgba(250,204,21,0.1)' };
        }
        return { level: 'ERROR', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' };
    };

    const severity = getSeverity();

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
            <ParticleBackground />
            <CyberGrid animated speed={0.4} lineColor="#f87171" glowColor="#fb923c" />
            <Scanline color="#f87171" intensity={0.5} />
            <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%)' }}
            />
            <div className="relative z-10 max-w-4xl w-full">
                <NeonBorder color="pink" intensity="high" animationSpeed={0.4}>
                    <div className="p-6 sm:p-10">
                        <div className="flex items-start gap-4 mb-8">
                            <motion.div
                                className="relative flex-shrink-0"
                                animate={{
                                    scale: isGlitching ? [1, 1.1, 1] : [1, 1.05, 1],
                                    rotate: isGlitching ? [0, -5, 5, 0] : 0,
                                }}
                                transition={{
                                    scale: { duration: 2, repeat: Infinity },
                                    rotate: { duration: 0.3 },
                                }}
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center relative"
                                    style={{ background: severity.bg, border: `1px solid ${severity.color}40` }}
                                >
                                    <FiAlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: severity.color }} />
                                    <motion.div
                                        className="absolute inset-0 rounded-2xl"
                                        style={{ border: `2px solid ${severity.color}` }}
                                        animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </div>
                            </motion.div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <GlitchText
                                        className="text-2xl sm:text-3xl font-bold text-white font-mono"
                                        glitchInterval={3000}
                                        intensity={0.8}
                                    >
                                        SYSTEM ERROR
                                    </GlitchText>

                                    <div
                                        className="px-3 py-1 rounded-full text-[10px] font-mono font-bold"
                                        style={{
                                            background: severity.bg,
                                            color: severity.color,
                                            border: `1px solid ${severity.color}40`,
                                        }}
                                    >
                                        {severity.level}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-400 font-mono">
                                    The Chronos Engine encountered an unexpected error
                                </p>
                            </div>
                        </div>

                        <div className="mb-6 p-4 rounded-xl border" style={{ background: severity.bg, borderColor: `${severity.color}30` }}>
                            <div className="flex items-start gap-3">
                                <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: severity.color }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: severity.color }}>
                                        ERROR MESSAGE
                                    </p>
                                    <p className="text-sm text-white font-mono break-words">
                                        {errorDetails.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiTerminal className="w-3 h-3 text-gray-500" />
                                    <span className="text-[10px] text-gray-500 font-mono uppercase">Error Code</span>
                                </div>
                                <p className="text-xs text-white font-mono truncate">
                                    {errorDetails.code}
                                </p>
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiCpu className="w-3 h-3 text-gray-500" />
                                    <span className="text-[10px] text-gray-500 font-mono uppercase">Correlation ID</span>
                                </div>
                                <p className="text-xs text-white font-mono truncate">
                                    {errorDetails.correlationId}
                                </p>
                            </div>

                            {errorDetails.status && (
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FiZap className="w-3 h-3 text-gray-500" />
                                        <span className="text-[10px] text-gray-500 font-mono uppercase">HTTP Status</span>
                                    </div>
                                    <p className="text-xs text-white font-mono">
                                        {errorDetails.status} {errorDetails.statusText}
                                    </p>
                                </div>
                            )}

                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiShield className="w-3 h-3 text-gray-500" />
                                    <span className="text-[10px] text-gray-500 font-mono uppercase">Timestamp</span>
                                </div>
                                <p className="text-xs text-white font-mono truncate">
                                    {formatDateFull(errorDetails.timestamp)}
                                </p>
                            </div>
                        </div>

                        {IS_DEV && errorDetails.stack && (
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowStack(!showStack)}
                                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white font-mono transition-colors mb-2"
                                >
                                    {showStack ? <FiChevronUp /> : <FiChevronDown />}
                                    <span>Stack Trace</span>
                                </button>

                                <AnimatePresence>
                                    {showStack && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <pre className="p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-red-300 overflow-auto max-h-64 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-red-500/30">
                                                {errorDetails.stack}
                                            </pre>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 mb-6">
                            <GradientButton
                                onClick={() => window.location.reload()}
                                variant="rainbow"
                                size="lg"
                                icon={<FiRefreshCw />}
                                pulse
                            >
                                Try Again
                            </GradientButton>

                            <GradientButton
                                onClick={() => navigate(ROUTES.HOME)}
                                variant="cyan"
                                size="lg"
                                icon={<FiHome />}
                            >
                                Go Home
                            </GradientButton>

                            <GradientButton
                                onClick={() => navigate(-1)}
                                variant="purple"
                                size="lg"
                                icon={<FiArrowLeft />}
                            >
                                Go Back
                            </GradientButton>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/20 transition-all text-xs text-gray-400 hover:text-white font-mono"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck className="w-3 h-3 text-green-400" />
                                        <span className="text-green-400">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCopy className="w-3 h-3" />
                                        Copy Error Details
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleReport}
                                disabled={isReporting}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/20 transition-all text-xs text-gray-400 hover:text-white font-mono disabled:opacity-50"
                            >
                                {isReporting ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full"
                                        />
                                        Reporting...
                                    </>
                                ) : (
                                    <>
                                        <FiMail className="w-3 h-3" />
                                        Report to Support
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-gray-600 font-mono">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                    ERROR LOGGED
                                </span>
                                <span className="text-gray-700">|</span>
                                <span>{APP_CONFIG.name} v{APP_CONFIG.version}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>{ENV.MODE.toUpperCase()}</span>
                                <span className="text-gray-700">|</span>
                                <span>Correlation: {errorDetails.correlationId}</span>
                            </div>
                        </div>
                    </div>
                </NeonBorder>
                <div className="mt-6 text-center">
                    <p className="text-[10px] text-gray-600 font-mono">
                        Need help? Contact{' '}
                        <a
                            href={`mailto:${APP_CONFIG.supportEmail}`}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            {APP_CONFIG.supportEmail}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;