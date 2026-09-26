import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX,
    FiExternalLink,
    FiShare2,
    FiHeart,
    FiClock,
    FiUser,
    FiMapPin,
    FiMessageSquare,
    FiImage,
    FiVideo,
    FiCopy,
    FiCheck,
} from 'react-icons/fi';
import { getPlatformColor, formatTimeAgo, formatNumber } from '../../utils/formatters';
import { NeonBorder } from '../common/NeonBorder';

interface ResultDetailModalProps {
    result: {
        id?: string;
        url: string;
        platform: string;
        posted_at: string;
        confidence: number;
        similarity: number;
        thumbnail: string;
        caption?: string;
        author_username?: string;
        author_full_name?: string;
        author_profile_url?: string;
        media_type?: string;
        likes?: number;
        shares?: number;
        comments?: number;
        location?: {
            place_name?: string;
            city?: string;
            country?: string;
        };
        hashtags?: string[];
        mentions?: string[];
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ResultDetailModal: React.FC<ResultDetailModalProps> = ({
    result, isOpen, onClose,
}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!result || !isOpen) return null;
    const confidenceNum = result.confidence;
    const platformColor = getPlatformColor(result.platform);
    const confidenceColor = confidenceNum > 85 ? '#4ade80' : confidenceNum > 70 ? '#facc15' : '#f87171';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <NeonBorder
                            color={confidenceNum > 85 ? 'green' : 'cyan'}
                            intensity="high"
                            className="w-full"
                        >
                            <div className="relative bg-gray-900/95 backdrop-blur-2xl rounded-2xl overflow-hidden">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-xl rounded-full hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <FiX className="w-5 h-5 text-gray-400" />
                                </button>

                                <div className="grid grid-cols-1 lg:grid-cols-2">
                                    <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full bg-black/30 overflow-hidden">
                                        {result.thumbnail ? (
                                            <img
                                                src={result.thumbnail}
                                                alt={result.caption || 'Result detail'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                <span className="text-6xl opacity-20">📸</span>
                                            </div>
                                        )}

                                        {result.media_type && (
                                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/5 flex items-center gap-2">
                                                {result.media_type === 'video' ? (
                                                    <FiVideo className="w-4 h-4 text-cyan-400" />
                                                ) : (
                                                    <FiImage className="w-4 h-4 text-purple-400" />
                                                )}
                                                <span className="text-xs text-gray-300 capitalize">
                                                    {result.media_type}
                                                </span>
                                            </div>
                                        )}

                                        <div
                                            className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-xl border text-xs font-mono font-bold"
                                            style={{
                                                backgroundColor: `${confidenceColor}20`,
                                                borderColor: `${confidenceColor}40`,
                                                color: confidenceColor,
                                            }}
                                        >
                                            {result.confidence} Match
                                        </div>
                                    </div>

                                    <div className="p-6 lg:p-8 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: platformColor }}
                                                >
                                                    {result.platform}
                                                </span>
                                                <span className="text-gray-600">•</span>
                                                <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                                    <FiClock className="w-3 h-3" />
                                                    {formatTimeAgo(result.posted_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={handleCopy}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    {copied ? (
                                                        <FiCheck className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <FiCopy className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => window.open(result.url, '_blank')}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <FiExternalLink className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                            {result.author_profile_url ? (
                                                <img
                                                    src={result.author_profile_url}
                                                    alt={result.author_username}
                                                    className="w-10 h-10 rounded-full border border-white/10"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                                    <FiUser className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    {result.author_full_name || result.author_username}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    @{result.author_username}
                                                </p>
                                            </div>
                                        </div>

                                        {result.caption && (
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                    {result.caption}
                                                </p>
                                            </div>
                                        )}

                                        {((result.hashtags ?? []).length > 0 || (result.mentions ?? []).length > 0) && (
                                            <div className="space-y-2">
                                                {(result.hashtags ?? []).length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(result.hashtags ?? []).map((tag, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-0.5 bg-cyan-400/10 rounded-lg text-xs text-cyan-400 font-mono"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {(result.mentions ?? []).length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(result.mentions ?? []).map((mention, i) => (
                                                            <span
                                                                key={i}
                                                                className="px-2 py-0.5 bg-purple-400/10 rounded-lg text-xs text-purple-400 font-mono"
                                                            >
                                                                @{mention}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {result.location?.place_name && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FiMapPin className="w-3 h-3" />
                                                <span>{result.location.place_name}</span>
                                                {result.location.city && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{result.location.city}</span>
                                                    </>
                                                )}
                                                {result.location.country && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{result.location.country}</span>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {(result.likes || result.shares || result.comments) && (
                                            <div className="flex items-center gap-6 p-3 bg-white/5 rounded-xl border border-white/5">
                                                {result.likes && (
                                                    <div className="flex items-center gap-2">
                                                        <FiHeart className="w-4 h-4 text-pink-400" />
                                                        <span className="text-sm font-mono text-gray-300">
                                                            {formatNumber(result.likes)}
                                                        </span>
                                                    </div>
                                                )}
                                                {result.comments && (
                                                    <div className="flex items-center gap-2">
                                                        <FiMessageSquare className="w-4 h-4 text-cyan-400" />
                                                        <span className="text-sm font-mono text-gray-300">
                                                            {formatNumber(result.comments)}
                                                        </span>
                                                    </div>
                                                )}
                                                {result.shares && (
                                                    <div className="flex items-center gap-2">
                                                        <FiShare2 className="w-4 h-4 text-purple-400" />
                                                        <span className="text-sm font-mono text-gray-300">
                                                            {formatNumber(result.shares)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => setIsLiked(!isLiked)}
                                                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${isLiked
                                                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/20'
                                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                                                    }`}
                                            >
                                                <FiHeart className={isLiked ? 'fill-pink-400' : ''} />
                                                {isLiked ? 'Liked' : 'Like'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (navigator.share) {
                                                        navigator.share({
                                                            title: 'Chronos Search Result',
                                                            text: `Found on ${result.platform}`,
                                                            url: result.url,
                                                        });
                                                    }
                                                }}
                                                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2"
                                            >
                                                <FiShare2 />
                                                Share
                                            </button>
                                            <button
                                                onClick={() => window.open(result.url, '_blank')}
                                                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                                            >
                                                <FiExternalLink />
                                                View Original
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="absolute top-0 left-0 right-0 h-0.5"
                                    style={{
                                        background: `linear-gradient(90deg, transparent, ${confidenceColor}, transparent)`,
                                    }}
                                />
                            </div>
                        </NeonBorder>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};