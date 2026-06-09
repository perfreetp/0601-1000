import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Ruler,
  Layers,
  Home,
  Eye,
  CalendarDays,
  MapPin,
  BedDouble,
  Bath,
  Heart,
  Scale,
  Navigation,
  Maximize2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';

const roomTypeColors: Record<string, { fill: string; stroke: string }> = {
  livingroom: { fill: 'rgba(0, 229, 168, 0.15)', stroke: '#00E5A8' },
  bedroom: { fill: 'rgba(255, 217, 61, 0.15)', stroke: '#FFD93D' },
  kitchen: { fill: 'rgba(255, 107, 107, 0.15)', stroke: '#FF6B6B' },
  bathroom: { fill: 'rgba(107, 133, 160, 0.2)', stroke: '#6B85A0' },
  balcony: { fill: 'rgba(54, 245, 188, 0.1)', stroke: '#36F5BC' },
  study: { fill: 'rgba(255, 138, 138, 0.15)', stroke: '#FF8A8A' },
  diningroom: { fill: 'rgba(255, 227, 105, 0.15)', stroke: '#FFE369' },
};

export default function FloorPlan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById, setCurrentProperty, toggleFavorite, isFavorite, addToCompare, compareList } =
    useAppStore();
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const property = id ? getPropertyById(id) : undefined;

  useEffect(() => {
    if (property) {
      setCurrentProperty(property);
    }
  }, [property, setCurrentProperty]);

  if (!property) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg flex items-center justify-center">
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-metal-300 text-lg">房源不存在</p>
          <Link to="/" className="btn-primary inline-block mt-6">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(property.id);
  const inCompare = compareList.includes(property.id);
  const selectedRoomData = selectedRoom
    ? property.rooms.find((r) => r.id === selectedRoom)
    : null;

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary p-2.5 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-metal-400 text-sm mb-1">
              <MapPin className="w-3.5 h-3.5" />
              {property.address}
            </div>
            <h1 className="text-2xl font-bold text-metal-100 truncate">{property.title}</h1>
          </div>
          <button
            onClick={() => toggleFavorite(property.id)}
            className={`p-3 rounded-xl transition-all duration-300 ${
              favorite
                ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/50'
                : 'glass-card text-metal-300 hover:text-coral-500'
            }`}
          >
            <Heart className="w-5 h-5" fill={favorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => !inCompare && addToCompare(property.id)}
            disabled={inCompare}
            className={`p-3 rounded-xl transition-all duration-300 ${
              inCompare
                ? 'bg-aurora-500 text-space-900 shadow-lg shadow-aurora-500/50'
                : 'glass-card text-metal-300 hover:text-aurora-400'
            }`}
          >
            <Scale className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-aurora-400" />
                  <h2 className="text-lg font-semibold text-metal-100">户型平面图</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost py-1.5 px-3 text-sm">
                    <Maximize2 className="w-4 h-4 inline mr-1" />
                    全屏
                  </button>
                </div>
              </div>

              <div className="relative aspect-[4/3] bg-space-950 rounded-xl overflow-hidden border border-metal-500/20">
                <svg viewBox="0 0 430 300" className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="rgba(0, 229, 168, 0.05)"
                        strokeWidth="1"
                      />
                    </pattern>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {property.rooms.map((room) => {
                    const colors = roomTypeColors[room.type] || roomTypeColors.livingroom;
                    const isHovered = hoveredRoom === room.id;
                    const isSelected = selectedRoom === room.id;
                    return (
                      <g
                        key={room.id}
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredRoom(room.id)}
                        onMouseLeave={() => setHoveredRoom(null)}
                        onClick={() => {
                          setSelectedRoom(room.id);
                          navigate(`/property/${property.id}/roam?room=${room.id}`);
                        }}
                      >
                        <path
                          d={room.svgPath}
                          fill={isSelected || isHovered ? colors.fill : 'rgba(15, 31, 56, 0.5)'}
                          stroke={colors.stroke}
                          strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                          filter={isSelected ? 'url(#glow)' : undefined}
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                        />
                        <text
                          x={room.position.x + 40}
                          y={room.position.y + 50}
                          textAnchor="middle"
                          fill={isSelected || isHovered ? colors.stroke : '#C4D4E0'}
                          fontSize="13"
                          fontWeight="600"
                          style={{ pointerEvents: 'none' }}
                        >
                          {room.name}
                        </text>
                        <text
                          x={room.position.x + 40}
                          y={room.position.y + 70}
                          textAnchor="middle"
                          fill="#6B85A0"
                          fontSize="11"
                          style={{ pointerEvents: 'none' }}
                        >
                          {room.area}㎡
                        </text>
                      </g>
                    );
                  })}

                  <g transform="translate(380, 250)">
                    <circle r="20" fill="rgba(0, 229, 168, 0.1)" stroke="#00E5A8" strokeWidth="1.5" />
                    <Compass
                      className="w-5 h-5"
                      style={{
                        color: '#00E5A8',
                        transform: 'translate(-10px, -10px)',
                      }}
                    />
                    <text y="-25" textAnchor="middle" fill="#00E5A8" fontSize="10" fontWeight="bold">
                      N
                    </text>
                  </g>
                </svg>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="tag-chip flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    {property.orientation}朝向
                  </span>
                  <span className="tag-chip flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {property.builtArea}㎡ 建面
                  </span>
                </div>

                {hoveredRoom && (
                  <div className="absolute bottom-4 left-4 glass-card rounded-lg px-4 py-2 animate-pulse-slow">
                    <p className="text-sm text-aurora-400 font-medium">
                      点击进入 {property.rooms.find((r) => r.id === hoveredRoom)?.name} 漫游
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {property.rooms.map((room) => {
                  const colors = roomTypeColors[room.type] || roomTypeColors.livingroom;
                  const isSelected = selectedRoom === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room.id);
                        navigate(`/property/${property.id}/roam?room=${room.id}`);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'bg-aurora-500/10 border-aurora-500/50'
                          : 'bg-space-800/50 border-metal-500/30 hover:border-aurora-500/30'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors.stroke }}
                      />
                      <div className="text-left">
                        <div className={`text-sm font-medium ${isSelected ? 'text-aurora-400' : 'text-metal-200'}`}>
                          {room.name}
                        </div>
                        <div className="text-xs text-metal-400">{room.area}㎡</div>
                      </div>
                      <Navigation
                        className={`w-4 h-4 ml-2 ${isSelected ? 'text-aurora-400' : 'text-metal-500'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-4xl font-display font-bold text-gradient">
                    {property.price}
                  </div>
                  <span className="text-metal-300 ml-1">万</span>
                </div>
                <div className="text-right">
                  <div className="text-metal-400 text-sm">参考单价</div>
                  <div className="text-aurora-400 font-semibold">
                    {property.pricePerSqm.toLocaleString()} 元/㎡
                  </div>
                </div>
              </div>
              {property.monthlyPayment && (
                <div className="flex items-center gap-2 text-sm text-metal-400 mb-4">
                  <CalendarDays className="w-4 h-4" />
                  月供约 <span className="text-aurora-400 font-semibold">{property.monthlyPayment.toLocaleString()}</span> 元
                </div>
              )}
              <Link to={`/property/${property.id}/roam`} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                <Eye className="w-5 h-5" />
                立即VR漫游
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-metal-100 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-aurora-400" />
                房源参数
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">户型</div>
                    <div className="flex items-center gap-1 text-metal-100">
                      <BedDouble className="w-4 h-4 text-aurora-400" />
                      {property.layout}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">楼层</div>
                    <div className="text-metal-100">{property.floor}</div>
                  </div>
                </div>
                <div className="divider-glow" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">建筑面积</div>
                    <div className="flex items-center gap-1 text-metal-100">
                      <Ruler className="w-4 h-4 text-aurora-400" />
                      {property.builtArea}㎡
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">套内面积</div>
                    <div className="text-metal-100">{property.netArea}㎡</div>
                  </div>
                </div>
                <div className="divider-glow" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">朝向</div>
                    <div className="flex items-center gap-1 text-metal-100">
                      <Compass className="w-4 h-4 text-aurora-400" />
                      {property.orientation}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">装修</div>
                    <div className="text-metal-100">{property.decoration}</div>
                  </div>
                </div>
                <div className="divider-glow" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">小区</div>
                    <div className="text-metal-100">{property.community}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-metal-400">建成年份</div>
                    <div className="text-metal-100">{property.year}年</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-metal-100 mb-4">房源标签</h3>
              <div className="flex flex-wrap gap-2">
                {property.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-metal-100 mb-3">房源描述</h3>
              <p className="text-metal-300 text-sm leading-relaxed">{property.description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
