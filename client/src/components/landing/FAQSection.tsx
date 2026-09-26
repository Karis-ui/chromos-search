import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiHelpCircle, FiMessageCircle } from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';

const FAQS = [
    {
        question: 'How does face recognition work?',
        answer: 'Chronos uses InsightFace, a state-of-the-art neural network that extracts 512-dimensional face embeddings. Each face is converted to a unique mathematical signature that can be matched against millions of other faces with 99.8% accuracy — even with partial occlusion, different lighting, or age progression.',
    },
    {
        question: 'Is this legal to use?',
        answer: 'Chronos is designed for legitimate use cases: law enforcement investigations, security research, journalists verifying sources, and personal safety. Users must agree to our terms prohibiting stalking, harassment, or unauthorized surveillance. We log all searches and cooperate fully with legal authorities.',
    },
    {
        question: 'What data do you store?',
        answer: 'We store only anonymized search metadata (timestamps, platforms scanned, result counts). Uploaded media is deleted after 30 days. We never sell your data. Your searches are encrypted at rest with AES-256 and are not visible to other users or our team.',
    },
    {
        question: 'How far back can you search?',
        answer: 'Free users can search the last 30 days. Professional users get full 6-month historical search. Enterprise customers can request custom time ranges and on-premise data retention policies.',
    },
    {
        question: 'Which platforms do you support?',
        answer: 'Chronos searches Instagram, Facebook, Twitter/X, TikTok, Telegram, Reddit, YouTube, LinkedIn, Snapchat, Pinterest, Discord, and WhatsApp. New platforms are added based on customer demand — Enterprise customers can request specific platforms.',
    },
    {
        question: 'Can I export results?',
        answer: 'Yes! Professional and Enterprise users can export search results in JSON or CSV format. Each result includes the match score, timestamp, platform, direct URL, and thumbnail. Perfect for building reports or integrating with your existing tools.',
    },
    {
        question: 'Do you offer an API?',
        answer: 'Yes — Professional and Enterprise plans include full REST API access. You can programmatically initiate searches, stream results via WebSocket, and manage your account. Full API documentation with code examples is available.',
    },
    {
        question: 'What if I need to cancel?',
        answer: 'Cancel anytime from your account settings. No questions asked, no hidden fees. If you cancel mid-cycle, you keep access until the end of your billing period. We also offer a 14-day money-back guarantee on all paid plans.',
    },
];

export const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                    <FiHelpCircle className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">
                        FAQ
                    </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                    <span className="text-white">Questions? </span>
                    <span className="shimmer-text">Answered.</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
                    Everything you need to know about Chronos Search Engine.
                </p>
            </motion.div>

            <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                    const isOpen = openIndex === idx;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                            <GlassCard
                                variant={isOpen ? 'light' : 'dark'}
                                padding="none"
                                hover
                                className="overflow-hidden"
                            >
                                {/* Question */}
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between gap-4 p-5 text-left group"
                                >
                                    <span
                                        className={`text-sm sm:text-base font-semibold transition-colors ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                            }`}
                                    >
                                        {faq.question}
                                    </span>

                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isOpen
                                                ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white rotate-180'
                                                : 'bg-white/5 text-gray-400 group-hover:bg-white/10'
                                            }`}
                                    >
                                        {isOpen ? (
                                            <FiMinus className="w-4 h-4" />
                                        ) : (
                                            <FiPlus className="w-4 h-4" />
                                        )}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 pt-0">
                                                <div className="h-px w-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-transparent mb-4" />
                                                <p className="text-sm text-gray-400 leading-relaxed">
                                                    {faq.answer}
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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 text-center"
            >
                <GlassCard variant="dark" padding="lg" className="inline-block">
                    <div className="flex items-center gap-3 mb-3">
                        <FiMessageCircle className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">Still have questions?</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Our team is here to help. Reach out anytime.
                    </p>
                    <a
                        href="mailto:support@chronos.io"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-sm text-cyan-400 font-mono transition-colors"
                    >
                        support@chronos.io
                    </a>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default FAQSection;