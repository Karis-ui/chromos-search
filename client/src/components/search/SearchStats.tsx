import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiZap, FiBarChart2 } from 'react-icons/fi';
import { formatConfidence } from '../../utils/formatters';

interface SearchStatsProps {
    results: Array<{
        platform: string;
        confidence: number;
        similarity: number;
        posted_at: string;
        likes?: number;
        shares?: number;
        comments?: number;
    }>;
}

export const SearchStats: React.FC<SearchStatsProps> = ({ results }) => {
    const stats = useMemo(() => {
        if (!results.length) return null;
        const total = results.length;
        const avgConfidence = results.reduce((acc, r) => acc + r.similarity, 0) / total;
        const maxConfidence = Math.max(...results.map(r => r.similarity));
        const minConfidence = Math.min(...results.map(r => r.similarity));
        const platfromCounts: Record<string, number> = {};
        results.forEach(r => {
            platfromCounts[r.platform] = (platfromCounts[r.platform] || 0) + 1
        });
        const topPlatform = Object.entries(platfromCounts).sort((a, b) => b[1] - a[1])[0];
        const totalLikes = results.reduce((acc, r) => acc + (r.likes || 0), 0);
        const totalShares = results.reduce((acc, r) => acc + (r.shares || 0), 0);
        const totalComments = results.reduce((acc, r) => acc + (r.comments || 0), 0);
        const high = results.filter(r => r.similarity >= 0.85).length;
        const medium = results.filter(r => r.similarity >= 0.70 && r.similarity < 0.85).length;
        const low = results.filter(r => r.similarity >= 0.55 && r.similarity < 0.70).length;
        const negative = results.filter(r => r.similarity < 0.55).length;

        return {
            total, avgConfidence, maxConfidence, minConfidence, topPlatform: topPlatform ? { name: topPlatform[0], count: topPlatform[1] } : null,
            engagement: {
                likes: totalLikes,
                shares: totalShares,
                comments: totalComments,
                total: totalLikes + totalShares + totalComments,
            },
            distribution: { high, medium, low, negative },
        };
    }, [results]);
    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-2 bg-white/5 rounded-xl border border-white/5"
            >
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">TOTAL</span>
                    <FiBarChart2 className="w-3 h-3 text-cyan-400" />
                </div>
                <p className="text-lg font-bold text-white mt-0.5">{stats.total}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="px-3 py-2 bg-white/5 rounded-xl border border-white/5"
            >
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">AVG CONFIDENCE</span>
                    <FiTrendingUp className="w-3 h-3 text-purple-400" />
                </div>
                <p className="text-lg font-bold text-white mt-0.5">
                    {formatConfidence(stats.avgConfidence)}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-2 bg-white/5 rounded-xl border border-white/5"
            >
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">TOP PLATFORM</span>
                    <FiZap className="w-3 h-3 text-pink-400" />
                </div>
                <p className="text-lg font-bold text-white mt-0.5 capitalize">
                    {stats.topPlatform ? stats.topPlatform.name : 'N/A'}
                </p>
                <span className="text-[8px] text-gray-500 font-mono">
                    {stats.topPlatform ? `${stats.topPlatform.count} matches` : ''}
                </span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="px-3 py-2 bg-white/5 rounded-xl border border-white/5"
            >
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-mono">BEST MATCH</span>
                    <FiAward className="w-3 h-3 text-yellow-400" />
                </div>
                <p className="text-lg font-bold text-white mt-0.5">
                    {formatConfidence(stats.maxConfidence)}
                </p>
                <span className="text-[8px] text-gray-500 font-mono">
                    {stats.distribution.high} high confidence
                </span>
            </motion.div>
        </div>
    );
};