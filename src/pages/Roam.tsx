import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls as DreiPointerLockControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  ArrowLeft,
  Sun,
  Sunset,
  Moon,
  Ruler,
  Sofa,
  Eye,
  MessageCircle,
  Move3D,
  ZoomIn,
  ZoomOut,
  Compass,
  X,
  Heart,
  Scale,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import type { LightingMode } from '@/types';

type PointerLockControlsImpl = {
  lock: () => void;
  unlock: () => void;
  isLocked: boolean;
  addEventListener: (type: string, handler: () => void) => void;
  removeEventListener: (type: string, handler: () => void) => void;
};

function PlayerController({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.set(0, 1.6, 0);
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = 5 * delta;
    direction.current.z = Number(keys.current['KeyW'] || 0) - Number(keys.current['KeyS'] || 0);
    direction.current.x = Number(keys.current['KeyD'] || 0) - Number(keys.current['KeyA'] || 0);
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.length() > 0) forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    velocity.current.set(0, 0, 0);
    velocity.current.addScaledVector(forward, direction.current.z * speed);
    velocity.current.addScaledVector(right, direction.current.x * speed);

    camera.position.add(velocity.current);
    camera.position.y = 1.6;

    camera.position.x = Math.max(-8, Math.min(8, camera.position.x));
    camera.position.z = Math.max(-8, Math.min(8, camera.position.z));
  });

  return null;
}

