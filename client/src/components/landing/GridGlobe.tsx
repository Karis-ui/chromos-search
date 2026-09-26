import React, { useEffect, useRef } from 'react';

interface GridGlobeProps {
    mouseX?: number;
    mouseY?: number;
}

export const GridGlobe: React.FC<GridGlobeProps> = ({ mouseX = 0, mouseY = 0 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const size = 500;
        canvas.width = size;
        canvas.height = size;

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.35;

        const generateSpherePoints = (latLines: number, lonLines: number, pointsPerLine: number) => {
            const points: Array<Array<{ x: number; y: number; z: number }>> = [];

            for (let i = 1; i < latLines; i++) {
                const lat = (i / latLines) * Math.PI - Math.PI / 2;
                const line: Array<{ x: number; y: number; z: number }> = [];
                for (let j = 0; j <= pointsPerLine; j++) {
                    const lon = (j / pointsPerLine) * Math.PI * 2;
                    const x = Math.cos(lat) * Math.cos(lon);
                    const y = Math.sin(lat);
                    const z = Math.cos(lat) * Math.sin(lon);
                    line.push({ x, y, z });
                }
                points.push(line);
            }

            for (let i = 0; i < lonLines; i++) {
                const lon = (i / lonLines) * Math.PI * 2;
                const line: Array<{ x: number; y: number; z: number }> = [];
                for (let j = 0; j <= pointsPerLine; j++) {
                    const lat = (j / pointsPerLine) * Math.PI - Math.PI / 2;
                    const x = Math.cos(lat) * Math.cos(lon);
                    const y = Math.sin(lat);
                    const z = Math.cos(lat) * Math.sin(lon);
                    line.push({ x, y, z });
                }
                points.push(line);
            }

            return points;
        };

        const spherePoints = generateSpherePoints(8, 12, 60);

        const rotatePoint = (p: { x: number; y: number; z: number }, rx: number, ry: number) => {
            const cosY = Math.cos(ry);
            const sinY = Math.sin(ry);
            const x1 = p.x * cosY - p.z * sinY;
            const z1 = p.x * sinY + p.z * cosY;

            const cosX = Math.cos(rx);
            const sinX = Math.sin(rx);
            const y1 = p.y * cosX - z1 * sinX;
            const z2 = p.y * sinX + z1 * cosX;

            return { x: x1, y: y1, z: z2 };
        };

        let time = 0;
        const animate = () => {
            time += 0.005;
            rotationRef.current.targetY = mouseX * 0.5;
            rotationRef.current.targetX = mouseY * 0.3;
            rotationRef.current.x += (rotationRef.current.targetX - rotationRef.current.x) * 0.05;
            rotationRef.current.y += (rotationRef.current.targetY - rotationRef.current.y) * 0.05;

            const rx = rotationRef.current.x;
            const ry = rotationRef.current.y + time;

            ctx.clearRect(0, 0, size, size);

            spherePoints.forEach((line) => {
                ctx.beginPath();
                let firstPoint = true;

                line.forEach((p) => {
                    const rotated = rotatePoint(p, rx, ry);
                    const perspective = 1 / (1 - rotated.z * 0.3);
                    const x = centerX + rotated.x * radius * perspective;
                    const y = centerY + rotated.y * radius * perspective;

                    if (firstPoint) {
                        ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                const lineOpacity = 0.15 + Math.abs(Math.sin(time + spherePoints.indexOf(line))) * 0.1;
                ctx.strokeStyle = `rgba(34, 211, 238, ${lineOpacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });

            spherePoints.forEach((line, i) => {
                line.forEach((p, j) => {
                    if ((i + j) % 5 !== 0) return;

                    const rotated = rotatePoint(p, rx, ry);
                    if (rotated.z < 0) return; // Only front points

                    const perspective = 1 / (1 - rotated.z * 0.3);
                    const x = centerX + rotated.x * radius * perspective;
                    const y = centerY + rotated.y * radius * perspective;

                    const dotOpacity = 0.2 + rotated.z * 0.3;
                    ctx.fillStyle = `rgba(34, 211, 238, ${dotOpacity})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                });
            });

            for (let i = 0; i < 6; i++) {
                const angle = time * (0.5 + i * 0.1) + (i * Math.PI * 2) / 6;
                const orbitRadius = radius * (1.1 + i * 0.05);
                const orbitTilt = (i / 6) * Math.PI - Math.PI / 2;

                const x = centerX + Math.cos(angle) * orbitRadius;
                const y = centerY + Math.sin(angle) * orbitRadius * Math.cos(orbitTilt);

                const opacity = 0.3 + Math.sin(angle) * 0.2;
                ctx.fillStyle = i % 2 === 0
                    ? `rgba(34, 211, 238, ${opacity})`
                    : `rgba(168, 85, 247, ${opacity})`;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();

                const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
                glow.addColorStop(0, i % 2 === 0
                    ? `rgba(34, 211, 238, ${opacity * 0.5})`
                    : `rgba(168, 85, 247, ${opacity * 0.5})`);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            const centerGlow = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius * 1.5
            );
            centerGlow.addColorStop(0, 'rgba(34, 211, 238, 0.05)');
            centerGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = centerGlow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [mouseX, mouseY]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full pointer-events-none"
            style={{ maxWidth: '600px', maxHeight: '600px' }}
        />
    );
};

export default GridGlobe;