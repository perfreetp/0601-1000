import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  BedDouble,
  Wallet,
  Paintbrush,
  X,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import PropertyCard from '@/components/PropertyCard';
import { useAppStore } from '@/store/useAppStore';
import { DISTRICTS, LAYOUTS, DECORATIONS } from '@/data/mock';
import type { SortType, DecorationType } from '@/types';

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'area-desc', label: '面积从大到小' },
  { value: 'newest', label: '最新发布' },
];

export default function PropertyList() {
  const { filters, sortBy, setFilters, resetFilters, setSortBy, getFilteredProperties } =
    useAppStore();
  const [showFilters, setShowFilters] = useState(true);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredProperties = getFilteredProperties();

  const toggleDistrict = (district: string) => {
    const exists = filters.districts.includes(district);
    setFilters({
      districts: exists
        ? filters.districts.filter((d) => d !== district)
        : [...filters.districts, district],
    });
  };

  const toggleLayout = (layout: string) => {
    const exists = filters.layouts.includes(layout);
    setFilters({
      layouts: exists ? filters.layouts.filter((l) => l !== layout) : [...filters.layouts, layout],
    });
  };

  const toggleDecoration = (decoration: DecorationType) => {
    const exists = filters.decorations.includes(decoration);
    setFilters({
      decorations: exists
        ? filters.decorations.filter((d) => d !== decoration)
        : [...filters.decorations, decoration],
    });
  };

  const activeFilterCount =
    filters.districts.length +
    filters.layouts.length +
    filters.decorations.length +
    (filters.keyword ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 text-aurora-400" />
            <h1 className="text-3xl font-display font-bold text-gradient">发现您的理想之家</h1>
          </div>
          <p className="text-metal-400 ml-10">探索 {filteredProperties.length} 套精选房源，开启沉浸式虚拟看房体验</p>
        </div>

        <div className="flex gap-6">
          {showFilters && (
            <aside className="w-72 flex-shrink-0">
              <div className="glass-card rounded-2xl p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-aurora-400" />
                    <span className="font-semibold text-metal-100">筛选条件</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-aurora-500 text-space-900 text-xs flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-metal-400 hover:text-coral-500 transition-colors"
                    >
                      重置
                    </button>
                  )}
                </div>

                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-400" />
                    <input
                      type="text"
                      placeholder="搜索小区、地址..."
                      value={filters.keyword}
                      onChange={(e) => setFilters({ keyword: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-aurora-400" />
                    <span className="text-sm font-medium text-metal-200">区域</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DISTRICTS.map((district) => (
                      <button
                        key={district}
                        onClick={() => toggleDistrict(district)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          filters.districts.includes(district)
                            ? 'bg-aurora-500/20 text-aurora-400 border border-aurora-500/50'
                            : 'bg-space-800/50 text-metal-300 border border-metal-500/30 hover:border-aurora-500/30 hover:text-aurora-400'
                        }`}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BedDouble className="w-4 h-4 text-aurora-400" />
                    <span className="text-sm font-medium text-metal-200">户型</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LAYOUTS.map((layout) => (
                      <button
                        key={layout}
                        onClick={() => toggleLayout(layout)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          filters.layouts.includes(layout)
                            ? 'bg-aurora-500/20 text-aurora-400 border border-aurora-500/50'
                            : 'bg-space-800/50 text-metal-300 border border-metal-500/30 hover:border-aurora-500/30 hover:text-aurora-400'
                        }`}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4 text-aurora-400" />
                    <span className="text-sm font-medium text-metal-200">
                      价格：{filters.priceRange[0]} - {filters.priceRange[1]} 万
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={50}
                        value={filters.priceRange[0]}
                        onChange={(e) =>
                          setFilters({
                            priceRange: [Number(e.target.value), filters.priceRange[1]],
                          })
                        }
                        className="flex-1 accent-aurora-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={50}
                        value={filters.priceRange[1]}
                        onChange={(e) =>
                          setFilters({
                            priceRange: [filters.priceRange[0], Number(e.target.value)],
                          })
                        }
                        className="flex-1 accent-aurora-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      {[
                        [0, 500],
                        [500, 1000],
                        [1000, 2000],
                        [2000, 10000],
                      ].map(([min, max]) => (
                        <button
                          key={`${min}-${max}`}
                          onClick={() => setFilters({ priceRange: [min, max] as [number, number] })}
                          className="flex-1 px-2 py-1 rounded text-xs bg-space-800/50 text-metal-300 border border-metal-500/30 hover:border-aurora-500/30 hover:text-aurora-400 transition-all"
                        >
                          {min >= 10000 ? '1亿+' : `${min}万`}
                          <br />
                          {max >= 10000 ? '以上' : `-${max}万`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Paintbrush className="w-4 h-4 text-aurora-400" />
                    <span className="text-sm font-medium text-metal-200">装修</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DECORATIONS.map((decoration) => (
                      <button
                        key={decoration}
                        onClick={() => toggleDecoration(decoration)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          filters.decorations.includes(decoration)
                            ? 'bg-aurora-500/20 text-aurora-400 border border-aurora-500/50'
                            : 'bg-space-800/50 text-metal-300 border border-metal-500/30 hover:border-aurora-500/30 hover:text-aurora-400'
                        }`}
                      >
                        {decoration}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center gap-2 py-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>筛选</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-aurora-500 text-space-900 text-xs flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {activeFilterCount > 0 && (
                  <div className="flex items-center gap-2">
                    {filters.districts.map((d) => (
                      <span
                        key={d}
                        className="tag-chip tag-chip-active gap-1 cursor-pointer"
                        onClick={() => toggleDistrict(d)}
                      >
                        {d}
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                    {filters.layouts.map((l) => (
                      <span
                        key={l}
                        className="tag-chip tag-chip-active gap-1 cursor-pointer"
                        onClick={() => toggleLayout(l)}
                      >
                        {l}
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                    {filters.decorations.map((d) => (
                      <span
                        key={d}
                        className="tag-chip tag-chip-active gap-1 cursor-pointer"
                        onClick={() => toggleDecoration(d)}
                      >
                        {d}
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="btn-secondary flex items-center gap-2 py-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                  />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-44 glass-card rounded-xl py-2 z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          sortBy === option.value
                            ? 'text-aurora-400 bg-aurora-500/10'
                            : 'text-metal-300 hover:text-aurora-400 hover:bg-aurora-500/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-space-800 flex items-center justify-center">
                  <Search className="w-10 h-10 text-metal-500" />
                </div>
                <h3 className="text-xl font-semibold text-metal-200 mb-2">未找到匹配房源</h3>
                <p className="text-metal-400 mb-6">试试调整筛选条件，发现更多好房</p>
                <button onClick={resetFilters} className="btn-primary">
                  重置筛选条件
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
