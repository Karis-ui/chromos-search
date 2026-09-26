import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiSearch, FiZap, FiAward, FiGlobe, FiShield } from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';

interface StatItem {
    icon: any;
    value: number;
    suffix: string;
    label: string;
    color: string;
    decimal?: number;
}

const STATS: StatItem[] = [
    { icon: FiUsers, value: 12847, suffix: '+', label: 'Active Users', color: '#06b6d4' },
    { icon: FiSearch, value: 2847392, suffix: '', label: 'Searches Performed', color: '#a855f7' },
    { icon: FiZap, value: 3.2, suffix: 's', label: 'Average Search Time', color: '#ec4899', decimal: 1 },
    { icon: FiAward, value: 99.8, suffix: '%', label: 'Accuracy Rate', color: '#22c55e', decimal: 1 },
    { icon: FiGlobe, value: 12, suffix: '', label: 'Platforms Scanned', color: '#f97316' },
    { icon: FiShield, value: 100, suffix: '%', label: 'Uptime SLA', color: '#eab308' },
];

const Counter: React.FC<{
    value: number;
    suffix: string;
    label: string;
    color: string;
    decimal?: number;
}> = ({ value, suffix, color, decimal = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (inView) return;
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= increment) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(current)
            }
        }, duration / steps);
    }), [value, inView];

    const formatNumber = (num: number): string => {
        if (decimal > 0) {
            return Math.floor(num).toFixed(decimal) + 'k';
        }
        return num.toFixed(decimal);
    };

    return (
        <span ref={ref} style={{ color }} className="tabular-nums">
            {formatNumber(count)}
            {suffix}
        </span>
    );
}
export const StatsSection: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                    <FiAward className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider">
                        By The Numbers
                    </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                    <span className="text-white">Trusted By </span>
                    <span className="shimmer-text">Thousands</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg">
                    Real numbers from real users. Updated live.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {STATS.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <GlassCard
                            variant="dark"
                            hover
                            hoverEffect="lift"
                            padding="lg"
                            className="text-center group"
                        >
                            {/* Icon */}
                            <div
                                className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                style={{
                                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`,
                                    border: `1px solid ${stat.color}30`,
                                }}
                            >
                                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                            </div>

                            {/* Value */}
                            <div className="text-3xl sm:text-4xl font-black mb-2">
                                <Counter
                                    label={stat.label}
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    decimal={stat.decimal}
                                    color={stat.color}
                                />
                            </div>

                            {/* Label */}
                            <p className="text-xs sm:text-sm text-gray-400 font-mono uppercase tracking-wider">
                                {stat.label}
                            </p>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StatsSection;