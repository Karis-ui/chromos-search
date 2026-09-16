import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface HolographicCardProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
    tilt?: boolean;
    glowColor?: string;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
    children,
    className = '',
    intensity = 1,
    tilt = true,
    glowColor = '#06b6d4',
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateY = useSpring(x, { stiffness: 300, damping: 30 });

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            if (tilt) {
                const rotateXVal = ((y - centerY) / centerY) * -15 * intensity;
                const rotateYVal = ((x - centerX) / centerX) * 15 * intensity;
                rotateX.set(rotateXVal);
                rotateY.set(rotateYVal);
            }

            setMousePosition({
                x: (x / rect.width) * 100,
                y: (y / rect.height) * 100,
            });
        };

        const handleMouseEnter = () => {
            setIsHovered(true);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            if (tilt) {
                rotateX.set(0);
                rotateY.set(0);
            }
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [tilt, intensity, rotateX, rotateY]);

    return (
        <motion.div
            ref={cardRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                rotateX: rotateX,
                rotateY: rotateY,
            }}
        >
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: `radial-gradient(
            ellipse at ${mousePosition.x}% ${mousePosition.y}%,
            ${glowColor}15,
            transparent 60%
          )`,
                    opacity: isHovered ? 1 : 0.5,
                    transition: 'opacity 0.3s ease',
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: `linear-gradient(
            ${mousePosition.x * 3.6}deg,
            transparent 30%,
            ${glowColor}10 50%,
            transparent 70%
          )`,
                    backgroundSize: '200% 200%',
                    opacity: isHovered ? 0.5 : 0,
                    transition: 'opacity 0.5s ease',
                }}
            />

            <div
                className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]"
                style={{
                    border: `1px solid ${glowColor}20`,
                    boxShadow: `inset 0 0 30px ${glowColor}10, 0 0 30px ${glowColor}05`,
                }}
            />

            <div className="relative z-5">
                {children}
            </div>
        </motion.div>
    );
};