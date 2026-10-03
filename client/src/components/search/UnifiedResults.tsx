import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiFilter,
    FiGrid,
    FiList,
    FiShield,
    FiUsers,
    FiGlobe,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';

import { GlassCard } from '../common/GlassCard';
import { ConsentResultCard } from './ConsentResultCard';
import { SocialResultCard } from './SocialResultCard';
import type { UnifiedResult } from '../../api/endpoints/search';

type FilterSource = 'all' | 'consent' | 'social';
type SortBy = 'similarity' | 'rank' | 'recent';

interface UnifiedResultsProps {
    results: UnifiedResult[];
    onContact?: (result: UnifiedResult) => void;
    onClaim?: (result: UnifiedResult) => void;
    onViewProfile?: (result: UnifiedResult) => void;
    onResultClick?: (result: UnifiedResult) => void;
}

export const UnifiedResults: React.FC<UnifiedResultsProps> = ({
    results,
    onContact,
    onClaim,
    onViewProfile,
    onResultClick,
}) => {
    const [filterSource, setFilterSource] = useState<FilterSource>('all');
    const [sortBy, setSortBy] = useState<SortBy>('similarity');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const counts = useMemo(() => {
        const consent = results.filter((r) => r.source === 'consent').length;
        const social = results.filter((r) => r.source === 'social').length;
        return {
            all: results.length,
            consent,
            social,
        };
    }, [results]);

    const filteredResults = useMemo(() => {
        let filtered = [...results];

        if (filterSource !== 'all') {
            filtered = filtered.filter((r) => r.source === filterSource);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'similarity':
                    return b.similarity - a.similarity;
                case 'rank':
                    return (a.rank || 0) - (b.rank || 0);
                case 'recent':
                    if (a.source === 'consent' && b.source !== 'consent') return -1;
                    if (b.source === 'consent' && a.source !== 'consent') return 1;
                    return 0;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [results, filterSource, sortBy]);

    const renderResult = useCallback(
        (result: UnifiedResult, idx: number) => {
            if (result.source === 'consent') {
                return (
                    <motion.div
                        key={result.profile_id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                    >
                        <ConsentResultCard
                            result={result}
                            onContact={onContact}
                            onViewProfile={onViewProfile}
                        />
                    </motion.div>
                );
            }

            return (
                <motion.div
                    key={result.post_id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                >
                    <SocialResultCard
                        result={result}
                        onClaim={onClaim}
                        onClick={onResultClick}
                    />
                </motion.div>
            );
        },
        [onContact, onClaim, onViewProfile, onResultClick]
    );

    if (results.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FiUsers className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No matches found</p>
                <p className="text-sm text-gray-500">
                    Try adjusting your filters or uploading a different photo
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <GlassCard variant="dark" padding="sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                        <FilterButton
                            active={filterSource === 'all'}
                            onClick={() => setFilterSource('all')}
                            icon={<FiUsers className="w-3.5 h-3.5" />}
                            label="All"
                            count={counts.all}
                            color="#06b6d4"
                        />
                        <FilterButton
                            active={filterSource === 'consent'}
                            onClick={() => setFilterSource('consent')}
                            icon={<FiShield className="w-3.5 h-3.5" />}
                            label="Consent"
                            count={counts.consent}
                            color="#22c55e"
                        />
                        <FilterButton
                            active={filterSource === 'social'}
                            onClick={() => setFilterSource('social')}
                            icon={<FiGlobe className="w-3.5 h-3.5" />}
                            label="Social"
                            count={counts.social}
                            color="#a855f7"
                        />
                    </div>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                        {(
                            [
                                { key: 'similarity', label: 'Match', icon: FiTrendingUp },
                                { key: 'rank', label: 'Rank', icon: FiZap },
                                { key: 'recent', label: 'Recent', icon: FiFilter },
                            ] as const
                        ).map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all
                  ${sortBy === key
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }
                `}
                            >
                                <Icon className="w-3 h-3" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-0.5 p-1 bg-white/5 rounded-xl border border-white/5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <FiGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <FiList className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-green-400">CONSENT</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">Verified, contactable</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-cyan-400">SOCIAL</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">Public, claimable</span>
                </div>
                <span className="text-gray-500 ml-auto">
                    Showing {filteredResults.length} of {results.length}
                </span>
            </div>

            <AnimatePresence mode="wait">
                {filteredResults.length > 0 ? (
                    <motion.div
                        key={`${filterSource}-${sortBy}-${viewMode}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                                : 'space-y-3'
                        }
                    >
                        {filteredResults.map((result, idx) => renderResult(result, idx))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <FiFilter className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">No results in this filter</p>
                        <p className="text-sm text-gray-500">
                            Try selecting a different source
                        </p>
                        <button
                            onClick={() => setFilterSource('all')}
                            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs text-gray-300 font-mono transition-colors"
                        >
                            Show All Results
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count: number;
    color: string;
}> = ({ active, onClick, icon, label, count, color }) => (
    <button
        onClick={onClick}
        className={`
      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium transition-all
      ${active
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }
    `}
        style={
            active
                ? {
                    background: `${color}20`,
                    boxShadow: `inset 0 0 0 1px ${color}40`,
                    color,
                }
                : undefined
        }
    >
        {icon}
        <span>{label}</span>
        <span
            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${active ? 'bg-white/10' : 'bg-white/5'
                }`}
        >
            {count}
        </span>
    </button>
);

export default UnifiedResults;