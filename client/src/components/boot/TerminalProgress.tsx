import React, { useEffect, useState } from "react";

interface TerminalProgressProps {
    label: string;
    duration: number;
    onComplete?: () => void;
    barColor?: string;
}

export const TerminalProgress: React.FC<TerminalProgressProps> = ({ label, duration, onComplete, barColor = '#4ade80' }) => {

    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const steps = 40;
        const interval = duration / steps;
        const increment = 100 / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= 100) {
                clearInterval(timer);
                setTimeout(() => onComplete?.(), 200);
            }
            setProgress(current);
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete, duration]);

    const barLength = 40;
    const filled = Math.floor((progress / 100) * barLength);
    const empty = barLength - filled;

    return (
        <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-500">{label}</span>
            <span>
                [
                <span style={{ color: barColor }}>
                    {'█'.repeat(filled)}
                </span>
                <span className="text-gray-700">
                    {'░'.repeat(empty)}
                </span>
                ]
            </span>
            <span className="text-gray-400 tabular-nums w-10 text-right">
                {Math.floor(progress)}%
            </span>
        </div>
    );
}