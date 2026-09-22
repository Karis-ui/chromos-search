import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiMail, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../providers';
import { GlassCard } from '../components/common/GlassCard';
import { GradientButton } from '../components/common/GradientButton';
import { GlitchText } from '../components/common/GlitchText';
import { ROUTES } from '../constants/routes';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await register({
            email,
            username,
            password,
            acceptTerms: true,
        });
        if (success) {
            navigate(ROUTES.LOGIN);
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
                        <GlitchText text="CREATE CLEARANCE" />
                    </h1>
                    <p className="text-sm text-gray-400 font-mono">
                        Register New Agent Node
                    </p>
                </div>

                <GlassCard className="p-8 border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-mono rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2">
                                EMAIL IDENTIFIER
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agent@chronos.ai"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2">
                                CODENAME / USERNAME
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="agent_zero"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-2">
                                CIPHER KEY
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
                            className="w-full justify-center py-3 text-sm font-semibold tracking-wide mt-2"
                        >
                            {isLoading ? 'COMMITTING NODE...' : 'INITIALIZE PROFILE'}
                            <FiArrowRight className="ml-2 w-4 h-4" />
                        </GradientButton>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        Already have access credentials?{' '}
                        <Link
                            to={ROUTES.LOGIN}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors underline font-medium"
                        >
                            Access Terminal
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
