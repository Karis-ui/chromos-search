import React from 'react';
import { motion } from 'framer-motion';
import {
    FiDollarSign,
    FiTrendingUp,
    FiEye,
    FiMousePointer,
    FiCalendar,
    FiAward,
    FiArrowUpRight,
    FiClock,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { useConsent } from '../../hooks/useConsent';

interface ConsentStatsProps {
    className?: string;
}

export const ConsentStats: React.FC<ConsentStatsProps> = ({ className = '' }) => {
    const { stats, profile } = useConsent();
    const data = stats || profile;
    if (!data) {
        return (
            <GlassCard variant="dark" padding="lg" className={className}>
                <p className="text-sm text-gray-500 text-center">
                    No stats available yet
                </p>
            </GlassCard>
        );
    }
    const totalEarnings = (data as any).total_earnings || 0;
    const pendingEarnings = (data as any).pending_earnings || 0;
    const clickThroughs = (data as any).click_throughs || 0;
    const profileViews = (data as any).profile_views || 0;
    const totalSearches = (data as any).lifetime_searches || (data as any).total_searches || 0;
    const searches30Days = (data as any).searches_last_30_days || 0;


    return (
        <div className={`space-y-4 ${className}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard
                    variant="light"
                    padding="lg"
                    glow="green"
                    glowIntensity="medium"
                    className="relative overflow-hidden"
                >
                    <div
                        className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
                        }}
                    />

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                    <FiDollarSign className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                        Total Earnings
                                    </p>
                                    <p className="text-xs text-gray-400">From being found</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <FiTrendingUp className="w-3 h-3 text-green-400" />
                                <span className="text-[10px] text-green-400 font-mono font-bold">
                                    +{((totalSearches / Math.max(1, searches30Days)) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-bold text-white font-mono">
                                ${totalEarnings.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 font-mono">USD</span>
                        </div>

                        {pendingEarnings > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                    <FiClock className="w-3 h-3 text-yellow-400" />
                                    <span className="text-[10px] text-yellow-400 font-mono">
                                        ${pendingEarnings.toFixed(2)} pending
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    icon={FiEye}
                    label="Total Searches"
                    value={String(totalSearches)}
                    color="#06b6d4"
                    delay={0.1}
                />
                <StatCard
                    icon={FiTrendingUp}
                    label="Last 30 Days"
                    value={String(searches30Days)}
                    color="#a855f7"
                    delay={0.15}
                />
                <StatCard
                    icon={FiMousePointer}
                    label="Profile Views"
                    value={String(profileViews)}
                    color="#ec4899"
                    delay={0.2}
                />
                <StatCard
                    icon={FiAward}
                    label="Click Throughs"
                    value={String(clickThroughs)}
                    color="#22c55e"
                    delay={0.25}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <GlassCard variant="dark" padding="lg">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                        <FiCalendar className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-semibold text-white">
                            Reward Breakdown
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <RewardRow
                            label="Search Appearance"
                            rate="$0.10 / search"
                            count={totalSearches}
                            color="#06b6d4"
                        />
                        <RewardRow
                            label="Profile Click"
                            rate="$0.50 / click"
                            count={clickThroughs}
                            color="#a855f7"
                        />
                        <RewardRow
                            label="Premium Search"
                            rate="$1.00 / search"
                            count={Math.floor(totalSearches * 0.2)}
                            color="#eab308"
                        />
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">
                            Estimated Total
                        </span>
                        <span className="text-lg font-bold text-green-400 font-mono">
                            ${(
                                totalSearches * 0.1 +
                                clickThroughs * 0.5 +
                                Math.floor(totalSearches * 0.2) * 1.0
                            ).toFixed(2)}
                        </span>
                    </div>
                </GlassCard>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <GlassCard
                    variant="dark"
                    padding="md"
                    glow="cyan"
                    glowIntensity="low"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Ready to withdraw?
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                Minimum $10.00 • Weekly payouts
                            </p>
                        </div>

                        <button
                            disabled={totalEarnings < 10}
                            className={`
                flex items-center gap-1 px-4 py-2 rounded-xl font-semibold text-xs font-mono transition-all
                ${totalEarnings >= 10
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:scale-105'
                                    : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                }
              `}
                        >
                            Withdraw
                            <FiArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

const StatCard: React.FC<{
    icon: any;
    label: string;
    value: string;
    color: string;
    delay: number;
}> = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <GlassCard variant="dark" padding="md">
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}05)`,
                        border: `1px solid ${color}30`,
                    }}
                >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">
                    {label}
                </p>
            </div>
            <p className="text-xl font-bold text-white font-mono">{value}</p>
        </GlassCard>
    </motion.div>
);

const RewardRow: React.FC<{
    label: string;
    rate: string;
    count: number;
    color: string;
}> = ({ label, rate, count, color }) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
            <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 font-mono">{rate}</span>
            <span className="text-xs font-bold text-white font-mono w-12 text-right">
                ×{count}
            </span>
        </div>
    </div>
);