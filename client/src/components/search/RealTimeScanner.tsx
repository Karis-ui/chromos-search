import React, { useEffect, useRef, useState } from 'react';

interface RealTimeScannerProps {
  isActive: boolean;
  progress: number;
  status: string;
  message: string;
  resultsCount: number;
}

export const RealTimeScanner: React.FC<RealTimeScannerProps> = ({
    isActive,
    progress,
    status,
    message,
    resultsCount,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scannerLines] = useState<Array<{x:number;y:number;speed:number;length:number}>>([]);

    useEffect(() => {
        if (!isActive) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        if (scannerLines.length === 0) {
            const lines: Array<{x:number;y:number;speed:number;length:number}> = [];
            for (let i = 0; i < 8; i++) {
                lines.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speed: 0.5 + Math.random() * 1.5,
                    length: 20 + Math.random() * 40,
                });
            }
        }

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(34,211,238,0.03)';
        ctx.lineWidth = 0.5;
        const gridSize = 39;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        const scanY = (performance.now() / 2000) % height;
        const gradient = ctx.createLinearGradient(0, scanY - 100, 0, scanY + 100);
        gradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
        gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.15)');
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanY - 100, width, 200);

        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();
    }, [isActive, scannerLines]);

    return (
        <div className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/60 p-3">
            <canvas ref={canvasRef} width={320} height={160} className="w-full h-40 rounded-lg" />
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-300">
                <span>{status}</span>
                <span>{progress}%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{message}</p>
            <p className="mt-1 text-[10px] text-cyan-300">{resultsCount} results</p>
        </div>
    );
};
