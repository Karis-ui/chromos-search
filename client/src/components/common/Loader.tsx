import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

interface LoaderProps {
    fullScreen?: boolean;
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'cyber' | 'holographic' | 'matrix' | 'neon';
}

export const Loader: React.FC<LoaderProps> = ({
    fullScreen = false,
    text = 'Loading...',
    size = 'md',
    variant = 'cyber',
}) => {
    const [progress, setProgress] = useState(0);
    const [dots, setDots] = useState('');

    const sizeMap = {
        sm: {
            container: 'w-12 h-12',
            ring: 'w-10 h-10',
            svgSize: 48,
            text: 'text-xs',
            gap: 'gap-2',
        },
        md: {
            container: 'w-20 h-20',
            ring: 'w-16 h-16',
            svgSize: 80,
            text: 'text-sm',
            gap: 'gap-3',
        },
        lg: {
            container: 'w-32 h-32',
            ring: 'w-24 h-24',
            svgSize: 128,
            text: 'text-lg',
            gap: 'gap-4',
        },
    };

    const config = sizeMap[size];
    const center = config.svgSize / 2;
    const radius = center - 4;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + Math.random() * 3 + 0.5;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => {
                if (prev.length >= 3) return '';
                return prev + '.';
            });
        }, 400);

        return () => clearInterval(interval);
    }, []);


    const variants = {
        cyber: {
            colors: ['#06b6d4', '#a855f7', '#ec4899'],
            gradient: 'from-cyan-400 via-purple-400 to-pink-400',
            ring: 'border-cyan-500',
            glow: 'shadow-cyan-500/20',
        },
        holographic: {
            colors: ['#06b6d4', '#22d3ee', '#67e8f9'],
            gradient: 'from-cyan-300 via-blue-400 to-purple-400',
            ring: 'border-cyan-300',
            glow: 'shadow-cyan-300/20',
        },
        matrix: {
            colors: ['#00ff41', '#00cc33', '#0099ff'],
            gradient: 'from-green-400 via-green-500 to-emerald-400',
            ring: 'border-green-500',
            glow: 'shadow-green-500/20',
        },
        neon: {
            colors: ['#ff00ff', '#ff00cc', '#ff0066'],
            gradient: 'from-pink-500 via-purple-500 to-indigo-500',
            ring: 'border-pink-500',
            glow: 'shadow-pink-500/20',
        },
    };

    const variantConfig = variants[variant];

    const container = (
        <div className={`flex flex-col items-center ${config.gap}`}>
            <div className={`relative ${config.container}`}>
                <motion.div
                    className={`absolute inset-0 rounded-full border-2 ${variantConfig.ring} opacity-20`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                <motion.div
                    className={`absolute inset-0 rounded-full border-t-2 border-r-2 border-l-0 border-b-0 ${variantConfig.ring}`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />

                <motion.div
                    className={`absolute inset-0 rounded-full border-2 border-transparent ${variantConfig.glow}`}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <FiCpu className={`text-${size === 'lg' ? '3xl' : size === 'md' ? 'xl' : 'lg'} text-cyan-400`} />
                </motion.div>

                <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
                >
                    <circle
                        cx={config.svgSize / 2}
                        cy={config.svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-white/5"
                        strokeWidth="2"
                    />

                    <motion.circle
                        cx={config.svgSize / 2}
                        cy={config.svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-cyan-400"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={
                            circumference * (1 - progress / 100)
                        }
                        animate={{
                            strokeDashoffset:
                                circumference * (1 - progress / 100),
                        }}
                        transition={{ duration: 0.3 }}
                    />
                </svg>
            </div>

            <div className="flex items-center gap-2">
                <motion.span
                    className={`font-mono ${config.text} text-cyan-400`}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {Math.round(progress)}%
                </motion.span>
                <span className={`font-mono ${config.text} text-gray-500`}>|</span>
                <motion.span
                    className={`font-mono ${config.text} text-gray-400`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {text}{dots}
                </motion.span>
            </div>

            <div className="flex items-center gap-1 opacity-30">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        className="h-[2px] w-2 rounded-full bg-cyan-400"
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scaleX: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950/95 backdrop-blur-2xl"
                >
                    <div className="absolute inset-0 opacity-5">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{
                            y: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    >
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                    </motion.div>

                    {container}
                </motion.div>
            </AnimatePresence>
        );
    }

    return container;
};