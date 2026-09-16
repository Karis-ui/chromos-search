import React from 'react';
import { motion } from 'framer-motion';
import {
    FiInstagram,
    FiFacebook,
    FiTwitter,
    FiYoutube,
    FiLinkedin,
} from 'react-icons/fi';
import { FaTiktok, FaTelegram, FaReddit, FaSnapchat } from 'react-icons/fa';

interface PlatformFilterProps {
    selected: string[];
    onChange: (plaform: string[]) => void;
}

interface Platform {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}
export const PlatformFilter: React.FC<PlatformFilterProps> = ({ selected, onChange }) => {
    const platforms: Platform[] = [
        { id: 'instagram', label: 'Instagram', icon: <FiInstagram />, color: '#E4405F', bg: 'bg-pink-500/20' },
        { id: 'facebook', label: 'Facebook', icon: <FiFacebook />, color: '#1877F2', bg: 'bg-blue-500/20' },
        { id: 'twitter', label: 'Twitter', icon: <FiTwitter />, color: '#1DA1F2', bg: 'bg-blue-400/20' },
        { id: 'tiktok', label: 'TikTok', icon: <FaTiktok />, color: '#000000', bg: 'bg-white/5' },
        { id: 'youtube', label: 'YouTube', icon: <FiYoutube />, color: '#FF0000', bg: 'bg-red-500/20' },
        { id: 'telegram', label: 'Telegram', icon: <FaTelegram />, color: '#26A5E4', bg: 'bg-blue-300/20' },
        { id: 'reddit', label: 'Reddit', icon: <FaReddit />, color: '#FF4500', bg: 'bg-orange-500/20' },
        { id: 'linkedin', label: 'LinkedIn', icon: <FiLinkedin />, color: '#0A66C2', bg: 'bg-blue-600/20' },
        { id: 'snapchat', label: 'Snapchat', icon: <FaSnapchat />, color: '#FFFC00', bg: 'bg-yellow-500/20' },
    ];

    const togglePlatform = (platformId: string) => {
        if (selected.includes(platformId)) {
            onChange(selected.filter(p => p !== platformId));
        }
        else {
            onChange([...selected, platformId]);
        }
    };

    const selectAll = () => {
        onChange(platforms.map(p => p.id));
    };

    const clearAll = () => {
        onChange([]);
    };

    const isAllSelected = selected.length === platforms.length;
    const isNoneSelected = selected.length === 0;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
                {platforms.map((platform) => {
                    const isSelected = selected.includes(platform.id);

                    return (
                        <motion.button
                            key={platform.id}
                            onClick={() => togglePlatform(platform.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                relative px-2 py-2 rounded-xl text-xs font-medium transition-all
                ${isSelected
                                    ? `${platform.bg} border border-white/20 text-white shadow-lg`
                                    : 'bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-gray-300'
                                }
              `}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="text-sm" style={{ color: isSelected ? platform.color : undefined }}>
                                    {platform.icon}
                                </span>
                                <span className="truncate max-w-[50px]">{platform.label}</span>
                            </div>

                            {isSelected && (
                                <motion.div
                                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ backgroundColor: platform.color }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={selectAll}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${isAllSelected
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={clearAll}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${isNoneSelected
                                ? 'bg-gray-500/20 text-gray-400'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        None
                    </button>
                </div>

                <span className="text-[9px] text-gray-500 font-mono">
                    {selected.length} / {platforms.length} selected
                </span>
            </div>
        </div>
    );
};