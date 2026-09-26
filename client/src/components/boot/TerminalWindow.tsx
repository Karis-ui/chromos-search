import React from "react";
import { motion } from "framer-motion";
import { FiTerminal, FiX, FiMinus, FiSquare } from "react-icons/fi";

interface TerminalWindowProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    onClose?: () => void;
    subTitle?: string;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({ children, className = '', title = 'chronos@system:~/boot', onClose, subTitle }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`relative w-full max-w-4xl bg-black/95 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/10 backdrop-blur-xl ${className}`}
        >
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    boxShadow: 'inset 0 0 40px rgba(34,211,238,0.05), 0 0 60px rgba(34,211,238,0.1)',
                }}
            />

            <div className="relative flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-cyan-500/10">
                <div className="flex items-center gap-2">
                    <motion.div
                        className="w-3 h-3 rounded-full bg-red-500/70"
                        whileHover={{ scale: 1.2 }}
                    />
                    <motion.div
                        className="w-3 h-3 rounded-full bg-yellow-500/70"
                        whileHover={{ scale: 1.2 }}
                    />
                    <motion.div
                        className="w-3 h-3 rounded-full bg-green-500/70"
                        whileHover={{ scale: 1.2 }}
                    />
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono">
                    <FiTerminal className="w-3 h-3 text-cyan-400" />
                    <span className="text-gray-400">{title}</span>
                </div>

                <div className="flex items-center gap-2">
                    {subTitle && (
                        <div className="text-[9px] text-gray-600 font-mono mr-2">
                            {subTitle}
                        </div>
                    )}
                    <button
                        className="p-1 hover:bg-white/5 rounded transition-colors"
                        onClick={onClose}
                    >
                        <FiMinus className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                        className="p-1 hover:bg-white/5 rounded transition-colors"
                        onClick={onClose}
                    >
                        <FiSquare className="w-2.5 h-2.5 text-gray-600" />
                    </button>
                    <button
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        onClick={onClose}
                    >
                        <FiX className="w-3 h-3 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="relative p-6 font-mono text-sm">
                {children}
            </div>
            <motion.div
                className="absolute left-0 right-0 h-[1px] pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)',
                }}
                animate={{
                    top: ['0%', '100%'],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />

            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-400/40 rounded-tl" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-400/40 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-400/40 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-400/40 rounded-br" />
        </motion.div>
    );
};

export default TerminalWindow;