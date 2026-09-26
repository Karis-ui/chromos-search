import React, { useEffect, useRef } from 'react';

interface TerminalMatrixProps {
    opacity?: number;
}

export const TerminalMatrix: React.FC<TerminalMatrixProps> = ({ opacity = 0.15 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let columns = 0;
        let drops: number[] = [];
        let animationId: number;

        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF!@#$%^&*';

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            width = parent.clientWidth;
            height = parent.clientHeight;
            canvas.width = width;
            canvas.height = height;

            columns = Math.floor(width / 14);
            drops = Array(columns).fill(1);
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
            ctx.fillRect(0, 0, width, height);

            ctx.font = '12px monospace';

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * 14;
                const y = drops[i] * 14;

                ctx.fillStyle = `rgba(220, 255, 220, ${opacity * 4})`;
                ctx.fillText(char, x, y);

                ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
                ctx.fillText(
                    chars[Math.floor(Math.random() * chars.length)],
                    x,
                    y - 14
                );

                drops[i] += 0.5;
                if (drops[i] * 14 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [opacity]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity }}
        />
    );
};