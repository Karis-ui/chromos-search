import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiCpu,
    FiShield,
    FiZap,
    FiAlertCircle,
    FiCheckCircle,
    FiGithub,
    FiGlobe,
    FiWifi,
    FiActivity,
} from 'react-icons/fi';
import { FaFingerprint } from 'react-icons/fa';
import { GradientButton } from '../components/common/GradientButton';
import { GlitchText } from '../components/common/GlitchText';
import { NeonBorder } from '../components/common/NeonBorder';
import { CyberGrid } from '../components/common/CyberGrid';
import { Scanline } from '../components/common/Scanline';
import { ParticleBackground } from '../components/common/ParticleBackground';
import { TypewriterText } from '../components/common/TypewriterText';
import { AnimatedContainer } from '../components/common/AnimatedContainer';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';
import { APP_CONFIG } from '../constants/config';
import { LIMITS } from '../constants/config';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(LIMITS.auth.passwordMinLength, 'Password is too short').max(LIMITS.auth.passwordMaxLength, `Password must be at least ${LIMITS.auth.passwordMinLength} characters`),
    rememberMe: z.boolean().optional(),
});
type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, isAuthenticated } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState<'email' | 'password' | null>(null);
    const [submitAttempts, setSubmitAttempts] = useState(0);
    const [systemTime, setSystemTime] = useState(new Date());

    const emailInputRef = useRef<HTMLInputElement>(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        watch,
    } = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        shouldFocusError: true,
    });
    const watchedEmail = watch('email');
    const matchedPassword = watch('password');
    const passwordStrength = React.useMemo(() => {
        if (!matchedPassword) return 0;
        let strenth = 0;
        if (matchedPassword.length >= LIMITS.auth.passwordMinLength) strenth += 25;
        if (/[A-Z]/.test(matchedPassword)) strenth += 25;
        if (/[0-9]/.test(matchedPassword)) strenth += 25;
        if (/[!@#$%^&*]/.test(matchedPassword)) strenth += 25;
        return strenth;
    }, [matchedPassword]);
    const passwordLevel = React.useMemo(() => {
        if (passwordStrength < 25) return 'weak';
        if (passwordStrength < 50) return 'medium';
        if (passwordStrength < 75) return 'strong';
        return 'very_strong';
    }, [passwordStrength]);

    const getStrengthColor = () => {
        switch (passwordLevel) {
            case 'weak': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'strong': return 'bg-green-500';
            case 'very_strong': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };
    const getStrengthLabel = () => {
        switch (passwordLevel) {
            case 'weak': return 'weak';
            case 'medium': return 'medium';
            case 'strong': return 'strong';
            case 'very_strong': return 'very_strong';
            default: return 'weak';
        }
    };
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const parallaxX = useTransform(springX, [-1, 1], [-15, 15]);
    const parallaxY = useTransform(springY, [-1, 1], [-15, 15]);

    useEffect(() => {
        const interval = setInterval(() => setSystemTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || ROUTES.HOME;
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);


    useEffect(() => {
        const timer = setTimeout(() => emailInputRef.current?.focus(), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        },
        [mouseX, mouseY]
    );

    const onSubmit = useCallback(
        async (data: LoginFormData) => {
            setSubmitAttempts((prev) => prev + 1);

            const success = await login(data.email, data.password);

            if (success) {
                const from = (location.state as any)?.from?.pathname || ROUTES.HOME;
                navigate(from, { replace: true });
            }
        },
        [login, navigate, location]
    );

    return (
        <div
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden"
        >
            <ParticleBackground />
            <CyberGrid animated speed={0.3} />
            <Scanline color="#06b6d4" intensity={0.3} />

            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
                    x: parallaxX,
                    y: parallaxY,
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                    x: useTransform(springX, [-1, 1], [15, -15]),
                    y: useTransform(springY, [-1, 1], [15, -15]),
                }}
            />

            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
                <AnimatedContainer animation="slide" className="max-w-lg">
                    <div className="flex items-center gap-4 mb-8">
                        <motion.div
                            className="relative w-16 h-16"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                                <FiCpu className="text-white text-3xl" />
                            </div>
                            <motion.div
                                className="absolute -inset-2 rounded-3xl border-2 border-cyan-400/30"
                                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold shimmer-text">
                                {APP_CONFIG.name}
                            </h1>
                            <p className="text-sm text-gray-500 font-mono">
                                v{APP_CONFIG.version}
                            </p>
                        </div>
                    </div>

                    <GlitchText
                        className="text-4xl font-bold text-white mb-4 leading-tight"
                        glitchInterval={4000}
                        intensity={0.6}
                    >
                        DIGITAL ECHO LOCATOR
                    </GlitchText>

                    <TypewriterText
                        text="Search the past 6 months. Find anyone. Anywhere."
                        speed={40}
                        className="text-lg text-gray-400 mb-8"
                        cursor={true}
                        loop={false}
                    />

                    <div className="space-y-4">
                        {[
                            { icon: FiShield, label: 'Military-Grade Security', desc: 'JWT + 2FA protected' },
                            { icon: FiZap, label: 'Real-Time Biometrics', desc: 'Face + Voice recognition' },
                            { icon: FiGlobe, label: '12 Social Platforms', desc: 'Comprehensive search' },
                            { icon: FiActivity, label: 'Instant Results', desc: 'Sub-5 second search' },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + idx * 0.15 }}
                                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20">
                                    <feature.icon className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{feature.label}</p>
                                    <p className="text-xs text-gray-500 font-mono">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center gap-6 text-xs text-gray-500 font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span>SYSTEM ONLINE</span>
                        </div>
                        <span className="text-gray-700">|</span>
                        <span>{systemTime.toLocaleTimeString('en-US', { hour12: false })}</span>
                        <span className="text-gray-700">|</span>
                        <span className="flex items-center gap-1">
                            <FiWifi className="w-3 h-3" />
                            SECURE
                        </span>
                    </div>
                </AnimatedContainer>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
                <AnimatedContainer
                    animation="scale"
                    delay={0.2}
                    className="w-full max-w-md"
                >
                    <NeonBorder color="cyan" intensity="medium" animationSpeed={0.6}>
                        <div className="p-6 sm:p-8">
                            <div className="text-center mb-8">
                                <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                                        <FiCpu className="text-white text-2xl" />
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">
                                    <GlitchText glitchInterval={5000}>Access Terminal</GlitchText>
                                </h2>
                                <p className="text-sm text-gray-500 font-mono">
                                    Enter your credentials to continue
                                </p>

                                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <FaFingerprint className="w-3 h-3 text-green-400" />
                                    <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider">
                                        Secure Connection
                                    </span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-400 font-mono">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                        <FiMail className="w-3 h-3 text-cyan-400" />
                                        EMAIL ADDRESS
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('email')}
                                            ref={(e) => {
                                                register('email').ref(e);
                                                (emailInputRef as any).current = e;
                                            }}
                                            type="email"
                                            autoComplete="email"
                                            placeholder="operator@chronos.io"
                                            onFocus={() => setIsFocused('email')}
                                            onBlur={() => setIsFocused(null)}
                                            className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600
                        focus:outline-none transition-all font-mono
                        ${errors.email
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : isFocused === 'email'
                                                        ? 'border-cyan-400/50 focus:border-cyan-400 shadow-lg shadow-cyan-500/10'
                                                        : 'border-white/10 hover:border-white/20 focus:border-cyan-400/50'
                                                }
                      `}
                                            disabled={isLoading || isSubmitting}
                                        />

                                        {watchedEmail && !errors.email && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <FiCheckCircle className="w-4 h-4 text-green-400" />
                                            </motion.div>
                                        )}
                                    </div>

                                    <AnimatePresence>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-[10px] text-red-400 font-mono mt-1.5 flex items-center gap-1"
                                            >
                                                <FiAlertCircle className="w-3 h-3" />
                                                {errors.email.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                        <FiLock className="w-3 h-3 text-purple-400" />
                                        PASSWORD
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            placeholder="••••••••••••"
                                            onFocus={() => setIsFocused('password')}
                                            onBlur={() => setIsFocused(null)}
                                            className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600
                        focus:outline-none transition-all font-mono
                        ${errors.password
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : isFocused === 'password'
                                                        ? 'border-purple-400/50 focus:border-purple-400 shadow-lg shadow-purple-500/10'
                                                        : 'border-white/10 hover:border-white/20 focus:border-purple-400/50'
                                                }
                      `}
                                            disabled={isLoading || isSubmitting}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? (
                                                <FiEyeOff className="w-4 h-4" />
                                            ) : (
                                                <FiEye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {matchedPassword && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center justify-between text-[10px] font-mono">
                                                <span className="text-gray-500">STRENGTH</span>
                                                <span style={{ color: getStrengthColor() }}>
                                                    {getStrengthLabel()}
                                                </span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${passwordStrength}%` }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{ backgroundColor: getStrengthColor() }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {errors.password && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-[10px] text-red-400 font-mono mt-1.5 flex items-center gap-1"
                                            >
                                                <FiAlertCircle className="w-3 h-3" />
                                                {errors.password.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            {...register('rememberMe')}
                                            type="checkbox"
                                            className="sr-only peer"
                                        />
                                        <div className="relative w-9 h-5 bg-white/10 rounded-full transition-all peer-checked:bg-cyan-500/30 border border-white/10 peer-checked:border-cyan-400/50">
                                            <motion.div
                                                className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-gray-400 rounded-full peer-checked:bg-cyan-400"
                                                animate={{
                                                    left: watch('rememberMe') ? 'calc(100% - 18px)' : '2px',
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono group-hover:text-white transition-colors">
                                            Remember me
                                        </span>
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <GradientButton
                                    type="submit"
                                    variant="rainbow"
                                    size="lg"
                                    fullWidth
                                    disabled={!isValid || isLoading || isSubmitting}
                                    loading={isLoading || isSubmitting}
                                    loadingText="Authenticating..."
                                    pulse={isValid && !isLoading}
                                    icon={<FiArrowRight />}
                                    iconPosition="right"
                                >
                                    Access System
                                </GradientButton>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-[10px] font-mono">
                                    <span className="px-3 bg-gray-950/90 text-gray-500 uppercase tracking-wider">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm text-gray-300"
                                >
                                    <FiGithub className="w-4 h-4" />
                                    <span className="font-mono text-xs">GitHub</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm text-gray-300"
                                >
                                    <FiGlobe className="w-4 h-4" />
                                    <span className="font-mono text-xs">Google</span>
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 font-mono">
                                    New to Chronos?{' '}
                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>

                            {submitAttempts >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                                >
                                    <p className="text-[10px] text-yellow-400 font-mono flex items-center gap-2">
                                        <FiAlertCircle className="w-3 h-3" />
                                        Multiple failed attempts. Account may be temporarily locked.
                                    </p>
                                </motion.div>
                            )}

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
                                    <span>© {new Date().getFullYear()} {APP_CONFIG.name}</span>
                                    <div className="flex items-center gap-3">
                                        <a href="#" className="hover:text-gray-400 transition-colors">
                                            Privacy
                                        </a>
                                        <a href="#" className="hover:text-gray-400 transition-colors">
                                            Terms
                                        </a>
                                        <a href="#" className="hover:text-gray-400 transition-colors">
                                            Help
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </NeonBorder>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono">
                        <FiShield className="w-3 h-3 text-green-400" />
                        <span>End-to-end encrypted • TLS 1.3 • AES-256</span>
                    </div>
                </AnimatedContainer>
            </div>
        </div>
    );
};

export default LoginPage;