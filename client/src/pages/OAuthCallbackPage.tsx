import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiCpu } from 'react-icons/fi';
import { ParticleBackground } from '../components/common/ParticleBackground';
import { CyberGrid } from '../components/common/CyberGrid';
import { Scanline } from '../components/common/Scanline';
import { GradientButton } from '../components/common/GradientButton';
import { GlitchText } from '../components/common/GlitchText';
import { NeonBorder } from '../components/common/NeonBorder';
import { useOAuth } from '../hooks/useOAuth';
import { ROUTES } from '../constants/routes';

type CallbackStatus = 'processing' | 'success' | 'error';
export const OAuthCallbackPage: React.FC = () => {
    const { handleCallback } = useOAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<CallbackStatus>('processing');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const processCallback = async () => {
            try {
                setStatus('processing');
                const success = await handleCallback(searchParams);
                if (success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setErrorMessage("Authentication failed");
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage(error instanceof Error ? error.message : "An unexpedcted error occurred");
            }
        };
        processCallback();
    }, [handleCallback, searchParams]);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
            <ParticleBackground />
            <CyberGrid animated speed={0.3} />
            <Scanline color="#06b6d4" intensity={0.3} />

            <div className="relative z-10 max-w-md w-full">
                <NeonBorder
                    color={status === 'error' ? 'pink' : 'cyan'}
                    intensity="medium"
                >
                    <div className="p-8 text-center">
                        {/* ── Icon / Animation ── */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto mb-6 relative"
                        >
                            {status === 'processing' && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    />
                                    <div className="absolute inset-1 bg-gray-950 rounded-full flex items-center justify-center">
                                        <FiCpu className="w-8 h-8 text-cyan-400" />
                                    </div>
                                </>
                            )}

                            {status === 'success' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center"
                                >
                                    <FiCheckCircle className="w-10 h-10 text-green-400" />
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                    className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center"
                                >
                                    <FiAlertCircle className="w-10 h-10 text-red-400" />
                                </motion.div>
                            )}
                        </motion.div>

                        <h1 className="text-2xl font-bold text-white mb-3 font-mono">
                            <GlitchText glitchInterval={3000}>
                                {status === 'processing' && 'AUTHENTICATING'}
                                {status === 'success' && 'SUCCESS'}
                                {status === 'error' && 'AUTHENTICATION FAILED'}
                            </GlitchText>
                        </h1>

                        <p className="text-sm text-gray-400 font-mono mb-6">
                            {status === 'processing' && 'Verifying your credentials...'}
                            {status === 'success' && 'Redirecting to your dashboard...'}
                            {status === 'error' && errorMessage}
                        </p>

                        {status === 'processing' && (
                            <div className="flex items-center justify-center gap-1.5 mb-6">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-cyan-400"
                                        animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-3">
                                <GradientButton
                                    onClick={() => navigate(ROUTES.LOGIN)}
                                    variant="cyan"
                                    fullWidth
                                >
                                    Back to Login
                                </GradientButton>

                                <GradientButton
                                    onClick={() => window.location.reload()}
                                    variant="ghost"
                                    fullWidth
                                >
                                    Try Again
                                </GradientButton>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono">
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${status === 'processing'
                                    ? 'bg-cyan-400 animate-pulse'
                                    : status === 'success'
                                        ? 'bg-green-400'
                                        : 'bg-red-400'
                                    }`}
                            />
                            <span>
                                {status === 'processing' && 'PROCESSING OAUTH CALLBACK'}
                                {status === 'success' && 'REDIRECTING...'}
                                {status === 'error' && 'ERROR ENCOUNTERED'}
                            </span>
                        </div>
                    </div>
                </NeonBorder>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;