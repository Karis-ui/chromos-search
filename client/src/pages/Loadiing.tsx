import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';
import { ParticleBackground } from '../components/common/ParticleBackground';
import { CyberGrid } from '../components/common/CyberGrid';
import { Scanline } from '../components/common/Scanline';
import { GlitchText } from '../components/common/GlitchText';

export const LoadingPage: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
            <ParticleBackground />
            <CyberGrid animated speed={0.3} />
            <Scanline color="#06b6d4" intensity={0.3} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center"
            >
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <motion.div
                        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                        <FiCpu className="text-white text-4xl" />
                    </motion.div>

                    <motion.div
                        className="absolute -inset-4 rounded-full border-2 border-cyan-400/20"
                        animate={{ rotate: [360, 0], scale: [1, 1.15, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    <motion.div
                        className="absolute -inset-8 rounded-full border border-purple-400/10"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    />
                </div>

                <GlitchText
                    className="text-2xl font-bold text-white mb-2 font-mono"
                    glitchInterval={3000}
                    intensity={0.5}
                >
                    CHRONOS SEARCH
                </GlitchText>

                <p className="text-sm text-gray-400 font-mono mb-6">{message}</p>

                <div className="flex items-center justify-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.15,
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingPage;