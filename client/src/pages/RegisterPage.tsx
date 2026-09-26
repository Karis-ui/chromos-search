import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiUser,
    FiCheck,
    FiX,
    FiAlertCircle,
    FiCheckCircle,
    FiArrowRight,
    FiArrowLeft,
    FiCpu,
    FiShield,
    FiZap,
    FiGlobe,
    FiActivity,
    FiUsers,
    FiStar,
    FiGift,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
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
import { APP_CONFIG, LIMITS } from '../constants/config';
import OAuthButtons from '../components/auth/OAuthButtons';

const registerSchema = z
    .object({
        email: z.string().min(1, "Email is required").email("Invalid email address"),
        username: z.string().min(LIMITS.auth.usernameMinLength, `Username must be at least ${LIMITS.auth.usernameMinLength} characters`)
            .max(LIMITS.auth.usernameMaxLength, `Username must be at most ${LIMITS.auth.usernameMaxLength} characters`)
            .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Username must start with a letter and contain only letters, numbers, and underscores'),
        full_name: z.string().optional(),
        password: z
            .string()
            .min(LIMITS.auth.passwordMinLength, `Password must be at least ${LIMITS.auth.passwordMinLength} characters`)
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
        confirmPassword: z.string().min(1, "Confirm password is required"),
        acceptTerms: z.boolean().refine((value) => value === true, "You must accept the Terms of Service"),
    })
    .refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register: registerUser, isLoading, error, isAuthenticated } = useAuth();
    const [, setSystemTime] = useState(new Date());
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register, handleSubmit, formState: { errors, isValid, isSubmitting }, watch, trigger
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: "", username: "", full_name: "", password: "", confirmPassword: "", acceptTerms: false },
        mode: "onChange"
    });
    const watchedPassword = watch('password');
    const watchedUsername = watch('username');
    const watchedEmail = watch('email');

    const passwordRequirements = useMemo(() => {
        const pwd = watchedPassword || '';
        return {
            minLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasDigit: /[0-9]/.test(pwd),
            hasSpecial: /[^A-Za-z0-9]/.test(pwd),
        }
    }, [watchedPassword]);
    const passwordStrength = useMemo(() => {
        return Object.values(passwordRequirements).filter(Boolean).length * 20;
    }, [passwordRequirements]);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
    const parallaxX = useTransform(springX, [-1, 1], [-15, 15]);
    const parallaxY = useTransform(springY, [-1, 1], [-15, 15]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(ROUTES.HOME, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const interval = setInterval(() => { setSystemTime(new Date()); }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
        mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const goToStep2 = useCallback(async () => {
        const valid = await trigger(['email', 'username', 'full_name']);
        if (valid) {
            setStep(2);
        }
    }, [trigger]);

    const gotoStep1 = useCallback(() => {
        setStep(1);
    }, []);

    const onSubmit = useCallback(async (data: RegisterFormValues) => {
        const success = await registerUser({
            email: data.email,
            username: data.username,
            password: data.password,
            full_name: data.full_name,
            acceptTerms: data.acceptTerms
        });

        if (success) {
            toast.success("Welcome to Chronos! Please login to continue");
            navigate(ROUTES.LOGIN);
        }
    }, [registerUser, navigate]);

    const getStrengthLabel = useCallback((): string => {
        if (passwordStrength < 20) return "TOO WEAK";
        if (passwordStrength < 50) return "WEAK";
        if (passwordStrength < 80) return "MEDIUM";
        if (passwordStrength < 100) return "STRONG";
        return "VERY STRONG";
    }, [passwordStrength]);

    const getStrengthColor = useCallback(() => {
        if (passwordStrength < 20) return "text-red-400";
        if (passwordStrength < 50) return "text-yellow-400";
        if (passwordStrength < 80) return "text-blue-400";
        if (passwordStrength < 100) return "text-green-400";
        return "text-purple-400";
    }, [passwordStrength]);

    const Requirement = ({ met, label }: { met: boolean; label: string }) => (
        <div className="flex items-center gap-2 text-[10px] font-mono">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${met ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/5 border border-white/10'
                }`}>
                {met ? (
                    <FiCheck className="w-2 h-2 text-green-400" />
                ) : (
                    <FiX className="w-2 h-2 text-gray-600" />
                )}
            </div>
            <span className={met ? 'text-green-400' : 'text-gray-500'}>{label}</span>
        </div>
    );

    return (
        <div
            onMouseMove={handleMouseMove}
            className="relative min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden"
        >
            {/* ═══ BACKGROUND EFFECTS ═══ */}
            <ParticleBackground />
            <CyberGrid animated speed={0.3} />
            <Scanline color="#a855f7" intensity={0.3} />

            <motion.div
                className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                    x: parallaxX,
                    y: parallaxY,
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
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-2xl shadow-pink-500/50">
                                <FiCpu className="text-white text-3xl" />
                            </div>
                        </motion.div>
                        <div>
                            <h1 className="text-3xl font-bold shimmer-text">Join Chronos</h1>
                            <p className="text-sm text-gray-500 font-mono">Create your account</p>
                        </div>
                    </div>

                    <GlitchText
                        className="text-3xl font-bold text-white mb-4 leading-tight"
                        glitchInterval={4000}
                        intensity={0.5}
                    >
                        UNLOCK THE POWER OF SEARCH
                    </GlitchText>

                    <TypewriterText
                        text="Join thousands of investigators, journalists, and researchers."
                        speed={40}
                        className="text-lg text-gray-400 mb-8"
                        cursor={true}
                        loop={false}
                    />

                    <div className="space-y-3">
                        {[
                            { icon: FiZap, label: 'Unlimited Searches', desc: 'Premium tier included', highlight: true },
                            { icon: FiShield, label: 'Advanced Biometrics', desc: 'Face + Voice + Hybrid' },
                            { icon: FiGlobe, label: 'All 12 Platforms', desc: 'Instagram, TikTok, Twitter+' },
                            { icon: FiActivity, label: 'Real-Time Analytics', desc: 'Live data visualization' },
                            { icon: FiGift, label: 'Free 14-Day Trial', desc: 'No credit card required', highlight: true },
                        ].map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                                className={`flex items-center gap-4 p-3 rounded-xl backdrop-blur-xl transition-all ${benefit.highlight
                                    ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20'
                                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${benefit.highlight
                                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30'
                                    : 'bg-white/5 border-white/10'
                                    }`}>
                                    <benefit.icon className={`w-5 h-5 ${benefit.highlight ? 'text-cyan-400' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${benefit.highlight ? 'text-white' : 'text-gray-300'}`}>
                                        {benefit.label}
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">{benefit.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                            { value: '10K+', label: 'Users' },
                            { value: '1M+', label: 'Searches' },
                            { value: '99.9%', label: 'Uptime' },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-xl font-bold shimmer-text">{stat.value}</p>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </AnimatedContainer>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
                <AnimatedContainer animation="scale" delay={0.2} className="w-full max-w-md">
                    <NeonBorder color="purple" intensity="medium" animationSpeed={0.6}>
                        <div className="p-6 sm:p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    <GlitchText glitchInterval={5000}>Create Account</GlitchText>
                                </h2>

                                <div className="flex items-center justify-center gap-3 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400' : 'bg-white/5 border-2 border-white/10 text-gray-600'
                                            }`}>
                                            1
                                        </div>
                                        <span className={`text-[10px] font-mono ${step >= 1 ? 'text-cyan-400' : 'text-gray-600'}`}>
                                            IDENTITY
                                        </span>
                                    </div>

                                    <div className={`w-12 h-0.5 rounded transition-all ${step >= 2 ? 'bg-cyan-400' : 'bg-white/10'}`} />

                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-400' : 'bg-white/5 border-2 border-white/10 text-gray-600'
                                            }`}>
                                            2
                                        </div>
                                        <span className={`text-[10px] font-mono ${step >= 2 ? 'text-purple-400' : 'text-gray-600'}`}>
                                            SECURITY
                                        </span>
                                    </div>
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
                            <div className='mb-6'>
                                <OAuthButtons layout='grid' mode='login' />
                            </div>
                            <div className='relative my-6'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-white/5'></div>
                                </div>
                                <div className='relative flex justify-center text-[10px] uppercase tracking-wider'>
                                    <span className='px-2 bg-gray-950 backdrop-blur-sm text-gray-600'>
                                        or sign up with Email
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                                    <FiMail className="w-3 h-3 text-cyan-400" />
                                                    EMAIL ADDRESS
                                                </label>
                                                <input
                                                    {...register('email')}
                                                    type="email"
                                                    autoComplete="email"
                                                    placeholder="operator@chronos.io"
                                                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600
                            focus:outline-none focus:border-cyan-400/50 transition-all font-mono
                            ${errors.email ? 'border-red-500/50' : 'border-white/10'}
                          `}
                                                    disabled={isLoading}
                                                />
                                                {errors.email && (
                                                    <p className="text-[10px] text-red-400 font-mono mt-1.5 flex items-center gap-1">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        {errors.email.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                                    <FiUser className="w-3 h-3 text-cyan-400" />
                                                    USERNAME
                                                </label>
                                                <input
                                                    {...register('username')}
                                                    type="text"
                                                    autoComplete="username"
                                                    placeholder="cyber_operator"
                                                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600
                            focus:outline-none focus:border-cyan-400/50 transition-all font-mono
                            ${errors.username ? 'border-red-500/50' : 'border-white/10'}
                          `}
                                                    disabled={isLoading}
                                                />
                                                {errors.username && (
                                                    <p className="text-[10px] text-red-400 font-mono mt-1.5 flex items-center gap-1">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        {errors.username.message}
                                                    </p>
                                                )}
                                                {watchedUsername && !errors.username && (
                                                    <p className="text-[10px] text-green-400 font-mono mt-1.5 flex items-center gap-1">
                                                        <FiCheckCircle className="w-3 h-3" />
                                                        Username available
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                                    <FiUsers className="w-3 h-3 text-cyan-400" />
                                                    FULL NAME <span className="text-gray-600">(optional)</span>
                                                </label>
                                                <input
                                                    {...register('full_name')}
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600
                            focus:outline-none focus:border-cyan-400/50 transition-all font-mono"
                                                    disabled={isLoading}
                                                />
                                            </div>

                                            <GradientButton
                                                type="button"
                                                variant="cyan"
                                                size="lg"
                                                fullWidth
                                                onClick={goToStep2}
                                                disabled={!watchedEmail || !watchedUsername}
                                                icon={<FiArrowRight />}
                                                iconPosition="right"
                                            >
                                                Continue
                                            </GradientButton>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                                    <FiLock className="w-3 h-3 text-purple-400" />
                                                    PASSWORD
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        {...register('password')}
                                                        type={showPassword ? 'text' : 'password'}
                                                        autoComplete="new-password"
                                                        placeholder="••••••••••••"
                                                        className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600
                              focus:outline-none focus:border-purple-400/50 transition-all font-mono
                              ${errors.password ? 'border-red-500/50' : 'border-white/10'}
                            `}
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                                    </button>
                                                </div>

                                                {watchedPassword && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                                            <span className="text-gray-500">STRENGTH</span>
                                                            <span style={{ color: getStrengthColor() }}>
                                                                {getStrengthLabel()}
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${passwordStrength}%` }}
                                                                transition={{ duration: 0.3 }}
                                                                style={{ backgroundColor: getStrengthColor() }}
                                                            />
                                                        </div>

                                                        {/* Requirements */}
                                                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                                                            <Requirement met={passwordRequirements.minLength} label="8+ chars" />
                                                            <Requirement met={passwordRequirements.hasUppercase} label="Uppercase" />
                                                            <Requirement met={passwordRequirements.hasLowercase} label="Lowercase" />
                                                            <Requirement met={passwordRequirements.hasDigit} label="Number" />
                                                            <Requirement met={passwordRequirements.hasSpecial} label="Special" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-mono text-gray-400 mb-2 flex items-center gap-2">
                                                    <FiLock className="w-3 h-3 text-purple-400" />
                                                    CONFIRM PASSWORD
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        {...register('confirmPassword')}
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        autoComplete="new-password"
                                                        placeholder="••••••••••••"
                                                        className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white text-sm placeholder-gray-600
                              focus:outline-none focus:border-purple-400/50 transition-all font-mono
                              ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'}
                            `}
                                                        disabled={isLoading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {errors.confirmPassword && (
                                                    <p className="text-[10px] text-red-400 font-mono mt-1.5 flex items-center gap-1">
                                                        <FiAlertCircle className="w-3 h-3" />
                                                        {errors.confirmPassword.message}
                                                    </p>
                                                )}
                                            </div>

                                            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                                <input
                                                    {...register('acceptTerms')}
                                                    type="checkbox"
                                                    className="mt-0.5 w-4 h-4 rounded bg-white/5 border-white/20 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                                                />
                                                <span className="text-xs text-gray-400 font-mono leading-relaxed">
                                                    I agree to the{' '}
                                                    <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
                                                    {' '}and{' '}
                                                    <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
                                                </span>
                                            </label>
                                            {errors.acceptTerms && (
                                                <p className="text-[10px] text-red-400 font-mono flex items-center gap-1">
                                                    <FiAlertCircle className="w-3 h-3" />
                                                    {errors.acceptTerms.message}
                                                </p>
                                            )}

                                            <div className="flex gap-3">
                                                <GradientButton
                                                    type="button"
                                                    variant="ghost"
                                                    size="lg"
                                                    onClick={gotoStep1}
                                                    disabled={isLoading}
                                                    icon={<FiArrowLeft />}
                                                >
                                                    Back
                                                </GradientButton>

                                                <GradientButton
                                                    type="submit"
                                                    variant="rainbow"
                                                    size="lg"
                                                    fullWidth
                                                    disabled={!isValid || isLoading || isSubmitting}
                                                    loading={isLoading || isSubmitting}
                                                    loadingText="Creating account..."
                                                    pulse={isValid}
                                                    icon={<FiStar />}
                                                    iconPosition="right"
                                                >
                                                    Create Account
                                                </GradientButton>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 font-mono">
                                    Already have an account?{' '}
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-[9px] text-gray-600 font-mono">
                                    <span>© {new Date().getFullYear()} {APP_CONFIG.name}</span>
                                    <span className="flex items-center gap-1">
                                        <FiShield className="w-3 h-3 text-green-400" />
                                        Secure Registration
                                    </span>
                                </div>
                            </div>
                        </div>
                    </NeonBorder>
                </AnimatedContainer>
            </div>
        </div>
    );
};

export default RegisterPage;