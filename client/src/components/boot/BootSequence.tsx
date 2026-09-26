import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

import { TerminalWindow } from './TerminalWindow';
import { TerminalLine } from './TerminalLine';
import { TerminalMatrix } from './TerminalMatrix';
import {
    BootLine,
    getWelcomeBootSequence,
    getNewUserBootSequence,
    getShortBootSequence,
} from './BootSequence';
import { ParticleBackground } from '../common/ParticleBackground';

export type BootSequenceType = 'welcome' | 'new_user' | 'short';
interface BootSequenceProps {
    username: string;
    role?: string;
    type: BootSequenceType;
    isNewUser?: boolean;
    onComplete?: () => void;
    minDuration?: number;
}

export const BootSequence: React.FC<BootSequenceProps> = ({
    username, role = 'user', type = 'welcome', isNewUser = false, onComplete, minDuration = 3000,
}) => {
    const lines = useMemo<BootLine[]>(() => {
        if (isNewUser) return getNewUserBootSequence(username);
        if (type === 'short') return getShortBootSequence(username);
        return getWelcomeBootSequence(username, role);
    }, [username, type, isNewUser, role]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [canSkip, setCanSkip] = useState(false);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const timer = setTimeout(() => setCanSkip(true), minDuration);
        return () => clearTimeout(timer);
    }, [minDuration]);

    const handleLineComplete = useCallback(() => {
        if (currentIndex < lines.length - 1) {
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
            }, 50);
        } else {
            setTimeout(() => {
                setIsComplete(true);
            }, 1000);
        }
    }, [currentIndex, lines.length, onComplete]);

    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                onComplete?.();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isComplete, onComplete]);

    const handleSkip = useCallback(() => {
        if (canSkip) {
            setCurrentIndex(lines.length);
            setIsComplete(true);
        }
    }, [canSkip, lines.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Space' || e.code === 'Enter' || e.key === ' ') {
                if (canSkip) {
                    e.preventDefault();
                    handleSkip();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSkip, canSkip]);

    const visibleLines = useMemo(() =>
        lines.slice(0, currentIndex + 1),
        [lines, currentIndex]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black"
                >
                    <ParticleBackground />

                    <TerminalMatrix opacity={0.12} />

                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(34, 211, 238, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
              `,
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <motion.div
                        className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.4), transparent)',
                        }}
                        animate={{ top: ['-2px', '100%'] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="relative w-full max-w-4xl max-h-[90vh] z-10">
                        <TerminalWindow
                            title={`chronos@boot:~/welcome`}
                            subTitle={`v3.0.0 • ${new Date().toLocaleTimeString('en-US', { hour12: false })}`}
                        >
                            {/* ── Terminal Content ── */}
                            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent pr-2">
                                {visibleLines.map((line, index) => (
                                    <TerminalLine
                                        key={index}
                                        line={line}
                                        autoStart={true}
                                        onComplete={
                                            index === visibleLines.length - 1
                                                ? handleLineComplete
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-cyan-500/10 flex items-center justify-between text-[9px] font-mono">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <motion.div
                                            className="w-1.5 h-1.5 rounded-full bg-green-400"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        <span className="text-green-400">ONLINE</span>
                                    </div>
                                    <span className="text-gray-700">|</span>
                                    <span className="text-cyan-400">
                                        {currentIndex + 1}/{lines.length}
                                    </span>
                                    <span className="text-gray-700">|</span>
                                    <span className="text-gray-600">
                                        {Math.floor((Date.now() - startTime) / 1000)}s
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600">
                                        {canSkip ? (
                                            <>
                                                Press{' '}
                                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-cyan-400">
                                                    ESC
                                                </kbd>{' '}
                                                to skip
                                            </>
                                        ) : (
                                            'Initializing...'
                                        )}
                                    </span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {canSkip && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        onClick={handleSkip}
                                        className="absolute top-3 right-20 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-[10px] text-cyan-400 font-mono transition-all"
                                    >
                                        SKIP →
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </TerminalWindow>

                        <motion.div
                            className="absolute -top-8 -left-8 text-cyan-500/20 pointer-events-none"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                            <FiCpu size={80} />
                        </motion.div>
                    </div>

                    {/* ── Loading Pulse (center) ── */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        animate={{ opacity: [0, 0.05, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-[120px]" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};