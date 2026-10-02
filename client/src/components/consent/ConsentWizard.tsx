import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

import { ConsentProgress } from './ConsentProgress';
import { ConsentTerms } from './ConsentTerms';
import { PhotoUploader } from './PhotoUploader';
import { SocialLinker } from './SocialLinker';
import { ConsentReview } from './ConsentReview';
import { ConsentSuccess } from './ConsentSuccess';
import { useConsentStore } from '../../store/consentStore';

interface ConentWizardProps {
    onComplete?: () => void;
    onCancel?: () => void;
    initialStep?: number;
}

type WizardStep = 'terms' | 'photos' | 'socials' | 'review' | 'success';

const STEP_ORDER: WizardStep[] = ['terms', 'photos', 'socials', 'review', 'success'];

export const ConsentWizard: React.FC<ConentWizardProps> = ({
    onComplete,
    onCancel,
    initialStep = 1,
}) => {
    const { wizardStep, setWizardStep, resetWizard } = useConsentStore();

    useEffect(() => {
        if (initialStep && initialStep !== wizardStep) {
            setWizardStep(initialStep);
        }
    }, []);

    const currentStep: WizardStep = STEP_ORDER[wizardStep - 1] || 'terms';

    const goNext = useCallback(() => {
        setWizardStep(Math.min(wizardStep + 1, STEP_ORDER.length));
    }, []);

    const goBack = useCallback(() => {
        setWizardStep(Math.max(1, wizardStep - 1));
    }, [wizardStep]);

    const goToStep = useCallback((step: number) => {
        const safeStep = Math.max(1, Math.min(step, STEP_ORDER.length));
        setWizardStep(safeStep);
    }, []);

    const handleCancel = useCallback(() => {
        resetWizard();
        onCancel?.();
    }, [resetWizard, onCancel]);

    const handleComplete = useCallback(() => {
        onComplete?.();
    }, [onComplete]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gray-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

                {onCancel && currentStep !== 'success' && (
                    <button
                        onClick={handleCancel}
                        className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-all group"
                        aria-label="Cancel"
                    >
                        <FiX className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </button>
                )}

                {currentStep !== 'success' && (
                    <div className="p-6 sm:p-8 pb-0">
                        <ConsentProgress currentStep={wizardStep} totalSteps={5} />
                    </div>
                )}

                <div className="p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            {currentStep === 'terms' && (
                                <ConsentTerms onNext={goNext} onBack={handleCancel} />
                            )}

                            {currentStep === 'photos' && (
                                <PhotoUploader onNext={goNext} onBack={goBack} />
                            )}

                            {currentStep === 'socials' && (
                                <SocialLinker onNext={goNext} onBack={goBack} />
                            )}

                            {currentStep === 'review' && (
                                <ConsentReview
                                    onNext={goNext}
                                    onBack={goBack}
                                    onEditStep={goToStep}
                                />
                            )}

                            {currentStep === 'success' && (
                                <ConsentSuccess onFinish={handleComplete} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

                <motion.div
                    className="absolute left-0 right-0 h-px pointer-events-none"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)',
                    }}
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
            </motion.div>

            {currentStep !== 'success' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-center"
                >
                    <p className="text-[10px] text-gray-500 font-mono">
                        🔒 End-to-end encrypted • GDPR compliant • Revocable anytime
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ConsentWizard;