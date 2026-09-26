import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { type BootLine, LINE_COLORS, getLinePrefix } from "./BootSequence";

interface TerminalLineProps {
    line: BootLine,
    onComplete?: () => void;
    autoStart?: boolean;
}
export const TerminalLine: React.FC<TerminalLineProps> = ({
    line, onComplete, autoStart = true
}) => {
    const [displayText, setDisplayText] = useState<string>('');
    const [, setisComplete] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [showCursor, setShowCursor] = useState(false);
    const color = LINE_COLORS[line.type];
    const prefix = getLinePrefix(line.type);
    const typeSpeed = line.typeSpeed ?? 15;

    useEffect(() => {
        if (!autoStart) return;
        if (line.type === 'blank') {
            setisComplete(true);
            onComplete?.();
            return;
        }

        if (line.type === "progress") {
            const duration = line.duration || 1000;
            const target = line.progress || 100;
            const steps = 30;
            const increment = target / steps;
            const interval = duration / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setisComplete(true);
                        onComplete?.();
                    }, 200);
                }
                setProgressValue(Math.round(current));
            }, interval);
            return () => clearInterval(timer)
        }

        if (typeSpeed === 0) {
            setDisplayText(line.text);
            setShowCursor(true);
            setTimeout(() => {
                setisComplete(true);
                onComplete?.();
            }, 200)
            return;
        }

        let index = 0;
        setShowCursor(true);

        const timer = setInterval(() => {
            if (index < line.text.length) {
                setDisplayText(line.text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
                setTimeout(() => {
                    setisComplete(true);
                    onComplete?.();
                }, 200);
            }
        }, typeSpeed);

        return () => clearInterval(timer);
    }, [line, autoStart, typeSpeed, onComplete]);

    if (line.type === 'blank') {
        return <div className="h-4" />;
    }

    if (line.type === 'progress') {
        const barLength = 30;
        const filled = Math.floor(progressValue / 100 * barLength);
        const empty = barLength - filled;

        return (
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs"
                style={{ color }}
            >
                <span>{line.text.replace('[Loading', '').replace('...]', '').trim() === '' ? '' : '  '}</span>
                <span className="font-mono">
                    {'['}
                    <span style={{ color: '#4ade80' }}>{'█'.repeat(filled)}</span>
                    <span style={{ color: '#374151' }}>{'░'.repeat(empty)}</span>
                    {']'}
                </span>
                <span className="ml-2 text-gray-400">
                    {Math.floor(progressValue)}%
                </span>
            </motion.div>
        );
    }

    if (line.type === 'ascii') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="text-xs whitespace-pre font-mono leading-tight"
                style={{ color }}
            >
                {line.text}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs whitespace-pre-wrap break-all leading-relaxed"
            style={{ color }}
        >
            {prefix}
            {displayText}
            {showCursor && (
                <motion.span
                    className="inline-block w-2 h-3 ml-0.5 align-middle"
                    style={{ backgroundColor: color }}
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
};