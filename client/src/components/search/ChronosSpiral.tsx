import React, { useRef, useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Float,
  Html,
  Stars,
  Sparkles,
  GradientTexture,
} from '@react-three/drei';
import {

  Bloom,
  ChromaticAberration,
  EffectComposer,
  DepthOfField,
} from '@react-three/postprocessing';
import { AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { getPlatformColor, formatTimeAgo, getConfidenceColor } from '../../utils/formatters';
import { useUIStore } from '../../store/uiStore';

interface Result {
  id?: string;
  url: string;
  platform: string;
  posted_at: string;
  confidence: string;
  similarity: number;
  thumbnail: string;
  caption?: string;
  author_username?: string;
  media_type?: string;
}

interface ChronosSpiralProps {
  results: Result[];
  onResultClick?: (result: Result) => void;
}

const SpiralCard3D: React.FC<{
  result: Result;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  index: number;
  total: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
  onClick: () => void;
}> = ({ result, position, rotation, index, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [pulsePhase, setPulsePhase] = useState(Math.random() * Math.PI * 2);

  const platformColor = getPlatformColor(result.platform);
  const confidenceNum = parseFloat(result.confidence);
  const confidenceColor = getConfidenceColor(confidenceNum);

  useEffect(() => {
    if (isHovered) {
      setHoverProgress(1);
    } else {
      setHoverProgress(0);
    }
  }, [isHovered]);

  const scale = useMemo(() => {
    return 1 + hoverProgress * 0.35;
  }, [hoverProgress]);

  const glowIntensity = useMemo(() => {
    return 0.2 + hoverProgress * 0.8;
  }, [hoverProgress]);

  const floatOffset = useMemo(() => {
    return Math.sin(index * 1.5 + performance.now() * 0.001) * 0.15;
  }, [index]);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      setPulsePhase(prev => prev + delta * 0.5);
      const pulse = Math.sin(pulsePhase) * 0.02 + 1;
      meshRef.current.scale.set(
        scale * (1 + pulse * 0.01),
        scale * (1 + pulse * 0.01),
        scale * (1 + pulse * 0.01)
      );
    }

    if (glowRef.current) {
      const pulse = Math.sin(pulsePhase) * 0.2 + 0.8;
      glowRef.current.scale.set(
        1 + pulse * 0.1,
        1 + pulse * 0.1,
        1 + pulse * 0.1
      );
    }
  });

  return (
    <group
      position={[position.x, position.y + floatOffset, position.z]}
      rotation={rotation}
    >
      <Float
        speed={0.5 + Math.random() * 0.5}
        rotationIntensity={0.05}
        floatIntensity={0.2 + Math.random() * 0.1}
      >
        <mesh
          ref={meshRef}
          onPointerOver={() => onHover(index)}
          onPointerOut={() => onHover(null)}
          onClick={onClick}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.2, 3.0, 0.12]} />
          <meshPhysicalMaterial
            color={isHovered ? '#1e293b' : '#0f172a'}
            metalness={isHovered ? 0.9 : 0.6}
            roughness={isHovered ? 0.1 : 0.4}
            emissive={isHovered ? confidenceColor : '#000'}
            emissiveIntensity={isHovered ? 0.3 : 0}
            transparent
            opacity={0.95}
            clearcoat={isHovered ? 0.3 : 0.1}
            clearcoatRoughness={0.2}
            envMapIntensity={isHovered ? 1.0 : 0.5}
          />
        </mesh>

        <mesh ref={glowRef} position={[0, 0, 0]}>
          <ringGeometry args={[1.5, 1.8, 64]} />
          <meshBasicMaterial
            color={confidenceColor}
            transparent
            opacity={0.1 * glowIntensity}
            side={THREE.DoubleSide}
          />
        </mesh>

        <line>
          <edgesGeometry args={[new THREE.BoxGeometry(2.25, 3.05, 0.16)]} />
          <lineBasicMaterial
            color={confidenceColor}
            transparent
            opacity={isHovered ? 1 : 0.3 + Math.sin(performance.now() * 0.001 + index) * 0.1}
          />
        </line>

        {result.thumbnail && (
          <mesh position={[0, 0.4, 0.08]} scale={[1.8, 1.4, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial>
              <GradientTexture
                colors={['#1a1a2e', '#16213e']}
                stops={[0, 1]}
              />
            </meshBasicMaterial>
          </mesh>
        )}

        <mesh position={[0, -1.1, 0.08]} scale={[1.8, 0.06, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial>
            <GradientTexture
              colors={[confidenceColor, confidenceColor + '88']}
              stops={[0, 1]}
            />
          </meshBasicMaterial>
        </mesh>

        <Html
          position={[0, -0.7, 0.08]}
          center
          transform
          scale={0.35}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            textAlign: 'center',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <div className={`text-[12px] font-bold`} style={{ color: confidenceColor }}>
            {result.confidence}
          </div>
        </Html>

        <Html
          position={[0, -1.1, 0.08]}
          center
          transform
          scale={0.25}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            textAlign: 'center',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          <div className="text-[10px] text-gray-400">
            {formatTimeAgo(result.posted_at)}
          </div>
        </Html>

        <Html
          position={[0.9, 1.3, 0.08]}
          center
          transform
          scale={0.2}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            className="text-[14px] font-bold opacity-60"
            style={{ color: platformColor }}
          >
            {result.platform.slice(0, 2).toUpperCase()}
          </div>
        </Html>

        <Html
          position={[-0.9, 1.3, 0.08]}
          center
          transform
          scale={0.2}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="text-[10px] text-gray-600 font-mono">
            #{index + 1}
          </div>
        </Html>

        {result.caption && (
          <Html
            position={[0, -1.4, 0.08]}
            center
            transform
            scale={0.2}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
              textAlign: 'center',
              maxWidth: '180px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div className="text-[9px] text-gray-500 truncate">
              {result.caption.length > 40 ? result.caption.slice(0, 40) + '...' : result.caption}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

const SpiralScene: React.FC<{ results: Result[]; onResultClick?: (result: Result) => void }> = ({
  results,
  onResultClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { camera } = useThree();
  const isDark = useUIStore(state => state.isDark);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) =>
      new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    );
  }, [results]);

  const positions = useMemo(() => {
    const total = sortedResults.length;
    const maxVisible = Math.min(total, 150);
    const radius = 6;
    const heightSpan = 12;
    const spiralTurns = 3.5;

    return sortedResults.slice(0, maxVisible).map((_, index) => {
      const t = index / maxVisible;
      const angle = t * Math.PI * 2 * spiralTurns + Math.PI / 2;
      const radiusScale = 1 - t * 0.45;
      const x = Math.cos(angle) * radius * radiusScale;
      const z = Math.sin(angle) * radius * radiusScale;
      const y = t * heightSpan - heightSpan / 2;

      return {
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, -angle + Math.PI / 2, 0),
      };
    });
  }, [sortedResults]);

  useFrame((state, delta) => {
    if (groupRef.current && hoveredIndex === null) {
      groupRef.current.rotation.y += delta * 0.06;
    }

    const breath = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    camera.position.y = 2 + breath;
    camera.lookAt(0, 0, 0);
  });

  useEffect(() => {
    camera.position.set(10, 3, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  if (sortedResults.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, -5, 0]} intensity={0.4} color="#a855f7" />

      <Environment
        preset={isDark ? 'night' : 'studio'}
        environmentIntensity={0.6}
      />

      <Stars
        radius={25}
        depth={60}
        count={8000}
        factor={5}
        saturation={0}
        fade
        speed={0.5}
      />
      <Sparkles
        count={200}
        scale={15}
        size={0.08}
        color="#06b6d4"
        opacity={0.4}
        speed={0.3}
      />
      <Sparkles
        count={100}
        scale={12}
        size={0.06}
        color="#a855f7"
        opacity={0.3}
        speed={0.2}
      />

      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  0, -6.5, 0,
                  0, 6.5, 0
                ]),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#06b6d4" opacity={0.15} transparent />
        </line>

        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  0, -6.5, 0,
                  0, 6.5, 0
                ]),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#06b6d4" opacity={0.05} transparent linewidth={4} />
        </line>

        <Float speed={0.5} rotationIntensity={0} floatIntensity={0.3}>
          <Html position={[0, 6.8, 0]} center>
            <div className="text-green-400 text-[10px] font-mono opacity-50 tracking-widest">
              NOW
            </div>
          </Html>
          <Html position={[0, -7.0, 0]} center>
            <div className="text-red-400 text-[10px] font-mono opacity-50 tracking-widest">
              6 MONTHS
            </div>
          </Html>
        </Float>
      </group>

      {positions.length > 2 && (
        <group>
          {[0, 0.25, 0.5, 0.75].map((t) => {
            const radius = 6 * (1 - t * 0.45);
            const y = t * 12 - 6;
            const points = 60;
            const positions = new Float32Array((points + 1) * 3);
            for (let i = 0; i <= points; i++) {
              const angle = (i / points) * Math.PI * 2;
              positions[i * 3] = Math.cos(angle) * radius;
              positions[i * 3 + 1] = y;
              positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
            return (
              <line key={t}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#4ade80"
                  opacity={0.03}
                  transparent
                />
              </line>
            );
          })}
        </group>
      )}

      <AnimatePresence>
        {positions.map((pos, index) => {
          const result = sortedResults[index];
          if (!result) return null;

          return (
            <SpiralCard3D
              key={result.id || index}
              result={result}
              position={pos.position}
              rotation={pos.rotation}
              index={index}
              total={positions.length}
              isHovered={hoveredIndex === index}
              onHover={setHoveredIndex}
              onClick={() => onResultClick?.(result)}
            />
          );
        })}
      </AnimatePresence>

      {positions.length > 2 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  positions.slice(0, 80).flatMap(p => [p.position.x, p.position.y, p.position.z])
                ),
                3
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#06b6d4"
            opacity={0.04}
            transparent
            blending={THREE.AdditiveBlending}
          />
        </line>
      )}
    </group>
  );
};

