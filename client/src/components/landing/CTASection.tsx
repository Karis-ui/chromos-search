import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiShield, FiStar } from 'react-icons/fi';

import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { NeonBorder } from '../common/NeonBorder';
import { ROUTES } from '../../constants/routes';

export const CTASection: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
            >
                <NeonBorder color="cyan" intensity="high" animationSpeed={0.3}>
                    <div className="relative p-8 sm:p-12 lg:p-16 text-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                        {/* Background Effects */}
                        <div className="absolute inset-0 opacity-20">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(34, 211, 238, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)
                  `,
                                }}
                            />
                        </div>

                        <div className="relative z-10">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
                            >
                                <FiZap className="w-10 h-10 text-cyan-400" />
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6">
                                <GlitchText
                                    glitchInterval={4000}
                                    intensity={0.6}
                                    className="block text-white"
                                >
                                    READY TO FIND
                                </GlitchText>
                                <span className="block shimmer-text">
                                    ANYONE?
                                </span>
                            </h2>

                            <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg mb-8">
                                Join 10,000+ investigators, researchers, and security professionals who trust Chronos
                                to find the people they're looking for.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                                {[
                                    { icon: FiStar, label: 'Free 14-day trial' },
                                    { icon: FiShield, label: 'No credit card required' },
                                    { icon: FiZap, label: 'Cancel anytime' },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
                                    >
                                        <item.icon className="w-3 h-3 text-cyan-400" />
                                        <span className="text-xs text-gray-300 font-mono">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                                    <GradientButton
                                        variant="cyan"
                                        size="lg"
                                        pulse
                                        icon={<FiArrowRight />}
                                        iconPosition="right"
                                        className="w-full sm:w-auto text-base px-8 py-4"
                                    >
                                        Start Searching Free
                                    </GradientButton>
                                </Link>

                                <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm text-gray-300 hover:text-white font-mono">
                                        Sign In to Existing Account
                                    </button>
                                </Link>
                            </div>

                            <p className="mt-8 text-xs text-gray-500 font-mono">
                                🔒 Enterprise-grade security • ⚡ 99.8% accuracy • 🌐 12 platforms
                            </p>
                        </div>
                    </div>
                </NeonBorder>
            </motion.div>
        </div>
    );
};

export default CTASection;