import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiLayout, FiEye } from 'react-icons/fi';
import { ResultCard } from './ResultCard';

interface MorphingGridProps {
    results: Array<{
        id?: string;
        url: string;
        platform: string;
        posted_at: string;
        confidence: number;
        similarity: number;
        thumbnail: string;
        caption?: string;
        author_username?: string;
        media_type?: string;
    }>;
    onResultClick?: (result: any) => void;
}

export const MorphingGrid: React.FC<MorphingGridProps> = ({ results, onResultClick }) => {
    const [layout, setLayout] = useState<'grid' | 'list' | 'masonry'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'confidence' | 'date' | 'platform'>('confidence');
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const filteredResults = useMemo(() => {
        let filtered = [...results];

        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.author_username?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedPlatform) {
            filtered = filtered.filter(r => r.platform === selectedPlatform);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'confidence':
                    return b.similarity - a.similarity;
                case 'date':
                    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
                case 'platform':
                    return a.platform.localeCompare(b.platform);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [results, searchTerm, selectedPlatform, sortBy]);

    const layoutClasses = {
        grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4',
        list: 'flex flex-col gap-3',
        masonry: 'columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4',
    };

    const platforms = useMemo(() => {
        const unique = new Set(results.map(r => r.platform));
        return Array.from(unique);
    }, [results]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="flex-1 min-w-[150px]">
                    <input
                        type="text"
                        placeholder="Search results..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    <button
                        onClick={() => setSelectedPlatform(null)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedPlatform === null
                            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All
                    </button>
                    {platforms.map((platform) => (
                        <button
                            key={platform}
                            onClick={() => setSelectedPlatform(platform === selectedPlatform ? null : platform)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap capitalize ${selectedPlatform === platform
                                ? 'bg-purple-400/20 text-purple-400 border border-purple-400/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {platform}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-2 py-1 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-400/50"
                    >
                        <option value="confidence">Confidence</option>
                        <option value="date">Date</option>
                        <option value="platform">Platform</option>
                    </select>
                </div>

                <div className="flex items-center gap-0.5 p-0.5 bg-white/5 rounded-xl border border-white/5">
                    {(['grid', 'list', 'masonry'] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLayout(l)}
                            className={`p-1.5 rounded-lg transition-all ${layout === l
                                ? 'bg-cyan-400/20 text-cyan-400'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {l === 'grid' && <FiGrid className="w-3.5 h-3.5" />}
                            {l === 'list' && <FiList className="w-3.5 h-3.5" />}
                            {l === 'masonry' && <FiLayout className="w-3.5 h-3.5" />}
                        </button>
                    ))}
                </div>

                <span className="text-[10px] text-gray-500 font-mono ml-auto">
                    {filteredResults.length} / {results.length} results
                </span>
            </div>

            <AnimatePresence mode="wait">
                {filteredResults.length > 0 ? (
                    <motion.div
                        key={layout}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={layoutClasses[layout]}
                    >
                        {filteredResults.map((result, index) => (
                            <motion.div
                                key={result.id || index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className={layout === 'list' ? 'w-full' : undefined}
                            >
                                <ResultCard
                                    result={result}
                                    index={index}
                                    onClick={() => onResultClick?.(result)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <FiEye className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 font-medium">No results found</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Try adjusting your filters or search term
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MorphingGrid;