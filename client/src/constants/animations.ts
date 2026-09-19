export const DURATIONS = {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    moderate: 0.35,
    slow: 0.5,
    slower: 0.75,
    slowest: 1.0,

    hover: 0.15,
    tap: 0.1,
    fade: 0.25,
    slide: 0.3,
    scale: 0.2,
    pageTransition: 0.4,
    modalOpen: 0.3,
    modalClose: 0.2,
    toast: 0.25,
    tooltip: 0.15,
    sidebar: 0.3,
    drawer: 0.35,
} as const;

export const EASING = {
    linear: [0, 0, 1, 1],

    ease: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],

    standard: [0.4, 0, 0.2, 1],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
    sharp: [0.4, 0, 0.6, 1],

    emphasized: [0.2, 0, 0, 1],
    emphasizedDecelerate: [0.05, 0.7, 0.1, 1],
    emphasizedAccelerate: [0.3, 0, 0.8, 0.15],

    backOut: [0.34, 1.56, 0.64, 1],
    backIn: [0.36, 0, 0.66, -0.56],
    backInOut: [0.68, -0.6, 0.32, 1.6],
    circOut: [0, 0.55, 0.45, 1],
    circIn: [0.55, 0, 1, 0.45],
    circInOut: [0.85, 0, 0.15, 1],

    cyber: [0.16, 1, 0.3, 1],
    cyberSnap: [0.19, 1, 0.22, 1],
    cyberSmooth: [0.4, 0, 0.2, 1],

    expoOut: [0.19, 1, 0.22, 1],
    expoIn: [0.95, 0.05, 0.795, 0.035],
    expoInOut: [1, 0, 0, 1],
} as const;

export const TRANSITIONS = {
    default: {
        duration: DURATIONS.normal,
        ease: EASING.easeInOut,
    },

    fast: {
        duration: DURATIONS.fast,
        ease: EASING.easeOut,
    },

    slow: {
        duration: DURATIONS.slow,
        ease: EASING.easeInOut,
    },

    fade: {
        duration: DURATIONS.fade,
        ease: EASING.easeOut,
    },

    fadeIn: {
        duration: DURATIONS.fade,
        ease: EASING.easeOut,
    },

    fadeOut: {
        duration: DURATIONS.fast,
        ease: EASING.easeIn,
    },

    slide: {
        duration: DURATIONS.slide,
        ease: EASING.cyber,
    },

    slideLeft: {
        duration: DURATIONS.slide,
        ease: EASING.cyber,
    },

    slideRight: {
        duration: DURATIONS.slide,
        ease: EASING.cyber,
    },

    slideUp: {
        duration: DURATIONS.slide,
        ease: EASING.cyber,
    },

    slideDown: {
        duration: DURATIONS.slide,
        ease: EASING.cyber,
    },

    scale: {
        duration: DURATIONS.scale,
        ease: EASING.backOut,
    },

    pop: {
        duration: DURATIONS.scale,
        ease: EASING.backOut,
    },

    spring: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        mass: 1,
    },

    springSoft: {
        type: 'spring' as const,
        stiffness: 180,
        damping: 22,
        mass: 1,
    },

    springSnappy: {
        type: 'spring' as const,
        stiffness: 450,
        damping: 35,
        mass: 0.8,
    },

    springBouncy: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 18,
        mass: 1,
    },

    springGentle: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 18,
        mass: 1,
    },

    springHeavy: {
        type: 'spring' as const,
        stiffness: 250,
        damping: 40,
        mass: 2,
    },

    layout: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
    },

    hover: {
        duration: DURATIONS.hover,
        ease: EASING.easeOut,
    },

    tap: {
        duration: DURATIONS.tap,
        ease: EASING.easeOut,
    },

    pageTransition: {
        duration: DURATIONS.pageTransition,
        ease: EASING.cyber,
    },

    modalOpen: {
        duration: DURATIONS.modalOpen,
        ease: EASING.cyberSnap,
    },

    modalClose: {
        duration: DURATIONS.modalClose,
        ease: EASING.easeIn,
    },

    staggered: (index: number, base = 0.05) => ({
        duration: DURATIONS.normal,
        ease: EASING.cyber,
        delay: index * base,
    }),

    delayed: (delay: number, base: keyof typeof TRANSITIONS = 'default') =>
        ({ ...(TRANSITIONS[base] as any), delay }),
} as const;

export const SPRING_CONFIGS = {
    default: { stiffness: 300, damping: 30, mass: 1 },
    soft: { stiffness: 180, damping: 22, mass: 1 },
    snappy: { stiffness: 450, damping: 35, mass: 0.8 },
    bouncy: { stiffness: 500, damping: 18, mass: 1 },
    gentle: { stiffness: 120, damping: 18, mass: 1 },
    heavy: { stiffness: 250, damping: 40, mass: 2 },
    precise: { stiffness: 400, damping: 40, mass: 0.5 },

    parallax: { stiffness: 50, damping: 20, mass: 0.5 },
    parallaxSlow: { stiffness: 30, damping: 25, mass: 1 },
    parallaxFast: { stiffness: 80, damping: 15, mass: 0.5 },

    counter: { stiffness: 60, damping: 20 },
    gauge: { stiffness: 80, damping: 25 },
} as const;

