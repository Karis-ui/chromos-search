import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiMapPin,
    FiBriefcase,
    FiCheck,
    FiEdit,
    FiAlertCircle,
    FiShield,
    FiCamera,
    FiLink,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { useConsentStore } from '../../store/consentStore';
import { useConsent } from '../../hooks/useConsent';

interface ConsentReviewProps {
    onNext: () => void;
    onBack: () => void;
    onEditStep: (step: number) => void;
}

export const ConsentReview: React.FC<ConsentReviewProps> = ({
    onNext, onBack, onEditStep
}) => {
    const { wizardData, uploadedPhotos } = useConsentStore();
    const { grantConsent, isGranting } = useConsent();

    const handleSubmit = useCallback(async () => {
        try {
            await grantConsent({
                display_name: wizardData.displayName || undefined,
                bio: wizardData.bio || undefined,
                location: wizardData.location || undefined,
                occupation: wizardData.occupation || undefined,
                company: wizardData.company || undefined,
                contact_email: wizardData.contactEmail || undefined,
                allow_direct_messages: wizardData.allowDirectMessages,
                allow_email_contact: wizardData.allowEmailContact,
                allow_phone_contact: wizardData.allowPhoneContact,
                consent_version: wizardData.consentVersion,
                accept_terms: wizardData.acceptTerms,
            });
            onNext();
        }
        catch (err) {

        }
    }, [wizardData, grantConsent, onNext]);

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/25"
                >
                    <FiCheck className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    <GlitchText glitchInterval={5000} intensity={0.4}>
                        Review & Confirm
                    </GlitchText>
                </h2>

                <p className="text-sm text-gray-400 max-w-lg mx-auto">
                    Please review everything before you go live. This will make you searchable.
                </p>
            </div>

            <GlassCard variant="dark" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-semibold text-white">
                            Profile Information
                        </h3>
                    </div>
                    <button
                        onClick={() => onEditStep(1)}
                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                    >
                        <FiEdit className="w-3 h-3" />
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">
                            Display Name
                        </p>
                        <p className="text-sm text-white">
                            {wizardData.displayName || '—'}
                        </p>
                    </div>

                    {wizardData.location && (
                        <div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">
                                Location
                            </p>
                            <p className="text-sm text-white flex items-center gap-1.5">
                                <FiMapPin className="w-3 h-3 text-gray-500" />
                                {wizardData.location}
                            </p>
                        </div>
                    )}

                    {wizardData.occupation && (
                        <div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">
                                Occupation
                            </p>
                            <p className="text-sm text-white flex items-center gap-1.5">
                                <FiBriefcase className="w-3 h-3 text-gray-500" />
                                {wizardData.occupation}
                                {wizardData.company && ` at ${wizardData.company}`}
                            </p>
                        </div>
                    )}

                    {wizardData.bio && (
                        <div className="sm:col-span-2">
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">
                                Bio
                            </p>
                            <p className="text-sm text-gray-300">{wizardData.bio}</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            <GlassCard variant="dark" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <FiCamera className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-white">
                            Face Photos ({uploadedPhotos.length})
                        </h3>
                    </div>
                    <button
                        onClick={() => onEditStep(2)}
                        className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-mono transition-colors"
                    >
                        <FiEdit className="w-3 h-3" />
                        Edit
                    </button>
                </div>

                {uploadedPhotos.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                        {uploadedPhotos.map((photo, idx) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
                            >
                                <img
                                    src={photo.thumbnail}
                                    alt={`Photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {photo.isPrimary && (
                                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-cyan-500 rounded text-[8px] text-white font-bold font-mono">
                                        PRIMARY
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No photos uploaded
                    </p>
                )}
            </GlassCard>

            <GlassCard variant="dark" padding="lg" className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <FiMail className="w-4 h-4 text-green-400" />
                    <h3 className="text-sm font-semibold text-white">
                        Contact Preferences
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Direct Messages</span>
                        <span
                            className={
                                wizardData.allowDirectMessages
                                    ? 'text-green-400 font-mono text-xs'
                                    : 'text-gray-600 font-mono text-xs'
                            }
                        >
                            {wizardData.allowDirectMessages ? '✓ Allowed' : '✗ Disabled'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Email Contact</span>
                        <span
                            className={
                                wizardData.allowEmailContact
                                    ? 'text-green-400 font-mono text-xs'
                                    : 'text-gray-600 font-mono text-xs'
                            }
                        >
                            {wizardData.allowEmailContact ? '✓ Allowed' : '✗ Disabled'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Phone Contact</span>
                        <span
                            className={
                                wizardData.allowPhoneContact
                                    ? 'text-green-400 font-mono text-xs'
                                    : 'text-gray-600 font-mono text-xs'
                            }
                        >
                            {wizardData.allowPhoneContact ? '✓ Allowed' : '✗ Disabled'}
                        </span>
                    </div>
                </div>
            </GlassCard>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl"
            >
                <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-400 leading-relaxed">
                        <p className="font-semibold text-yellow-400 mb-1">
                            Final Confirmation
                        </p>
                        <p>
                            Once confirmed, your profile becomes searchable within seconds. You
                            can revoke at any time from your settings. Revoking removes you from
                            search immediately and deletes all face data.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 font-mono">
                <div className="flex items-center gap-1.5">
                    <FiShield className="w-3 h-3 text-green-400" />
                    <span>End-to-end encrypted</span>
                </div>
                <span className="text-gray-700">•</span>
                <div className="flex items-center gap-1.5">
                    <FiLink className="w-3 h-3 text-cyan-400" />
                    <span>GDPR compliant</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm text-gray-300 hover:text-white font-mono"
                >
                    ← Back
                </button>

                <GradientButton
                    onClick={handleSubmit}
                    loading={isGranting}
                    loadingText="Going Live..."
                    variant="rainbow"
                    size="lg"
                    pulse={!isGranting}
                    icon={<FiCheck />}
                    iconPosition="right"
                    className="min-w-[220px]"
                >
                    Confirm & Go Live
                </GradientButton>
            </div>
        </div>
    );
};

export default ConsentReview;