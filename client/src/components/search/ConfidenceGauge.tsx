import React, { useEffect, useRef, useState } from 'react';
import { useSpring } from 'framer-motion';
import { FiTarget, FiAward } from 'react-icons/fi';

interface ConfidenceGaugeProps {
    value: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    animate?: boolean;
    showLabel?: boolean;
    showPercentage?: boolean;
    status?: 'high' | 'medium' | 'low' | 'negative';
    className?: string;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
    value, label = 'Confidence', size = 'md', animate = true, showLabel = true, showPercentage = true, status, className = '',
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const sizeMap = {
        sm: { width: 100, height: 100, fontSize: 16, labelSize: 9, ringWidth: 6 },
        md: { width: 150, height: 150, fontSize: 24, labelSize: 11, ringWidth: 8 },
        lg: { width: 200, height: 200, fontSize: 32, labelSize: 13, ringWidth: 10 },
        xl: { width: 250, height: 250, fontSize: 40, labelSize: 15, ringWidth: 12 },
    };
    const config = sizeMap[size] || sizeMap.md;
    const statusColors = {
        high: { main: '#4ade80', glow: 'rgba(74,222,128,0.3)', label: 'HIGH' },
        medium: { main: '#facc15', glow: 'rgba(250,204,21,0.3)', label: 'MEDIUM' },
        low: { main: '#fb923c', glow: 'rgba(251,146,60,0.3)', label: 'LOW' },
        negative: { main: '#f87171', glow: 'rgba(248,113,113,0.3)', label: 'NEGATIVE' },
    };
    const statusColorsFallback = {
        high: '#4ade80',
        medium: '#facc15',
        low: '#fb923c',
        negative: '#f87171',
    };
    const statusInfo = status ? statusColors[status] : null;
    const mainColor = statusInfo?.main || statusColorsFallback.high;
    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 15,
        mass: 0.8,
    });

    useEffect(() => {
        if (animate) {
            springValue.set(value);
        } else {
            springValue.set(value);
        }
        const unsubscribe = springValue.onChange((v) => {
            setDisplayValue(v);
        });
        return () => unsubscribe();
    }, [value, animate, springValue]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = config.width;
        const height = config.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 15;
        const currentValue = Math.min(displayValue / 100, 1);

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = config.ringWidth + 2;
        ctx.stroke();

        const trackGradient = ctx.createLinearGradient(0, 0, width, height);
        trackGradient.addColorStop(0, 'rgba(34, 211, 238, 0.05)');
        trackGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        trackGradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)');
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI * 0.75, Math.PI * 0.75);
        ctx.strokeStyle = trackGradient;
        ctx.lineWidth = config.ringWidth;
        ctx.stroke();

        const startAngle = -Math.PI * 0.75;
        const endAngle = -Math.PI * 0.75 + currentValue * Math.PI * 1.5;

        const arcGradient = ctx.createLinearGradient(
            centerX - radius, centerY,
            centerX + radius, centerY
        );
        arcGradient.addColorStop(0, statusInfo?.main || '#06b6d4');
        arcGradient.addColorStop(0.5, statusInfo?.main || '#a855f7');
        arcGradient.addColorStop(1, statusInfo?.main || '#ec4899');

        ctx.shadowColor = statusInfo?.glow || 'rgba(34,211,238,0.3)';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = arcGradient;
        ctx.lineWidth = config.ringWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.shadowBlur = 0;
        const dotCount = 12;
        for (let i = 0; i < dotCount; i++) {
            const progress = i / dotCount;
            if (progress > currentValue) break;

            const angle = startAngle + progress * Math.PI * 1.5;
            const dotX = centerX + Math.cos(angle) * radius;
            const dotY = centerY + Math.sin(angle) * radius;

            const dotGradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6);
            dotGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            dotGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = dotGradient;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${config.fontSize}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = statusInfo?.glow || 'rgba(34,211,238,0.1)';
        ctx.shadowBlur = 10;
        ctx.fillText(`${Math.round(displayValue)}%`, centerX, centerY - 4);

        if (showLabel) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.font = `${config.labelSize}px Inter, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText(label, centerX, centerY + 12);
        }

        if (statusInfo) {
            ctx.fillStyle = statusInfo.main;
            ctx.shadowColor = statusInfo.glow;
            ctx.shadowBlur = 15;
            ctx.font = `7px JetBrains Mono, monospace`;
            ctx.textBaseline = 'bottom';
            ctx.textAlign = 'right';
            ctx.fillText(statusInfo.label, width - 10, height - 8);
        }

        ctx.shadowBlur = 0;
        const innerGlowGradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.2,
            centerX, centerY, radius * 0.8
        );
        innerGlowGradient.addColorStop(0, 'rgba(255,255,255,0)');
        innerGlowGradient.addColorStop(1, 'rgba(255,255,255,0.02)');
        ctx.fillStyle = innerGlowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

    }, [displayValue, config, label, showLabel, statusInfo, status]);

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <canvas ref={canvasRef} />

            {showPercentage && (
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                        <FiTarget className="w-3 h-3 text-cyan-400" />
                        Score: {Math.round(value * 100)}%
                    </span>
                    <span className="text-gray-600">|</span>
                    <span
                        className="flex items-center gap-1"
                        style={{ color: mainColor }}
                    >
                        <FiAward className="w-3 h-3" />
                        {statusInfo?.label || (value >= 0.85 ? 'HIGH' : value >= 0.70 ? 'MEDIUM' : 'LOW')}
                    </span>
                </div>
            )}
        </div>
    );
};