export const ChronosSpiral: React.FC<ChronosSpiralProps> = ({ results, onResultClick }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = useUIStore(state => state.isDark);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${isDark ? 'bg-[#0a0a0f]' : 'bg-gray-100'} rounded-2xl overflow-hidden`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0f]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-b-transparent rounded-full animate-spin animation-delay-150" />
            </div>
            <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-mono">
              Rendering Spiral...
            </p>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [10, 3, 10], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          dpr={[1, 2]}
          onCreated={() => setIsLoading(false)}
        >
          <SpiralScene results={results} onResultClick={onResultClick} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={4}
            maxDistance={25}
            autoRotate={false}
            target={[0, 0, 0]}
            dampingFactor={0.08}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            enableDamping={true}
          />

          <EffectComposer>
            <DepthOfField
              focusDistance={0.02}
              focalLength={0.2}
              bokehScale={2}
              height={480}
            />
            <Bloom
              intensity={0.2}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.1}
              width={300}
              height={300}
            />
            <ChromaticAberration
              offset={[0.0005, 0.0005]}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        </Canvas>
      </Suspense>

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10">
            <span className="text-xs text-gray-400 font-mono">
              🖱 Drag to rotate • Scroll to zoom
            </span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-cyan-400 font-mono">
              {results.length} results
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all group"
          >
            {isFullscreen ? (
              <FiMinimize2 className="text-gray-400 text-sm group-hover:text-white transition-colors" />
            ) : (
              <FiMaximize2 className="text-gray-400 text-sm group-hover:text-white transition-colors" />
            )}
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 pointer-events-none">
        <div className="px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/5">
          <span className="text-[10px] text-gray-500 font-mono tracking-widest">
            ◈ CHRONOS SPIRAL ◈
          </span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/10 via-transparent to-black/10" />
    </div>
  );
};