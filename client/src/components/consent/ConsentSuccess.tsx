import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
    FiCheck,
    FiUser,
    FiCamera,
    FiDollarSign,
    FiArrowRight,
    FiShare2,
    FiCopy,
    FiZap,
    FiStar,
    FiAward,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { useConsentStore } from '../../store/consentStore';
import { ROUTES } from '../../constants/routes';
import { useNavigate } from 'react-router-dom';

interface ConsentSuccessProps {
    onFinish?: () => void;
}

export const ConsentSuccess: React.FC<ConsentSuccessProps> = ({ onFinish }) => {
    const { profile, resetWizard } = useConsentStore();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999
        };

        const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;
        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = Math.min(50, Math.floor(20 * (timeLeft / duration)));
            confetti(
                {
                    ...defaults,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    particleCount,
                    colors: ['#06b6d4', '#a855f7', '#ec4899']
                }
            );
            confetti({
                ...defaults,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                particleCount,
                colors: ['#06b6d4', '#a855f7', '#ec4899']
            });
        }, 250);
        return () => clearInterval(interval);
    }, []);

    const handleCopyUrl = async () => {
        const url = `https://chronos.io/p/${profile?.id || 'me'}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('URL copied to clipboard')
        } catch (error) {
            toast.error('Failed to copy URL')
        }
    };

    const handleFinish = () => {
        resetWizard();
        onFinish?.();
        navigate(ROUTES.HOME);
    };

    return (
        <div className="space-y-6 text-center">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                }}
                className="relative inline-flex items-center justify-center w-24 h-24 mx-auto"
            >
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-2xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
                    <FiCheck className="w-12 h-12 text-white" strokeWidth={3} />
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-green-400"
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-green-400"
                        animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                    <GlitchText glitchInterval={5000} intensity={0.5}>
                        YOU'RE LIVE! 🎉
                    </GlitchText>
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Welcome to Chronos. You are now searchable. Anyone with your photo can
                    find and contact you.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4"
            >
                {[
                    {
                        icon: FiUser,
                        label: 'Profile',
                        value: 'Live',
                        color: '#22c55e',
                    },
                    {
                        icon: FiCamera,
                        label: 'Face Photos',
                        value: `${profile?.face_count || 0}`,
                        color: '#06b6d4',
                    },
                    {
                        icon: FiDollarSign,
                        label: 'Earnings',
                        value: '$0.00',
                        color: '#eab308',
                    },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                        <GlassCard variant="dark" padding="md" className="text-center">
                            <div
                                className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`,
                                    border: `1px solid ${stat.color}30`,
                                }}
                            >
                                <stat.icon
                                    className="w-5 h-5"
                                    style={{ color: stat.color }}
                                />
                            </div>
                            <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                {stat.label}
                            </p>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <GlassCard variant="light" padding="md" className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <FiShare2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            Share Your Profile
                        </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-black/30 rounded-xl border border-white/5">
                        <span className="text-xs text-cyan-400 font-mono truncate flex-1">
                            chronos.io/p/{profile?.id?.slice(0, 8) || 'me'}
                        </span>
                        <button
                            onClick={handleCopyUrl}
                            className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {copied ? (
                                <FiCheck className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                                <FiCopy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                        </button>
                    </div>
                </GlassCard>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl text-left"
            >
                <p className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <FiZap className="w-3 h-3" />
                    WHAT'S NEXT
                </p>
                <ul className="space-y-1.5 text-xs text-gray-400">
                    <li className="flex items-start gap-2">
                        <FiStar className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span>Add more photos to improve matching accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <FiAward className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>Verify your identity for the blue checkmark</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <FiDollarSign className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Start earning rewards when you're found</span>
                    </li>
                </ul>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="pt-4"
            >
                <GradientButton
                    onClick={handleFinish}
                    variant="rainbow"
                    size="lg"
                    pulse
                    fullWidth
                    icon={<FiArrowRight />}
                    iconPosition="right"
                >
                    Go to Dashboard
                </GradientButton>
            </motion.div>
        </div>
    );
};

export default ConsentSuccess;