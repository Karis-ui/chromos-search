import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome,
    FiArrowLeft,
    FiSearch,
    FiAlertTriangle,
    FiTerminal,
    FiCpu,
    FiZap,
    FiCompass,
    FiRefreshCw,
} from 'react-icons/fi';
import { GradientButton } from '../components/common/GradientButton';
import { GlitchText } from '../components/common/GlitchText';
import { NeonBorder } from '../components/common/NeonBorder';
import { CyberGrid } from '../components/common/CyberGrid';
import { Scanline } from '../components/common/Scanline';
import { ParticleBackground } from '../components/common/ParticleBackground';
import { TypewriterText } from '../components/common/TypewriterText';
import { ROUTES } from '../constants/routes';
import { APP_CONFIG } from '../constants/config';

const TERMINAL_LINES = [
    '> Initializing route lookup...',
    '> Scanning database for target path...',
    '> ERROR: Path not found in routing table',
    '> Attempting recovery protocols...',
    '> Fallback engaged: Displaying 404 handler',
    '> Logging incident to monitoring system...',
    '> Ready for user input...',
];

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [errorCode] = useState(() => {
        return `ERR_404_${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}`
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleLines((prev) => {
                if (prev >= TERMINAL_LINES.length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 400)
        return () => clearInterval(interval);
    }, []);

    const [, setIsGlitching] = useState(false);
    useEffect(() => {
        const interval = setInterval(() => {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 200);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
            <ParticleBackground />
            <CyberGrid animated speed={0.5} lineColor="#f87171" glowColor="#ec4899" />
            <Scanline color="#f87171" intensity={0.4} />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%)' }}
            />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }}
            />

            <div className="relative z-10 max-w-3xl w-full">
                <NeonBorder color="pink" intensity="medium" animationSpeed={0.5}>
                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="relative inline-block mb-6"
                            >
                                <GlitchText
                                    className="text-8xl sm:text-9xl font-black text-transparent bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text"
                                    glitchInterval={3000}
                                    intensity={1.5}
                                >
                                    404
                                </GlitchText>

                                <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 -z-10" />
                            </motion.div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-mono">
                                <TypewriterText
                                    text="DIGITAL ECHO NOT FOUND"
                                    speed={50}
                                    cursor={false}
                                    loop={false}
                                />
                            </h1>

                            <p className="text-sm sm:text-base text-gray-400 font-mono max-w-lg mx-auto">
                                The path{' '}
                                <span className="text-red-400 break-all">
                                    {location.pathname.length > 40
                                        ? location.pathname.slice(0, 40) + '...'
                                        : location.pathname}
                                </span>{' '}
                                does not exist in our system.
                            </p>
                        </div>
                        <div className="mb-8 bg-black/60 rounded-xl border border-white/5 overflow-hidden backdrop-blur-xl">
                            <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                    <FiTerminal className="w-3 h-3" />
                                    <span>chronos@system:~/error</span>
                                </div>
                                <div className="text-[10px] text-gray-600 font-mono">
                                    {errorCode}
                                </div>
                            </div>

                            <div className="p-4 font-mono text-xs space-y-1 min-h-[160px]">
                                {TERMINAL_LINES.slice(0, visibleLines).map((line, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`${line.includes('ERROR')
                                            ? 'text-red-400'
                                            : line.includes('Fallback')
                                                ? 'text-yellow-400'
                                                : 'text-green-400'
                                            }`}
                                    >
                                        {line}
                                    </motion.div>
                                ))}
                                {visibleLines >= TERMINAL_LINES.length && (
                                    <motion.span
                                        animate={{ opacity: [1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="inline-block w-2 h-4 bg-green-400"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                            {[
                                {
                                    icon: FiCompass,
                                    label: 'ROUTE',
                                    value: location.pathname.split('/').slice(-1)[0] || '/',
                                    color: '#f87171',
                                },
                                {
                                    icon: FiAlertTriangle,
                                    label: 'STATUS',
                                    value: 'NOT_FOUND',
                                    color: '#facc15',
                                },
                                {
                                    icon: FiCpu,
                                    label: 'METHOD',
                                    value: 'GET',
                                    color: '#22d3ee',
                                },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <item.icon className="w-3 h-3" style={{ color: item.color }} />
                                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                            {item.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white font-mono truncate" title={item.value}>
                                        {item.value}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center">
                            <GradientButton
                                onClick={() => navigate(ROUTES.HOME)}
                                variant="cyan"
                                size="lg"
                                icon={<FiHome />}
                                pulse
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

                            <GradientButton
                                onClick={() => window.location.href = ROUTES.HOME}
                                variant="ghost"
                                size="lg"
                                icon={<FiRefreshCw />}
                            >
                                Reload
                            </GradientButton>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-xs text-gray-500 font-mono text-center mb-3">
                                Maybe you were looking for:
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[
                                    { label: 'Search Dashboard', path: ROUTES.HOME, icon: FiSearch },
                                    { label: 'Analytics', path: ROUTES.ANALYTICS, icon: FiZap },
                                ].map((link, idx) => (
                                    <Link
                                        key={idx}
                                        to={link.path}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/20 transition-all text-xs text-gray-400 hover:text-white font-mono"
                                    >
                                        <link.icon className="w-3 h-3" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </NeonBorder>

                <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-gray-600 font-mono">
                    <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        ERROR CODE: {errorCode}
                    </span>
                    <span className="text-gray-700">|</span>
                    <span>{APP_CONFIG.name} v{APP_CONFIG.version}</span>
                    <span className="text-gray-700">|</span>
                    <span>{new Date().toISOString()}</span>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
