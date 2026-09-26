import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface ScrollProgressProps {
    progress: MotionValue<number>;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ progress }) => {
    const scaleX = useTransform(progress, [0, 1], [0, 1]);
    const opacity = useTransform(progress, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 right-0 h-0.5 origin-left z-[100] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                style={{
                    scaleX,
                    opacity,
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
                }}
            />

            <motion.div
                className="fixed bottom-6 right-6 z-50 px-3 py-1.5 bg-black/70 backdrop-blur-xl rounded-full border border-white/10"
                style={{ opacity }}
            >
                <motion.span
                    className="text-xs text-cyan-400 font-mono font-bold tabular-nums"
                    style={{
                        display: 'inline-block',
                    }}
                >
                    <ScrollPercentage progress={progress} />
                </motion.span>
            </motion.div>
        </>
    );
};

const ScrollPercentage: React.FC<{ progress: MotionValue<number> }> = ({ progress }) => {
    const [percentage, setPercentage] = React.useState(0);

    React.useEffect(() => {
        const unsubscribe = progress.on('change', (value) => {
            setPercentage(Math.round(value * 100));
        });
        return () => unsubscribe();
    }, [progress]);

    return <>{percentage}%</>;
};

export default ScrollProgress;