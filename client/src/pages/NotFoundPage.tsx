import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';
import { GlitchText } from '../components/common/GlitchText';
import { GradientButton } from '../components/common/GradientButton';
import { ROUTES } from '../constants/routes';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-black to-gray-950">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                    <FiAlertTriangle className="w-10 h-10 animate-pulse" />
                </div>
                <h1 className="text-6xl font-bold font-mono text-cyan-400 mb-2">
                    <GlitchText text="404" />
                </h1>
                <h2 className="text-xl font-bold text-white mb-2">NODE NOT FOUND</h2>
                <p className="text-sm text-gray-400 font-mono mb-8">
                    The requested coordinates do not exist in the neural matrix.
                </p>
                <Link to={ROUTES.HOME}>
                    <GradientButton className="mx-auto justify-center">
                        <FiHome className="mr-2 w-4 h-4" />
                        RETURN TO COMMAND
                    </GradientButton>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
