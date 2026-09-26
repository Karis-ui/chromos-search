import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheck, FiX, FiZap, FiStar, FiBriefcase, FiArrowRight } from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { NeonBorder } from '../common/NeonBorder';
import { ROUTES } from '../../constants/routes';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        description: 'Perfect for trying Chronos',
        price: { monthly: 0, yearly: 0 },
        icon: FiZap,
        color: '#06b6d4',
        features: [
            { text: '10 searches per day', included: true },
            { text: 'Basic face recognition', included: true },
            { text: '3 platforms', included: true },
            { text: '30-day search history', included: true },
            { text: 'Voice matching', included: false },
            { text: 'Advanced analytics', included: false },
            { text: 'Export results', included: false },
            { text: 'Priority support', included: false },
        ],
        cta: 'Start Free',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Professional',
        description: 'For serious investigators',
        price: { monthly: 29, yearly: 290 },
        icon: FiStar,
        color: '#a855f7',
        features: [
            { text: 'Unlimited searches', included: true },
            { text: 'Advanced face + voice', included: true },
            { text: 'All 12 platforms', included: true },
            { text: '6-month search history', included: true },
            { text: 'Advanced analytics', included: true },
            { text: 'Export results (JSON/CSV)', included: true },
            { text: 'API access', included: true },
            { text: 'Priority support', included: true },
        ],
        cta: 'Start 14-Day Trial',
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For teams and organizations',
        price: { monthly: 199, yearly: 1990 },
        icon: FiBriefcase,
        color: '#ec4899',
        features: [
            { text: 'Everything in Professional', included: true },
            { text: 'Unlimited team members', included: true },
            { text: 'Custom integrations', included: true },
            { text: 'On-premise deployment', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: '99.99% uptime SLA', included: true },
            { text: 'Custom AI models', included: true },
            { text: '24/7 phone support', included: true },
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

export const PricingSection: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                    <FiZap className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                        Pricing
                    </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                    <span className="text-white">Simple, </span>
                    <span className="shimmer-text">Transparent Pricing</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg mb-8">
                    Choose the perfect plan for your needs. No hidden fees. Cancel anytime.
                </p>

                <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
                    {(['monthly', 'yearly'] as const).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setBillingCycle(cycle)}
                            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${billingCycle === cycle
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {cycle}
                            {cycle === 'yearly' && (
                                <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px]">
                                    -20%
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {PLANS.map((plan, idx) => {
                    const price = plan.price[billingCycle];
                    const isPopular = plan.popular;

                    const cardContent = (
                        <div className="p-6 sm:p-8 h-full flex flex-col">
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-[10px] font-bold text-white font-mono uppercase tracking-wider shadow-lg z-10">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{
                                        background: `linear-gradient(135deg, ${plan.color}20, ${plan.color}05)`,
                                        border: `1px solid ${plan.color}30`,
                                    }}
                                >
                                    <plan.icon className="w-6 h-6" style={{ color: plan.color }} />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-gray-400">{plan.description}</p>
                            </div>

                            <div className="mb-6 pb-6 border-b border-white/5">
                                <div className="flex items-baseline gap-2">
                                    <span
                                        className="text-4xl sm:text-5xl font-black"
                                        style={{ color: plan.color }}
                                    >
                                        ${price}
                                    </span>
                                    <span className="text-sm text-gray-500 font-mono">
                                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                                {billingCycle === 'yearly' && price > 0 && (
                                    <p className="text-xs text-green-400 font-mono mt-1">
                                        Save ${plan.price.monthly * 12 - price}/year
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 mb-6 flex-1">
                                {plan.features.map((feature, featureIdx) => (
                                    <div key={featureIdx} className="flex items-start gap-2">
                                        {feature.included ? (
                                            <FiCheck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <FiX className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                                        )}
                                        <span
                                            className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600 line-through'
                                                }`}
                                        >
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link to={plan.id === 'enterprise' ? '#contact' : ROUTES.REGISTER}>
                                <GradientButton
                                    variant={isPopular ? 'rainbow' : 'cyan'}
                                    size="lg"
                                    fullWidth
                                    pulse={isPopular}
                                    icon={<FiArrowRight />}
                                    iconPosition="right"
                                >
                                    {plan.cta}
                                </GradientButton>
                            </Link>
                        </div>
                    );

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            className={`relative ${isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
                        >
                            {isPopular ? (
                                <NeonBorder color="purple" intensity="high" animationSpeed={0.5}>
                                    {cardContent}
                                </NeonBorder>
                            ) : (
                                <GlassCard variant="dark" hover hoverEffect="lift" padding="none" className="relative">
                                    {cardContent}
                                </GlassCard>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center text-xs text-gray-500 font-mono mt-8"
            >
                All plans include SSL encryption, GDPR compliance, and 99.9% uptime
            </motion.p>
        </div>
    );
};

export default PricingSection;