import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiCpu, FiZap, FiWifi, FiClock, FiDatabase } from 'react-icons/fi';
import { useWebSocket } from '../../providers';
import { useSearchStore } from '../../store/searchStore';

export const StatusBar: React.FC = () => {
    const [systemTime, setSystemTime] = useState(new Date());
    const [cpuUsage, setCpuUsage] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0);
    const { isConnected } = useWebSocket();
    const { results, totalResults, progress, isSearching } = useSearchStore();

    useEffect(() => {
        const interval = setInterval(() => {
            setSystemTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(Math.round(20 + Math.random() * 30));
            setMemoryUsage(Math.round(40 + Math.random() * 20));
        }, 2000);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-1.5 bg-black/80 backdrop-blur-2xl border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                            />
                        </motion.div>
                        <span className="text-[9px]">
                            {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
                        </span>
                    </div>

                    <span className="text-gray-600">|</span>

                    {isSearching && (
                        <div className="flex items-center gap-2">
                            <FiActivity className="w-3 h-3 text-cyan-400 animate-pulse" />
                            <span className="text-cyan-400 text-[9px]">
                                SEARCHING {progress}%
                            </span>
                        </div>
                    )}

                    {!isSearching && results.length > 0 && (
                        <div className="flex items-center gap-2">
                            <FiZap className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-400 text-[9px]">
                                {totalResults} MATCHES
                            </span>
                        </div>
                    )}

                    <span className="text-gray-600">|</span>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <FiCpu className="w-3 h-3 text-gray-500" />
                            <span className="text-[9px] text-gray-500">{cpuUsage}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FiDatabase className="w-3 h-3 text-gray-500" />
                            <span className="text-[9px] text-gray-500">{memoryUsage}%</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <FiWifi className="w-3 h-3 text-gray-500" />
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-px h-1.5 bg-gray-500"
                                    style={{
                                        opacity: i <= 3 ? 0.6 : 0.2,
                                        height: `${2 + i * 1.5}px`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <span className="text-gray-600">|</span>

                    <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3 text-gray-500" />
                        <span className="text-[9px] text-gray-500">
                            {systemTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>

                    <span className="text-gray-600">|</span>

                    <span className="text-[9px] text-gray-600">
                        v3.0.0-masterpiece
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600">⚡</span>

                    <span className="text-[9px] text-gray-500 font-mono">
                        {navigator.onLine ? 'ONLINE' : 'OFFLINE'}
                    </span>

                    {navigator.onLine && (
                        <>
                            <span className="text-gray-600">|</span>

                            <span className="text-[9px] text-gray-500">
                                {(() => {
                                    const connection = (
                                        navigator as Navigator & {
                                            connection?: {
                                                effectiveType?: string;
                                                downlink?: number;
                                            };
                                        }
                                    ).connection;

                                    return connection?.downlink
                                        ? `${connection.downlink}Mbps`
                                        : 'UNKNOWN';
                                })()}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}