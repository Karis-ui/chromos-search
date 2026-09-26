import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTerminal, FiCpu, FiSearch } from 'react-icons/fi';

export const TerminalHero: React.FC = () => {
    const [lines, setLines] = useState<Array<{ text: string; type: string }>>([]);
    const [currentLine, setCurrentLine] = useState('');
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const script = [
        { text: '$ chronos search --face ./target.jpg', type: 'command' },
        { text: '', type: 'blank' },
        { text: '⚡ Initializing biometric engine...', type: 'system' },
        { text: '✓ Face detected (confidence: 99.2%)', type: 'success' },
        { text: '✓ Extracting 512-dim face embedding', type: 'success' },
        { text: '', type: 'blank' },
        { text: '🔍 Scanning 12 social platforms...', type: 'info' },
        { text: '  → Instagram................ 847 posts', type: 'info' },
        { text: '  → TikTok................... 512 posts', type: 'info' },
        { text: '  → Twitter/X................ 341 posts', type: 'info' },
        { text: '  → Facebook................. 289 posts', type: 'info' },
        { text: '', type: 'blank' },
        { text: '🎯 Analyzing 6 months of history...', type: 'system' },
        { text: '', type: 'blank' },
        { text: '╔══════════════════════════════════════╗', type: 'ascii' },
        { text: '║   ▓▓▓ 42 MATCHES FOUND ▓▓▓          ║', type: 'ascii' },
        { text: '║                                      ║', type: 'ascii' },
        { text: '║   Top match: 96.4% confidence       ║', type: 'ascii' },
        { text: '║   Platform: Instagram               ║', type: 'ascii' },
        { text: '║   Date: 3 months ago                ║', type: 'ascii' },
        { text: '╚══════════════════════════════════════╝', type: 'ascii' },
        { text: '', type: 'blank' },
        { text: '✓ Search complete in 3.2 seconds', type: 'success' },
        { text: '$ █', type: 'cursor' },
    ]

    useEffect(() => {
        if (lineIndex >= script.length) {
            const restartTimer = setTimeout(() => {
                setLines([]);
                setCurrentLine('');
                setLineIndex(0);
                setCharIndex(0);
            }, 5000);
            return () => clearTimeout(restartTimer);
        }

        const currentScriptLine = script[lineIndex];
        if (currentScriptLine.type === 'blank' || currentScriptLine.type === 'ascii') {
            const timer = setTimeout(() => {
                setLines(prev => [...prev, currentScriptLine]);
                setLineIndex(prev => prev + 1);
                setCurrentLine('');
                setCharIndex(0);
            }, currentScriptLine.type === 'blank' ? 300 : 1000);
            return () => clearTimeout(timer);
        }

        if (charIndex < currentScriptLine.text.length) {
            const timer = setTimeout(() => {
                setCurrentLine(prev => prev + currentScriptLine.text[charIndex]);
                setCharIndex(prev => prev + 1);
            }, 50);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => {
                setLines(prev => [...prev, currentScriptLine]);
                setCurrentLine('');
                setLineIndex(prev => prev + 1);
                setCharIndex(0);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [lineIndex, charIndex, script]);

    const getLineColor = (type: string) => {
        const colors: Record<string, string> = {
            command: 'text-cyan-400',
            system: 'text-purple-400',
            success: 'text-green-400',
            info: 'text-gray-400',
            error: 'text-red-400',
            ascii: 'text-cyan-400',
            cursor: 'text-green-400',
        };
        return colors[type] || 'text-gray-300';
    };

    return (
        <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />

            <div className="relative bg-black/90 backdrop-blur-2xl rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/10">
                <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-cyan-500/10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/70" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                        <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                        <FiTerminal className="w-3 h-3" />
                        <span>chronos@search:~$</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-green-400"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-[9px] text-green-400 font-mono">LIVE</span>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="p-5 h-[500px] overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
                >
                    {lines.map((line, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`whitespace-pre ${getLineColor(line.type)}`}
                        >
                            {line.text || '\u00A0'}
                        </motion.div>
                    ))}

                    {currentLine && (
                        <div className={`whitespace-pre ${getLineColor(script[lineIndex]?.type || 'info')}`}>
                            {currentLine}
                            <motion.span
                                className="inline-block w-2 h-3 ml-0.5 align-middle bg-cyan-400"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            />
                        </div>
                    )}

                    {lineIndex >= script.length && (
                        <div className="text-green-400">
                            $ █
                            <motion.span
                                className="inline-block w-2 h-3 ml-1 align-middle bg-green-400"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-t border-cyan-500/10 text-[9px] text-gray-600 font-mono">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <FiCpu className="w-3 h-3 text-cyan-400" />
                            <span>CHRONOS v3.0</span>
                        </div>
                        <span className="text-gray-700">|</span>
                        <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            OPERATIONAL
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                    </div>
                </div>

                <motion.div
                    className="absolute left-0 right-0 h-px pointer-events-none"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
                    }}
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 px-3 py-1.5 bg-black/90 backdrop-blur-xl rounded-xl border border-green-500/30 shadow-lg shadow-green-500/10"
            >
                <div className="flex items-center gap-2">
                    <FiCpu className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-green-400 font-mono">GPU ACTIVE</span>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 px-3 py-1.5 bg-black/90 backdrop-blur-xl rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
            >
                <div className="flex items-center gap-2">
                    <FiSearch className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-cyan-400 font-mono">3.2s AVG</span>
                </div>
            </motion.div>
        </div>
    );
};

export default TerminalHero;