function Hotspot({
  position,
  label,
  type,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  type: 'room' | 'info' | 'furniture';
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = type === 'room' ? '#00E5A8' : type === 'info' ? '#FFD93D' : '#FF6B6B';

  return (
    <group position={position}>
      <mesh onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : 0.8} />
      </mesh>
      <pointLight color={color} intensity={hovered ? 2 : 1} distance={2} />
      {hovered && (
        <Html center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className="glass-card rounded-lg px-3 py-1.5 whitespace-nowrap text-sm font-medium" style={{ color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

function MeasureLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const distance =
    Math.sqrt(
      Math.pow(end[0] - start[0], 2) +
        Math.pow(end[1] - start[1], 2) +
        Math.pow(end[2] - start[2], 2)
    ) * 100;

  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 0.1,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...start, ...end])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FF6B6B" />
      </line>
      <mesh position={start}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FF6B6B" />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#FF6B6B" />
      </mesh>
      <Text position={midPoint} fontSize={0.2} color="#FF6B6B" anchorX="center" anchorY="middle">
        {distance.toFixed(1)} cm
      </Text>
    </group>
  );
}

function RoomScene({
  lightingMode,
  showFurniture,
  measurePoints,
  hotspots,
  currentRoomId,
  onHotspotClick,
  pointerLocked,
}: {
  lightingMode: LightingMode;
  showFurniture: boolean;
  measurePoints: { x: number; y: number; z: number }[];
  hotspots: { id: string; roomId: string; type: 'room' | 'info' | 'furniture'; position: { x: number; y: number; z: number }; label: string; targetRoomId?: string; info?: string }[];
  currentRoomId: string;
  onHotspotClick: (hotspot: typeof hotspots[0]) => void;
  pointerLocked: boolean;
}) {
  const lightingConfig = {
    day: { ambient: 0.6, directional: 1, bg: '#87CEEB', color: '#FFF8E7' },
    dusk: { ambient: 0.3, directional: 0.6, bg: '#FF7F50', color: '#FFD4A3' },
    night: { ambient: 0.15, directional: 0.2, bg: '#0A1628', color: '#4A6FA5' },
  };
  const lighting = lightingConfig[lightingMode];
  const roomHotspots = hotspots.filter((h) => h.roomId === currentRoomId);

  return (
    <>
      <color attach="background" args={[lighting.bg]} />
      <fog attach="fog" args={[lighting.bg, 10, 50]} />
      <ambientLight intensity={lighting.ambient} color={lighting.color} />
      <directionalLight position={[5, 10, 5]} intensity={lighting.directional} color={lighting.color} castShadow />
      <pointLight position={[0, 3, 0]} intensity={lightingMode === 'night' ? 0.8 : 0.3} color={lighting.color} />

      <PlayerController enabled={pointerLocked} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={lightingMode === 'day' ? '#D4C4A8' : lightingMode === 'dusk' ? '#A0785A' : '#3A3A3A'} roughness={0.8} />
      </mesh>

      <mesh position={[0, 2.5, -5]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color={lightingMode === 'day' ? '#F5F0E6' : lightingMode === 'dusk' ? '#C4A882' : '#2A2A3A'} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.5, 5]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color={lightingMode === 'day' ? '#F5F0E6' : lightingMode === 'dusk' ? '#C4A882' : '#2A2A3A'} roughness={0.7} />
      </mesh>
      <mesh position={[-6, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={lightingMode === 'day' ? '#EDE6D6' : lightingMode === 'dusk' ? '#B89B72' : '#252535'} roughness={0.7} />
      </mesh>
      <mesh position={[6, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color={lightingMode === 'day' ? '#EDE6D6' : lightingMode === 'dusk' ? '#B89B72' : '#252535'} roughness={0.7} />
      </mesh>

      {lightingMode !== 'night' && (
        <mesh position={[0, 2.5, -4.9]}>
          <boxGeometry args={[4, 2.5, 0.05]} />
          <meshStandardMaterial
            color="#87CEEB"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
      )}

      {showFurniture && (
        <>
          <mesh position={[-2, 0.4, -2]} castShadow>
            <boxGeometry args={[2.5, 0.8, 1]} />
            <meshStandardMaterial color="#8B7355" roughness={0.8} />
          </mesh>
          <mesh position={[-2, 0.9, -2]} castShadow>
            <boxGeometry args={[2.4, 0.3, 0.9]} />
            <meshStandardMaterial color="#D4A574" roughness={0.7} />
          </mesh>
          <mesh position={[2, 0.3, -2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
            <meshStandardMaterial color="#333" roughness={0.5} />
          </mesh>
          <mesh position={[2, 0.7, -2]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.05, 16]} />
            <meshStandardMaterial color="#F5F5DC" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.5, 2]} castShadow>
            <boxGeometry args={[1.5, 1, 1]} />
            <meshStandardMaterial color="#6B5B4F" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.3, 2]} castShadow>
            <boxGeometry args={[1.3, 0.1, 0.8]} />
            <meshStandardMaterial color="#8B7355" roughness={0.7} />
          </mesh>
          <mesh position={[3, 0.5, 2]} castShadow>
            <boxGeometry args={[0.5, 1, 0.5]} />
            <meshStandardMaterial color="#A0522D" roughness={0.9} />
          </mesh>
          <mesh position={[3, 1.2, 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
            <meshStandardMaterial color="#228B22" roughness={0.9} />
          </mesh>
        </>
      )}

      {roomHotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.id}
          position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}
          label={hotspot.label}
          type={hotspot.type}
          onClick={() => onHotspotClick(hotspot)}
        />
      ))}

      {measurePoints.length === 1 && (
        <mesh position={[measurePoints[0].x, measurePoints[0].y, measurePoints[0].z]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#FF6B6B" />
        </mesh>
      )}
      {measurePoints.length === 2 && (
        <MeasureLine
          start={[measurePoints[0].x, measurePoints[0].y, measurePoints[0].z]}
          end={[measurePoints[1].x, measurePoints[1].y, measurePoints[1].z]}
        />
      )}
    </>
  );
}

export default function Roam() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    getPropertyById,
    currentRoomId,
    setCurrentRoomId,
    lightingMode,
    setLightingMode,
    showFurniture,
    setShowFurniture,
    isMeasuring,
    setIsMeasuring,
    measurePoints,
    addMeasurePoint,
    clearMeasurePoints,
    toggleFavorite,
    isFavorite,
    addToCompare,
    compareList,
  } = useAppStore();

  const [showRoomList, setShowRoomList] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const plcRef = useRef<PointerLockControlsImpl | null>(null);

  const property = id ? getPropertyById(id) : undefined;
  const favorite = property ? isFavorite(property.id) : false;
  const inCompare = property ? compareList.includes(property.id) : false;

  useEffect(() => {
    const roomFromUrl = searchParams.get('room');
    if (roomFromUrl) {
      setCurrentRoomId(roomFromUrl);
    }
  }, [searchParams, setCurrentRoomId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setPointerLocked(false);
      }
      if (e.code === 'KeyL' && pointerLocked) {
        const modes: LightingMode[] = ['day', 'dusk', 'night'];
        const nextIndex = (modes.indexOf(lightingMode) + 1) % modes.length;
        setLightingMode(modes[nextIndex]);
      }
      if (e.code === 'KeyF' && pointerLocked) {
        setShowFurniture(!showFurniture);
      }
      if (e.code === 'KeyM' && pointerLocked) {
        setIsMeasuring(!isMeasuring);
        if (isMeasuring) clearMeasurePoints();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pointerLocked, lightingMode, setLightingMode, showFurniture, setShowFurniture, isMeasuring, setIsMeasuring, clearMeasurePoints]);

  const handleStartRoam = () => {
    if (plcRef.current) {
      plcRef.current.lock();
    }
  };

  const handleExitRoam = () => {
    if (plcRef.current) {
      plcRef.current.unlock();
    }
    setPointerLocked(false);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg flex items-center justify-center">
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-metal-300 text-lg">房源不存在</p>
          <Link to="/" className="btn-primary inline-block mt-6">返回列表</Link>
        </div>
      </div>
    );
  }

  const currentRoom = property.rooms.find((r) => r.id === currentRoomId) || property.rooms[0];

  const handleHotspotClick = (hotspot: typeof property.hotspots[0]) => {
    if (hotspot.type === 'room' && hotspot.targetRoomId) {
      setCurrentRoomId(hotspot.targetRoomId);
    } else if (hotspot.type === 'info' && hotspot.info) {
      setInfoModal(hotspot.info);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isMeasuring || measurePoints.length >= 2) return;
    const rect = canvasWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    addMeasurePoint({ x: x * 3, y: 0.05, z: y * 3 });
  };

  return (
    <div className="h-screen w-screen bg-space-950 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 z-30">
        <Navbar />
      </div>

      <div ref={canvasWrapRef} className="absolute inset-0" onClick={handleCanvasClick}>
        <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
          <DreiPointerLockControls
            ref={(ref) => {
              if (ref) {
                plcRef.current = ref as unknown as PointerLockControlsImpl;
              }
            }}
            onLock={() => setPointerLocked(true)}
            onUnlock={() => setPointerLocked(false)}
            selector=""
          />
          <RoomScene
            lightingMode={lightingMode}
            showFurniture={showFurniture}
            measurePoints={measurePoints}
            hotspots={property.hotspots}
            currentRoomId={currentRoomId}
            onHotspotClick={handleHotspotClick}
            pointerLocked={pointerLocked}
          />
        </Canvas>
      </div>

      {!pointerLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-space-950/80 z-40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 text-center max-w-md border-aurora-500/30">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-aurora-400/20 to-aurora-500/10 flex items-center justify-center border border-aurora-500/30 animate-pulse-slow">
              <Eye className="w-10 h-10 text-aurora-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gradient mb-3">进入 VR 漫游模式</h2>
            <p className="text-metal-300 mb-6 leading-relaxed">
              点击下方按钮锁定鼠标，使用 <span className="text-aurora-400 font-semibold">WASD</span> 键行走，<span className="text-aurora-400 font-semibold">鼠标</span> 控制视角<br />
              按 <span className="text-aurora-400 font-semibold">ESC</span> 可随时退出漫游
            </p>
            <button
              onClick={handleStartRoam}
              className="btn-primary px-10 py-3 text-lg font-semibold animate-glow"
            >
              开始漫游
            </button>
            <div className="mt-6 pt-4 border-t border-metal-500/20">
              <div className="grid grid-cols-3 gap-3 text-xs text-metal-400">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-space-800 flex items-center justify-center font-mono text-aurora-400">WASD</div>
                  <span>移动</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-space-800 flex items-center justify-center font-mono text-aurora-400">🖱</div>
                  <span>视角</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg bg-space-800 flex items-center justify-center font-mono text-aurora-400">ESC</div>
                  <span>退出</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pointerLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-5 h-5 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-aurora-400/60" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-aurora-400/60" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-aurora-400" />
          </div>
        </div>
      )}

      <div className="absolute top-24 left-6 z-30 flex flex-col gap-3">
        <button
          onClick={() => navigate(-1)}
          className="glass-card p-3 rounded-xl text-metal-300 hover:text-aurora-400 transition-colors"
          title="返回"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => toggleFavorite(property.id)}
          className={`glass-card p-3 rounded-xl transition-all ${
            favorite ? 'text-coral-500' : 'text-metal-300 hover:text-coral-500'
          }`}
          title={favorite ? '取消收藏' : '收藏'}
        >
          <Heart className="w-5 h-5" fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => !inCompare && addToCompare(property.id)}
          disabled={inCompare}
          className={`glass-card p-3 rounded-xl transition-all ${
            inCompare ? 'text-aurora-400' : 'text-metal-300 hover:text-aurora-400'
          }`}
          title={inCompare ? '已加入对比' : '加入对比'}
        >
          <Scale className="w-5 h-5" />
        </button>
        {pointerLocked && (
          <button
            onClick={handleExitRoam}
            className="glass-card p-3 rounded-xl text-coral-500 hover:bg-coral-500/10 transition-colors"
            title="退出漫游"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="absolute top-24 right-6 z-30 glass-card rounded-xl p-4 w-64">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-aurora-400" />
            <span className="font-semibold text-metal-100">{currentRoom?.name || '客厅'}</span>
          </div>
          <button
            onClick={() => setShowRoomList(!showRoomList)}
            className="text-metal-400 hover:text-aurora-400 text-sm"
          >
            切换
          </button>
        </div>
        <div className="text-xs text-metal-400 mb-1">{currentRoom?.area || 32}㎡ · {property.orientation}朝向</div>
        {showRoomList && (
          <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
            {property.rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setCurrentRoomId(room.id);
                  setShowRoomList(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  room.id === currentRoomId
                    ? 'bg-aurora-500/20 text-aurora-400'
                    : 'text-metal-300 hover:bg-space-700/50'
                }`}
              >
                {room.name} <span className="text-metal-500 text-xs">{room.area}㎡</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-2">
          <div className="flex items-center gap-1 pr-3 border-r border-metal-500/30">
            {(['day', 'dusk', 'night'] as LightingMode[]).map((mode) => {
              const Icon = mode === 'day' ? Sun : mode === 'dusk' ? Sunset : Moon;
              const label = mode === 'day' ? '白天' : mode === 'dusk' ? '黄昏' : '夜晚';
              return (
                <button
                  key={mode}
                  onClick={() => setLightingMode(mode)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    lightingMode === mode
                      ? 'bg-aurora-500/20 text-aurora-400'
                      : 'text-metal-400 hover:text-metal-200'
                  }`}
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 pr-3 border-r border-metal-500/30">
            <button
              onClick={() => setShowFurniture(!showFurniture)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                showFurniture
                  ? 'bg-aurora-500/20 text-aurora-400'
                  : 'text-metal-400 hover:text-metal-200'
              }`}
              title="家具显示"
            >
              <Sofa className="w-5 h-5" />
              <span className="text-[10px]">家具</span>
            </button>
          </div>

          <div className="flex items-center gap-1 pr-3 border-r border-metal-500/30">
            <button
              onClick={() => {
                setIsMeasuring(!isMeasuring);
                if (isMeasuring) clearMeasurePoints();
              }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isMeasuring
                  ? 'bg-coral-500/20 text-coral-500'
                  : 'text-metal-400 hover:text-metal-200'
              }`}
              title="量尺工具"
            >
              <Ruler className="w-5 h-5" />
              <span className="text-[10px]">量尺</span>
            </button>
            {isMeasuring && measurePoints.length > 0 && (
              <button
                onClick={clearMeasurePoints}
                className="p-1.5 rounded-lg text-metal-400 hover:text-coral-500 transition-colors"
                title="清除测量"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-metal-400 hover:text-metal-200 transition-all">
              <ZoomIn className="w-5 h-5" />
              <span className="text-[10px]">放大</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-metal-400 hover:text-metal-200 transition-all">
              <ZoomOut className="w-5 h-5" />
              <span className="text-[10px]">缩小</span>
            </button>
          </div>

          <div className="w-px h-10 bg-metal-500/30 mx-2" />

          <Link
            to={`/property/${property.id}/tour`}
            className="btn-primary flex items-center gap-2 py-2.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">在线讲解</span>
          </Link>
        </div>

        <div className="text-center mt-3 text-xs text-metal-500">
          <Move3D className="w-3 h-3 inline mr-1" />
          WASD 行走 · 鼠标视角 · ESC 解锁 · L 切换光线 · F 家具 · M 量尺
        </div>
      </div>

      {infoModal && (
        <div className="absolute inset-0 bg-space-950/80 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-aurora-400">热点信息</h3>
              <button
                onClick={() => setInfoModal(null)}
                className="text-metal-400 hover:text-metal-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-metal-200 leading-relaxed">{infoModal}</p>
            <button onClick={() => setInfoModal(null)} className="btn-primary w-full mt-6">
              继续漫游
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
