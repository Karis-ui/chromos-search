import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertOctagon, FiRotateCcw, FiHome } from 'react-icons/fi';
import { GlitchText } from '../components/common/GlitchText';
import { GradientButton } from '../components/common/GradientButton';
import { ROUTES } from '../constants/routes';

export const ErrorPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-black to-gray-950">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                    <FiAlertOctagon className="w-10 h-10 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold font-mono text-red-400 mb-2">
                    <GlitchText text="SYSTEM EXCEPTION" />
                </h1>
                <p className="text-sm text-gray-400 font-mono mb-8">
                    An anomaly disrupted subsystem execution.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white font-mono text-xs flex items-center gap-2 transition-colors"
                    >
                        <FiRotateCcw className="w-4 h-4" />
                        RELOAD
                    </button>
                    <Link to={ROUTES.HOME}>
                        <GradientButton className="text-xs">
                            <FiHome className="mr-2 w-4 h-4" />
                            HOME
                        </GradientButton>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
