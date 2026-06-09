import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Scale, Home, MapPin, Calculator, Wallet, Banknote,
  TrendingUp, Search, ArrowRight, BedDouble, Ruler, Compass,
  Building, Paintbrush, Calendar, Tag,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import type { Property } from '@/types';

type CompareKey = 'price' | 'pricePerSqm' | 'layout' | 'area' | 'orientation' | 'floor' | 'decoration' | 'year' | 'community';
const PARAM_ROWS: { key: CompareKey; label: string; icon: typeof Home }[] = [
  { key: 'price', label: '总价', icon: Wallet },
  { key: 'pricePerSqm', label: '单价', icon: TrendingUp },
  { key: 'layout', label: '户型', icon: BedDouble },
  { key: 'area', label: '面积', icon: Ruler },
  { key: 'orientation', label: '朝向', icon: Compass },
  { key: 'floor', label: '楼层', icon: Building },
  { key: 'decoration', label: '装修', icon: Paintbrush },
  { key: 'year', label: '建成年份', icon: Calendar },
  { key: 'community', label: '小区', icon: Home },
];

function calcMonthlyPayment(principal: number, years: number, rate: number) {
  const r = rate / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function getPropValue(p: Property, key: CompareKey): string | number {
  switch (key) {
    case 'price': return `${p.price}万`;
    case 'pricePerSqm': return `¥${p.pricePerSqm.toLocaleString()}/㎡`;
    case 'layout': return p.layout;
    case 'area': return `${p.area}㎡`;
    case 'orientation': return p.orientation;
    case 'floor': return p.floor;
    case 'decoration': return p.decoration;
    case 'year': return `${p.year}年`;
    case 'community': return p.community;
  }
}

function isDiff(props: Property[], key: CompareKey) {
  if (props.length < 2) return false;
  const vals = props.map((p) => getPropValue(p, key));
  return new Set(vals).size > 1;
}

export default function Compare() {
  const { getCompareProperties, removeFromCompare, clearCompare } = useAppStore();
  const properties = getCompareProperties();

  const costs = useMemo(() => {
    return properties.map((p) => {
      const totalWan = p.price;
      const down = totalWan * 0.3;
      const tax = totalWan * 0.01;
      const loanPrincipal = (totalWan - down) * 10000;
      const monthly = calcMonthlyPayment(loanPrincipal, 30, 4.2);
      const totalPayment = monthly * 360;
      const totalInterest = totalPayment - loanPrincipal;
      return {
        downPayment: down.toFixed(0),
        tax: tax.toFixed(1),
        monthly: (monthly / 10000).toFixed(2),
        interest: (totalInterest / 10000).toFixed(0),
      };
    });
  }, [properties]);

  const costRows = [
    { key: 'downPayment', label: '首付(30%)', icon: Wallet, suffix: '万' },
    { key: 'tax', label: '税费(约1%)', icon: Calculator, suffix: '万' },
    { key: 'monthly', label: '月供(30年)', icon: Banknote, suffix: '万/月' },
    { key: 'interest', label: '总利息', icon: TrendingUp, suffix: '万' },
  ] as const;

  const costDiff = (rowKey: typeof costRows[number]['key']) => {
    if (costs.length < 2) return false;
    return new Set(costs.map((c) => c[rowKey])).size > 1;
  };

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg">
        <Navbar />
        <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
          <div className="glass-card rounded-2xl p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-space-800 flex items-center justify-center">
              <Scale className="w-10 h-10 text-metal-500" />
            </div>
            <h3 className="text-xl font-semibold text-metal-200 mb-2">暂无对比房源</h3>
            <p className="text-metal-400 mb-6">在房源列表中点击「对比」按钮，最多可同时对比4套房源</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <Search className="w-4 h-4" />去选房源
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Scale className="w-7 h-7 text-aurora-400" />
            <h1 className="text-2xl font-display font-bold text-gradient">房源对比</h1>
            <span className="tag-chip">已选 {properties.length}/4</span>
          </div>
          <button onClick={clearCompare} className="btn-secondary text-sm">
            <X className="w-4 h-4 inline mr-1" />清空对比
          </button>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[900px]">
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(0, 1fr))` }}>
              <div className="p-4" />
              {properties.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="glass-card rounded-xl overflow-hidden relative group">
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-space-900/80 text-metal-300 hover:text-coral-500 hover:bg-space-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="aspect-[4/3] bg-space-800 overflow-hidden">
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="text-aurora-400 font-bold text-lg mb-1">¥{p.price}万</div>
                      <div className="text-sm text-metal-100 font-medium line-clamp-1 mb-1">{p.title}</div>
                      <div className="flex items-center gap-1 text-xs text-metal-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{p.district}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="tag-chip text-[10px] py-0.5 px-1.5">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider-glow my-2" />

            {PARAM_ROWS.map((row) => {
              const Icon = row.icon;
              const diff = isDiff(properties, row.key);
              return (
                <div key={row.key} className="grid" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(0, 1fr))` }}>
                  <div className="p-4 flex items-center gap-2 text-sm text-metal-300">
                    <Icon className="w-4 h-4 text-aurora-400" />
                    {row.label}
                  </div>
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 text-sm ${diff ? 'bg-aurora-500/5 text-aurora-400 font-medium' : 'text-metal-200'}`}
                    >
                      {getPropValue(p, row.key)}
                      {diff && <span className="ml-1 text-[10px] opacity-60">●</span>}
                    </div>
                  ))}
                </div>
              );
            })}

            <div className="p-4 flex items-center gap-2 text-sm text-metal-300">
              <Tag className="w-4 h-4 text-aurora-400" />
              标签
            </div>
            {properties.map((p) => {
              const diff = properties.length > 1 && new Set(
                properties.flatMap((pp) => pp.tags)
              ).size > properties.reduce((sum, pp) => sum + pp.tags.length, 0) / properties.length;
              return (
                <div key={p.id} className={`p-4 ${diff ? 'bg-aurora-500/5' : ''}`}>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span key={t} className="tag-chip text-[10px] py-0.5 px-1.5">{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="divider-glow my-2" />

            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(0, 1fr))` }}>
              <div className="p-4 flex items-center gap-2 font-semibold text-metal-100">
                <Calculator className="w-5 h-5 text-aurora-400" />
                费用估算
              </div>
              {properties.map((p) => (
                <div key={p.id} className="p-4" />
              ))}
            </div>

            {costRows.map((row) => {
              const Icon = row.icon;
              const diff = costDiff(row.key);
              return (
                <div key={row.key} className="grid" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(0, 1fr))` }}>
                  <div className="px-4 py-3 flex items-center gap-2 text-sm text-metal-300">
                    <Icon className="w-4 h-4 text-aurora-400" />
                    {row.label}
                  </div>
                  {costs.map((c, idx) => (
                    <div
                      key={idx}
                      className={`px-4 py-3 text-sm ${diff ? 'bg-aurora-500/5 text-aurora-400 font-medium' : 'text-metal-200'}`}
                    >
                      {c[row.key]} <span className="text-xs text-metal-400">{row.suffix}</span>
                      {diff && <span className="ml-1 text-[10px] opacity-60">●</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Link to="/" className="btn-secondary inline-flex items-center gap-2">
            <Search className="w-4 h-4" />继续选择房源
          </Link>
          <div className="text-sm text-metal-400">
            *费用仅供参考：首付按30%、税费按1%估算、月供按30年等额本息、利率4.2%计算
          </div>
        </div>
      </main>
    </div>
  );
}
