import React from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiCpu, FiSearch, FiTarget, FiArrowRight } from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';

const STEPS = [
    {
        number: '01',
        icon: FiUpload,
        title: 'Upload Media',
        description: 'Drop any photo or video. We accept JPG, PNG, MP4, MOV, and more. Max 50MB.',
        color: '#06b6d4',
    },
    {
        number: '02',
        icon: FiCpu,
        title: 'AI Analyzes',
        description: 'Our neural network extracts face embeddings and voice signatures in milliseconds.',
        color: '#a855f7',
    },
    {
        number: '03',
        icon: FiSearch,
        title: 'Scans Platforms',
        description: 'Parallel scanning across 12 social networks covering the last 6 months.',
        color: '#ec4899',
    },
    {
        number: '04',
        icon: FiTarget,
        title: 'Get Results',
        description: 'Ranked matches with confidence scores, timestamps, and direct links.',
        color: '#22c55e',
    },
];

export const Works: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full mb-4">
                    <FiArrowRight className="w-3 h-3 text-pink-400" />
                    <span className="text-[10px] text-pink-400 font-mono uppercase tracking-wider">
                        Process
                    </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                    <span className="text-white">How It </span>
                    <span className="shimmer-text">Works</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
                    From upload to results in under 5 seconds. It's that simple.
                </p>
            </motion.div>

            <div className="relative">
                <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-green-500/20" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {STEPS.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            className="relative"
                        >
                            <GlassCard
                                variant="dark"
                                hover
                                hoverEffect="lift"
                                padding="lg"
                                className="h-full text-center group"
                            >
                                <div className="relative mb-6">
                                    <div
                                        className="relative w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{
                                            background: `linear-gradient(135deg, ${step.color}20, ${step.color}05)`,
                                            border: `2px solid ${step.color}30`,
                                        }}
                                    >
                                        <step.icon
                                            className="w-8 h-8"
                                            style={{ color: step.color }}
                                        />

                                        <motion.div
                                            className="absolute inset-0 rounded-2xl"
                                            style={{ border: `2px solid ${step.color}` }}
                                            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </div>

                                    <div
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-black"
                                        style={{ backgroundColor: step.color }}
                                    >
                                        {step.number}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2">
                                    {step.title}
                                </h3>

                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>

                                {idx < STEPS.length - 1 && (
                                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg"
                                        >
                                            <FiArrowRight className="w-3 h-3 text-white" />
                                        </motion.div>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Works;