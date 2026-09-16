import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

interface TypewriterTextProps {
    text: string | string[];
    speed?: number;
    delay?: number;
    cursor?: boolean;
    className?: string;
    onComplete?: () => void;
    loop?: boolean;
    typingDelay?: number;
    deleteDelay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    speed = 50,
    delay = 0,
    cursor = true,
    className = '',
    onComplete,
    loop = false,
    typingDelay = 100,
    deleteDelay = 1000,
}) => {
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const texts = Array.isArray(text) ? text : [text];
    const timeoutRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    useEffect(() => {
        const startTimeout = setTimeout(() => {
            setIsPaused(false);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [delay]);

    useEffect(() => {
        if (isPaused) return;

        const currentText = texts[currentIndex];

        if (!isDeleting) {
            if (displayText.length < currentText.length) {
                timeoutRef.current = setTimeout(() => {
                    setDisplayText(currentText.slice(0, displayText.length + 1));
                }, speed);
            } else {
                setIsComplete(true);
                onComplete?.();

                if (loop) {
                    timeoutRef.current = setTimeout(() => {
                        setIsDeleting(true);
                        setIsComplete(false);
                    }, deleteDelay);
                }
            }
        } else {
            if (displayText.length > 0) {
                timeoutRef.current = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, speed / 2);
            } else {
                setIsDeleting(false);
                setIsComplete(false);
                setCurrentIndex((prev) => (prev + 1) % texts.length);
                timeoutRef.current = setTimeout(() => {
                }, typingDelay);
            }
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [displayText, isDeleting, currentIndex, texts, speed, loop, deleteDelay, typingDelay, isPaused, onComplete]);

    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (isComplete && loop) {
            const glitchInterval = setInterval(() => {
                if (Math.random() < 0.05) {
                    setIsGlitching(true);
                    setTimeout(() => setIsGlitching(false), 50);
                }
            }, 1000);
            return () => clearInterval(glitchInterval);
        }
    }, [isComplete, loop]);

    return (
        <span className={`relative inline-flex items-center ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={displayText}
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        scale: isGlitching ? [1, 0.98, 1.02, 0.99, 1] : 1,
                    }}
                    transition={{ duration: 0.1 }}
                    className="relative"
                >
                    {displayText}

                    {isGlitching && (
                        <motion.span
                            className="absolute inset-0 text-red-500 mix-blend-difference"
                            animate={{
                                opacity: [0, 0.5, 0],
                                x: [-2, 2, -2],
                            }}
                            transition={{ duration: 0.1 }}
                        >
                            {displayText}
                        </motion.span>
                    )}
                </motion.span>
            </AnimatePresence>

            {cursor && (
                <motion.span
                    className="inline-block ml-0.5 text-cyan-400"
                    animate={{
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: 'circIn'
                    }}
                >
                    <FiCpu className="w-3 h-3" />
                </motion.span>
            )}

            <span
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(90deg, transparent 50%, rgba(6, 182, 212, 0.02) 50%)`,
                    backgroundSize: '200% 100%',
                    animation: isComplete ? 'none' : 'typing-shimmer 1s linear infinite',
                }}
            />
        </span>
    );
};