import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiUser, FiCamera, FiLink, FiEye, FiAward } from 'react-icons/fi';

interface ConsentProgressProps {
    currentStep: number;
    totalSteps?: number;
}

const STEPS = [
    { id: 1, label: 'Consent', icon: FiUser },
    { id: 2, label: 'Photos', icon: FiCamera },
    { id: 3, label: 'Socials', icon: FiLink },
    { id: 4, label: 'Review', icon: FiEye },
    { id: 5, label: 'Complete', icon: FiAward },
];

export const ConsentProgress: React.FC<ConsentProgressProps> = ({
    currentStep,
    totalSteps = 5
}) => {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/5 rounded-full" />
                <motion.div
                    className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                <div className="relative flex justify-between">
                    {STEPS.map((step) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: step.id * 0.05 }}
                                    className={`
                    relative w-10 h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300 z-10
                    ${isCompleted
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
                                            : isActive
                                                ? 'bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-purple-500/30'
                                                : 'bg-white/5 border border-white/10'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <FiCheck className="w-5 h-5 text-white" />
                                    ) : (
                                        <Icon
                                            className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'
                                                }`}
                                        />
                                    )}

                                    {/* Pulse ring for active */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute inset-0 rounded-xl border-2 border-cyan-400"
                                            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>

                                <span
                                    className={`
                    text-[10px] sm:text-xs font-mono uppercase tracking-wider
                    transition-colors duration-300
                    ${isCompleted
                                            ? 'text-green-400'
                                            : isActive
                                                ? 'text-cyan-400'
                                                : 'text-gray-600'
                                        }
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ConsentProgress;