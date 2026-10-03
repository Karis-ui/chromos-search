import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX,
    FiUserPlus,
    FiCheck,
    FiShield,
    FiAlertTriangle,
    FiArrowRight,
    FiMail,
    FiZap,
    FiAward,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { ROUTES } from '../../constants/routes';
import type { UnifiedResult } from '../../api/endpoints/search';

interface ClaimProfileModalProps {
    result: UnifiedResult | null;
    isOpen: boolean;
    onClose: () => void;
    onClaimSuccess: () => void;
}

export const ClaimProfileModal: React.FC<ClaimProfileModalProps> = ({ result, isOpen, onClose, onClaimSuccess }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClose = useCallback(() => {
        if (isClaiming) return;
        setStep(1)
        onClose();
    }, [isClaiming, onClose]);

    const handleClaim = useCallback(async () => {
        if (!result) return;

        setIsClaiming(true);
        toast.loading('Processing claim...');

        try {
            await new Promise(res => setTimeout(res, 1000));
            toast.dismiss()

            setStep(2);

            await new Promise(res => setTimeout(res, 2000));

            toast.success('Claim submitted!');

            onClaimSuccess();

            setTimeout(() => {
                onClose();
                navigate(ROUTES.PROFILE(''));
            }, 1500);
        } catch (error) {
            toast.error('Failed to submit claim')
        } finally {
            setIsClaiming(false);
        }
    }, [onClaimSuccess]);

    const handleContinueSetup = useCallback(() => {
        navigate(ROUTES.CONSENT);
        onClose();
    }, [onClose, navigate]);

    if (!result || !isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-md pointer-events-auto">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-t-3xl animate-pulse" />

                            <div className="bg-gray-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
                                <button
                                    onClick={handleClose}
                                    disabled={isClaiming}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
                                >
                                    <FiX className="w-4 h-4 text-gray-400" />
                                </button>

                                <div className="p-6 sm:p-8">
                                    <AnimatePresence mode="wait">
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-5"
                                            >
                                                <div className="text-center">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 200 }}
                                                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center"
                                                    >
                                                        <FiUserPlus className="w-8 h-8 text-purple-400" />
                                                    </motion.div>

                                                    <h2 className="text-xl font-bold text-white mb-2">
                                                        <GlitchText glitchInterval={5000} intensity={0.3}>
                                                            Is This You?
                                                        </GlitchText>
                                                    </h2>
                                                    <p className="text-sm text-gray-400">
                                                        Claim this profile to control your identity on Chronos
                                                    </p>
                                                </div>

                                                <div className="relative aspect-square max-w-[200px] mx-auto rounded-2xl overflow-hidden border border-purple-500/20">
                                                    {result.thumbnail ? (
                                                        <img
                                                            src={result.thumbnail}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                                            <FiUserPlus className="w-12 h-12 text-gray-700" />
                                                        </div>
                                                    )}

                                                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-xl rounded-lg">
                                                        <div className="flex items-center justify-between text-[10px] font-mono">
                                                            <span className="text-gray-400">
                                                                {result.platform}
                                                            </span>
                                                            <span className="text-green-400 font-bold">
                                                                {(result.similarity * 100).toFixed(1)}% match
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                                                    <div className="flex items-start gap-2">
                                                        <FiShield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-gray-400 leading-relaxed">
                                                            By claiming, you take ownership of this profile. You
                                                            must verify your identity to proceed.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={handleClose}
                                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-gray-300 font-mono transition-colors"
                                                    >
                                                        Not Me
                                                    </button>
                                                    <button
                                                        onClick={() => setStep(2)}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-sm text-white font-semibold font-mono shadow-lg shadow-purple-500/25 transition-all"
                                                    >
                                                        Yes, Continue →
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="space-y-5"
                                            >
                                                <div className="text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                                        <FiShield className="w-6 h-6 text-cyan-400" />
                                                    </div>
                                                    <h2 className="text-lg font-bold text-white mb-1">
                                                        Identity Verification
                                                    </h2>
                                                    <p className="text-xs text-gray-400">
                                                        To prevent impersonation, we verify your identity
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    {[
                                                        {
                                                            icon: FiMail,
                                                            label: 'Upload a clear selfie',
                                                            detail: 'Matches the target photo',
                                                        },
                                                        {
                                                            icon: FiShield,
                                                            label: 'Verify your identity',
                                                            detail: 'Face match with the found post',
                                                        },
                                                        {
                                                            icon: FiAward,
                                                            label: 'Set up your profile',
                                                            detail: 'Control what appears in search',
                                                        },
                                                    ].map((item, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                                <item.icon className="w-4 h-4 text-cyan-400" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-white">
                                                                    {item.label}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-mono">
                                                                    {item.detail}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                                                    <div className="flex items-start gap-2">
                                                        <FiAlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-gray-400 leading-relaxed">
                                                            False claims will be reported. Only claim profiles
                                                            that genuinely belong to you.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={() => setStep(1)}
                                                        disabled={isClaiming}
                                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-gray-300 font-mono transition-colors disabled:opacity-50"
                                                    >
                                                        ← Back
                                                    </button>
                                                    <GradientButton
                                                        onClick={handleClaim}
                                                        loading={isClaiming}
                                                        loadingText="Verifying..."
                                                        variant="rainbow"
                                                        size="lg"
                                                        icon={<FiCheck />}
                                                        iconPosition="right"
                                                        className="flex-1"
                                                    >
                                                        Verify & Claim
                                                    </GradientButton>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-5 text-center"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: 'spring', stiffness: 200 }}
                                                    className="relative inline-flex w-20 h-20 mx-auto"
                                                >
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 blur-xl"
                                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/40">
                                                        <FiCheck className="w-10 h-10 text-white" strokeWidth={3} />
                                                    </div>
                                                </motion.div>

                                                <div>
                                                    <h2 className="text-xl font-bold text-white mb-1">
                                                        Claim Approved! 🎉
                                                    </h2>
                                                    <p className="text-sm text-gray-400">
                                                        You've taken ownership of this profile
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl text-left">
                                                    <p className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                                                        <FiZap className="w-3 h-3" />
                                                        WHAT'S NEXT
                                                    </p>
                                                    <ul className="space-y-1.5 text-[11px] text-gray-400">
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5" />
                                                            <span>Complete your profile setup</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5" />
                                                            <span>Add your photos and bio</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5" />
                                                            <span>Start earning rewards when found</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <GradientButton
                                                    onClick={handleContinueSetup}
                                                    variant="rainbow"
                                                    size="lg"
                                                    fullWidth
                                                    pulse
                                                    icon={<FiArrowRight />}
                                                    iconPosition="right"
                                                >
                                                    Continue Setup
                                                </GradientButton>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ClaimProfileModal;