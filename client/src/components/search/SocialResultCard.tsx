import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiExternalLink,
    FiUser,
    FiHeart,
    FiMessageSquare,
    FiShare2,
    FiCamera,
    FiClock,
    FiUserPlus,
} from 'react-icons/fi';

import { NeonBorder } from '../common/NeonBorder';
import {
    getConfidenceColor,
    formatConfidence,
    formatTimeAgo,
    formatNumber,
    getPlatformColor,
    getPlatformIcon,
} from '../../utils/formatters';
import type { UnifiedResult } from '../../api/endpoints/search';

interface SocialResultCardProps {
    result: UnifiedResult;
    onClaim?: (result: UnifiedResult) => void;
    onClick?: (result: UnifiedResult) => void;
}

export const SocialResultCard: React.FC<SocialResultCardProps> = ({
    result,
    onClaim,
    onClick,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const confidenceColor = getConfidenceColor(result.similarity);
    const platformIcon = getPlatformIcon(result.platform || 'unknown');
    const platformColor = getPlatformColor(result.platform || 'unknown');
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => onClick?.(result)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-pointer"
        >
            <NeonBorder color="cyan" intensity={isHovered ? 'medium' : 'low'}>
                <div className="relative bg-gray-950/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/20 backdrop-blur-xl rounded-full border border-cyan-500/40">
                        <FiExternalLink className="w-3 h-3 text-cyan-400" />
                        <span className="text-[9px] font-bold text-cyan-400 font-mono uppercase tracking-wider">
                            SOCIAL
                        </span>
                    </div>

                    <div
                        className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 backdrop-blur-xl rounded-full border"
                        style={{
                            backgroundColor: `${platformColor}20`,
                            borderColor: `${platformColor}40`,
                        }}
                    >
                        <span className="text-xs">{platformIcon}</span>
                        <span
                            className="text-[9px] font-bold font-mono uppercase"
                            style={{ color: platformColor }}
                        >
                            {result.platform}
                        </span>
                    </div>
                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                        {result.thumbnail ? (
                            <img
                                src={result.thumbnail}
                                alt={result.caption || 'Result'}
                                className="w-full h-full object-cover transition-transform duration-500"
                                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiCamera className="w-16 h-16 text-gray-700" />
                            </div>
                        )}

                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-center pb-4"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClaim?.(result);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-xs font-semibold font-mono shadow-lg shadow-purple-500/30 transition-all"
                                >
                                    <FiUserPlus className="w-3.5 h-3.5" />
                                    Is this you? Claim
                                </button>
                            </motion.div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-400 font-mono">
                                    MATCH
                                </span>
                                <span
                                    className="text-sm font-bold font-mono"
                                    style={{ color: confidenceColor }}
                                >
                                    {formatConfidence(result.similarity)}
                                </span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.similarity * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    style={{ backgroundColor: confidenceColor }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        {result.author_username && (
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                    <FiUser className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-xs text-gray-300 font-mono truncate">
                                    @{result.author_username}
                                </span>
                            </div>
                        )}

                        {result.caption && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {result.caption}
                            </p>
                        )}

                        {result.posted_at && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                                <FiClock className="w-3 h-3" />
                                {formatTimeAgo(result.posted_at)}
                            </div>
                        )}

                        {(result.likes || result.comments || result.shares) && (
                            <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                                {result.likes != null && result.likes > 0 && (
                                    <span className="flex items-center gap-1">
                                        <FiHeart className="w-3 h-3 text-pink-400" />
                                        {formatNumber(result.likes)}
                                    </span>
                                )}
                                {result.comments != null && result.comments > 0 && (
                                    <span className="flex items-center gap-1">
                                        <FiMessageSquare className="w-3 h-3 text-cyan-400" />
                                        {formatNumber(result.comments)}
                                    </span>
                                )}
                                {result.shares != null && result.shares > 0 && (
                                    <span className="flex items-center gap-1">
                                        <FiShare2 className="w-3 h-3 text-purple-400" />
                                        {formatNumber(result.shares)}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs text-gray-300 font-mono transition-colors"
                            >
                                <FiExternalLink className="w-3.5 h-3.5" />
                                View Post
                            </a>
                        </div>
                    </div>
                </div>
            </NeonBorder>
        </motion.div>
    );
};

export default SocialResultCard;