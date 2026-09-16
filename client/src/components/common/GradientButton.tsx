import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { FiLoader, FiCheck, FiX } from 'react-icons/fi';

interface GradientButtonProps extends HTMLMotionProps<'button'> {
    children: React.ReactNode;
    className?: string;
    variant?: 'cyan' | 'purple' | 'pink' | 'rainbow' | 'holographic' | 'matrix' | 'neon' | 'ghost';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    loading?: boolean;
    loadingText?: string;
    success?: boolean;
    successText?: string;
    error?: boolean;
    errorText?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    glow?: boolean;
    glowIntensity?: 'low' | 'medium' | 'high';
    pulse?: boolean;
    shimmer?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    children,
    className = '',
    variant = 'cyan',
    size = 'md',
    loading = false,
    loadingText = 'Processing...',
    success = false,
    successText = 'Success!',
    error = false,
    errorText = 'Failed',
    disabled = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    glow = true,
    glowIntensity = 'medium',
    pulse = false,
    shimmer = false,
    onClick,
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleIdRef = useRef(0);

    // ── Mouse tracking for glow effect ──
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

    const sizeMap = {
        xs: { padding: 'px-2 py-1', text: 'text-[10px]', gap: 'gap-1', height: 'h-7', iconSize: 'w-3 h-3' },
        sm: { padding: 'px-3 py-1.5', text: 'text-xs', gap: 'gap-1.5', height: 'h-9', iconSize: 'w-3.5 h-3.5' },
        md: { padding: 'px-5 py-2.5', text: 'text-sm', gap: 'gap-2', height: 'h-11', iconSize: 'w-4 h-4' },
        lg: { padding: 'px-7 py-3.5', text: 'text-base', gap: 'gap-2.5', height: 'h-13', iconSize: 'w-5 h-5' },
        xl: { padding: 'px-9 py-4.5', text: 'text-lg', gap: 'gap-3', height: 'h-15', iconSize: 'w-6 h-6' },
    };

    const config = sizeMap[size] || sizeMap.md;

    const variantStyles = {
        cyan: {
            gradient: 'from-cyan-400 via-cyan-500 to-cyan-600',
            hover: 'hover:from-cyan-300 hover:via-cyan-400 hover:to-cyan-500',
            active: 'active:from-cyan-600 active:via-cyan-700 active:to-cyan-800',
            shadow: 'shadow-cyan-500/25',
            glow: 'shadow-cyan-500/40',
            text: 'text-white',
            border: 'border-cyan-400/20',
            bg: 'bg-cyan-500/10',
        },
        purple: {
            gradient: 'from-purple-400 via-purple-500 to-purple-600',
            hover: 'hover:from-purple-300 hover:via-purple-400 hover:to-purple-500',
            active: 'active:from-purple-600 active:via-purple-700 active:to-purple-800',
            shadow: 'shadow-purple-500/25',
            glow: 'shadow-purple-500/40',
            text: 'text-white',
            border: 'border-purple-400/20',
            bg: 'bg-purple-500/10',
        },
        pink: {
            gradient: 'from-pink-400 via-pink-500 to-pink-600',
            hover: 'hover:from-pink-300 hover:via-pink-400 hover:to-pink-500',
            active: 'active:from-pink-600 active:via-pink-700 active:to-pink-800',
            shadow: 'shadow-pink-500/25',
            glow: 'shadow-pink-500/40',
            text: 'text-white',
            border: 'border-pink-400/20',
            bg: 'bg-pink-500/10',
        },
        rainbow: {
            gradient: 'from-cyan-400 via-purple-400 via-pink-400 to-cyan-400',
            hover: 'hover:from-cyan-300 hover:via-purple-300 hover:via-pink-300 hover:to-cyan-300',
            active: 'active:from-cyan-600 active:via-purple-600 active:via-pink-600 active:to-cyan-600',
            shadow: 'shadow-purple-500/25',
            glow: 'shadow-purple-500/40',
            text: 'text-white',
            border: 'border-white/20',
            bg: 'bg-white/5',
        },
        holographic: {
            gradient: 'from-cyan-300 via-blue-400 via-purple-400 to-pink-400',
            hover: 'hover:from-cyan-200 hover:via-blue-300 hover:via-purple-300 hover:to-pink-300',
            active: 'active:from-cyan-500 active:via-blue-600 active:via-purple-600 active:to-pink-600',
            shadow: 'shadow-cyan-500/20',
            glow: 'shadow-cyan-500/30',
            text: 'text-white',
            border: 'border-white/10',
            bg: 'bg-white/5',
        },
        matrix: {
            gradient: 'from-green-400 via-emerald-500 to-green-600',
            hover: 'hover:from-green-300 hover:via-emerald-400 hover:to-green-500',
            active: 'active:from-green-600 active:via-emerald-700 active:to-green-800',
            shadow: 'shadow-green-500/25',
            glow: 'shadow-green-500/40',
            text: 'text-green-100',
            border: 'border-green-400/20',
            bg: 'bg-green-500/10',
        },
        neon: {
            gradient: 'from-pink-500 via-purple-500 to-indigo-500',
            hover: 'hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400',
            active: 'active:from-pink-700 active:via-purple-700 active:to-indigo-700',
            shadow: 'shadow-pink-500/25',
            glow: 'shadow-pink-500/40',
            text: 'text-white',
            border: 'border-pink-400/20',
            bg: 'bg-pink-500/10',
        },
        ghost: {
            gradient: 'from-transparent via-transparent to-transparent',
            hover: 'hover:from-white/5 hover:via-white/10 hover:to-white/5',
            active: 'active:from-white/10 active:via-white/20 active:to-white/10',
            shadow: 'shadow-none',
            glow: 'shadow-none',
            text: 'text-gray-300 hover:text-white',
            border: 'border-white/10 hover:border-white/20',
            bg: 'bg-transparent',
        },
    };

