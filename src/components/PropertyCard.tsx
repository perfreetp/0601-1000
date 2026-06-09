import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, Ruler, BedDouble, Bath, Scale } from 'lucide-react';
import type { Property } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { toggleFavorite, isFavorite, addToCompare, compareList } = useAppStore();
  const favorite = isFavorite(property.id);
  const inCompare = compareList.includes(property.id);

  return (
    <div className="group glass-card glass-card-hover rounded-2xl overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.coverImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-900/90 via-space-900/20 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          {property.hasVR && (
            <span className="badge-vr">
              <Eye className="w-3 h-3" />
              VR
            </span>
          )}
          <span className="tag-chip">{property.district}</span>
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property.id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              favorite
                ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/50'
                : 'bg-space-900/60 text-metal-200 hover:bg-coral-500/80 hover:text-white backdrop-blur-sm'
            }`}
          >
            <Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!inCompare) addToCompare(property.id);
            }}
            disabled={inCompare}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              inCompare
                ? 'bg-aurora-500 text-space-900 shadow-lg shadow-aurora-500/50'
                : 'bg-space-900/60 text-metal-200 hover:bg-aurora-500/80 hover:text-space-900 backdrop-blur-sm'
            }`}
          >
            <Scale className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-aurora-400">
              {property.price}
            </span>
            <span className="text-metal-300 text-sm">万</span>
            <span className="text-metal-400 text-xs ml-auto">
              {property.pricePerSqm.toLocaleString()} 元/㎡
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <Link to={`/property/${property.id}/floorplan`} className="block">
          <h3 className="text-base font-semibold text-metal-100 mb-2 line-clamp-1 group-hover:text-aurora-400 transition-colors duration-300">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-metal-400 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-metal-300 mb-4">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-aurora-400" />
            {property.bedrooms}室{property.livingrooms}厅
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-aurora-400" />
            {property.bathrooms}卫
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="w-3.5 h-3.5 text-aurora-400" />
            {property.area}㎡
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/property/${property.id}/roam`}
            className="flex-1 btn-primary py-2 text-sm text-center"
          >
            进入VR漫游
          </Link>
          <Link
            to={`/property/${property.id}/floorplan`}
            className="btn-secondary py-2 px-4 text-sm"
          >
            户型图
          </Link>
        </div>
      </div>
    </div>
  );
}
