import type { Variants } from 'framer-motion';
import type { AnimationVariant } from '../types/ui.types';

export const easings = {
    linear: [0, 0, 1, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    circIn: [0.6, 0.04, 0.98, 0.335],
    circOut: [0.075, 0.82, 0.165, 1],
    circInOut: [0.785, 0.135, 0.15, 0.86],
    backIn: [0.6, -0.28, 0.735, 0.045],
    backOut: [0.175, 0.885, 0.32, 1.275],
    backInOut: [0.68, -0.55, 0.265, 1.55],
    anticipation: [0.36, 0, 0.66, -0.56],
} as const;

export const springConfigs = {
    gentle: { type: 'spring', stiffness: 120, damping: 14 },
    snappy: { type: 'spring', stiffness: 400, damping: 30 },
    bouncy: { type: 'spring', stiffness: 300, damping: 10 },
    wobbly: { type: 'spring', stiffness: 180, damping: 12 },
    stiff: { type: 'spring', stiffness: 500, damping: 40 },
    slow: { type: 'spring', stiffness: 80, damping: 20 },
    molasses: { type: 'spring', stiffness: 50, damping: 20 },
} as const;

export const durationPresets = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    medium: 0.5,
    slow: 0.8,
    glacial: 1.5,
} as const;

export const delayPresets = {
    none: 0,
    tiny: 0.05,
    short: 0.1,
    medium: 0.2,
    long: 0.3,
    dramatic: 0.5,
} as const;


export const FRAMER_VARIANTS: Record<AnimationVariant, Variants> = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    },
    slide: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    },
    glitch: {
        hidden: { opacity: 0, x: -10, skewX: 5 },
        visible: { opacity: 1, x: 0, skewX: 0 },
        exit: { opacity: 0, x: 10, skewX: -5 },
    },
    cyber: {
        hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
        exit: { opacity: 0, clipPath: 'inset(0 0 0 100%)' },
    },
    neon: {
        hidden: { opacity: 0, filter: 'brightness(0)' },
        visible: { opacity: 1, filter: 'brightness(1)' },
        exit: { opacity: 0, filter: 'brightness(2)' },
    },
    holographic: {
        hidden: { opacity: 0, rotateY: 90 },
        visible: { opacity: 1, rotateY: 0 },
        exit: { opacity: 0, rotateY: -90 },
    },
    matrix: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    },
    explode: {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.5 },
    },
    morph: {
        hidden: { opacity: 0, borderRadius: '0%' },
        visible: { opacity: 1, borderRadius: '12px' },
        exit: { opacity: 0, borderRadius: '50%' },
    },
    blur: {
        hidden: { opacity: 0, filter: 'blur(8px)' },
        visible: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(8px)' },
    },
    rotate: {
        hidden: { opacity: 0, rotate: -180 },
        visible: { opacity: 1, rotate: 0 },
        exit: { opacity: 0, rotate: 180 },
    },
    flip: {
        hidden: { opacity: 0, rotateX: 90 },
        visible: { opacity: 1, rotateX: 0 },
        exit: { opacity: 0, rotateX: -90 },
    },
    bounce: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    },
    stagger: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    },
};


export const createTransition = (duration = 0.3, delay = 0, easing = easings.easeOut) => ({
    duration,
    delay,
    ease: easing,
});

export const staggerChildren = (staggerDelay = 0.1, delayChildren = 0) => ({
    staggerChildren: staggerDelay,
    delayChildren,
});

export const fadeIn = (duration = 0.3, delay = 0): Variants => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, delay } },
});

export const fadeOut = (duration = 0.3, delay = 0): Variants => ({
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration, delay } },
});

export const slideIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up', duration = 0.3): Variants => {
    const offsets = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };
    return {
        hidden: { opacity: 0, ...offsets[direction] },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration } },
    };
};

export const slideOut = (direction: 'up' | 'down' | 'left' | 'right' = 'up', duration = 0.3): Variants => {
    const offsets = {
        up: { y: -20 },
        down: { y: 20 },
        left: { x: -20 },
        right: { x: 20 },
    };
    return {
        visible: { opacity: 1, x: 0, y: 0 },
        exit: { opacity: 0, ...offsets[direction], transition: { duration } },
    };
};

export const scaleIn = (duration = 0.3): Variants => ({
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration } },
});

export const scaleOut = (duration = 0.3): Variants => ({
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration } },
});

export const createSpring = (stiffness = 300, damping = 30) => ({
    type: 'spring' as const,
    stiffness,
    damping,
});

export const createKeyframe = (values: number[], duration = 1, repeat = 0) => ({
    values,
    transition: {
        duration,
        repeat,
        ease: 'easeInOut' as const,
    },
});


export const ANIMATIONS = {
    buttonHover: {
        scale: 1.02,
        transition: springConfigs.snappy,
    },
    buttonTap: {
        scale: 0.98,
        transition: springConfigs.stiff,
    },
    cardHover: {
        y: -4,
        transition: springConfigs.gentle,
    },
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
    glow: {
        opacity: [0.3, 0.6, 0.3],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
    float: {
        y: [-5, 5, -5],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
    shake: {
        x: [-2, 2, -2, 2, 0],
        transition: {
            duration: 0.3,
        },
    },
} as const;

export const TRANSITIONS = {
    fast: { duration: 0.15 },
    normal: { duration: 0.3 },
    slow: { duration: 0.5 },
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
} as const;

export const DURATIONS = {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    dramatic: 1200,
} as const;

export const EASING = easings;