import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
    className?: string;
    density?: number;
    speed?: number;
    color?: string;
    glowColor?: string;
    characters?: string;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
    className = '',
    density = 0.5,
    speed = 1,
    color = '#00ff41',
    glowColor = '#00ff4140',
    characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?/`~',
}) => {
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

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;

            width = parent.clientWidth;
            height = parent.clientHeight;

            canvas.width = width;
            canvas.height = height;

            columns = Math.floor(width / 20);
            drops = Array(columns).fill(1);
        };

        resize();
        window.addEventListener('resize', resize);
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            const charSet = characters.split('');

            for (let i = 0; i < drops.length; i++) {
                const char = charSet[Math.floor(Math.random() * charSet.length)];

                const x = i * 20;

                drops[i] += 0.5 * speed;

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                const y = drops[i] * 20;

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
                gradient.addColorStop(0, glowColor);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(x - 10, y - 10, 20, 20);

                ctx.fillStyle = color;
                ctx.font = '18px monospace';
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fillText(char, x, y);

                const headY = y - 20;
                if (headY > 0) {
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 15;
                    ctx.fillText(
                        charSet[Math.floor(Math.random() * charSet.length)],
                        x,
                        headY
                    );
                }

                for (let j = 1; j < 5; j++) {
                    const tailY = y + j * 20;
                    if (tailY < height) {
                        ctx.fillStyle = color + '40';
                        ctx.shadowBlur = 0;
                        ctx.fillText(
                            charSet[Math.floor(Math.random() * charSet.length)],
                            x,
                            tailY
                        );
                    }
                }

                ctx.shadowBlur = 0;
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [color, glowColor, characters, speed, density]);

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};