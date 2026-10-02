import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FiInstagram,
    FiFacebook,
    FiTwitter,
    FiYoutube,
    FiLinkedin,
    FiCheck,
    FiX,
    FiLink,
    FiInfo,
    FiChevronRight,
} from 'react-icons/fi';
import { FaTiktok, FaTelegram, FaReddit, FaSnapchat, FaPinterest } from 'react-icons/fa';

import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';
import { GlitchText } from '../common/GlitchText';
import { useConsent } from '../../hooks/useConsent';
import { toast } from 'react-toastify';

interface PlatformConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    placeholder: string;
    prefix: string;
}
const PLATFORMS: PlatformConfig[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        icon: <FiInstagram />,
        color: '#E4405F',
        placeholder: 'username',
        prefix: 'https://instagram.com/',
    },
    {
        id: 'twitter',
        name: 'Twitter / X',
        icon: <FiTwitter />,
        color: '#1DA1F2',
        placeholder: 'username',
        prefix: 'https://twitter.com/',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: <FaTiktok />,
        color: '#000000',
        placeholder: 'username',
        prefix: 'https://tiktok.com/@',
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: <FiFacebook />,
        color: '#1877F2',
        placeholder: 'username',
        prefix: 'https://facebook.com/',
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: <FiLinkedin />,
        color: '#0A66C2',
        placeholder: 'username',
        prefix: 'https://linkedin.com/in/',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: <FiYoutube />,
        color: '#FF0000',
        placeholder: '@channel',
        prefix: 'https://youtube.com/',
    },
    {
        id: 'telegram',
        name: 'Telegram',
        icon: <FaTelegram />,
        color: '#26A5E4',
        placeholder: 'username',
        prefix: 'https://t.me/',
    },
    {
        id: 'reddit',
        name: 'Reddit',
        icon: <FaReddit />,
        color: '#FF4500',
        placeholder: 'u/username',
        prefix: 'https://reddit.com/',
    },
    {
        id: 'snapchat',
        name: 'Snapchat',
        icon: <FaSnapchat />,
        color: '#FFFC00',
        placeholder: 'username',
        prefix: 'https://snapchat.com/add/',
    },
    {
        id: 'pinterest',
        name: 'Pinterest',
        icon: <FaPinterest />,
        color: '#E60023',
        placeholder: 'username',
        prefix: 'https://pinterest.com/',
    },
]

interface SocialLinkerProps {
    onNext: () => void;
    onBack: () => void;
}

export const SocialLinker: React.FC<SocialLinkerProps> = ({ onNext, onBack }) => {
    const { updateSocialLinks } = useConsent();
    const [links, setLinks] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleLinkChange = useCallback((platformId: string, value: string) => {
        setLinks(prev => ({ ...prev, [platformId]: value.trim() }));
    }, []);

    const clearLink = useCallback((platformId: string) => {
        setLinks((prev) => {
            const newLinks = { ...prev };
            delete newLinks[platformId];
            return newLinks;
        });
    }, []);

    const handleContinue = useCallback(async () => {
        const fullLinks: Record<string, string> = {};
        for (const [platformId, value] of Object.entries(links)) {
            if (value) {
                const platform = PLATFORMS.find((p) => p.id === platformId);
                if (platform) {
                    if (value.startsWith('http')) {
                        fullLinks[platformId] = value;
                    } else {
                        const username = value.replace(/^\/+/, '').replace(/\/+$/, '');
                        fullLinks[platformId] = `${platform.prefix}${username}`;
                    }
                }
            }
        }

        if (Object.keys(fullLinks).length === 0) {
            toast.error('Please enter at least one social link');
            return;
        }

        try {
            await updateSocialLinks(fullLinks as any);
        } catch (err) {
            console.log('Failed to update social links', err);
            toast.error('Failed to update social links');
        } finally {
            setIsSaving(false);
        }
        onNext();
    }, [links, updateSocialLinks]);

    const handleSkip = useCallback(() => {
        onNext();
    }, [onNext]);

    const activeCount = Object.values(links).filter((v) => v && v.trim()).length;

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="text-center mb-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-xl shadow-purple-500/25"
                >
                    <FiLink className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    <GlitchText glitchInterval={5000} intensity={0.4}>
                        Link Your Socials
                    </GlitchText>
                </h2>

                <p className="text-sm text-gray-400 max-w-lg mx-auto">
                    Optional. Linked accounts appear in your search results so people can find and reach you.
                </p>
            </div>

            {/* ── Info Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl"
            >
                <div className="flex items-start gap-3">
                    <FiInfo className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-400 leading-relaxed">
                        <p className="font-semibold text-purple-400 mb-1">
                            All fields are optional
                        </p>
                        <p>
                            You can skip this step and add socials later. Only add links you're
                            comfortable sharing publicly.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── Platforms ── */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
                {PLATFORMS.map((platform, idx) => {
                    const value = links[platform.id] || '';
                    const isActive = value.trim().length > 0;

                    return (
                        <motion.div
                            key={platform.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <GlassCard
                                variant={isActive ? 'light' : 'dark'}
                                padding="sm"
                                className={`
                  transition-all duration-300
                  ${isActive ? 'border-purple-500/30 shadow-lg shadow-purple-500/10' : ''}
                `}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Icon */}
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border"
                                        style={{
                                            background: `linear-gradient(135deg, ${platform.color}20, ${platform.color}05)`,
                                            borderColor: `${platform.color}40`,
                                            color: platform.color,
                                        }}
                                    >
                                        <span className="text-lg">{platform.icon}</span>
                                    </div>

                                    {/* Input */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                                {platform.name}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center"
                                                >
                                                    <FiCheck className="w-2.5 h-2.5 text-green-400" />
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono pointer-events-none">
                                                {platform.prefix}
                                            </span>
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) =>
                                                    handleLinkChange(platform.id, e.target.value)
                                                }
                                                placeholder={platform.placeholder}
                                                className={`
                          w-full pl-[var(--prefix-width)] py-1.5 bg-transparent
                          border-b text-sm text-white placeholder-gray-600
                          focus:outline-none transition-colors font-mono
                          ${isActive
                                                        ? 'border-purple-500/40 focus:border-purple-400'
                                                        : 'border-white/10 focus:border-cyan-400/50'
                                                    }
                        `}
                                                style={{
                                                    ['--prefix-width' as any]: `${platform.prefix.length * 6.5}px`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Clear */}
                                    {isActive && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={() => clearLink(platform.id)}
                                            className="flex-shrink-0 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <FiX className="w-3.5 h-3.5 text-red-400" />
                                        </motion.button>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Counter ── */}
            {activeCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-xl"
                >
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-green-400 font-mono">
                        {activeCount} {activeCount === 1 ? 'account' : 'accounts'} will be
                        linked
                    </p>
                </motion.div>
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-between gap-4 pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-sm text-gray-300 hover:text-white font-mono"
                >
                    ← Back
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-3 text-xs text-gray-500 hover:text-gray-300 font-mono transition-colors"
                    >
                        Skip for now
                    </button>

                    <GradientButton
                        onClick={handleContinue}
                        loading={isSaving}
                        loadingText="Saving..."
                        variant="rainbow"
                        size="lg"
                        icon={<FiChevronRight />}
                        iconPosition="right"
                        className="min-w-[200px]"
                    >
                        {activeCount > 0 ? 'Save & Continue' : 'Continue'}
                    </GradientButton>
                </div>
            </div>
        </div>
    );
};

export default SocialLinker;