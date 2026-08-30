import React, { useState, useEffect, useRef, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RiskGauge } from '../ui/RiskGauge';
import { ThreatTelemetry } from './ThreatTelemetry';
import { ThreatCoreFallback, RISK_FACTORS, ThreatFactor } from './ThreatCore3D.fallback';
import { MaterialIcon } from '../ui/MaterialIcon';

// Synchronous WebGL availability check
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// Error Boundary catching 3D / WebGL runtime failures
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ThreatCore3D WebGL error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 3D Connection Line Positions matching radial nodes to center [0,0,0]
const LINE_POSITIONS: [number, number, number][] = [
  [-3.0, 1.6, 0],   // 1. Malware Evidence (Top Left)
  [-3.4, 0.0, 0],   // 2. Capability Risk (Mid Left)
  [-3.0, -1.6, 0],  // 3. Purpose Mismatch (Bottom Left)
  [3.0, 1.6, 0],    // 4. Behavioral Anomalies (Top Right)
  [3.4, 0.0, 0],    // 5. Fraud Pathway (Mid Right)
  [3.0, -1.6, 0],   // 6. Certificate Reputation (Bottom Right)
];

const CentralCore3D: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    // Slow rotation (< 5 deg/sec = ~0.06 rad/s)
    if (outerRef.current) outerRef.current.rotation.y += delta * 0.06;
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.04;

    // Scanning beam pass (4-6s cycle sine wave up and down)
    if (scanBeamRef.current) {
      const time = state.clock.getElapsedTime();
      scanBeamRef.current.position.y = Math.sin((time * Math.PI) / 2.5) * 1.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Wireframe Icosahedron Shell */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#E8935A"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Inner Soft Glowing Core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.15, 24, 24]} />
        <meshBasicMaterial
          color="#E8935A"
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Scanning Beam Ring */}
      <mesh ref={scanBeamRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 1.55, 32]} />
        <meshBasicMaterial
          color="#E8935A"
          transparent
          opacity={reducedMotion ? 0 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

interface ConnectionLine3DProps {
  start: [number, number, number];
  end: [number, number, number];
  isHovered: boolean;
  reducedMotion: boolean;
}

const ConnectionLine3D: React.FC<ConnectionLine3DProps> = ({
  start,
  end,
  isHovered,
  reducedMotion,
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);

  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const lineObject = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: '#E8935A',
      transparent: true,
      opacity: 0.25,
    });
    return new THREE.Line(lineGeometry, mat);
  }, [lineGeometry]);

  useEffect(() => {
    if (lineObject.material) {
      (lineObject.material as THREE.LineBasicMaterial).opacity = isHovered ? 0.85 : 0.25;
    }
  }, [lineObject, isHovered]);

  // Traveling pulse particle (max 1 pulse per connection line)
  useFrame((state) => {
    if (reducedMotion || !pulseRef.current) return;
    const time = state.clock.getElapsedTime();
    const progress = (time * 0.35) % 1;
    pulseRef.current.position.lerpVectors(points[0], points[1], progress);
  });

  return (
    <group>
      <primitive object={lineObject} />
      {!reducedMotion && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#E8935A" transparent opacity={isHovered ? 1.0 : 0.7} />
        </mesh>
      )}
    </group>
  );
};

// Capped Ambient Particles (18 total max)
const AmbientParticles: React.FC<{ isTablet: boolean; reducedMotion: boolean }> = ({
  isTablet,
  reducedMotion,
}) => {
  const count = isTablet ? 9 : 18;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 11;
      const y = (Math.random() - 0.5) * 7;
      const z = (Math.random() - 0.5) * 3;
      const speed = 0.2 + Math.random() * 0.3;
      temp.push({ x, y, z, speed, initialY: y });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    const time = state.clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(time * p.speed + i) * 0.15,
        p.initialY + Math.cos(time * p.speed + i) * 0.15,
        p.z
      );
      dummy.scale.set(0.04, 0.04, 0.04);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#E8935A" transparent opacity={0.25} />
    </instancedMesh>
  );
};

