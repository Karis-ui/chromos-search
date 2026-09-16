import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

interface NeonBorderProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    color?: 'cyan' | 'purple' | 'pink' | 'green' | 'yellow';
    intensity?: 'low' | 'medium' | 'high';
    animated?: boolean;
    animationSpeed?: number;
    rounded?: string;
    borderWidth?: number;
}

export const NeonBorder: React.FC<NeonBorderProps> = ({
    children,
    className = '',
    color = 'cyan',
    intensity = 'medium',
    animated = true,
    animationSpeed = 1,
    rounded = 'rounded-2xl',
    borderWidth = 2,
}) => {
    const colors = {
        cyan: {
            base: '#06b6d4',
            glow: '#22d3ee',
            shadow: 'rgba(34, 211, 238, 0.3)',
        },
        purple: {
            base: '#a855f7',
            glow: '#c084fc',
            shadow: 'rgba(168, 85, 247, 0.3)',
        },
        pink: {
            base: '#ec4899',
            glow: '#f472b6',
            shadow: 'rgba(236, 72, 153, 0.3)',
        },
        green: {
            base: '#22c55e',
            glow: '#4ade80',
            shadow: 'rgba(34, 197, 94, 0.3)',
        },
        yellow: {
            base: '#eab308',
            glow: '#facc15',
            shadow: 'rgba(234, 179, 8, 0.3)',
        },
    };

    const intensities = {
        low: {
            blur: 'blur-sm',
            opacity: 'opacity-30',
        },
        medium: {
            blur: 'blur',
            opacity: 'opacity-50',
        },
        high: {
            blur: 'blur-lg',
            opacity: 'opacity-70',
        },
    };

    const colorConfig = colors[color];
    const intensityConfig = intensities[intensity];

    return (
        <div
            className={clsx(
                'relative p-[2px] overflow-hidden',
                rounded,
                className
            )}
            style={{ padding: `${borderWidth}px` }}
        >
            {animated && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 10 / animationSpeed,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{
                        background: `conic-gradient(
              from 0deg,
              ${colorConfig.base}00 0%,
              ${colorConfig.base}80 25%,
              ${colorConfig.glow} 50%,
              ${colorConfig.base}80 75%,
              ${colorConfig.base}00 100%
            )`,
                        borderRadius: 'inherit',
                    }}
                />
            )}

            {/* Static border */}
            {!animated && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(
              135deg,
              ${colorConfig.base}80,
              ${colorConfig.glow},
              ${colorConfig.base}80
            )`,
                        borderRadius: 'inherit',
                    }}
                />
            )}

            {/* Inner content */}
            <div
                className={clsx(
                    'relative z-10 w-full h-full bg-gray-950/90 backdrop-blur-xl',
                    rounded
                )}
            >
                {children}
            </div>

            {/* Glow effect */}
            <div
                className={clsx(
                    'absolute inset-0 pointer-events-none transition-all duration-300',
                    intensityConfig.blur,
                    intensityConfig.opacity
                )}
                style={{
                    boxShadow: `0 0 40px ${colorConfig.shadow}, inset 0 0 40px ${colorConfig.shadow}`,
                    borderRadius: 'inherit',
                }}
            />
        </div>
    );
};