    const style = variantStyles[variant] || variantStyles.cyan;

    const glowIntensities = {
        low: 'shadow-lg',
        medium: 'shadow-xl',
        high: 'shadow-2xl',
    };

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = rippleIdRef.current++;
        setRipples(prev => [...prev, { x, y, id }]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== id));
        }, 600);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;
        handleRipple(e);
        onClick?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x);
        mouseY.set(y);
    };

    const shimmerStyle = shimmer ? {
        backgroundSize: '200% 100%',
        animation: 'shimmer 3s ease-in-out infinite',
    } : {};

    const pulseAnimation = pulse ? {
        scale: [1, 1.02, 1],
    } : {};

    const getStateIcon = () => {
        if (success) return <FiCheck className={config.iconSize} />;
        if (error) return <FiX className={config.iconSize} />;
        if (loading) return <FiLoader className={`${config.iconSize} animate-spin`} />;
        return icon;
    };

    const getStateText = () => {
        if (success) return successText;
        if (error) return errorText;
        if (loading) return loadingText;
        return children;
    };

    const showState = success || error;

    return (
        <motion.button
            ref={buttonRef}
            className={clsx(
                'relative rounded-xl font-semibold transition-all duration-200',
                'flex items-center justify-center',
                'bg-gradient-to-r bg-size-200 hover:bg-pos-right',
                'border',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                fullWidth && 'w-full',
                config.padding,
                config.text,
                config.gap,
                config.height,
                style.gradient,
                style.hover,
                style.active,
                style.text,
                style.border,
                !showState && (glow ? glowIntensities[glowIntensity] : ''),
                (glow && variant !== 'ghost') && style.glow,
                isHovered && !disabled && !loading && 'scale-[1.02]',
                isPressed && !disabled && !loading && 'scale-[0.98]',
                className
            )}
            style={shimmerStyle}
            animate={pulseAnimation}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
            {...props}
        >
            {glow && variant !== 'ghost' && (
                <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${springX.get() * 100}% ${springY.get() * 100}%, ${variant === 'cyan' ? 'rgba(34,211,238,0.15)' : variant === 'purple' ? 'rgba(168,85,247,0.15)' : variant === 'pink' ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.05)'} 0%, transparent 60%)`,
                    }}
                />
            )}

            {glow && variant !== 'ghost' && isHovered && (
                <div
                    className="absolute -inset-0.5 rounded-xl opacity-50 blur-sm pointer-events-none"
                    style={{
                        background: `linear-gradient(135deg, ${variant === 'cyan' ? 'rgba(34,211,238,0.3)' : variant === 'purple' ? 'rgba(168,85,247,0.3)' : variant === 'pink' ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.1)'}, transparent)`,
                    }}
                />
            )}

            <span className="relative z-10 flex items-center gap-2">
                {iconPosition === 'left' && getStateIcon() && (
                    <span className="flex-shrink-0">{getStateIcon()}</span>
                )}

                <span className="relative">
                    {getStateText()}
                    {shimmer && (
                        <span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-size-200 animate-shimmer"
                            style={{ backgroundSize: '200% 100%' }}
                        />
                    )}
                </span>

                {iconPosition === 'right' && getStateIcon() && (
                    <span className="flex-shrink-0">{getStateIcon()}</span>
                )}
            </span>

            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: ripple.x - 10,
                        top: ripple.y - 10,
                        width: 20,
                        height: 20,
                        background: variant === 'ghost' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                    }}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 6, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            ))}

            {loading && (
                <div className="absolute inset-0 rounded-xl bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                </div>
            )}

            {showState && (
                <motion.div
                    className={`absolute inset-0 rounded-xl flex items-center justify-center ${success ? 'bg-green-500/20' : 'bg-red-500/20'} backdrop-blur-[2px]`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                >
                    <div className="flex items-center gap-2">
                        {getStateIcon()}
                        <span className={success ? 'text-green-300' : 'text-red-300'}>
                            {getStateText()}
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.button>
    );
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  .bg-size-200 {
    background-size: 200% 100%;
  }
  
  .bg-pos-right {
    background-position: right center;
  }
`;
document.head.appendChild(styleSheet);