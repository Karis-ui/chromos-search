import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCalendar, FiZap } from 'react-icons/fi';

interface TimeScrubberProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    marks?: number[];
    label?: string;
}

export const TimeScrubber: React.FC<TimeScrubberProps> = ({
    min, max, value, onChange, marks = [], label = 'Time Range'
}) => {
    const [isDragging] = useState(false);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const percentage = ((value - min) / (max - min)) * 100;
    const getTimeLabel = useCallback((days: number) => {
        if (days === 0) return 'Now';
        if (days < 1) return 'Today';
        if (days < 7) return `${days} days ago`;
        if (days < 30) {
            const week = Math.floor(days / 7);
            return `${week} week${week > 1 ? 's' : ''} ago`
        }
        if (days < 365) {
            const months = Math.floor(days / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`
        }
    }, []);

    const getDensity = useCallback((position: number) => {
        const normalized = position / 100;
        const density = Math.sin(normalized * Math.PI) * 0.8 + 0.2;
        return density;
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const xPos = (e.clientX - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, xPos));
        const days = Math.round(clamped * (max - min) + min);
        setHoverValue(days);
    }, [min, max]);

    const handleMouseLeave = useCallback(() => {
        setHoverValue(null);
    }, []);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const xPos = (e.clientX - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, xPos));
        const days = Math.round(clamped * (max - min) + min);
        onChange(days);
    }, [min, max, onChange]);

    const displayValue = getTimeLabel(value);
    const hoverDisplay = hoverValue !== null ? getTimeLabel(hoverValue) : null;
    const hoverDensity = hoverValue !== null ? getDensity(((hoverValue - min) / (max - min)) * 100) : 0;

    return (
        <div
            ref={containerRef}
            className="relative w-full py-3 select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                    {Array.from({ length: 50 }).map((_, i) => {
                        const pos = i / 50;
                        const density = getDensity(pos * 100);
                        return (
                            <div
                                key={i}
                                className="flex-1"
                                style={{
                                    background: `rgba(34, 211, 238, ${density * 0.1})`,
                                    height: `${10 + density * 90}%`,
                                    alignSelf: 'flex-end',
                                }}
                            />
                        );
                    })}
                </div>

                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 rounded-full"
                    style={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {marks.map((mark) => {
                    const markPercent = ((mark - min) / (max - min)) * 100;
                    return (
                        <div
                            key={mark}
                            className="absolute top-0 bottom-0 w-px bg-white/20"
                            style={{ left: `${markPercent}%` }}
                        >
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 font-mono whitespace-nowrap">
                                {mark}d
                            </div>
                        </div>
                    );
                })}

                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-lg shadow-purple-500/25 border-2 border-white cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                    animate={{
                        scale: isDragging ? 1.3 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    whileHover={{ scale: 1.15 }}
                />

                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full pointer-events-none"
                    style={{
                        left: `${percentage}%`,
                        background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
                        opacity: isDragging ? 1 : 0.5,
                    }}
                    animate={{
                        scale: isDragging ? 1.2 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                />
            </div>

            <AnimatePresence>
                {hoverValue !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute -top-12 px-3 py-1.5 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 text-xs text-white whitespace-nowrap font-mono"
                        style={{
                            left: `calc(${((hoverValue - min) / (max - min)) * 100}% - 30px)`,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <FiClock className="w-3 h-3 text-cyan-400" />
                            <span>{hoverDisplay}</span>
                            <div
                                className="w-1 h-4 rounded-full"
                                style={{
                                    background: `rgba(34, 211, 238, ${hoverDensity})`,
                                    opacity: 0.5 + hoverDensity * 0.5,
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    <FiCalendar className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs text-gray-400 font-mono">{displayValue}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FiZap className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-gray-500 font-mono">
                        {Math.round((1 - (value / max)) * 100)}% coverage
                    </span>
                </div>
            </div>
        </div>
    );
};