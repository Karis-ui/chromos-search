import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiActivity } from 'react-icons/fi';

interface StatusIndicatorProps {
    status: 'online' | 'offline' | 'connecting' | 'error' | 'warning' | 'success';
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    showPulse?: boolean;
    showLabel?: boolean;
    className?: string;
    details?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    label,
    size = 'md',
    showPulse = true,
    showLabel = true,
    className = '',
    details,
}) => {
    const [isGlitching, setIsGlitching] = useState(false);

    // ── Size configurations ──
    const sizeMap = {
        sm: { dot: 'w-2 h-2', text: 'text-xs', gap: 'gap-1.5', icon: 12 },
        md: { dot: 'w-3 h-3', text: 'text-sm', gap: 'gap-2', icon: 16 },
        lg: { dot: 'w-4 h-4', text: 'text-base', gap: 'gap-3', icon: 20 },
    };

    const config = sizeMap[size];

    // ── Status configurations ──
    const statusConfigs = {
        online: {
            icon: FiCheckCircle,
            color: '#4ade80',
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            glow: 'shadow-green-500/20',
            label: label || 'Online',
            pulse: true,
        },
        connecting: {
            icon: FiActivity,
            color: '#facc15',
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30',
            glow: 'shadow-yellow-500/20',
            label: label || 'Connecting...',
            pulse: true,
        },
        offline: {
            icon: FiXCircle,
            color: '#ef4444',
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            glow: 'shadow-red-500/20',
            label: label || 'Offline',
            pulse: false,
        },
        error: {
            icon: FiAlertCircle,
            color: '#ef4444',
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            glow: 'shadow-red-500/20',
            label: label || 'Error',
            pulse: true,
        },
        warning: {
            icon: FiAlertCircle,
            color: '#facc15',
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30',
            glow: 'shadow-yellow-500/20',
            label: label || 'Warning',
            pulse: true,
        },
        success: {
            icon: FiCheckCircle,
            color: '#4ade80',
            bg: 'bg-green-500/20',
            border: 'border-green-500/30',
            glow: 'shadow-green-500/20',
            label: label || 'Success',
            pulse: false,
        },
    };

    const configs = statusConfigs[status];
    const Icon = configs.icon;

    // ── Random glitch effect ──
    useEffect(() => {
        if (status === 'error' || status === 'warning') {
            const interval = setInterval(() => {
                if (Math.random() < 0.05) {
                    setIsGlitching(true);
                    setTimeout(() => setIsGlitching(false), 100);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status]);

    return (
        <div className={`flex items-center ${config.gap} ${className}`}>
            {/* ── Status Dot ── */}
            <div className="relative">
                <motion.div
                    className={`rounded-full ${config.dot} ${configs.bg} border ${configs.border} ${configs.glow}`}
                    animate={{
                        scale: isGlitching ? [1, 0.8, 1.2, 0.9, 1] : configs.pulse && showPulse ? [1, 1.2, 1] : 1,
                        opacity: isGlitching ? [1, 0.3, 1] : 1,
                    }}
                    transition={{
                        duration: configs.pulse && showPulse ? 1.5 : 0.1,
                        repeat: configs.pulse && showPulse ? Infinity : 0,
                        ease: 'easeInOut',
                    }}
                    style={{
                        backgroundColor: configs.color,
                        boxShadow: `0 0 10px ${configs.color}40`,
                    }}
                />

                {/* ── Pulse Ring ── */}
                {configs.pulse && showPulse && (
                    <motion.div
                        className={`absolute inset-0 rounded-full border-2 ${configs.border}`}
                        animate={{
                            scale: [1, 2],
                            opacity: [0.5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeOut',
                        }}
                        style={{
                            borderColor: configs.color,
                        }}
                    />
                )}

                {/* ── Glitch overlay ── */}
                {isGlitching && (
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                            opacity: [1, 0],
                        }}
                        transition={{ duration: 0.1 }}
                        style={{
                            backgroundColor: '#ff0000',
                            mixBlendMode: 'difference',
                        }}
                    />
                )}
            </div>

            {/* ── Label ── */}
            {showLabel && (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span
                            className={`font-mono ${config.text} font-medium`}
                            style={{ color: configs.color }}
                        >
                            {configs.label}
                        </span>
                        <Icon className={`w-${config.icon / 4} h-${config.icon / 4}`} style={{ color: configs.color }} />
                    </div>
                    {details && (
                        <span className="text-[8px] text-gray-500 font-mono">{details}</span>
                    )}
                </div>
            )}
        </div>
    );
};