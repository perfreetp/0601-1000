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
  Check,
  X,
  BarChart3,
  Filter,
  Plus,
  Trash2,
  Pause,
  Play,
  Calendar,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import type { Property, Appointment, VisitRecord, AppointmentStatus, OpenSlot } from '@/types';

const AVAILABLE_TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

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

  const [schedulePropertyId, setSchedulePropertyId] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState(AVAILABLE_TIME_SLOTS[0]);
  const [newSlotCapacity, setNewSlotCapacity] = useState(3);
  const [scheduleViewMode, setScheduleViewMode] = useState<'list' | 'week'>('week');

  const {
    properties,
    appointments,
    visitRecords,
    openSlots,
    togglePropertySale,
    updateAppointmentStatus,
    addOpenSlot,
    toggleSlotActive,
    deleteOpenSlot,
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

  const filteredOpenSlots = useMemo(() => {
    let result = [...openSlots];
    if (schedulePropertyId) {
      result = result.filter((s) => s.propertyId === schedulePropertyId);
    }
    return result.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [openSlots, schedulePropertyId]);

  const handleAddSlot = () => {
    if (!schedulePropertyId || !newSlotDate) return;
    const property = properties.find((p) => p.id === schedulePropertyId);
    if (!property) return;
    const exists = openSlots.some(
      (s) => s.propertyId === schedulePropertyId && s.date === newSlotDate && s.timeSlot === newSlotTime
    );
    if (exists) {
      alert('该时段已存在');
      return;
    }
    addOpenSlot({
      propertyId: schedulePropertyId,
      propertyTitle: property.title,
      date: newSlotDate,
      timeSlot: newSlotTime,
      isActive: true,
      maxCapacity: newSlotCapacity,
    });
    setNewSlotTime(AVAILABLE_TIME_SLOTS[0]);
  };

  const getBookedCount = (slot: OpenSlot) => {
    return appointments.filter((a) => {
      if (a.propertyId !== slot.propertyId || a.status === 'cancelled') return false;
      const ad = new Date(a.time);
      const slotTime = slot.timeSlot.split('-')[0];
      return (
        ad.toISOString().split('T')[0] === slot.date &&
        `${String(ad.getHours()).padStart(2, '0')}:00` === slotTime
      );
    }).length;
  };

  const weekDaysData = useMemo(() => {
    const days: { day: string; date: string; dateKey: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push({
        day: weekDays[i],
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        dateKey: d.toISOString().split('T')[0],
      });
    }
    return days;
  }, []);

  const handleToggleSlotSafe = (slot: OpenSlot) => {
    const booked = getBookedCount(slot);
    if (slot.isActive && booked > 0) {
      if (!confirm(`该时段已有 ${booked} 个预约，停用后购房者将无法再预约，但已有预约会保留。确认停用吗？`)) {
        return;
      }
    }
    toggleSlotActive(slot.id);
  };

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
                <div className="glass-card rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-aurora-400" />添加开放时段
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="text-sm text-metal-300 mb-2 block">选择房源</label>
                      <select
                        value={schedulePropertyId}
                        onChange={(e) => setSchedulePropertyId(e.target.value)}
                        className="input-field"
                      >
                        <option value="">全部房源</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-metal-300 mb-2 block">日期</label>
                      <input
                        type="date"
                        value={newSlotDate}
                        onChange={(e) => setNewSlotDate(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-metal-300 mb-2 block">时间段</label>
                      <select
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        className="input-field"
                      >
                        {AVAILABLE_TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-metal-300 mb-2 block">最大容量</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newSlotCapacity}
                        onChange={(e) => setNewSlotCapacity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <button
                        onClick={handleAddSlot}
                        disabled={!schedulePropertyId || !newSlotDate}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />添加时段
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-metal-400">
                    共 <span className="text-aurora-400 font-semibold">{filteredOpenSlots.length}</span> 个开放时段
                  </div>
                  <div className="flex items-center gap-1 bg-space-800/60 rounded-xl p-1">
                    <button
                      onClick={() => setScheduleViewMode('week')}
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all ${scheduleViewMode === 'week' ? 'bg-aurora-500 text-space-900 font-semibold' : 'text-metal-300 hover:text-white'}`}
                    >
                      排班周视图
                    </button>
                    <button
                      onClick={() => setScheduleViewMode('list')}
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all ${scheduleViewMode === 'list' ? 'bg-aurora-500 text-space-900 font-semibold' : 'text-metal-300 hover:text-white'}`}
                    >
                      列表视图
                    </button>
                  </div>
                </div>

                {scheduleViewMode === 'week' ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[1000px]">
                      <div className="grid grid-cols-8 gap-3 mb-3">
                        <div className="text-sm font-semibold text-metal-400 px-3 py-2">房源</div>
                        {weekDaysData.map((d) => (
                          <div key={d.dateKey} className="text-center">
                            <div className="text-xs text-metal-500">{d.day}</div>
                            <div className="text-base font-bold text-white">{d.date}</div>
                          </div>
                        ))}
                      </div>
                      {(schedulePropertyId
                        ? properties.filter((p) => p.id === schedulePropertyId)
                        : properties
                      ).map((property) => (
                        <div key={property.id} className="grid grid-cols-8 gap-3 mb-3">
                          <div className="glass-card rounded-xl p-3 flex items-start">
                            <img
                              src={property.coverImage}
                              alt={property.title}
                              className="w-10 h-8 rounded object-cover flex-shrink-0 mr-2"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">{property.title}</div>
                              <div className="text-[10px] text-metal-400 truncate">{property.layout} · {property.area}㎡</div>
                            </div>
                          </div>
                          {weekDaysData.map((day) => {
                            const daySlots = filteredOpenSlots.filter(
                              (s) => s.propertyId === property.id && s.date === day.dateKey
                            );
                            return (
                              <div key={`${property.id}-${day.dateKey}`} className="glass-card rounded-xl p-2 min-h-[100px]">
                                {daySlots.length === 0 ? (
                                  <div className="h-full flex items-center justify-center">
                                    <span className="text-[10px] text-metal-600">无时段</span>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    {daySlots.map((slot) => {
                                      const booked = getBookedCount(slot);
                                      const remaining = slot.maxCapacity - booked;
                                      const isFull = remaining <= 0;
                                      return (
                                        <div
                                          key={slot.id}
                                          className={`rounded-lg p-2 text-[11px] border transition-all ${
                                            !slot.isActive
                                              ? 'bg-metal-500/10 border-metal-500/20 opacity-60'
                                              : isFull
                                              ? 'bg-coral-500/10 border-coral-500/30'
                                              : 'bg-space-800/60 border-aurora-500/20 hover:border-aurora-500/40'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className={`font-mono font-medium ${slot.isActive ? 'text-aurora-400' : 'text-metal-500'}`}>
                                              {slot.timeSlot}
                                            </span>
                                            <button
                                              onClick={() => handleToggleSlotSafe(slot)}
                                              className={`p-0.5 rounded transition-colors ${slot.isActive ? 'text-amber-400 hover:bg-amber-500/20' : 'text-aurora-400 hover:bg-aurora-500/20'}`}
                                              title={slot.isActive ? '停用' : '启用'}
                                            >
                                              {slot.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                            </button>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <span className={isFull ? 'text-coral-400' : slot.isActive ? 'text-metal-200' : 'text-metal-500'}>
                                              剩 <span className="font-bold">{remaining}</span>/{slot.maxCapacity}
                                            </span>
                                            {!slot.isActive && (
                                              <span className="text-[9px] text-coral-400">停用</span>
                                            )}
                                            {isFull && slot.isActive && (
                                              <span className="text-[9px] text-coral-400">约满</span>
                                            )}
                                          </div>
                                          {booked > 0 && (
                                            <div className="mt-1 pt-1 border-t border-metal-500/10">
                                              <div className="h-1 rounded-full bg-space-900 overflow-hidden">
                                                <div
                                                  className={`h-full rounded-full ${isFull ? 'bg-coral-500' : 'bg-aurora-500'}`}
                                                  style={{ width: `${(booked / slot.maxCapacity) * 100}%` }}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-metal-400 border-b border-metal-500/20">
                          <th className="py-3 pr-4 font-medium">房源</th>
                          <th className="py-3 pr-4 font-medium">日期</th>
                          <th className="py-3 pr-4 font-medium">时间段</th>
                          <th className="py-3 pr-4 font-medium">预约情况</th>
                          <th className="py-3 pr-4 font-medium">状态</th>
                          <th className="py-3 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOpenSlots.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-metal-500">
                              暂无开放时段，请先添加
                            </td>
                          </tr>
                        ) : (
                          filteredOpenSlots.map((slot: OpenSlot) => {
                            const booked = getBookedCount(slot);
                            const remaining = slot.maxCapacity - booked;
                            const isFull = remaining <= 0;
                            return (
                              <tr key={slot.id} className="border-b border-metal-500/10 hover:bg-aurora-500/5">
                                <td className="py-4 pr-4">
                                  <div className="text-white font-medium truncate max-w-[280px]">{slot.propertyTitle}</div>
                                </td>
                                <td className="py-4 pr-4 text-metal-200">{slot.date}</td>
                                <td className="py-4 pr-4">
                                  <span className="tag-chip">{slot.timeSlot}</span>
                                </td>
                                <td className="py-4 pr-4">
                                  <div className="flex flex-col gap-1">
                                    <span className={isFull ? 'text-coral-400 font-medium' : 'text-metal-200'}>
                                      剩余 <span className="font-bold">{remaining}</span> / {slot.maxCapacity}
                                      {isFull && ' (约满)'}
                                    </span>
                                    <div className="h-1.5 w-24 rounded-full bg-space-800 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${isFull ? 'bg-coral-500' : 'bg-aurora-500'}`}
                                        style={{ width: `${(booked / slot.maxCapacity) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 pr-4">
                                  {slot.isActive ? (
                                    <span className="tag-chip tag-chip-active">开放中</span>
                                  ) : (
                                    <span className="tag-chip" style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', borderColor: 'rgba(255,107,107,0.3)' }}>已停用</span>
                                  )}
                                </td>
                                <td className="py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleToggleSlotSafe(slot)}
                                      className={`p-2 rounded-lg transition-all ${slot.isActive ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'bg-aurora-500/15 text-aurora-400 hover:bg-aurora-500/25'}`}
                                      title={slot.isActive ? '停用' : '启用'}
                                    >
                                      {slot.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('确定删除该时段吗？')) deleteOpenSlot(slot.id);
                                      }}
                                      className="p-2 rounded-lg bg-coral-500/15 text-coral-400 hover:bg-coral-500/25 transition-all"
                                      title="删除"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-metal-500/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-aurora-400" />近期预约
                  </h3>
                  <div className="grid grid-cols-7 gap-3">
                    {scheduleData.map((col, ci) => (
                      <div key={ci} className="glass-card rounded-xl p-3 min-h-[200px]">
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
