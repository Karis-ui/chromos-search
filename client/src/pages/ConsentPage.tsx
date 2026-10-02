import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShield, FiUserPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import { ConsentWizard } from '../components/consent/ConsentWizard';
import { ParticleBackground } from '../components/common/ParticleBackground';
import { CyberGrid } from '../components/common/CyberGrid';
import { Scanline } from '../components/common/Scanline';

import { useConsent } from '../hooks/useConsent';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export const ConsentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { hasConsent, isActive, refreshStatus } = useConsent();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate(ROUTES.LOGIN, {
                state: { from: location },
                replace: true,
            });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    useEffect(() => {
        const checkConsent = async () => {
            if (!isAuthenticated) return;

            try {
                await refreshStatus();
            } catch (error) {
            } finally {
                setIsChecking(false);
            }
        };

        checkConsent();
    }, [isAuthenticated, refreshStatus]);

    const handleComplete = () => {
        toast.success('Welcome to Chronos!');
        navigate(ROUTES.DASHBOARD);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (authLoading || isChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (hasConsent && isActive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
                <ParticleBackground />
                <CyberGrid animated speed={0.3} />
                <Scanline color="#22c55e" intensity={0.3} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md w-full bg-gray-950/80 backdrop-blur-2xl rounded-3xl border border-green-500/20 p-8 text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                        <FiShield className="w-8 h-8 text-green-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        You're Already Searchable
                    </h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Your consent is active. You can manage your profile from settings.
                    </p>

                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                        Go to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-4 overflow-x-hidden">
            <ParticleBackground />
            <CyberGrid animated speed={0.3} />
            <Scanline color="#06b6d4" intensity={0.3} />
            <div
                className="fixed top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)',
                }}
            />
            <div
                className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{
                    background:
                        'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
                }}
            />

            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-4xl mx-auto mb-8"
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-gray-300 hover:text-white font-mono group"
                    >
                        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <FiUserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold shimmer-text">
                                Become Searchable
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">
                                Step-by-step setup
                            </p>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="relative z-10">
                <ConsentWizard
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                />
            </div>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-10 max-w-4xl mx-auto mt-12 text-center"
            >
                <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-gray-500 font-mono">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span>Secure Connection</span>
                    </div>
                    <span className="text-gray-700">•</span>
                    <span>TLS 1.3</span>
                    <span className="text-gray-700">•</span>
                    <span>AES-256 Encryption</span>
                    <span className="text-gray-700">•</span>
                    <span>SOC 2 Compliant</span>
                </div>
            </motion.footer>
        </div>
    );
};

export default ConsentPage;