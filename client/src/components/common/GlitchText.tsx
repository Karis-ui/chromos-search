import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlitchTextProps {
  children?: string;
  text?: string;
  className?: string;
  glitchInterval?: number;
  intensity?: number;
  color?: string;
  style?: React.CSSProperties;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  text,
  className = '',
  glitchInterval = 2000,
  intensity = 1,
  color = '#06b6d4',
  style,
}) => {
  const content = text ?? children ?? '';
  const [isGlitching, setIsGlitching] = useState(false);
  const [glitchText, setGlitchText] = useState(content);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const characters = '!@#$%^&*()_+-=[]{}|;:,.<>?/`~';

  const generateGlitch = () => {
    const chars = content.split('');
    const glitched = chars.map((char) => {
      if (Math.random() < 0.15 * intensity) {
        return characters[Math.floor(Math.random() * characters.length)];
      }
      return char;
    });
    return glitched.join('');
  };
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setGlitchText(content);
  }, [content]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsGlitching(true);
      setGlitchText(generateGlitch());

      timeoutRef.current = setTimeout(() => {
        setIsGlitching(false);
        setGlitchText(content);
      }, 150);
    }, glitchInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [children, glitchInterval, intensity]);

  return (
    <span className={`relative inline-block ${className}`} style={style}>
      <span className="relative z-10">{children}</span>

      <AnimatePresence>
        {isGlitching && (
          <>
            <motion.span
              className="absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.7, 0],
                x: [-4, 4, -4],
                y: [2, -2, 2],
                color: ['#ff0000', '#00ff00', '#0000ff'],
              }}
              transition={{ duration: 0.15, times: [0, 0.5, 1] }}
              style={{ color: '#ff0000' }}
            >
              {glitchText}
            </motion.span>

            <motion.span
              className="absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.5, 0],
                x: [2, -2, 2],
                y: [-1, 1, -1],
              }}
              transition={{ duration: 0.12, times: [0, 0.4, 1], delay: 0.03 }}
              style={{ color: '#00ff00' }}
            >
              {glitchText}
            </motion.span>

            <motion.span
              className="absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                x: [-1, 1, -1],
                y: [0, 2, 0],
              }}
              transition={{ duration: 0.1, times: [0, 0.3, 1], delay: 0.06 }}
              style={{ color: '#0000ff' }}
            >
              {glitchText}
            </motion.span>

            <motion.div
              className="absolute inset-0 z-[25] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.15, 0],
                top: ['10%', '50%', '90%'],
              }}
              transition={{ duration: 0.15, times: [0, 0.5, 1] }}
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
                height: '20%',
              }}
            />
          </>
        )}
      </AnimatePresence>

      <span
        className="absolute inset-0 z-0 blur-xl opacity-20"
        style={{ color }}
      >
        {children}
      </span>
    </span>
  );
};