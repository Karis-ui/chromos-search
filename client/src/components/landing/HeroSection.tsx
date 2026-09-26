import React, { useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FiArrowRight, FiPlay, FiZap, FiShield, FiGlobe,
    FiChevronDown, FiStar, FiTrendingUp,
} from 'react-icons/fi';

import { TerminalHero } from './TerminalHero';
import { GridGlobe } from './GridGlobe';
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { TypewriterText } from '../common/TypewriterText';
import { ROUTES } from '../../constants/routes';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HERO SECTION - HORIZONTAL 50/50 LAYOUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const HeroSection: React.FC = () => {
    // ── Mouse tracking for parallax ──
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    // ── Handle mouse move ──
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    // ── Scroll to features ──
    const scrollToFeatures = useCallback(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return (
        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* ═══ 3D GLOBE BACKGROUND ═══ */}
            <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none overflow-hidden">
                <div className="w-[800px] h-[800px] -translate-y-8">
                    <GridGlobe mouseX={springX.get()} mouseY={springY.get()} />
                </div>
            </div>

            {/* ═══ MAIN GRID: 2-COLUMN HORIZONTAL LAYOUT ═══ */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full">

                {/* ════════════════════════════════════════════════ */}
                {/* LEFT COLUMN: Content                          */}
                {/* ════════════════════════════════════════════════ */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:space-y-7 w-full order-1">

                    {/* ── Live Status Badge ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-cyan-500/20"
                    >
                        <div className="flex items-center gap-1.5">
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-green-400"
                                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider font-bold">
                                Live
                            </span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <span className="text-[10px] text-gray-400 font-mono">
                            12,847 searches today
                        </span>
                    </motion.div>

                    {/* ── Main Headline ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="space-y-2 w-full"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] tracking-tight">
                            <GlitchText
                                glitchInterval={6000}
                                intensity={0.5}
                                className="block text-white"
                            >
                                FIND ANYONE.
                            </GlitchText>
                            <span className="block shimmer-text py-1">
                                ANYWHERE.
                            </span>
                            <span className="block text-gray-600">
                                IN SECONDS.
                            </span>
                        </h1>
                    </motion.div>

                    {/* ── Subtitle ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-xl w-full"
                    >
                        <TypewriterText
                            text="AI-powered biometric search across 12 social platforms. Face recognition. Voice matching. Deep temporal analysis. This is the future of digital investigation."
                            speed={20}
                            className="text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed"
                            cursor={true}
                            loop={false}
                        />
                    </motion.div>

                    {/* ── Feature Pills ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-2 w-full"
                    >
                        {[
                            { icon: FiZap, label: 'Face Recognition' },
                            { icon: FiShield, label: 'Voice Matching' },
                            { icon: FiGlobe, label: '12 Platforms' },
                            { icon: FiTrendingUp, label: '6-Month History' },
                        ].map((pill, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                            >
                                <pill.icon className="w-3 h-3 text-cyan-400" />
                                <span className="text-[10px] sm:text-xs text-gray-300 font-mono">
                                    {pill.label}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ── CTAs ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full max-w-md lg:max-w-none"
                    >
                        <Link to={ROUTES.REGISTER} className="flex-1 sm:flex-initial">
                            <GradientButton
                                variant="rainbow"
                                size="lg"
                                pulse
                                icon={<FiArrowRight />}
                                iconPosition="right"
                                className="w-full"
                            >
                                Start Searching Free
                            </GradientButton>
                        </Link>

                        <button className="group flex-1 sm:flex-initial px-6 py-3.5 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                                <FiPlay className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
                            </div>
                            <span className="text-sm text-gray-300 font-mono whitespace-nowrap">
                                Watch Demo
                            </span>
                        </button>
                    </motion.div>

                    {/* ── Trust Indicators ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2 w-full"
                    >
                        {/* Users */}
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="w-7 h-7 rounded-full border-2 border-gray-950 flex items-center justify-center text-[9px] font-bold text-white"
                                        style={{
                                            background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 50%), hsl(${i * 60 + 40}, 70%, 40%))`,
                                        }}
                                    >
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs">
                                <div className="flex items-center gap-0.5 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <FiStar key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-500 font-mono text-[10px] mt-0.5">
                                    10,000+ users
                                </p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden sm:block" />

                        {/* Security */}
                        <div className="flex items-center gap-2 text-xs">
                            <FiShield className="w-4 h-4 text-green-400" />
                            <div>
                                <p className="text-gray-300 font-mono text-[11px]">
                                    Enterprise Grade
                                </p>
                                <p className="text-gray-500 font-mono text-[9px]">
                                    TLS 1.3 • AES-256
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ════════════════════════════════════════════════ */}
                {/* RIGHT COLUMN: Terminal Preview                 */}
                {/* ════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="relative w-full order-2 lg:order-2"
                >
                    <TerminalHero />
                </motion.div>
            </div>

            {/* ═══ SCROLL INDICATOR ═══ */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={scrollToFeatures}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
            >
                <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                    Scroll to explore
                </span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <FiChevronDown className="w-4 h-4 text-cyan-400" />
                </motion.div>
            </motion.button>
        </div>
    );
};

export default HeroSection;