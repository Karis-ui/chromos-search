import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiBarChart2,
    FiActivity,
    FiZap,
    FiGlobe,
    FiAward,
    FiDownload
} from 'react-icons/fi';
import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { SearchTrends } from './SearchTrends';
import { PlatformDistribution } from './PlatfromDistribution';
import { ConfidenceTrends } from './ConfidenceTrends';
import { TemporalPatterns } from './TemporalPatterns';
import { useSearchStore } from '../../store/searchStore';

export const AnalyticsDashboard: React.FC = () => {
    const { results } = useSearchStore();
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
    const [exportLoading, setExportLoading] = useState(false);

    const analytics = useMemo(() => {
        if (!results.length) return null;
        const total = results.length;
        const avgConfidence = results.reduce((acc, r) => acc + r.similarity, 0) / total;
        const maxConfidence = Math.max(...results.map(r => r.similarity));
        const minConfidence = Math.min(...results.map(r => r.similarity));
        const platformCounts: Record<string, number> = {};
        results.forEach(r => {
            platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
        });
        const high = results.filter(r => r.similarity >= 0.85).length;
        const medium = results.filter(r => r.similarity >= 0.70 && r.similarity < 0.85).length;
        const low = results.filter(r => r.similarity >= 0.55 && r.similarity < 0.70).length;
        const negative = results.filter(r => r.similarity < 0.55).length;

        return {
            total,
            avgConfidence,
            maxConfidence,
            minConfidence,
            platformCounts,
            distribution: { high, medium, low, negative },
        };
    }, [results]);

    const handleExport = async () => {
        setExportLoading(true);
        try {
            const data = {
                results, analytics, exported_at: new Date().toISOString(), version: '3.0.0.0'
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `chronos_analytics_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExportLoading(false);
        }
    };

    if (!analytics || !results.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FiBarChart2 className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium">No analytics data available</p>
                <p className="text-sm text-gray-500 mt-1">
                    Run a search to see analytics insights
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </span>
                        <span className="text-sm font-normal text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            {analytics.total} results analyzed
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 font-mono">
                        Real-time insights from your search results
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                        {(['day', 'week', 'month', 'all'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${timeRange === range
                                    ? 'bg-cyan-400/20 text-cyan-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                    </div>

                    <GradientButton
                        onClick={handleExport}
                        loading={exportLoading}
                        loadingText="Exporting..."
                        size="sm"
                        className="px-4 py-2"
                    >
                        <FiDownload className="w-4 h-4" />
                        Export
                    </GradientButton>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 font-mono">AVG CONFIDENCE</span>
                        <FiActivity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {(analytics.avgConfidence * 100).toFixed(1)}%
                    </p>
                    <span className="text-[10px] text-gray-500">
                        ±{(analytics.maxConfidence - analytics.minConfidence) * 50}% range
                    </span>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 font-mono">BEST MATCH</span>
                        <FiAward className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {(analytics.maxConfidence * 100).toFixed(1)}%
                    </p>
                    <span className="text-[10px] text-gray-500">
                        Highest confidence score
                    </span>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 font-mono">PLATFORMS</span>
                        <FiGlobe className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {Object.keys(analytics.platformCounts).length}
                    </p>
                    <span className="text-[10px] text-gray-500">
                        {Object.entries(analytics.platformCounts)
                            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'} most common
                    </span>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500 font-mono">HIGH CONFIDENCE</span>
                        <FiZap className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {analytics.distribution.high}
                    </p>
                    <span className="text-[10px] text-gray-500">
                        {((analytics.distribution.high / analytics.total) * 100).toFixed(1)}% of total
                    </span>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-4">
                    <SearchTrends results={results} timeRange={timeRange} />
                </GlassCard>

                <GlassCard className="p-4">
                    <PlatformDistribution results={results} />
                </GlassCard>

                <GlassCard className="p-4">
                    <ConfidenceTrends results={results} />
                </GlassCard>

                <GlassCard className="p-4">
                    <TemporalPatterns results={results} />
                </GlassCard>
            </div>

            <GlassCard className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiBarChart2 className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-semibold text-gray-300">Confidence Distribution</h3>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                            {analytics.total} total matches
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'High', value: analytics.distribution.high, color: '#4ade80' },
                            { label: 'Medium', value: analytics.distribution.medium, color: '#facc15' },
                            { label: 'Low', value: analytics.distribution.low, color: '#fb923c' },
                            { label: 'Negative', value: analytics.distribution.negative, color: '#f87171' },
                        ].map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400">{item.label}</span>
                                    <span className="text-[10px] font-mono text-white">
                                        {((item.value / analytics.total) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / analytics.total) * 100}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                                <span className="text-[9px] text-gray-500 font-mono">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default AnalyticsDashboard;