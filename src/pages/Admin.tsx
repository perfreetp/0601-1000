import { useState, useMemo } from 'react';
import {
  Home,
  Eye,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  BarChart3,
  Filter,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import type { Property, Appointment, VisitRecord, AppointmentStatus } from '@/types';

type TabType = 'properties' | 'schedule' | 'visitors';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${s}秒`;
};

const statusConfig: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending: { label: '待审核', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  confirmed: { label: '已确认', cls: 'bg-aurora-500/15 text-aurora-400 border-aurora-500/30' },
  completed: { label: '已完成', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  cancelled: { label: '已取消', cls: 'bg-coral-500/15 text-coral-400 border-coral-500/30' },
};

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [propertySearch, setPropertySearch] = useState('');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorDateFilter, setVisitorDateFilter] = useState('');

  const {
    properties,
    appointments,
    visitRecords,
    togglePropertySale,
    updateAppointmentStatus,
  } = useAppStore();

  const stats = useMemo(() => {
    const onSale = properties.filter((p) => p.isOnSale).length;
    const todayVisits = visitRecords.filter((v) => {
      const vd = new Date(v.visitTime);
      const now = new Date();
      return vd.toDateString() === now.toDateString();
    }).length;
    return {
      total: properties.length,
      onSale,
      todayVisits: todayVisits || 12,
      appointments: appointments.length,
    };
  }, [properties, visitRecords, appointments]);

  const filteredProperties = useMemo(() => {
    if (!propertySearch.trim()) return properties;
    const kw = propertySearch.toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.district.toLowerCase().includes(kw) ||
        p.community.toLowerCase().includes(kw)
    );
  }, [properties, propertySearch]);

  const filteredVisitors = useMemo(() => {
    return visitRecords.filter((v) => {
      const matchKw =
        !visitorSearch.trim() ||
        v.propertyTitle.toLowerCase().includes(visitorSearch.toLowerCase()) ||
        v.userName.includes(visitorSearch);
      const matchDate = !visitorDateFilter || v.visitTime.startsWith(visitorDateFilter);
      return matchKw && matchDate;
    });
  }, [visitRecords, visitorSearch, visitorDateFilter]);

  const visitChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    visitRecords.forEach((v) => {
      const key = new Date(v.visitTime).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).slice(-7);
  }, [visitRecords]);

  const maxChartVal = Math.max(...visitChartData.map(([, v]) => v), 1);

  const scheduleData = useMemo(() => {
    const days: { day: string; date: string; items: Appointment[] }[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const items = appointments.filter((a) => {
        const ad = new Date(a.time);
        return ad.toDateString() === d.toDateString();
      });
      days.push({ day: weekDays[i], date: dateStr, items });
    }
    return days;
  }, [appointments]);

  return (
    <div className="min-h-screen bg-space-900">
      <Navbar />
      <div className="pt-20 pb-12 px-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">管理后台</h1>
          <p className="text-metal-400">房源管理、预约审核、数据分析</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { icon: Building2, label: '房源总数', value: stats.total, change: 2.5, up: true },
            { icon: Home, label: '在架房源', value: stats.onSale, change: 1.2, up: true },
            { icon: Eye, label: '今日访问量', value: stats.todayVisits, change: 8.3, up: true },
            { icon: CalendarCheck, label: '预约总数', value: stats.appointments, change: 0.5, up: false },
          ].map((s, i) => (
            <div key={i} className="glass-card glass-card-hover rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-aurora-500/15 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-aurora-400" strokeWidth={2} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? 'text-emerald-400' : 'text-coral-400'}`}>
                  {s.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {s.change}%
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-metal-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex border-b border-metal-500/20">
            {[
              { key: 'properties', label: '房源管理' },
              { key: 'schedule', label: '开放时段' },
              { key: 'visitors', label: '访客记录' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-6 py-4 text-sm font-medium transition-all relative ${
                  activeTab === tab.key
                    ? 'text-aurora-400'
                    : 'text-metal-400 hover:text-metal-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-aurora-400 to-aurora-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'properties' && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                    <input
                      type="text"
                      placeholder="搜索房源标题、区域、小区..."
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-metal-400 border-b border-metal-500/20">
                        <th className="py-3 pr-4 font-medium">房源</th>
                        <th className="py-3 pr-4 font-medium">区域</th>
                        <th className="py-3 pr-4 font-medium">价格(万)</th>
                        <th className="py-3 pr-4 font-medium">面积(㎡)</th>
                        <th className="py-3 pr-4 font-medium">装修</th>
                        <th className="py-3 pr-4 font-medium">状态</th>
                        <th className="py-3 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map((p: Property) => (
                        <tr key={p.id} className="border-b border-metal-500/10 hover:bg-aurora-500/5">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.coverImage}
                                alt={p.title}
                                className="w-14 h-10 rounded-lg object-cover"
                              />
                              <div className="min-w-0">
                                <div className="text-white font-medium truncate max-w-[260px]">{p.title}</div>
                                <div className="text-xs text-metal-400">{p.layout}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-metal-200">{p.district}</td>
                          <td className="py-4 pr-4 text-aurora-400 font-semibold">{p.price}</td>
                          <td className="py-4 pr-4 text-metal-200">{p.area}</td>
                          <td className="py-4 pr-4">
                            <span className="tag-chip">{p.decoration}</span>
                          </td>
                          <td className="py-4 pr-4">
                            {p.isOnSale ? (
                              <span className="tag-chip tag-chip-active">在架</span>
                            ) : (
                              <span className="tag-chip" style={{ background: 'rgba(74,99,128,0.2)', color: '#7A8CA0', borderColor: 'rgba(74,99,128,0.4)' }}>下架</span>
                            )}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => togglePropertySale(p.id)}
                              className={p.isOnSale ? 'btn-secondary text-xs py-1.5 px-3' : 'btn-primary text-xs py-1.5 px-3'}
                            >
                              {p.isOnSale ? '下架' : '上架'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <div className="grid grid-cols-7 gap-3">
                  {scheduleData.map((col, ci) => (
                    <div key={ci} className="glass-card rounded-xl p-3 min-h-[400px]">
                      <div className="text-center mb-3 pb-3 border-b border-metal-500/20">
                        <div className="text-xs text-metal-400 mb-0.5">{col.day}</div>
                        <div className="text-lg font-bold text-white">{col.date}</div>
                      </div>
                      <div className="space-y-2">
                        {col.items.length === 0 ? (
                          <div className="text-center text-xs text-metal-500 py-4">暂无预约</div>
                        ) : (
                          col.items.map((a: Appointment) => (
                            <div key={a.id} className="rounded-lg bg-space-800/60 p-2.5 border border-metal-500/15">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-aurora-400 font-medium">
                                  {new Date(a.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`tag-chip text-[10px] px-1.5 py-0.5 ${statusConfig[a.status].cls}`}>
                                  {statusConfig[a.status].label}
                                </span>
                              </div>
                              <div className="text-xs text-white font-medium truncate mb-1">{a.propertyTitle}</div>
                              <div className="text-[11px] text-metal-400 mb-2">经纪人: {a.agentName}</div>
                              {a.status === 'pending' && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => updateAppointmentStatus(a.id, 'confirmed')}
                                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-aurora-500/20 text-aurora-400 hover:bg-aurora-500/30 transition text-[11px]"
                                  >
                                    <Check className="w-3 h-3" />通过
                                  </button>
                                  <button
                                    onClick={() => updateAppointmentStatus(a.id, 'cancelled')}
                                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-coral-500/15 text-coral-400 hover:bg-coral-500/25 transition text-[11px]"
                                  >
                                    <X className="w-3 h-3" />拒绝
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'visitors' && (
              <div>
                <div className="glass-card rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-aurora-400" />
                    <span className="text-sm font-medium text-white">近7日访问量</span>
                  </div>
                  <div className="flex items-end gap-3 h-32">
                    {visitChartData.map(([date, val], i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center justify-end flex-1">
                          <span className="text-xs text-aurora-400 font-semibold mb-1">{val}</span>
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-aurora-600 to-aurora-400 transition-all hover:opacity-80"
                            style={{ height: `${(val / maxChartVal) * 100}%`, minHeight: '4px' }}
                          />
                        </div>
                        <span className="text-[11px] text-metal-400">{date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                    <input
                      type="text"
                      placeholder="搜索房源或访客姓名..."
                      value={visitorSearch}
                      onChange={(e) => setVisitorSearch(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metal-500" />
                    <input
                      type="date"
                      value={visitorDateFilter}
                      onChange={(e) => setVisitorDateFilter(e.target.value)}
                      className="input-field pl-10 w-auto"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-metal-400 border-b border-metal-500/20">
                        <th className="py-3 pr-4 font-medium">房源</th>
                        <th className="py-3 pr-4 font-medium">访客</th>
                        <th className="py-3 pr-4 font-medium">访问时间</th>
                        <th className="py-3 font-medium">浏览时长</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVisitors.map((v: VisitRecord) => (
                        <tr key={v.id} className="border-b border-metal-500/10 hover:bg-aurora-500/5">
                          <td className="py-4 pr-4">
                            <div className="text-white font-medium truncate max-w-[320px]">{v.propertyTitle}</div>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aurora-500/30 to-aurora-700/30 border border-aurora-500/30 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-aurora-400" />
                              </div>
                              <span className="text-metal-200">{v.userName}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-1.5 text-metal-200">
                              <Clock className="w-3.5 h-3.5 text-metal-500" />
                              {formatTime(v.visitTime)}
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="tag-chip">{formatDuration(v.duration)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredVisitors.length === 0 && (
                    <div className="text-center py-12 text-metal-500">暂无访客记录</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
