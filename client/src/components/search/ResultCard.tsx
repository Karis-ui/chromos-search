import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShare2, FiExternalLink, FiClock, FiUser, FiCamera, FiVideo } from 'react-icons/fi';
import { getPlatformColor, formatTimeAgo, formatNumber, getConfidenceColor } from '../../utils/formatters';
import { NeonBorder } from '../common/NeonBorder';

interface ResultCardProps {
    result: {
        id?: string;
        url: string;
        platform: string;
        posted_at: string;
        confidence: string;
        similarity: number;
        thumbnail: string;
        caption?: string;
        author_username?: string;
        media_type?: string;
        likes?: number;
        shares?: number;
        comments?: number;
    };
    index: number;
    onClick?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, index, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const confidenceNum = parseFloat(result.confidence);
    const confidenceColor = getConfidenceColor(confidenceNum);
    const platformColor = getPlatformColor(result.platform);

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
    }, [isLiked]);

    const handleShare = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: 'Chromos Search Result',
                text: `Found on ${result.platform}`,
                url: result.url
            });
        }
    }, [result]);

    const handleOpen = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(result.url, '_blank', 'noopener,noreferrer')
    }, [result.url]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-pointer"
        >
            <NeonBorder
                color={confidenceNum > 85 ? 'green' : confidenceNum > 70 ? 'cyan' : 'yellow'}
                intensity={isHovered ? 'high' : 'medium'}
                animationSpeed={0.5 + index * 0.1}
                className="h-full"
            >
                <div className="relative h-full flex flex-col overflow-hidden">
                    <div className="relative aspect-[4/3] bg-gray-800/50 overflow-hidden">
                        {result.thumbnail ? (
                            <img
                                src={result.thumbnail}
                                alt={result.caption || 'Result thumbnail'}
                                className="w-full h-full object-cover transition-transform duration-500"
                                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                <span className="text-4xl opacity-20">📸</span>
                            </div>
                        )}

                        {result.media_type && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xl rounded-md border border-white/5">
                                {result.media_type === 'video' ? (
                                    <FiVideo className="w-3 h-3 text-cyan-400" />
                                ) : (
                                    <FiCamera className="w-3 h-3 text-purple-400" />
                                )}
                            </div>
                        )}

                        <div
                            className="absolute top-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-xl border text-[10px] font-mono font-bold"
                            style={{
                                backgroundColor: `${confidenceColor}20`,
                                borderColor: `${confidenceColor}40`,
                                color: confidenceColor,
                            }}
                        >
                            {result.confidence}
                        </div>

                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xl rounded-md border border-white/5 text-[9px] text-gray-400 font-mono">
                            #{index + 1}
                        </div>

                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center gap-3"
                                >
                                    <button
                                        onClick={handleOpen}
                                        className="p-2 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <FiExternalLink className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <FiShare2 className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                        onClick={handleLike}
                                        className={`p-2 backdrop-blur-xl rounded-full transition-all border border-white/10 ${isLiked ? 'bg-pink-500/30 border-pink-500/30' : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        <FiHeart className={`w-4 h-4 ${isLiked ? 'text-pink-400 fill-pink-400' : 'text-white'}`} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 p-3 flex flex-col">
                        {/* Platform & Time */}
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-[10px] font-semibold uppercase tracking-wider"
                                    style={{ color: platformColor }}
                                >
                                    {result.platform}
                                </span>
                                <span className="text-[8px] text-gray-600">•</span>
                                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                    <FiClock className="w-2.5 h-2.5" />
                                    {formatTimeAgo(result.posted_at)}
                                </span>
                            </div>
                        </div>

                        {result.author_username && (
                            <div className="flex items-center gap-1 mb-1">
                                <FiUser className="w-2.5 h-2.5 text-gray-500" />
                                <span className="text-[10px] text-gray-400 truncate">
                                    @{result.author_username}
                                </span>
                            </div>
                        )}

                        {result.caption && (
                            <p className="text-xs text-gray-300 line-clamp-2 flex-1">
                                {result.caption}
                            </p>
                        )}

                        {(result.likes || result.shares || result.comments) && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                                {result.likes && (
                                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                        ❤️ {formatNumber(result.likes)}
                                    </span>
                                )}
                                {result.comments && (
                                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                        💬 {formatNumber(result.comments)}
                                    </span>
                                )}
                                {result.shares && (
                                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                                        🔄 {formatNumber(result.shares)}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="mt-2 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${confidenceNum * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                style={{ backgroundColor: confidenceColor }}
                            />
                        </div>
                    </div>
                </div>
            </NeonBorder>
        </motion.div>
    );
};