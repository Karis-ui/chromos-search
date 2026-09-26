import { GlassCard } from "../common";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiUpload, FiCpu, FiZap, FiTarget, FiChevronRight, FiActivity, FiLayers } from "react-icons/fi";
import { GradientButton } from "../common";
import { NeonBorder } from "../common";
import { GlitchText } from "../common";

const DEMO_STEPS = [
    {
        id: 'upload',
        title: 'Upload Photo',
        description: 'Drag & drop any image or video',
        icon: FiUpload,
        color: '#06b6d4',
        preview: 'DROP_IMAGE_HERE.jpg',
    },
    {
        id: 'analyze',
        title: 'AI Analysis',
        description: 'Face detection & embedding extraction',
        icon: FiCpu,
        color: '#a855f7',
        preview: 'FACE_DETECTED: 99.2%',
    },
    {
        id: 'scan',
        title: 'Scan Platforms',
        description: 'Query 12 social networks in parallel',
        icon: FiLayers,
        color: '#ec4899',
        preview: 'SCANNING 1,847 POSTS...',
    },
    {
        id: 'match',
        title: 'Match Results',
        description: 'Get ranked matches with confidence scores',
        icon: FiTarget,
        color: '#22c55e',
        preview: '42 MATCHES FOUND',
    },
];

export const LiveDemo: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;

        const timer = setInterval(() => {
            setActiveStep((prevStep) =>
                prevStep === DEMO_STEPS.length - 1 ? 0 : prevStep + 1
            )
        }, 2000);
        return () => clearInterval(timer)
    }, [isPlaying]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                    <FiPlay className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">
                        Live Demo
                    </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                    <span className="text-white">See It </span>
                    <span className="shimmer-text">In Action</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
                    Watch how Chronos turns a single photo into actionable intelligence in seconds.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
            >
                <NeonBorder color="purple" intensity="medium">
                    <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-950 to-gray-900">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* ═══ LEFT: Steps ═══ */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white font-mono">
                                        SEARCH PIPELINE
                                    </h3>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                                    >
                                        {isPlaying ? (
                                            <>
                                                <FiPause className="w-3 h-3 text-cyan-400" />
                                                <span className="text-xs text-cyan-400 font-mono">Pause</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiPlay className="w-3 h-3 text-green-400" />
                                                <span className="text-xs text-green-400 font-mono">Play</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {DEMO_STEPS.map((step, idx) => (
                                    <motion.button
                                        key={step.id}
                                        onClick={() => {
                                            setActiveStep(idx);
                                            setIsPlaying(false);
                                        }}
                                        className={`w-full text-left transition-all ${activeStep === idx ? 'scale-[1.02]' : ''
                                            }`}
                                    >
                                        <GlassCard
                                            variant={activeStep === idx ? 'light' : 'dark'}
                                            hover
                                            padding="md"
                                            glow={activeStep === idx ? 'purple' : 'none'}
                                            className={`relative overflow-hidden ${activeStep === idx ? 'border-purple-500/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all ${activeStep === idx
                                                        ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-400'
                                                        : 'bg-white/5 border border-white/10 text-gray-500'
                                                        }`}
                                                >
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>

                                                <div
                                                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeStep === idx
                                                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                                                        : 'bg-white/5'
                                                        }`}
                                                >
                                                    <step.icon
                                                        className="w-5 h-5"
                                                        style={{ color: activeStep === idx ? step.color : '#6b7280' }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-semibold transition-colors ${activeStep === idx ? 'text-white' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        {step.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {step.description}
                                                    </p>
                                                </div>

                                                <FiChevronRight
                                                    className={`w-4 h-4 transition-all ${activeStep === idx
                                                        ? 'text-purple-400 translate-x-0'
                                                        : 'text-gray-600 -translate-x-2'
                                                        }`}
                                                />
                                            </div>

                                            {activeStep === idx && isPlaying && (
                                                <motion.div
                                                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 2, ease: 'linear' }}
                                                />
                                            )}
                                        </GlassCard>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="relative">
                                <GlassCard
                                    variant="dark"
                                    padding="none"
                                    className="h-full overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500/70" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                                            <div className="w-2 h-2 rounded-full bg-green-500/70" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            chronos@demo
                                        </span>
                                        <FiActivity className="w-3 h-3 text-cyan-400 animate-pulse" />
                                    </div>

                                    <div className="p-6 h-[400px] flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeStep}
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                                transition={{ duration: 0.4 }}
                                                className="text-center"
                                            >
                                                <motion.div
                                                    animate={{
                                                        rotate: [0, 360],
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                                                        scale: { duration: 2, repeat: Infinity },
                                                    }}
                                                    className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${DEMO_STEPS[activeStep].color}20, ${DEMO_STEPS[activeStep].color}05)`,
                                                        border: `2px solid ${DEMO_STEPS[activeStep].color}40`,
                                                        boxShadow: `0 0 40px ${DEMO_STEPS[activeStep].color}20`,
                                                    }}
                                                >
                                                    {React.createElement(DEMO_STEPS[activeStep].icon, {
                                                        className: 'w-12 h-12',
                                                        style: { color: DEMO_STEPS[activeStep].color },
                                                    })}
                                                </motion.div>

                                                <GlitchText
                                                    className="text-lg font-bold text-white mb-3 font-mono"
                                                    glitchInterval={3000}
                                                    intensity={0.3}
                                                >
                                                    {DEMO_STEPS[activeStep].preview}
                                                </GlitchText>

                                                <p className="text-sm text-gray-400 mb-6 font-mono">
                                                    {DEMO_STEPS[activeStep].description}
                                                </p>

                                                <div className="flex items-center justify-center gap-2">
                                                    {DEMO_STEPS.map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-2 h-2 rounded-full transition-all ${activeStep === idx
                                                                ? 'w-8'
                                                                : ''
                                                                }`}
                                                            style={{
                                                                backgroundColor:
                                                                    activeStep === idx
                                                                        ? DEMO_STEPS[activeStep].color
                                                                        : 'rgba(255,255,255,0.1)',
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-green-400 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            RUNNING
                                        </span>
                                        <span className="text-gray-600">
                                            STEP {activeStep + 1} / {DEMO_STEPS.length}
                                        </span>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <GradientButton
                                variant="rainbow"
                                size="lg"
                                pulse
                                icon={<FiZap />}
                            >
                                Try It Yourself
                            </GradientButton>
                        </div>
                    </div>
                </NeonBorder>
            </motion.div>
        </div>
    );
};

export default LiveDemo;