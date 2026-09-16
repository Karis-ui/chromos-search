import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanlineProps {
    className?: string;
    speed?: number;
    color?: string;
    intensity?: number;
    vertical?: boolean;
    animated?: boolean;
    children?: React.ReactNode;
}

export const Scanline: React.FC<ScanlineProps> = ({
    className = '',
    speed = 1,
    color = '#06b6d4',
    intensity = 0.5,
    vertical = false,
    animated = true,
    children,
}) => {
    const [position, setPosition] = useState(0);
    const [isActive, setIsActive] = useState(true);

    // ── Animation loop ──
    useEffect(() => {
        if (!animated) return;

        let animationId: number;
        let startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = (time - startTime) / 1000;
            const progress = (elapsed * 50 * speed) % 100;
            setPosition(progress);
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [animated, speed]);

    // ── Random glitch effect ──
    useEffect(() => {
        if (!animated) return;

        const glitchInterval = setInterval(() => {
            if (Math.random() < 0.1) {
                setIsActive(false);
                setTimeout(() => setIsActive(true), 100 + Math.random() * 200);
            }
        }, 2000);

        return () => clearInterval(glitchInterval);
    }, [animated]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* ── Content ── */}
            {children}

            {/* ── Scanline Overlay ── */}
            <AnimatePresence>
                {isActive && animated && (
                    <motion.div
                        className={`absolute pointer-events-none z-10`}
                        style={{
                            [vertical ? 'left' : 'top']: `${position}%`,
                            [vertical ? 'width' : 'height']: '100%',
                            [vertical ? 'height' : 'width']: vertical ? '2px' : '2px',
                            background: `linear-gradient(${vertical ? '90deg' : '0deg'}, transparent, ${color}${Math.floor(intensity * 40).toString(16).padStart(2, '0')}, transparent)`,
                            boxShadow: `0 0 20px ${color}${Math.floor(intensity * 20).toString(16).padStart(2, '0')}`,
                        }}
                        animate={{
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── Static noise overlay ── */}
            <div
                className="absolute inset-0 pointer-events-none z-5 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
            />

            {/* ── Vignette ── */}
            <div
                className="absolute inset-0 pointer-events-none z-5"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)`,
                }}
            />
        </div>
    );
};