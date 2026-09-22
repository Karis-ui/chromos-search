import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../providers';
import { GlassCard } from '../components/common/GlassCard';
import { GradientButton } from '../components/common/GradientButton';
import { GlitchText } from '../components/common/GlitchText';
import { ROUTES } from '../constants/routes';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const from = (location.state as any)?.from?.pathname || ROUTES.HOME;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login({ username, password });
        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-black to-gray-950">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        <GlitchText text="CHRONOS OSINT" />
                    </h1>
                    <p className="text-sm text-gray-400 font-mono">
                        Neural Intelligence Access Terminal
                    </p>
                </div>

                <GlassCard className="p-8 border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 text-xs font-mono rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2">
                                IDENTIFIER / USERNAME
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="agent@chronos.ai"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2">
                                ACCESS KEY
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <GradientButton
                            type="submit"
                            disabled={isLoading}
                            className="w-full justify-center py-3 text-sm font-semibold tracking-wide"
                        >
                            {isLoading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
                            <FiArrowRight className="ml-2 w-4 h-4" />
                        </GradientButton>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Don't have clearance?{' '}
                        <Link
                            to={ROUTES.REGISTER}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline font-medium"
                        >
                            Register Identity
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default LoginPage;
