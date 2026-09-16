import React,{useEffect,useRef,useState} from "react";

interface CyberGridProps {
  className?: string;
  cellSize?: number;
  lineColor?: string;
  glowColor?: string;
  opacity?: number;
  animated?: boolean;
  speed?: number;
}

export const CyberGrid: React.FC<CyberGridProps> = ({
    className = '',
    cellSize = 40,
    lineColor = '#06b6d4',
    glowColor = '#a855f7',
    opacity = 0.08,
    animated = true,
    speed = 0.5,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions,setDimensions] = useState({width:0,height:0});

    useEffect(() =>{
        const canvas = canvasRef.current;
        if(!canvas) return;

        const parent = canvas.parentElement;
        if(!parent) return;

        const resize = () => {
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            setDimensions({width:rect.width,height:rect.height});
        };
        resize();
        window.addEventListener('resize',resize);
        return () => window.removeEventListener('resize',resize);
    },[]);

    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.01 * speed;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const cols = Math.ceil(dimensions.width / cellSize);
      const rows = Math.ceil(dimensions.height / cellSize);

      for (let i = 0; i <= cols; i++) {
        const x = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.height);
        ctx.strokeStyle = lineColor;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        const y = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.width, y);
        ctx.strokeStyle = lineColor;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (animated) {
        const glowSize = cellSize * 0.3;
        const pulse = Math.sin(time) * 0.5 + 0.5;

        for (let i = 0; i < 3; i++) {
          const col = Math.floor((time * (i + 1) * 10 + i * 3) % cols);
          const row = Math.floor((time * (i + 1) * 7 + i * 5) % rows);

          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          gradient.addColorStop(0, glowColor);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.1 * pulse;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        const scanY = (time * 2) % dimensions.height;
        const scanGradient = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
        scanGradient.addColorStop(0, 'transparent');
        scanGradient.addColorStop(0.5, lineColor);
        scanGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGradient;
        ctx.globalAlpha = 0.02;
        ctx.fillRect(0, scanY - 50, dimensions.width, 100);
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [dimensions, cellSize, lineColor, glowColor, opacity, animated, speed]);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} />;
};