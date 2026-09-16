import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { HTMLMotionProps, Variants } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    variant?: 'light' | 'strong' | 'dark' | 'holographic' | 'neon' | 'cyber';
    hover?: boolean;
    hoverEffect?: 'lift' | 'glow' | 'scale' | 'tilt' | 'shine' | 'none';
    glow?: 'cyan' | 'purple' | 'pink' | 'green' | 'yellow' | 'none';
    glowIntensity?: 'low' | 'medium' | 'high';
    border?: boolean;
    borderGlow?: boolean;
    glassBlur?: number;
    glassOpacity?: number;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    withScanline?: boolean;
    withNoise?: boolean;
    animated?: boolean;
    animationDelay?: number;
    animationDuration?: number;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    variant = 'light',
    hover = true,
    hoverEffect = 'lift',
    glow = 'none',
    glowIntensity = 'medium',
    border = true,
    borderGlow = false,
    glassBlur = 20,
    glassOpacity = 0.08,
    rounded = '2xl',
    padding = 'md',
    withScanline = false,
    withNoise = false,
    animated = false,
    animationDelay = 0,
    animationDuration = 0.5,
    onClick,
    ...props
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateY = useSpring(x, { stiffness: 300, damping: 30 });

    const glowColors = {
        cyan: {
            light: 'rgba(34, 211, 238, 0.15)',
            medium: 'rgba(34, 211, 238, 0.25)',
            high: 'rgba(34, 211, 238, 0.4)',
            shadow: 'rgba(34, 211, 238, 0.1)',
            border: 'rgba(34, 211, 238, 0.2)',
            glow: '0 0 30px rgba(34, 211, 238, 0.15), 0 0 60px rgba(34, 211, 238, 0.05)',
        },
        purple: {
            light: 'rgba(168, 85, 247, 0.15)',
            medium: 'rgba(168, 85, 247, 0.25)',
            high: 'rgba(168, 85, 247, 0.4)',
            shadow: 'rgba(168, 85, 247, 0.1)',
            border: 'rgba(168, 85, 247, 0.2)',
            glow: '0 0 30px rgba(168, 85, 247, 0.15), 0 0 60px rgba(168, 85, 247, 0.05)',
        },
        pink: {
            light: 'rgba(236, 72, 153, 0.15)',
            medium: 'rgba(236, 72, 153, 0.25)',
            high: 'rgba(236, 72, 153, 0.4)',
            shadow: 'rgba(236, 72, 153, 0.1)',
            border: 'rgba(236, 72, 153, 0.2)',
            glow: '0 0 30px rgba(236, 72, 153, 0.15), 0 0 60px rgba(236, 72, 153, 0.05)',
        },
        green: {
            light: 'rgba(74, 222, 128, 0.15)',
            medium: 'rgba(74, 222, 128, 0.25)',
            high: 'rgba(74, 222, 128, 0.4)',
            shadow: 'rgba(74, 222, 128, 0.1)',
            border: 'rgba(74, 222, 128, 0.2)',
            glow: '0 0 30px rgba(74, 222, 128, 0.15), 0 0 60px rgba(74, 222, 128, 0.05)',
        },
        yellow: {
            light: 'rgba(250, 204, 21, 0.15)',
            medium: 'rgba(250, 204, 21, 0.25)',
            high: 'rgba(250, 204, 21, 0.4)',
            shadow: 'rgba(250, 204, 21, 0.1)',
            border: 'rgba(250, 204, 21, 0.2)',
            glow: '0 0 30px rgba(250, 204, 21, 0.15), 0 0 60px rgba(250, 204, 21, 0.05)',
        },
        none: {
            light: 'transparent',
            medium: 'transparent',
            high: 'transparent',
            shadow: 'transparent',
            border: 'rgba(255,255,255,0.05)',
            glow: 'none',
        },
    };

    const glowConfig = glowColors[glow];

    const variants = {
        light: {
            bg: `rgba(255, 255, 255, ${glassOpacity})`,
            border: 'rgba(255, 255, 255, 0.08)',
            shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            hover: 'hover:bg-white/15',
        },
        strong: {
            bg: `rgba(255, 255, 255, ${glassOpacity * 2})`,
            border: 'rgba(255, 255, 255, 0.15)',
            shadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
            hover: 'hover:bg-white/20',
        },
        dark: {
            bg: `rgba(10, 10, 20, ${glassOpacity * 1.5})`,
            border: 'rgba(255, 255, 255, 0.05)',
            shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            hover: 'hover:bg-white/5',
        },
        holographic: {
            bg: `rgba(255, 255, 255, ${glassOpacity * 0.5})`,
            border: 'rgba(255, 255, 255, 0.1)',
            shadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            hover: 'hover:bg-white/10',
        },
        neon: {
            bg: `rgba(0, 0, 0, ${glassOpacity * 1.5})`,
            border: 'rgba(255, 255, 255, 0.05)',
            shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            hover: 'hover:bg-white/5',
        },
        cyber: {
            bg: `rgba(0, 0, 0, ${glassOpacity * 2})`,
            border: 'rgba(34, 211, 238, 0.1)',
            shadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            hover: 'hover:bg-cyan-500/5',
        },
    };

    const variantConfig = variants[variant] || variants.light;

    const roundedMap = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
    };

    const paddingMap = {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8',
        xl: 'p-12',
    };

    useEffect(() => {
        const card = cardRef.current;
        if (!card || hoverEffect !== 'tilt') return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            setMousePosition({
                x: (x / rect.width) * 100,
                y: (y / rect.height) * 100,
            });

            const rotateXVal = ((y - centerY) / centerY) * -8;
            const rotateYVal = ((x - centerX) / centerX) * 8;
            rotateX.set(rotateXVal);
            rotateY.set(rotateYVal);
        };

        const handleMouseLeave = () => {
            rotateX.set(0);
            rotateY.set(0);
            setMousePosition({ x: 50, y: 50 });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [hoverEffect, rotateX, rotateY]);

    const hoverStyles = {
        lift: hover ? 'hover:-translate-y-1 hover:shadow-xl' : '',
        glow: hover ? 'hover:shadow-2xl' : '',
        scale: hover ? 'hover:scale-[1.02]' : '',
        tilt: '',
        shine: hover ? 'hover:shadow-2xl' : '',
        none: '',
    };

    const glowIntensityMap = {
        low: glowConfig.light,
        medium: glowConfig.medium,
        high: glowConfig.high,
    };

    const glowShadowIntensity = {
        low: 'shadow-lg',
        medium: 'shadow-xl',
        high: 'shadow-2xl',
    };

    const animationVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: animationDuration,
                delay: animationDelay,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
        hover: {
            y: -4,
            transition: {
                duration: 0.3,
                ease: 'easeOut',
            },
        },
    };

    const shineStyle = hoverEffect === 'shine' && isHovered ? {
        background: `radial-gradient(
      ellipse at ${mousePosition.x}% ${mousePosition.y}%,
      rgba(255,255,255,0.08) 0%,
      transparent 60%
    )`,
    } : {};

    const cardStyle = {
        background: variantConfig.bg,
        backdropFilter: `blur(${glassBlur}px)`,
        WebkitBackdropFilter: `blur(${glassBlur}px)`,
        borderColor: border ? (glow !== 'none' ? glowConfig.border : variantConfig.border) : 'transparent',
        boxShadow: borderGlow && glow !== 'none' ? glowConfig.glow : variantConfig.shadow,
        ...shineStyle,
    };

    const component = (
        <motion.div
            ref={cardRef}
            className={clsx(
                'relative transition-all duration-300',
                border && 'border',
                roundedMap[rounded],
                paddingMap[padding],
                hoverStyles[hoverEffect],
                glow !== 'none' && glowShadowIntensity[glowIntensity],
                variant === 'holographic' && 'bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5',
                variant === 'neon' && 'border-pink-500/10',
                variant === 'cyber' && 'border-cyan-500/10',
                withScanline && 'overflow-hidden',
                className
            )}
            style={cardStyle}
            variants={animationVariants}
            initial={animated ? 'hidden' : false}
            animate={animated ? 'visible' : false}
            whileHover={hover && hoverEffect !== 'tilt' && hoverEffect !== 'shine' ? 'hover' : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            {...props}
        >
            {variant === 'holographic' && (
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none"
                    style={{
                        background: `conic-gradient(
              from ${isHovered ? '45deg' : '0deg'} at ${mousePosition.x || 50}% ${mousePosition.y || 50}%,
              rgba(34,211,238,0.1) 0%,
              rgba(168,85,247,0.1) 25%,
              rgba(236,72,153,0.1) 50%,
              rgba(168,85,247,0.1) 75%,
              rgba(34,211,238,0.1) 100%
            )`,
                        transition: 'all 0.5s ease',
                    }}
                />
            )}

            {variant === 'neon' && glow !== 'none' && (
                <div
                    className="absolute -inset-1 rounded-[inherit] opacity-20 blur-xl pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at center, ${glowIntensityMap[glowIntensity]}, transparent 70%)`,
                    }}
                />
            )}

            {variant === 'cyber' && (
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-5"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '20px 20px',
                    }}
                />
            )}

            {glow !== 'none' && (
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 0.6 : 0.2,
                        boxShadow: `inset 0 0 60px ${glowIntensityMap[glowIntensity]}`,
                    }}
                />
            )}

            {withScanline && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.02) 2px,
                rgba(0,0,0,0.02) 4px
              )`,
                        }}
                    />
                    <motion.div
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                        animate={{
                            top: ['-2px', '100%'],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                </div>
            )}

            {withNoise && (
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
                    }}
                />
            )}

            {borderGlow && glow !== 'none' && (
                <motion.div
                    className="absolute -inset-px rounded-[inherit] pointer-events-none"
                    animate={{
                        opacity: isHovered ? [0.3, 0.8, 0.3] : 0.1,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        border: `1px solid ${glowIntensityMap[glowIntensity]}`,
                    }}
                />
            )}

            {hoverEffect === 'shine' && isHovered && (
                <div
                    className="absolute -inset-px rounded-[inherit] pointer-events-none"
                    style={{
                        background: `radial-gradient(
              ellipse at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(255,255,255,0.1) 0%,
              transparent 60%
            )`,
                    }}
                />
            )}

            {glow !== 'none' && (
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[inherit] pointer-events-none"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${glowIntensityMap[glowIntensity]}, transparent)`,
                    }}
                />
            )}

            {glow !== 'none' && (
                <div
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-[inherit] pointer-events-none"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${glowIntensityMap[glowIntensity]}, transparent)`,
                    }}
                />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );

    return component;
};