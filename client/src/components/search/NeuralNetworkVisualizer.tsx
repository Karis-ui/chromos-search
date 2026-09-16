import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCpu,
  FiZap,
  FiActivity,
  FiTarget,
  FiLayers,
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
} from 'react-icons/fi';
import { GlassCard } from '../common/GlassCard';
import { GlitchText } from '../common/GlitchText';

interface Neuron {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  layer: number;
  activation: number;
  targetActivation: number;
  bias: number;
  label?: string;
  type: 'input' | 'hidden' | 'output';
}

interface Connection {
  from: number;
  to: number;
  weight: number;
  activation: number;
  pulse: number;
}

interface ActivationPulse {
  id: number;
  from: number;
  to: number;
  progress: number;
  speed: number;
  startTime: number;
}

interface NeuralNetworkVisualizerProps {
  inputSize?: number;
  hiddenLayers?: number[];
  outputSize?: number;
  isActive?: boolean;
  mode?: 'face' | 'voice' | 'hybrid' | 'training' | 'inference';
  confidence?: number;
  features?: string[];
  className?: string;
  onNeuronClick?: (neuron: Neuron) => void;
  onLayerClick?: (layer: number) => void;
  interactive?: boolean;
}

export const NeuralNetworkVisualizer: React.FC<NeuralNetworkVisualizerProps> = ({
  inputSize = 8,
  hiddenLayers = [12, 10, 8],
  outputSize = 4,
  isActive = true,
  mode = 'inference',
  confidence = 0.85,
  features = [],
  className = '',
  onNeuronClick,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const neuronsRef = useRef<Neuron[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const pulsesRef = useRef<ActivationPulse[]>([]);
  const hoveredNeuronRef = useRef<Neuron | null>(null);
  const selectedNeuronRef = useRef<Neuron | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNeuron, setHoveredNeuron] = useState<Neuron | null>(null);
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);
  const [networkStats, setNetworkStats] = useState({
    totalNeurons: 0,
    totalConnections: 0,
    activeNeurons: 0,
    avgActivation: 0,
    inferenceTime: 0,
    layerStats: [] as Array<{ layer: number; neurons: number; avgActivation: number }>,
  });
  const [showStats, setShowStats] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const palettes = {
    face: {
      primary: '#06b6d4',
      secondary: '#22d3ee',
      tertiary: '#67e8f9',
      accent: '#0891b2',
      glow: 'rgba(34, 211, 238, 0.4)',
      background: 'rgba(34, 211, 238, 0.02)',
    },
    voice: {
      primary: '#a855f7',
      secondary: '#c084fc',
      tertiary: '#d8b4fe',
      accent: '#7e22ce',
      glow: 'rgba(168, 85, 247, 0.4)',
      background: 'rgba(168, 85, 247, 0.02)',
    },
    hybrid: {
      primary: '#ec4899',
      secondary: '#f472b6',
      tertiary: '#f9a8d4',
      accent: '#db2777',
      glow: 'rgba(236, 72, 153, 0.4)',
      background: 'rgba(236, 72, 153, 0.02)',
    },
    training: {
      primary: '#facc15',
      secondary: '#fde047',
      tertiary: '#fef08a',
      accent: '#eab308',
      glow: 'rgba(250, 204, 21, 0.4)',
      background: 'rgba(250, 204, 21, 0.02)',
    },
    inference: {
      primary: '#4ade80',
      secondary: '#86efac',
      tertiary: '#bbf7d0',
      accent: '#22c55e',
      glow: 'rgba(74, 222, 128, 0.4)',
      background: 'rgba(74, 222, 128, 0.02)',
    },
  };

  const palette = palettes[mode] || palettes.inference;

  const defaultFeatures = {
    face: ['Left Eye', 'Right Eye', 'Nose', 'Mouth', 'Jaw', 'Cheekbones', 'Forehead', 'Chin'],
    voice: ['Pitch', 'Tone', 'Rhythm', 'Timbre', 'Volume', 'Clarity', 'Speed', 'Accent'],
    hybrid: ['Face ID', 'Voice ID', 'Expression', 'Emotion', 'Gesture', 'Posture', 'Context', 'Identity'],
    training: ['Loss', 'Grad', 'LR', 'Epoch', 'Batch', 'Acc', 'Val', 'Time'],
    inference: ['Face', 'Voice', 'Match', 'Score', 'Rank', 'Time', 'Conf', 'Idx'],
  };

  const inputLabels = features.length > 0 ? features : (defaultFeatures[mode] || defaultFeatures.inference);

  const initializeNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 60, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const layerSizes = [inputSize, ...hiddenLayers, outputSize];
    const numLayers = layerSizes.length;

    const neurons: Neuron[] = [];
    let neuronId = 0;

    for (let layer = 0; layer < numLayers; layer++) {
      const layerSize = layerSizes[layer];
      const layerX = padding.left + (layer / (numLayers - 1)) * innerWidth;
      const layerSpacing = innerHeight / (layerSize + 1);

      for (let i = 0; i < layerSize; i++) {
        const y = padding.top + (i + 1) * layerSpacing;
        const jitter = 0; // Could add jitter for organic look

        let type: 'input' | 'hidden' | 'output' = 'hidden';
        if (layer === 0) type = 'input';
        else if (layer === numLayers - 1) type = 'output';

        let label: string | undefined;
        if (layer === 0 && i < inputLabels.length) {
          label = inputLabels[i];
        } else if (layer === numLayers - 1) {
          label = `Out ${i + 1}`;
        }

        neurons.push({
          id: neuronId++,
          x: layerX + jitter,
          y,
          targetX: layerX,
          targetY: y,
          radius: type === 'input' || type === 'output' ? 6 : 5,
          layer,
          activation: type === 'input' ? 0.5 + Math.random() * 0.5 : Math.random() * 0.3,
          targetActivation: Math.random(),
          bias: Math.random() * 0.5 - 0.25,
          label,
          type,
        });
      }
    }

    const connections: Connection[] = [];
    let neuronOffset = 0;

    for (let layer = 0; layer < numLayers - 1; layer++) {
      const currentLayerSize = layerSizes[layer];
      const nextLayerSize = layerSizes[layer + 1];

      for (let i = 0; i < currentLayerSize; i++) {
        for (let j = 0; j < nextLayerSize; j++) {
          connections.push({
            from: neuronOffset + i,
            to: neuronOffset + currentLayerSize + j,
            weight: Math.random() * 2 - 1,
            activation: Math.random() * 0.5,
            pulse: 0,
          });
        }
      }

      neuronOffset += currentLayerSize;
    }

    neuronsRef.current = neurons;
    connectionsRef.current = connections;
    pulsesRef.current = [];

    const layerStats = [];
    for (let layer = 0; layer < numLayers; layer++) {
      const layerNeurons = neurons.filter(n => n.layer === layer);
      const avgActivation = layerNeurons.reduce((sum, n) => sum + n.activation, 0) / layerNeurons.length;
      layerStats.push({
        layer,
        neurons: layerNeurons.length,
        avgActivation,
      });
    }

    setNetworkStats({
      totalNeurons: neurons.length,
      totalConnections: connections.length,
      activeNeurons: neurons.filter(n => n.activation > 0.5).length,
      avgActivation: neurons.reduce((sum, n) => sum + n.activation, 0) / neurons.length,
      inferenceTime: Math.random() * 20 + 5,
      layerStats,
    });
  }, [inputSize, hiddenLayers, outputSize, inputLabels]);

  const createPulse = useCallback((fromId: number, toId: number) => {
    const pulse: ActivationPulse = {
      id: Date.now() + Math.random(),
      from: fromId,
      to: toId,
      progress: 0,
      speed: 0.02 + Math.random() * 0.03,
      startTime: performance.now(),
    };
    pulsesRef.current.push(pulse);
  }, []);

  const propagateActivations = useCallback(() => {
    const neurons = neuronsRef.current;
    const connections = connectionsRef.current;
    const canvas = canvasRef.current;
    if (!canvas || neurons.length === 0) return;

    neurons.forEach(neuron => {
      if (neuron.type === 'input') {
        neuron.targetActivation = 0.3 + Math.random() * 0.7;
      }
    });

    const layers: Neuron[][] = [];
    neurons.forEach(neuron => {
      if (!layers[neuron.layer]) layers[neuron.layer] = [];
      layers[neuron.layer].push(neuron);
    });

    for (let layer = 0; layer < layers.length - 1; layer++) {
      const nextLayer = layers[layer + 1];

      nextLayer.forEach((neuron) => {
        let sum = neuron.bias;
        const incomingConnections = connections.filter(c => c.to === neuron.id);

        incomingConnections.forEach(conn => {
          const sourceNeuron = neurons[conn.from];
          if (sourceNeuron) {
            sum += sourceNeuron.activation * conn.weight;
          }
        });

        neuron.targetActivation = 1 / (1 + Math.exp(-sum));

        if (Math.random() < 0.1 && incomingConnections.length > 0) {
          const randomConn = incomingConnections[Math.floor(Math.random() * incomingConnections.length)];
          createPulse(randomConn.from, randomConn.to);
        }
      });
    }

    connections.forEach(conn => {
      const fromNeuron = neurons[conn.from];
      const toNeuron = neurons[conn.to];
      if (fromNeuron && toNeuron) {
        conn.activation = fromNeuron.activation * Math.abs(conn.weight);
        conn.pulse = (Math.sin(performance.now() * 0.002 + conn.from * 0.1) + 1) / 2;
      }
    });
  }, [createPulse]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const width = canvas.width;
    const height = canvas.height;
    const neurons = neuronsRef.current;
    const connections = connectionsRef.current;
    const pulses = pulsesRef.current;
    const hoveredNeuron = hoveredNeuronRef.current;
    const selectedNeuron = selectedNeuronRef.current;

    ctx.clearRect(0, 0, width, height);

    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    bgGradient.addColorStop(0, palette.background);
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    const gridSize = 30;
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

    connections.forEach(conn => {
      const from = neurons[conn.from];
      const to = neurons[conn.to];
      if (!from || !to) return;

      const isHighlighted =
        (hoveredNeuron && (hoveredNeuron.id === conn.from || hoveredNeuron.id === conn.to)) ||
        (selectedNeuron && (selectedNeuron.id === conn.from || selectedNeuron.id === conn.to));

      const baseOpacity = 0.05 + Math.abs(conn.weight) * 0.15 + conn.activation * 0.1;
      const opacity = isHighlighted ? baseOpacity * 3 : baseOpacity;

      const color = conn.weight > 0 ? palette.primary : '#f87171';

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 0.5 + Math.abs(conn.weight) * 0.8;
      ctx.stroke();

      if (isHighlighted) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
    });

    const now = performance.now();
    const activePulses: ActivationPulse[] = [];

    pulses.forEach(pulse => {
      const elapsed = now - pulse.startTime;
      pulse.progress = Math.min(elapsed / 1000, 1);

      if (pulse.progress < 1) {
        const from = neurons[pulse.from];
        const to = neurons[pulse.to];

        if (from && to) {
          const x = from.x + (to.x - from.x) * pulse.progress;
          const y = from.y + (to.y - from.y) * pulse.progress;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
          gradient.addColorStop(0, palette.primary);
          gradient.addColorStop(0.5, palette.secondary);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();

          activePulses.push(pulse);
        }
      }
    });

    pulsesRef.current = activePulses;

    neurons.forEach(neuron => {
      const isHovered = hoveredNeuron?.id === neuron.id;
      const isSelected = selectedNeuron?.id === neuron.id;
      const activation = neuron.activation;

      const glowRadius = neuron.radius * (2.5 + activation * 1.5);
      const glowGradient = ctx.createRadialGradient(
        neuron.x, neuron.y, 0,
        neuron.x, neuron.y, glowRadius
      );

      let glowColor = palette.primary;
      if (neuron.type === 'input') glowColor = palette.secondary;
      if (neuron.type === 'output') glowColor = palette.tertiary;

      const glowAlpha = (0.1 + activation * 0.3) * (isHovered || isSelected ? 2 : 1);
      glowGradient.addColorStop(0, `${glowColor}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`);
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      const coreRadius = neuron.radius * (0.7 + activation * 0.5);
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, coreRadius, 0, Math.PI * 2);

      const fillColor = activation > 0.7
        ? palette.primary
        : activation > 0.4
          ? palette.secondary
          : palette.accent;

      ctx.fillStyle = fillColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isHovered || isSelected ? 20 : 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isHovered || isSelected ? 2 : 1;
      ctx.stroke();

      if (isSelected) {
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, coreRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (isHovered && !isSelected) {
        ctx.strokeStyle = palette.secondary;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, coreRadius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (activation > 0.8) {
        const pulseRadius = coreRadius + 4 + Math.sin(now * 0.003 + neuron.id) * 3;
        ctx.strokeStyle = `${palette.primary}80`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (showLabels && neuron.label) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '7px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(neuron.label, neuron.x, neuron.y - coreRadius - 4);
      }
    });

    const layers = new Set(neurons.map(n => n.layer));
    layers.forEach(layer => {
      const layerNeurons = neurons.filter(n => n.layer === layer);
      if (layerNeurons.length === 0) return;

      const avgX = layerNeurons.reduce((sum, n) => sum + n.x, 0) / layerNeurons.length;
      const minY = Math.min(...layerNeurons.map(n => n.y)) - 30;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      let layerName = `Layer ${layer}`;
      if (layer === 0) layerName = 'INPUT';
      else if (layer === layers.size - 1) layerName = 'OUTPUT';
      else layerName = `HIDDEN ${layer}`;

      ctx.fillText(layerName, avgX, minY);
    });

    if (confidence > 0) {
      const outputNeurons = neurons.filter(n => n.type === 'output');
      if (outputNeurons.length > 0) {
        const outputX = Math.max(...outputNeurons.map(n => n.x)) + 30;
        const outputY = height / 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(outputX, outputY - 60, 8, 120);

        const barHeight = 120 * confidence;
        const barGradient = ctx.createLinearGradient(0, outputY + 60, 0, outputY + 60 - barHeight);
        barGradient.addColorStop(0, palette.primary);
        barGradient.addColorStop(1, palette.secondary);
        ctx.fillStyle = barGradient;
        ctx.fillRect(outputX, outputY + 60 - barHeight, 8, barHeight);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(confidence * 100)}%`, outputX + 4, outputY);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '6px JetBrains Mono, monospace';
        ctx.fillText('CONF', outputX + 4, outputY + 70);
      }
    }

  }, [palette, confidence, showLabels]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isPaused) {
      neuronsRef.current = neuronsRef.current.map(neuron => ({
        ...neuron,
        activation: neuron.activation + (neuron.targetActivation - neuron.activation) * 0.1,
      }));

      if (Math.random() < 0.05) {
        propagateActivations();
      }

      if (Math.random() < 0.02) {
        const neurons = neuronsRef.current;
        const layerStats: Array<{ layer: number; neurons: number; avgActivation: number }> = [];
        const layers = new Set(neurons.map(n => n.layer));

        layers.forEach(layer => {
          const layerNeurons = neurons.filter(n => n.layer === layer);
          const avgActivation = layerNeurons.reduce((sum, n) => sum + n.activation, 0) / layerNeurons.length;
          layerStats.push({
            layer,
            neurons: layerNeurons.length,
            avgActivation,
          });
        });

        setNetworkStats(prev => ({
          ...prev,
          activeNeurons: neurons.filter(n => n.activation > 0.5).length,
          avgActivation: neurons.reduce((sum, n) => sum + n.activation, 0) / neurons.length,
          layerStats,
        }));
      }
    }

    draw(ctx, canvas);
    animationRef.current = requestAnimationFrame(animate);
  }, [draw, propagateActivations, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initializeNetwork();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeNetwork, animate]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !interactive) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePositionRef.current = { x, y };

    const hovered = neuronsRef.current.find(neuron => {
      const dx = neuron.x - x;
      const dy = neuron.y - y;
      return Math.sqrt(dx * dx + dy * dy) < neuron.radius + 8;
    });

    hoveredNeuronRef.current = hovered || null;
    setHoveredNeuron(hovered || null);
  }, [interactive]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = neuronsRef.current.find(neuron => {
      const dx = neuron.x - x;
      const dy = neuron.y - y;
      return Math.sqrt(dx * dx + dy * dy) < neuron.radius + 8;
    });

    if (clicked) {
      selectedNeuronRef.current = clicked;
      setSelectedNeuron(clicked);
      onNeuronClick?.(clicked);
    } else {
      selectedNeuronRef.current = null;
      setSelectedNeuron(null);
    }
  }, [interactive, onNeuronClick]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const resetNetwork = useCallback(() => {
    initializeNetwork();
    setSelectedNeuron(null);
    selectedNeuronRef.current = null;
  }, [initializeNetwork]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FiCpu className="w-4 h-4" style={{ color: palette.primary }} />
            <GlitchText
              className="text-sm font-bold"
              style={{ color: palette.primary }}
            >
              NEURAL NETWORK
            </GlitchText>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.primary }} />
            <span className="text-[9px] text-gray-400 font-mono uppercase">
              {mode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePause}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <FiPlay className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <FiPause className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
          <button
            onClick={resetNetwork}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Reset Network"
          >
            <FiRefreshCw className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <FiMaximize2 className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ minHeight: 400 }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={() => {
          hoveredNeuronRef.current = null;
          setHoveredNeuron(null);
        }}
      />

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 w-56 space-y-2"
          >
            <GlassCard variant="dark" padding="sm" className="text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[9px] text-gray-500 font-mono">STATS</span>
                  <FiActivity className="w-3 h-3" style={{ color: palette.primary }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] text-gray-500 font-mono">NEURONS</p>
                    <p className="text-sm font-bold font-mono text-white">
                      {networkStats.totalNeurons}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 font-mono">SYNAPSES</p>
                    <p className="text-sm font-bold font-mono text-white">
                      {networkStats.totalConnections}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 font-mono">ACTIVE</p>
                    <p className="text-sm font-bold font-mono" style={{ color: palette.primary }}>
                      {networkStats.activeNeurons}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 font-mono">AVG ACT</p>
                    <p className="text-sm font-bold font-mono text-white">
                      {(networkStats.avgActivation * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard variant="dark" padding="sm">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-[9px] text-gray-500 font-mono">LAYERS</span>
                  <FiLayers className="w-3 h-3" style={{ color: palette.secondary }} />
                </div>
                {networkStats.layerStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[8px] text-gray-500 font-mono w-6">
                      L{stat.layer}
                    </span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: palette.primary,
                          width: `${stat.avgActivation * 100}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.avgActivation * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-[8px] text-gray-400 font-mono w-8 text-right">
                      {stat.neurons}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <AnimatePresence>
              {selectedNeuron && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <GlassCard variant="dark" padding="sm" glow="cyan" borderGlow>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                        <span className="text-[9px] text-gray-500 font-mono">SELECTED</span>
                        <FiTarget className="w-3 h-3" style={{ color: palette.primary }} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px]">
                          <span className="text-gray-500 font-mono">ID</span>
                          <span className="text-white font-mono">#{selectedNeuron.id}</span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                          <span className="text-gray-500 font-mono">LAYER</span>
                          <span className="text-white font-mono">
                            {selectedNeuron.layer} ({selectedNeuron.type})
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                          <span className="text-gray-500 font-mono">ACTIVATION</span>
                          <span
                            className="font-mono font-bold"
                            style={{ color: palette.primary }}
                          >
                            {(selectedNeuron.activation * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                          <span className="text-gray-500 font-mono">BIAS</span>
                          <span className="text-white font-mono">
                            {selectedNeuron.bias.toFixed(3)}
                          </span>
                        </div>
                        {selectedNeuron.label && (
                          <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500 font-mono">LABEL</span>
                            <span className="text-white font-mono">
                              {selectedNeuron.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoveredNeuron && !selectedNeuron && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none z-30 px-2 py-1 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10"
            style={{
              left: hoveredNeuron.x + 15,
              top: hoveredNeuron.y - 30,
            }}
          >
            <div className="text-[9px] font-mono whitespace-nowrap">
              <div className="flex items-center gap-2">
                <span style={{ color: palette.primary }}>
                  N#{hoveredNeuron.id}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">
                  L{hoveredNeuron.layer}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-white">
                  {(hoveredNeuron.activation * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-gray-400 font-mono transition-colors border border-white/5"
          >
            {showStats ? '◉' : '○'} STATS
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] text-gray-400 font-mono transition-colors border border-white/5"
          >
            {showLabels ? '◉' : '○'} LABELS
          </button>
        </div>

        <div className="flex items-center gap-3 text-[8px] text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <FiZap className="w-2.5 h-2.5" style={{ color: palette.primary }} />
            INFERENCE: {networkStats.inferenceTime.toFixed(1)}ms
          </span>
          <span className="text-gray-600">|</span>
          <span>
            {networkStats.totalNeurons}N × {networkStats.totalConnections}S
          </span>
        </div>
      </div>

      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${palette.primary}15, transparent)`,
            }}
            animate={{
              top: ['-1px', '100%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      )}

      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l rounded-tl" style={{ borderColor: `${palette.primary}40` }} />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r rounded-tr" style={{ borderColor: `${palette.primary}40` }} />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l rounded-bl" style={{ borderColor: `${palette.primary}40` }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r rounded-br" style={{ borderColor: `${palette.primary}40` }} />
    </div>
  );
};

export default NeuralNetworkVisualizer;