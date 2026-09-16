import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { HTMLMotionProps, Variants, } from 'framer-motion';

interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    animation?:
    | 'fade'
    | 'slide'
    | 'scale'
    | 'glitch'
    | 'cyber'
    | 'neon'
    | 'holographic'
    | 'matrix'
    | 'explode'
    | 'morph'
    | 'blur'
    | 'rotate'
    | 'flip'
    | 'bounce'
    | 'stagger';
    delay?: number;
    duration?: number;
    staggerChildren?: boolean;
    staggerDelay?: number;
    staggerDirection?: 'forward' | 'reverse' | 'random';
    triggerOnce?: boolean;
    threshold?: number;
    amount?: 'some' | 'all' | number;
    onComplete?: () => void;
    onEnter?: () => void;
    onExit?: () => void;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
    children,
    className = '',
    animation = 'fade',
    delay = 0,
    duration = 0.5,
    staggerChildren = false,
    staggerDelay = 0.08,
    staggerDirection = 'forward',
    triggerOnce = true,
    threshold = 0.1,
    amount = 0.2,
    onComplete,
    onEnter,
    onExit,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const isInView = useInView(containerRef, {
        once: triggerOnce,
        amount: typeof amount === 'number' ? amount : amount === 'all' ? 1 : 0.2,
    });
    useEffect(() => {
        if (isInView && !hasAnimated) {
            setHasAnimated(true);
            onEnter?.();
        }
        if (!isInView && hasAnimated) {
            onExit?.();
        }
    }, [isInView, hasAnimated, onEnter, onExit]);

    const animationVariants: Record<string, Variants> = {
        fade: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { duration, delay, ease: 'easeOut' },
            },
        },
        slide: {
            hidden: { opacity: 0, y: 30 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration,
                    delay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: {
                opacity: 1,
                scale: 1,
                transition: {
                    duration,
                    delay,
                    ease: [0.34, 1.56, 0.64, 1],
                },
            },
        },
        glitch: {
            hidden: {
                opacity: 0,
                x: -20,
                skewX: 10,
                filter: 'blur(4px)',
            },
            visible: {
                opacity: 1,
                x: 0,
                skewX: 0,
                filter: 'blur(0px)',
                transition: {
                    duration: duration * 1.2,
                    delay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            },
        },
        cyber: {
            hidden: {
                opacity: 0,
                clipPath: 'inset(0 100% 0 0)',
                filter: 'brightness(0)',
            },
            visible: {
                opacity: 1,
                clipPath: 'inset(0 0% 0 0)',
                filter: 'brightness(1)',
                transition: {
                    duration: duration * 1.5,
                    delay,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            },
        },
        neon: {
            hidden: {
                opacity: 0,
                textShadow: '0 0 0px rgba(34,211,238,0)',
                filter: 'blur(2px) brightness(0.5)',
            },
            visible: {
                opacity: 1,
                textShadow: '0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1)',
                filter: 'blur(0px) brightness(1)',
                transition: {
                    duration: duration * 1.2,
                    delay,
                    ease: 'easeOut',
                },
            },
        },
        holographic: {
            hidden: {
                opacity: 0,
                scale: 0.95,
                rotateY: 10,
                filter: 'blur(2px) hue-rotate(0deg)',
            },
            visible: {
                opacity: 1,
                scale: 1,
                rotateY: 0,
                filter: 'blur(0px) hue-rotate(0deg)',
                transition: {
                    duration: duration * 1.5,
                    delay,
                    ease: [0.34, 1.56, 0.64, 1],
                },
            },
        },
        matrix: {
            hidden: {
                opacity: 0,
                y: -20,
                color: '#00ff41',
                textShadow: '0 0 0px rgba(0,255,65,0)',
            },
            visible: {
                opacity: 1,
                y: 0,
                color: '#00ff41',
                textShadow: '0 0 20px rgba(0,255,65,0.3), 0 0 40px rgba(0,255,65,0.1)',
                transition: {
                    duration: duration * 1.2,
                    delay,
                    ease: 'easeOut',
                },
            },
        },
        explode: {
            hidden: {
                opacity: 0,
                scale: 0.8,
                rotate: -10,
                filter: 'blur(4px)',
            },
            visible: {
                opacity: 1,
                scale: 1,
                rotate: 0,
                filter: 'blur(0px)',
                transition: {
                    type: 'spring',
                    damping: 12,
                    stiffness: 100,
                    delay,
                },
            },
        },
        morph: {
            hidden: {
                opacity: 0,
                borderRadius: '0%',
                scale: 0.8,
            },
            visible: {
                opacity: 1,
                borderRadius: '12px',
                scale: 1,
                transition: {
                    duration: duration * 1.5,
                    delay,
                    ease: [0.34, 1.56, 0.64, 1],
                },
            },
        },
        blur: {
            hidden: { opacity: 0, filter: 'blur(8px)' },
            visible: {
                opacity: 1,
                filter: 'blur(0px)',
                transition: { duration: duration * 1.2, delay, ease: 'easeOut' },
            },
        },
        rotate: {
            hidden: { opacity: 0, rotateY: 90 },
            visible: {
                opacity: 1,
                rotateY: 0,
                transition: {
                    duration: duration * 1.2,
                    delay,
                    ease: [0.34, 1.56, 0.64, 1],
                },
            },
        },
        flip: {
            hidden: { opacity: 0, rotateX: 90 },
            visible: {
                opacity: 1,
                rotateX: 0,
                transition: {
                    duration: duration * 1.2,
                    delay,
                    ease: [0.34, 1.56, 0.64, 1],
                },
            },
        },
        bounce: {
            hidden: { opacity: 0, y: 50 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    type: 'spring',
                    damping: 10,
                    stiffness: 80,
                    delay,
                },
            },
        },
        stagger: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay,
                    delayChildren: delay,
                },
            },
        },
    };

    const variant = animationVariants[animation] || animationVariants.fade;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
                staggerDirection: staggerDirection === 'forward' ? 1 : staggerDirection === 'reverse' ? -1 : 0,
                delayChildren: delay,
            },
        },
    };

    const childVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 15,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                damping: 15,
                stiffness: 100,
            },
        },
    };

    if (staggerChildren) {
        return (
            <motion.div
                ref={containerRef}
                className={className}
                variants={containerVariants}
                initial="hidden"
                animate={isInView || !triggerOnce ? 'visible' : 'hidden'}
                onAnimationComplete={onComplete}
                {...props}
            >
                {React.Children.map(children, (child) => (
                    <motion.div
                        variants={childVariants}
                        style={{
                            opacity: 0,
                            y: 15,
                        }}
                    >
                        {child}
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={containerRef}
            className={className}
            variants={variant}
            initial="hidden"
            animate={isInView || !triggerOnce ? 'visible' : 'hidden'}
            onAnimationComplete={onComplete}
            {...props}
        >
            {children}
        </motion.div>
    );
};