export const FRAMER_VARIANTS = {
    fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: TRANSITIONS.fade },
        exit: { opacity: 0, transition: TRANSITIONS.fadeOut },
    },

    fadeInUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: TRANSITIONS.slideUp },
        exit: { opacity: 0, y: 20, transition: TRANSITIONS.fadeOut },
    },

    fadeInDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: TRANSITIONS.slideDown },
        exit: { opacity: 0, y: -20, transition: TRANSITIONS.fadeOut },
    },

    fadeInLeft: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: TRANSITIONS.slideLeft },
        exit: { opacity: 0, x: -20, transition: TRANSITIONS.fadeOut },
    },

    fadeInRight: {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: TRANSITIONS.slideRight },
        exit: { opacity: 0, x: 20, transition: TRANSITIONS.fadeOut },
    },

    scaleIn: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: TRANSITIONS.scale },
        exit: { opacity: 0, scale: 0.9, transition: TRANSITIONS.fadeOut },
    },

    popIn: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 500, damping: 18 },
        },
        exit: { opacity: 0, scale: 0.8, transition: TRANSITIONS.fadeOut },
    },

    modal: {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: TRANSITIONS.modalOpen },
        exit: { opacity: 0, scale: 0.95, y: 10, transition: TRANSITIONS.modalClose },
    },

    backdrop: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: TRANSITIONS.fade },
        exit: { opacity: 0, transition: TRANSITIONS.fadeOut },
    },

    drawerRight: {
        hidden: { x: '100%' },
        visible: { x: 0, transition: TRANSITIONS.slide },
        exit: { x: '100%', transition: TRANSITIONS.slide },
    },

    drawerLeft: {
        hidden: { x: '-100%' },
        visible: { x: 0, transition: TRANSITIONS.slide },
        exit: { x: '-100%', transition: TRANSITIONS.slide },
    },

    toast: {
        hidden: { opacity: 0, y: -20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: TRANSITIONS.springSnappy },
        exit: { opacity: 0, y: -20, scale: 0.95, transition: TRANSITIONS.fadeOut },
    },

    staggerContainer: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
        exit: { opacity: 0, transition: TRANSITIONS.fadeOut },
    },

    staggerContainerFast: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03,
                delayChildren: 0.05,
            },
        },
        exit: { opacity: 0, transition: TRANSITIONS.fadeOut },
    },

    staggerItem: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: TRANSITIONS.springSoft },
        exit: { opacity: 0, y: 20, transition: TRANSITIONS.fadeOut },
    },

    page: {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: TRANSITIONS.pageTransition },
        exit: { opacity: 0, y: -8, transition: TRANSITIONS.fadeOut },
    },

    listItem: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    },

    collapse: {
        hidden: { height: 0, opacity: 0 },
        visible: { height: 'auto', opacity: 1, transition: TRANSITIONS.slide },
        exit: { height: 0, opacity: 0, transition: TRANSITIONS.fadeOut },
    },

    neonPulse: {
        hidden: { opacity: 0.6, scale: 1 },
        visible: {
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.02, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    },

    scanline: {
        hidden: { y: '-100%' },
        visible: {
            y: '100%',
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
            },
        },
    },
} as const;

export const ANIMATIONS = {
    pulse: {
        scale: [1, 1.05, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },

    pulseSlow: {
        scale: [1, 1.03, 1],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },

    heartbeat: {
        scale: [1, 1.15, 1, 1.15, 1],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },

    rotate: {
        rotate: 360,
        transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },

    rotateSlow: {
        rotate: 360,
        transition: { duration: 6, repeat: Infinity, ease: 'linear' },
    },

    rotateReverse: {
        rotate: -360,
        transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },

    float: {
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },

    floatSlow: {
        y: [0, -6, 0],
        transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
    },

    glow: {
        opacity: [0.6, 1, 0.6],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },

    flicker: {
        opacity: [1, 0.8, 1, 0.9, 1, 0.7, 1],
        transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },

    shimmer: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: { duration: 3, repeat: Infinity, ease: 'linear' },
    },

    marqueeX: {
        x: ['0%', '-50%'],
        transition: { duration: 20, repeat: Infinity, ease: 'linear' },
    },

    marqueeY: {
        y: ['0%', '-50%'],
        transition: { duration: 20, repeat: Infinity, ease: 'linear' },
    },

    bounce: {
        y: [0, -12, 0],
        transition: { duration: 0.6, repeat: Infinity, ease: 'easeOut' },
    },

    bounceSlow: {
        y: [0, -8, 0],
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
} as const;

export type Duration = keyof typeof DURATIONS;
export type EasingName = keyof typeof EASING;
export type TransitionName = keyof typeof TRANSITIONS;
export type SpringConfigName = keyof typeof SPRING_CONFIGS;
export type VariantName = keyof typeof FRAMER_VARIANTS;
export type AnimationName = keyof typeof ANIMATIONS;