import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiShield,
    FiCheck,
    FiAlertCircle,
    FiChevronDown,
    FiChevronUp,
    FiLock,
    FiUserCheck,
    FiEye,
    FiDollarSign,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { useConsentStore } from '../../store/consentStore';

interface ConsentTermsProps {
    onNext: () => void;
    onBack: () => void;
}

const TERMS_SECTIONS = [
    {
        id: 'searchable',
        icon: FiEye,
        title: 'You Will Be Searchable',
        description:
            'Anyone with a photo of you can find your Chronos profile, view the information you share, and contact you if you allow it.',
        color: '#06b6d4',
        required: true,
    },
    {
        id: 'photos',
        icon: FiUserCheck,
        title: 'Face Recognition Indexing',
        description:
            'Your uploaded photos will be processed using AI face recognition to create a mathematical signature (embedding). This signature allows us to match you in searches.',
        color: '#a855f7',
        required: true,
    },
    {
        id: 'control',
        icon: FiLock,
        title: 'You Keep Full Control',
        description:
            'You can revoke your consent at any time, and your profile and all photos will be permanently deleted from our search index within seconds.',
        color: '#22c55e',
        required: true,
    },
    {
        id: 'earnings',
        icon: FiDollarSign,
        title: 'Earn Rewards',
        description:
            'Every time someone finds you in a search, you earn a reward. Click-throughs, premium searches, and enterprise searches earn you more. Withdraw anytime.',
        color: '#eab308',
        required: true,
    },
    {
        id: 'data',
        icon: FiShield,
        title: 'Your Data is Protected',
        description:
            'We use AES-256 encryption, TLS 1.3, and are fully GDPR, BIPA, and CCPA compliant. We never sell your data. We never share it with third parties without consent.',
        color: '#ec4899',
        required: true,
    },
];

export const ConsentTerms: React.FC<ConsentTermsProps> = ({
    onNext,
    onBack,
}) => {
    const { wizardData, updateWizardData } = useConsentStore();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [, setHasReadAll] = useState(false);


    const handleAccept = useCallback(() => {
        if (!wizardData.acceptTerms) {
            return;
        }

        onNext();
    }, [onNext, wizardData.acceptTerms]);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/25"
                >
                    <FiShield className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    <GlitchText glitchInterval={5000} intensity={0.4}>
                        Consent Agreement
                    </GlitchText>
                </h2>

                <p className="text-sm text-gray-400 max-w-lg mx-auto">
                    Please read carefully. By signing up, you agree to be searchable on Chronos.
                </p>
            </div>

            <div className="space-y-3">
                {TERMS_SECTIONS.map((section, idx) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSection === section.id;

                    return (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                        >
                            <GlassCard
                                variant="dark"
                                padding="none"
                                hover
                                className="overflow-hidden"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedSection(isExpanded ? null : section.id)
                                    }
                                    className="w-full flex items-center gap-4 p-4 text-left group"
                                >
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${section.color}20, ${section.color}05)`,
                                            border: `1px solid ${section.color}30`,
                                        }}
                                    >
                                        <Icon
                                            className="w-5 h-5"
                                            style={{ color: section.color }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-semibold transition-colors ${isExpanded ? 'text-white' : 'text-gray-200'
                                                }`}
                                        >
                                            {section.title}
                                        </p>
                                        {!isExpanded && (
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {section.description}
                                            </p>
                                        )}
                                    </div>

                                    <div
                                        className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isExpanded
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'bg-white/5 text-gray-500'
                                            }`}
                                    >
                                        {isExpanded ? (
                                            <FiChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <FiChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 pt-0">
                                                <div
                                                    className="h-px w-full mb-3"
                                                    style={{
                                                        background: `linear-gradient(90deg, ${section.color}40, transparent)`,
                                                    }}
                                                />
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    {section.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl"
            >
                <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-400 leading-relaxed">
                        <p className="font-semibold text-yellow-400 mb-1">Legal Notice</p>
                        <p>
                            By continuing, you confirm that you are at least 18 years old and
                            consent to being searchable via face recognition on the Chronos
                            platform. You understand that you can revoke this consent at any
                            time, and that your face data will be permanently deleted upon
                            revocation. Full terms available at{' '}
                            <a
                                href="/terms"
                                className="text-cyan-400 hover:text-cyan-300 underline"
                            >
                                chronos.io/terms
                            </a>
                            .
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.label
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={`
          flex items-start gap-3 p-4 rounded-xl cursor-pointer
          transition-all duration-300 border-2
          ${wizardData.acceptTerms
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
        `}
            >
                <div className="pt-0.5">
                    <input
                        type="checkbox"
                        checked={wizardData.acceptTerms}
                        onChange={(e) => {
                            updateWizardData({ acceptTerms: e.target.checked });
                            if (e.target.checked) setHasReadAll(true);
                        }}
                        className="sr-only peer"
                    />
                    <div
                        className={`
              w-5 h-5 rounded-md border-2 flex items-center justify-center
              transition-all duration-200
              ${wizardData.acceptTerms
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-white/20'
                            }
            `}
                    >
                        {wizardData.acceptTerms && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            >
                                <FiCheck className="w-3.5 h-3.5 text-white" />
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <p className="text-sm text-white font-medium">
                        I consent to being searchable on Chronos
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        I have read and agree to the Terms of Service and Privacy Policy.
                        I understand that I can revoke this at any time.
                    </p>
                </div>
            </motion.label>

            <div className="flex items-center justify-between gap-4 pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm text-gray-300 hover:text-white font-mono"
                >
                    ← Back
                </button>

                <GradientButton
                    onClick={handleAccept}
                    disabled={!wizardData.acceptTerms}
                    variant="rainbow"
                    size="lg"
                    pulse={wizardData.acceptTerms}
                    icon={<FiCheck />}
                    iconPosition="right"
                    className="min-w-[200px]"
                >
                    I Consent — Continue
                </GradientButton>
            </div>
        </div>
    );
};

export default ConsentTerms;