// Parallax Scene Group
const ParallaxGroup: React.FC<{
  children: React.ReactNode;
  reducedMotion: boolean;
  isTablet: boolean;
}> = ({ children, reducedMotion, isTablet }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion || isTablet) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion, isTablet]);

  useFrame(() => {
    if (groupRef.current && !reducedMotion && !isTablet) {
      groupRef.current.rotation.y += (mouse.current.x * 0.08 - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-mouse.current.y * 0.08 - groupRef.current.rotation.x) * 0.05;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

export const ThreatCore3D: React.FC<{
  score?: number;
  packageName?: string;
  appTitle?: string;
}> = ({
  score = 85,
  packageName = 'com.bank.overlay.trojan',
  appTitle = 'Banking Trojan Overlay',
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hasWebGL] = useState<boolean>(() => checkWebGLSupport());
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Fallback to static component if WebGL is unavailable or on mobile
  if (!hasWebGL || isMobile) {
    return <ThreatCoreFallback score={score} packageName={packageName} appTitle={appTitle} />;
  }

  const leftNodes = RISK_FACTORS.slice(0, 3);
  const rightNodes = RISK_FACTORS.slice(3, 6);
  const fallbackView = <ThreatCoreFallback score={score} packageName={packageName} appTitle={appTitle} />;

  return (
    <ThreeErrorBoundary fallback={fallbackView}>
      <div
        aria-label={`Interactive 3D Threat Core: Risk score ${score}, 6 risk factors analyzed`}
        className="relative w-full max-w-[620px] mx-auto rounded-2xl border border-white/10 bg-[#0A0C14]/90 backdrop-blur-xl p-5 shadow-2xl overflow-hidden group"
      >
        {/* Ambient Lighting Orbs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#E8935A]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Info Bar */}
        <div className="relative z-10 flex justify-between items-center pb-3 mb-3 border-b border-white/10">
          <div className="min-w-0 pr-2">
            <span className="font-mono text-[11px] text-slate-400 block truncate">{packageName}</span>
            <span className="font-heading text-sm font-bold text-white tracking-tight">{appTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8935A]/10 border border-[#E8935A]/30 text-[#E8935A] font-mono text-xs font-bold shrink-0">
            <MaterialIcon name="warning" className="text-sm" />
            <span>RISK {score}</span>
          </div>
        </div>

        {/* 3-Column Interactive Layout: Left Nodes | 3D Core Canvas | Right Nodes */}
        <div className="relative z-10 grid grid-cols-12 gap-2 items-center my-2">
          {/* Left Column: 3 Factor Nodes */}
          <div className="col-span-4 space-y-2.5 z-20">
            {leftNodes.map((factor) => {
              const isActive = hoveredNode === factor.id;
              return (
                <button
                  key={factor.id}
                  onMouseEnter={() => setHoveredNode(factor.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onFocus={() => setHoveredNode(factor.id)}
                  onBlur={() => setHoveredNode(null)}
                  className={`w-full text-left p-2 rounded-xl border transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#E8935A]/20 border-[#E8935A] shadow-[0_0_15px_rgba(232,147,90,0.3)] translate-x-1'
                      : 'bg-[#07090E]/80 border-white/10 hover:border-[#E8935A]/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MaterialIcon
                        name={factor.icon}
                        className={`text-xs shrink-0 ${isActive ? 'text-[#E8935A]' : 'text-slate-400'}`}
                      />
                      <span className="font-heading text-[11px] font-semibold text-slate-200 truncate">
                        {factor.name}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-[#E8935A] bg-[#E8935A]/10 px-1 py-0.5 rounded border border-[#E8935A]/20 shrink-0">
                      {factor.weight}
                    </span>
                  </div>

                  {/* Stable Hover Tooltip */}
                  {isActive && (
                    <div className="absolute left-0 right-0 -bottom-11 z-40 p-2 bg-[#07090E] rounded-lg border border-[#E8935A]/50 text-[10px] font-mono text-slate-200 shadow-2xl pointer-events-none">
                      <span className="text-[#E8935A] font-bold">{factor.name} — {factor.weight}</span>: {factor.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Center Column: 3D Core Canvas with Central RiskGauge */}
          <div className="col-span-4 relative h-[310px] flex items-center justify-center">
            {/* Crisp Central RiskGauge SVG Overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none select-none flex flex-col items-center justify-center p-2 rounded-full bg-[#07090E]/90 border border-[#E8935A]/40 shadow-[0_0_25px_rgba(232,147,90,0.3)] backdrop-blur-md">
              <RiskGauge score={score} color="#E8935A" size={125} label="APK CORE" />
            </div>

            <Canvas
              camera={{ position: [0, 0, 7.5], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.8} />
              <ParallaxGroup reducedMotion={reducedMotion} isTablet={isTablet}>
                <AmbientParticles isTablet={isTablet} reducedMotion={reducedMotion} />
                <CentralCore3D reducedMotion={reducedMotion} />
                {RISK_FACTORS.map((factor, index) => (
                  <ConnectionLine3D
                    key={factor.id}
                    start={LINE_POSITIONS[index]}
                    end={[0, 0, 0]}
                    isHovered={hoveredNode === factor.id}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </ParallaxGroup>
            </Canvas>
          </div>

          {/* Right Column: 3 Factor Nodes */}
          <div className="col-span-4 space-y-2.5 z-20">
            {rightNodes.map((factor, idx) => {
              const isActive = hoveredNode === factor.id;
              const globalIdx = idx + 3;
              return (
                <button
                  key={factor.id}
                  onMouseEnter={() => setHoveredNode(factor.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onFocus={() => setHoveredNode(factor.id)}
                  onBlur={() => setHoveredNode(null)}
                  className={`w-full text-left p-2 rounded-xl border transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#E8935A]/20 border-[#E8935A] shadow-[0_0_15px_rgba(232,147,90,0.3)] -translate-x-1'
                      : 'bg-[#07090E]/80 border-white/10 hover:border-[#E8935A]/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MaterialIcon
                        name={factor.icon}
                        className={`text-xs shrink-0 ${isActive ? 'text-[#E8935A]' : 'text-slate-400'}`}
                      />
                      <span className="font-heading text-[11px] font-semibold text-slate-200 truncate">
                        {factor.name}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-[#E8935A] bg-[#E8935A]/10 px-1 py-0.5 rounded border border-[#E8935A]/20 shrink-0">
                      {factor.weight}
                    </span>
                  </div>

                  {/* Stable Hover Tooltip */}
                  {isActive && (
                    <div className="absolute left-0 right-0 -bottom-11 z-40 p-2 bg-[#07090E] rounded-lg border border-[#E8935A]/50 text-[10px] font-mono text-slate-200 shadow-2xl pointer-events-none">
                      <span className="text-[#E8935A] font-bold">{factor.name} — {factor.weight}</span>: {factor.desc}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Telemetry HUD Bottom Bar */}
        <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
          <ThreatTelemetry />
        </div>
      </div>
    </ThreeErrorBoundary>
  );
};

export default ThreatCore3D;
