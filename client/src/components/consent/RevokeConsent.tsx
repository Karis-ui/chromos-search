import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiAlertTriangle,
    FiX,
    FiEyeOff,
    FiTrash2,
    FiShield,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useConsent } from '../../hooks/useConsent';

interface RevokeConsentProps {
    isOpen: boolean;
    onClose: () => void;
}

const REVOKE_REASONS = [
    { id: 'privacy', label: 'I want more privacy' },
    { id: 'no-benefit', label: "I'm not getting value from it" },
    { id: 'harassment', label: 'I was contacted too much' },
    { id: 'temporary', label: 'Just want a temporary break' },
    { id: 'other', label: 'Other reason' },
];

export const RevokeConsent: React.FC<RevokeConsentProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const { revokeConsent, isRevoking } = useConsent();

    const handleRevoke = useCallback(async () => {
        if (confirmText !== 'REVOKE') {
            toast.error('Please type REVOKE to confirm');
            return;
        }
        try {
            await revokeConsent(selectedReason);
            onClose();
        } catch (error) {

        }
    }, [confirmText, selectedReason]);

    const handleClose = useCallback(() => {
        setStep(1);
        setSelectedReason('');
        setConfirmText('');
        onClose();
    }, [onClose]);

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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-md pointer-events-auto">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-t-3xl animate-pulse" />

                            <div className="bg-gray-950 border border-red-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/20">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
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
                                                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center"
                                                    >
                                                        <FiAlertTriangle className="w-8 h-8 text-red-400" />
                                                    </motion.div>

                                                    <h2 className="text-xl font-bold text-white mb-2">
                                                        Revoke Your Consent?
                                                    </h2>
                                                    <p className="text-sm text-gray-400">
                                                        This action is irreversible. Here's what happens:
                                                    </p>
                                                </div>

                                                <div className="space-y-2 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                                    {[
                                                        {
                                                            icon: FiEyeOff,
                                                            text: 'You will no longer be searchable',
                                                        },
                                                        {
                                                            icon: FiTrash2,
                                                            text: 'All face photos will be deleted',
                                                        },
                                                        {
                                                            icon: FiShield,
                                                            text: 'Your profile will be removed',
                                                        },
                                                        {
                                                            icon: FiAlertTriangle,
                                                            text: 'You will lose pending earnings',
                                                        },
                                                    ].map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 text-xs"
                                                        >
                                                            <item.icon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                                            <span className="text-gray-400">{item.text}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="p-3 bg-white/5 rounded-xl">
                                                    <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                                                        You can sign up again anytime. But your previous
                                                        search count and earnings will NOT be restored.
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={handleClose}
                                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-gray-300 font-mono transition-colors"
                                                    >
                                                        Keep It
                                                    </button>
                                                    <button
                                                        onClick={() => setStep(2)}
                                                        className="flex-1 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/30 text-sm text-red-400 font-semibold font-mono transition-colors"
                                                    >
                                                        Continue →
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
                                                {/* Header */}
                                                <div className="text-center">
                                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                                        <FiTrash2 className="w-6 h-6 text-red-400" />
                                                    </div>
                                                    <h2 className="text-lg font-bold text-white mb-1">
                                                        Final Confirmation
                                                    </h2>
                                                    <p className="text-xs text-gray-400">
                                                        Please tell us why, then confirm
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                                        Reason (optional)
                                                    </p>
                                                    <div className="space-y-1.5">
                                                        {REVOKE_REASONS.map((reason) => (
                                                            <button
                                                                key={reason.id}
                                                                onClick={() => setSelectedReason(reason.id)}
                                                                className={`
                                  w-full text-left px-3 py-2 rounded-lg border transition-all text-xs
                                  ${selectedReason === reason.id
                                                                        ? 'bg-red-500/10 border-red-500/40 text-white'
                                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                                    }
                                `}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className={`
                                      w-3 h-3 rounded-full border-2 flex items-center justify-center
                                      ${selectedReason === reason.id
                                                                                ? 'border-red-400'
                                                                                : 'border-gray-600'
                                                                            }
                                    `}
                                                                    >
                                                                        {selectedReason === reason.id && (
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                                        )}
                                                                    </div>
                                                                    {reason.label}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-2">
                                                        Type "REVOKE" to confirm
                                                    </p>
                                                    <input
                                                        type="text"
                                                        value={confirmText}
                                                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                                        placeholder="REVOKE"
                                                        className="w-full px-3 py-2.5 bg-white/5 border border-red-500/20 rounded-xl text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors text-center tracking-widest"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3 pt-2">
                                                    <button
                                                        onClick={() => setStep(1)}
                                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm text-gray-300 font-mono transition-colors"
                                                    >
                                                        ← Back
                                                    </button>
                                                    <button
                                                        onClick={handleRevoke}
                                                        disabled={confirmText !== 'REVOKE' || isRevoking}
                                                        className={`
                              flex-1 px-4 py-3 rounded-xl text-sm font-semibold font-mono transition-all
                              ${confirmText === 'REVOKE' && !isRevoking
                                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:scale-105'
                                                                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                                            }
                            `}
                                                    >
                                                        {isRevoking ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        repeat: Infinity,
                                                                        ease: 'linear',
                                                                    }}
                                                                    className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                                                                />
                                                                Revoking...
                                                            </div>
                                                        ) : (
                                                            'REVOKE CONSENT'
                                                        )}
                                                    </button>
                                                </div>
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
    )
}