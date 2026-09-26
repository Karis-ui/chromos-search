import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
interface BiometricVisualizerProps {
  type: string;
  confidence: number;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  onFeatureDetected?: (feature: string) => void;
}

type BiometricType = 'face' | 'voice' | 'hybrid';
type BiometricSize = 'sm' | 'md' | 'lg';

interface Neuron {
  x: number;
  y: number;
  radius: number;
  targetX: number;
  targetY: number;
  connections: number[];
  activation: number;
  layer: number;
  label?: string;
}

export const BiometricVisualizer: React.FC<BiometricVisualizerProps> = ({
  confidence, isActive, size = 'md', type = 'md', onFeatureDetected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [detectedFeatures, setDetectedFeatures] = useState<string[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const sizeMap: Record<BiometricSize, { width: number; height: number; neuronCount: number; dotSize: number }> = {
    sm: { width: 120, height: 120, neuronCount: 40, dotSize: 1 },
    md: { width: 200, height: 200, neuronCount: 80, dotSize: 1.5 },
    lg: { width: 300, height: 300, neuronCount: 120, dotSize: 2 },
  };

  const { width, height, neuronCount, dotSize } = sizeMap[size ?? 'md'];
  const normalizedType: BiometricType =
    type === 'face' || type === 'voice' || type === 'hybrid' ? type : 'face';

  const colors: Record<BiometricType, string[]> = {
    face: ['#22d3ee', '#a855f7', '#ec4899'],
    voice: ['#f472b6', '#fb923c', '#facc15'],
    hybrid: ['#22d3ee', '#a855f7', '#ec4899', '#10b981'],
  };

  const featureLabels: Record<BiometricType, string[]> = {
    face: ['Eyes', 'Nose', 'Mouth', 'Jaw'],
    voice: ['Pitch', 'Tone', 'Rhythm', 'Timbre'],
    hybrid: ['Face', 'Voice', 'Fusion', 'Score'],
  };
  const colorSet = colors[normalizedType] || colors.face;
  const labels = featureLabels[normalizedType] || featureLabels.face;

  const initNeurons = useCallback(() => {
    const newNeurons: Neuron[] = [];
    const layers = 3;
    const neuronsPerLayer = Math.floor(neuronCount / layers);

    for (let layer = 0; layer < layers; layer++) {
      const layerWidth = width * 0.8;
      const layerX = (width - layerWidth) / 2 + (layer / (layers - 1)) * layerWidth;
      const layerHeight = height * 0.7;
      const layerY = (height - layerHeight) / 2;

      for (let i = 0; i < neuronsPerLayer; i++) {
        const x = layerX + (Math.random() - 0.5) * 30;
        const y = layerY + (i / (neuronsPerLayer - 1)) * layerHeight;

        newNeurons.push({
          x: x,
          y: y,
          radius: dotSize + Math.random() * 2,
          targetX: x,
          targetY: y,
          connections: [],
          activation: Math.random(),
          layer: layer,
          label: i < labels.length ? labels[i] : undefined,
        });
      }
    }

    for (let i = 0; i < newNeurons.length; i++) {
      for (let j = i + 1; j < newNeurons.length; j++) {
        if (Math.random() < 0.12) {
          newNeurons[i].connections.push(j);
        }
      }
    }
    setNeurons(newNeurons);
  }, [neuronCount, width, height, dotSize, labels]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3 && detectedFeatures.length < labels.length) {
        const newFeature = labels[detectedFeatures.length];
        setDetectedFeatures(prev => [...prev, newFeature]);
        onFeatureDetected?.(newFeature);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isActive, detectedFeatures, labels, onFeatureDetected]);

  // ── Draw visualization ──
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const time = performance.now() / 1000;
    timeRef.current = time;

    // ── Clear ──
    ctx.clearRect(0, 0, width, height);

    // ── Background ──
    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width / 2
    );
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
    bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // ── Grid background ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
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

    setNeurons(prev =>
      prev.map(neuron => ({
        ...neuron,
        activation: Math.min(1, Math.max(0, neuron.activation + (Math.random() - 0.3) * 0.05)),
        x: neuron.x + (Math.random() - 0.5) * 0.3,
        y: neuron.y + (Math.random() - 0.5) * 0.3,
      }))
    );

    for (const neuron of neurons) {
      for (const connectionIndex of neuron.connections) {
        const target = neurons[connectionIndex];
        if (!target) continue;

        const alpha = 0.03 + 0.07 * (neuron.activation + target.activation) / 2;
        const pulsingAlpha = alpha * (0.7 + 0.3 * Math.sin(time * 2 + neuron.x));

        const gradient = ctx.createLinearGradient(neuron.x, neuron.y, target.x, target.y);
        const colorIndex = neuron.layer % colorSet.length;
        gradient.addColorStop(0, `${colorSet[colorIndex]}${Math.floor(pulsingAlpha * 80).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${colorSet[target.layer % colorSet.length]}${Math.floor(pulsingAlpha * 80).toString(16).padStart(2, '0')}`);

        ctx.beginPath();
        ctx.moveTo(neuron.x, neuron.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5 + neuron.activation * 0.5;
        ctx.stroke();
      }
    }

    for (const neuron of neurons) {
      const glowRadius = neuron.radius * (3 + 2 * Math.sin(time * neuron.layer + neuron.x));
      const glowGradient = ctx.createRadialGradient(
        neuron.x, neuron.y, 0,
        neuron.x, neuron.y, glowRadius
      );
      const colorIndex = neuron.layer % colorSet.length;
      glowGradient.addColorStop(0, `${colorSet[colorIndex]}${Math.floor(neuron.activation * 60).toString(16).padStart(2, '0')}`);
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      const coreColor = colorSet[neuron.layer % colorSet.length];
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 15;
      ctx.fillStyle = coreColor;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, neuron.radius * (0.5 + 0.5 * neuron.activation), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (neuron.label && neuron.activation > 0.7) {
        ctx.fillStyle = `rgba(255,255,255,${neuron.activation * 0.3})`;
        ctx.font = '6px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(neuron.label, neuron.x, neuron.y - neuron.radius - 2);
      }

      if (neuron.activation > 0.8) {
        const pulseRadius = neuron.radius * (2 + 2 * Math.sin(time * 3 + neuron.x));
        ctx.strokeStyle = `${colorSet[neuron.layer % colorSet.length]}80`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const centerX = width - 35;
    const centerY = 35;
    const radius = 22;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + confidence * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    const ringGradient = ctx.createLinearGradient(
      centerX - radius, centerY - radius,
      centerX + radius, centerY + radius
    );
    ringGradient.addColorStop(0, colorSet[0]);
    ringGradient.addColorStop(0.5, colorSet[1]);
    ringGradient.addColorStop(1, colorSet[2]);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '7px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(confidence * 100)}%`, centerX, centerY);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '7px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(type.toUpperCase(), 10, height - 10);

    if (isActive) {
      ctx.fillStyle = 'rgba(74,222,128,0.3)';
      ctx.font = '6px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('● ACTIVE', width - 10, height - 10);
    }

    if (detectedFeatures.length > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = '5px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const featureText = `⚡ ${detectedFeatures.join(' • ')}`;
      ctx.fillText(featureText, 10, height - 20);
    }

    animationRef.current = requestAnimationFrame(() => draw(ctx));
  }, [neurons, colorSet, confidence, isActive, type, width, height, dotSize, detectedFeatures]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    initNeurons();

    draw(ctx);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initNeurons, draw, width, height]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/20 border border-white/5">
      <canvas ref={canvasRef} className="w-full h-full" />

      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
            animate={{
              top: ['-2px', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      )}

      <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-[8px] text-gray-500 font-mono">
          {isActive ? 'LIVE' : 'IDLE'}
        </span>
      </div>

      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/40 backdrop-blur-xl rounded border border-white/5">
        <span className="text-[7px] text-gray-500 font-mono uppercase tracking-wider">
          {type} • {confidence >= 0.85 ? 'HIGH' : confidence >= 0.70 ? 'MEDIUM' : 'LOW'} CONFIDENCE
        </span>
      </div>
    </div>
  );
};