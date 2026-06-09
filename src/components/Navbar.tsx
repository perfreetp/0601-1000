import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Repeat2,
  NotebookPen,
  FileText,
  Settings,
  Sparkles,
  Heart,
  Scale,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { to: '/', label: '房源', icon: Home },
  { to: '/compare', label: '对比', icon: Scale, badge: 'compareList' },
  { to: '/notes', label: '笔记', icon: NotebookPen },
  { to: '/quote', label: '报价', icon: FileText },
  { to: '/admin', label: '后台', icon: Settings },
];

export default function Navbar() {
  const { favorites, compareList } = useAppStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-aurora-500/20">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-400 to-aurora-600 flex items-center justify-center shadow-lg shadow-aurora-500/30">
              <Sparkles className="w-5 h-5 text-space-900" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 rounded-xl bg-aurora-400/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-gradient tracking-wider">
              MetaEstate
            </span>
            <span className="text-[10px] text-metal-400 tracking-widest">元宇宙看房</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const badgeCount =
              item.badge === 'compareList' ? compareList.length : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `
                  relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium
                  transition-all duration-300 group
                  ${isActive
                    ? 'text-aurora-400 bg-aurora-500/10'
                    : 'text-metal-300 hover:text-aurora-400 hover:bg-aurora-500/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{item.label}</span>
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-bold shadow-lg shadow-coral-500/50">
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/favorites"
            className="relative p-2 rounded-lg text-metal-300 hover:text-coral-500 hover:bg-coral-500/10 transition-all duration-300"
          >
            <Heart className="w-5 h-5" strokeWidth={2} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-space-600 to-space-700 border border-metal-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-aurora-400">U</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
