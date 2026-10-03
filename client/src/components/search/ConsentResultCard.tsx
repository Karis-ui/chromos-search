import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiMapPin,
    FiBriefcase,
    FiCheck,
    FiMessageCircle,
    FiInstagram,
    FiTwitter,
    FiLinkedin,
    FiYoutube,
    FiShield,
    FiStar,
    FiExternalLink,
} from 'react-icons/fi';
import { FaTiktok, FaTelegram, FaReddit, FaSnapchat, FaPinterest } from 'react-icons/fa';

import { NeonBorder } from '../common/NeonBorder';
import { getConfidenceColor, formatConfidence } from '../../utils/formatters';
import type { UnifiedResult } from '../../api/endpoints/search';

const SOCIAL_ICONS: Record<string, any> = {
    instagram: FiInstagram,
    twitter: FiTwitter,
    linkedin: FiLinkedin,
    youtube: FiYoutube,
    tiktok: FaTiktok,
    telegram: FaTelegram,
    reddit: FaReddit,
    snapchat: FaSnapchat,
    pinterest: FaPinterest,
};

interface ConsentResultCardProps {
    result: UnifiedResult;
    onContact?: (result: UnifiedResult) => void;
    onViewProfile?: (result: UnifiedResult) => void;
}

export const ConsentResultCard: React.FC<ConsentResultCardProps> = ({ result, onContact, onViewProfile }) => {

    const [isHovered, setIsHovered] = useState(false);
    const similarity = result.similarity;
    const confidenceColor = getConfidenceColor(similarity);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-pointer"
        >
            <NeonBorder color="green" intensity={isHovered ? 'high' : 'medium'}>
                <div className="relative bg-gray-950/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-500/40">
                        <FiShield className="w-3 h-3 text-green-400" />
                        <span className="text-[9px] font-bold text-green-400 font-mono uppercase tracking-wider">
                            CONSENT
                        </span>
                    </div>

                    {result.is_verified && (
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-cyan-500/20 backdrop-blur-xl rounded-full border border-cyan-500/40">
                            <FiCheck className="w-3 h-3 text-cyan-400" />
                            <span className="text-[9px] font-bold text-cyan-400 font-mono">
                                VERIFIED
                            </span>
                        </div>
                    )}

                    <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                        {result.thumbnail ? (
                            <img
                                src={result.thumbnail}
                                alt={result.display_name || 'Profile'}
                                className="w-full h-full object-cover transition-transform duration-500"
                                style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FiUser className="w-16 h-16 text-gray-700" />
                            </div>
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
                                    {formatConfidence(similarity)}
                                </span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${similarity * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    style={{ backgroundColor: confidenceColor }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <div>
                            <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                                {result.display_name || 'Anonymous User'}
                                {result.is_featured && (
                                    <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                                )}
                            </h3>

                            {result.occupation && (
                                <p className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                                    <FiBriefcase className="w-3 h-3" />
                                    {result.occupation}
                                    {result.company && ` @ ${result.company}`}
                                </p>
                            )}
                        </div>

                        {result.location && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <FiMapPin className="w-3 h-3" />
                                <span className="truncate">{result.location}</span>
                            </div>
                        )}

                        {result.bio && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {result.bio}
                            </p>
                        )}

                        {result.social_links && Object.keys(result.social_links).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                                {Object.entries(result.social_links).map(([platform, url]) => {
                                    const Icon = SOCIAL_ICONS[platform.toLowerCase()];
                                    if (!Icon) return null;
                                    return (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 flex items-center justify-center transition-all group"
                                            title={`Open ${platform}`}
                                        >
                                            <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            {result.allow_direct_messages && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onContact?.(result);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg text-white text-xs font-semibold font-mono transition-all shadow-lg shadow-purple-500/20"
                                >
                                    <FiMessageCircle className="w-3.5 h-3.5" />
                                    Contact
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewProfile?.(result);
                                }}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs text-gray-300 font-mono transition-colors"
                            >
                                <FiExternalLink className="w-3.5 h-3.5" />
                                Profile
                            </button>
                        </div>
                    </div>
                </div>
            </NeonBorder>
        </motion.div>
    );
};

export default ConsentResultCard;