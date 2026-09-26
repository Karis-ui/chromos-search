import React from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaGithub, FaMicrosoft, FaApple, FaLinkedin } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

import { useOAuth } from '../../hooks/useOAuth';
import { type OAuthProvider } from '../../api/endpoints/oauth';

const PROVIDER_CONFIG: Record<OAuthProvider, {
    icon: React.ReactNode;
    name: string;
    color: string;
    bgHover: string;
}> = {
    google: {
        icon: <FaGoogle />,
        name: 'Google',
        color: '#EA4335',
        bgHover: 'hover:bg-red-500/10 hover:border-red-500/30',
    },
    github: {
        icon: <FaGithub />,
        name: 'GitHub',
        color: '#FFFFFF',
        bgHover: 'hover:bg-white/10 hover:border-white/30',
    },
    microsoft: {
        icon: <FaMicrosoft />,
        name: 'Microsoft',
        color: '#00A4EF',
        bgHover: 'hover:bg-blue-500/10 hover:border-blue-500/30',
    },
    apple: {
        icon: <FaApple />,
        name: 'Apple',
        color: '#FFFFFF',
        bgHover: 'hover:bg-white/10 hover:border-white/30',
    },
    linkedin: {
        icon: <FaLinkedin />,
        name: 'LinkedIn',
        color: '#0A66C2',
        bgHover: 'hover:bg-blue-600/10 hover:border-blue-600/30',
    },
};

interface OAuthButtonProps {
    provider: OAuthProvider;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    variant?: 'icon-only' | 'with-text';
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
    provider,
    onClick,
    loading = false,
    disabled = false,
    fullWidth = false,
    variant = 'with-text',
}) => {
    const config = PROVIDER_CONFIG[provider];
    if (!config) return null;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
            className={`
        relative flex items-center justify-center gap-3
        px-4 py-3 
        bg-white/5 border border-white/10 rounded-xl
        text-sm text-gray-300 font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.bgHover}
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'icon-only' ? 'w-12 !p-0' : ''}
      `}
        >
            {/* Icon */}
            <span
                className="text-lg flex-shrink-0"
                style={{ color: config.color }}
            >
                {loading ? <FiLoader className="animate-spin" /> : config.icon}
            </span>

            {/* Label */}
            {variant === 'with-text' && (
                <span className="font-mono text-xs">
                    {loading ? 'Connecting...' : `Continue with ${config.name}`}
                </span>
            )}
        </motion.button>
    );
};

interface OAuthButtonsProps {
    mode?: 'login' | 'link';
    onSuccess?: () => void;
    layout?: 'grid' | 'stack' | 'compact';
    showOnly?: OAuthProvider[];
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({
    mode = 'login',
    layout = 'grid',
    showOnly,
}) => {
    const { providers, isLoading, loginWithProvider, linkProvider } = useOAuth();

    const enabledProviders = providers.filter((p) => {
        if (!p.enable) return false;
        if (showOnly && !showOnly.includes(p.id)) return false;
        return true;
    });

    const handleClick = (provider: OAuthProvider) => {
        if (mode === 'login') {
            loginWithProvider(provider);
        } else {
            linkProvider(provider);
        }
    };

    if (layout === 'compact') {
        return (
            <div className="flex items-center justify-center gap-3">
                {enabledProviders.map((provider) => (
                    <OAuthButton
                        key={provider.id}
                        provider={provider.id}
                        variant="icon-only"
                        onClick={() => handleClick(provider.id)}
                        loading={isLoading}
                    />
                ))}
            </div>
        );
    }

    if (layout === 'stack') {
        return (
            <div className="space-y-3">
                {enabledProviders.map((provider) => (
                    <OAuthButton
                        key={provider.id}
                        provider={provider.id}
                        onClick={() => handleClick(provider.id)}
                        loading={isLoading}
                        fullWidth
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {enabledProviders.map((provider) => (
                <OAuthButton
                    key={provider.id}
                    provider={provider.id}
                    onClick={() => handleClick(provider.id)}
                    loading={isLoading}
                />
            ))}
        </div>
    );
};

export default OAuthButtons;