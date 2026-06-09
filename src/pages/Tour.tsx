import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Calendar, Clock,
  User, PhoneCall, Star, MapPin, ArrowLeft, Send, Radio, Hand,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_AGENTS } from '@/data/mock';
import type { Agent } from '@/types';
const STATUS_MAP: Record<Agent['status'], { label: string; color: string }> = {
  online: { label: '在线', color: 'bg-aurora-400' },
  busy: { label: '忙碌', color: 'bg-amber-500' },
  offline: { label: '离线', color: 'bg-metal-500' },
};
const HIGHLIGHTS = [
  { id: 1, x: 10, y: 20, w: 30, h: 40, label: '客厅落地窗' },
  { id: 2, x: 50, y: 55, w: 35, h: 30, label: '开放式厨房' },
];

export default function Tour() {
  const { id = 'p1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById, addAppointment, getAvailableSlotsForProperty } = useAppStore();
  const property = getPropertyById(id);

  const [selectedAgent, setSelectedAgent] = useState<Agent>(MOCK_AGENTS[0]);
  const [showAppt, setShowAppt] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptName, setApptName] = useState('');
  const [apptPhone, setApptPhone] = useState('');
  const [pointer] = useState({ x: 55, y: 40 });

  const availableSlots = useMemo(() => {
    if (!property) return [];
    return getAvailableSlotsForProperty(property.id);
  }, [property, getAvailableSlotsForProperty]);

  const availableTimeSlots = useMemo(() => {
    if (!apptDate) return [];
    const daySlots = availableSlots.find((s) => s.date === apptDate);
    return daySlots ? daySlots.timeSlots : [];
  }, [apptDate, availableSlots]);

  useEffect(() => {
    if (!inCall) { setDuration(0); return; }
    const t = setInterval(() => setDuration((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [inCall]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const submit = () => {
    if (!apptDate || !apptTime || !apptName || !apptPhone || !property) return;
    addAppointment({
      propertyId: property.id, propertyTitle: property.title,
      agentId: selectedAgent.id, agentName: selectedAgent.name,
      time: `${apptDate}T${apptTime.split('-')[0]}:00`, status: 'pending',
      userName: apptName, userPhone: apptPhone,
    });
    setShowAppt(false); setApptDate(''); setApptTime(''); setApptName(''); setApptPhone('');
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg">
        <Navbar />
        <div className="pt-24 px-6 text-center text-metal-400">房源不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-[1600px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-metal-300 hover:text-aurora-400 mb-6">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-metal-100 mb-2">{property.title}</h1>
          <div className="flex items-center gap-4 text-sm text-metal-400">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{property.address}</span>
            <span className="text-aurora-400 font-bold text-xl">¥{property.price}万</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl overflow-hidden relative">
              <div className="aspect-video bg-space-800 relative">
                <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover opacity-60" />
                {HIGHLIGHTS.map((a) => (
                  <div key={a.id} className="absolute border-2 border-aurora-400 rounded-lg bg-aurora-400/10 animate-pulse-slow"
                    style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.w}%`, height: `${a.h}%` }}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-aurora-500 text-space-900 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">
                      {a.label}
                    </div>
                  </div>
                ))}
                {inCall && (
                  <div className="absolute z-20" style={{ left: `${pointer.x}%`, top: `${pointer.y}%`, transform: 'translate(-50%,-50%)' }}>
                    <div className="relative">
                      <div className="absolute inset-0 w-10 h-10 rounded-full bg-aurora-400/30 animate-ping" />
                      <div className="w-10 h-10 rounded-full bg-aurora-500 flex items-center justify-center shadow-lg shadow-aurora-500/50">
                        <Hand className="w-5 h-5 text-space-900" />
                      </div>
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-space-900/90 text-aurora-400 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-aurora-500/30">
                        经纪人正在讲解：主卧朝南
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1.5 bg-coral-500/90 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    <Radio className="w-3 h-3 animate-pulse" />{inCall ? '讲解中' : '待连接'}
                  </div>
                </div>
              </div>
              {inCall && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-2xl px-6 py-4 flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-aurora-400/20 animate-ping" />
                    <div className="absolute inset-1 rounded-full bg-aurora-400/10 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-aurora-400 to-aurora-600 flex items-center justify-center font-bold text-space-900 text-lg">
                      {selectedAgent.name[0]}
                    </div>
                  </div>
                  <div>
                    <div className="text-metal-100 font-semibold">{selectedAgent.name}</div>
                    <div className="text-aurora-400 font-mono text-sm">{fmt(duration)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setMuted(!muted)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${muted ? 'bg-coral-500 text-white' : 'bg-space-700 text-metal-200 hover:bg-space-600'}`}>
                      {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setSpeakerOff(!speakerOff)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${speakerOff ? 'bg-coral-500 text-white' : 'bg-space-700 text-metal-200 hover:bg-space-600'}`}>
                      {speakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setInCall(false)} className="w-11 h-11 rounded-full bg-coral-500 text-white flex items-center justify-center hover:bg-coral-600">
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!inCall && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-metal-100 mb-4 flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-aurora-400" />开启语音同看
                </h3>
                <p className="text-metal-400 text-sm mb-4">与经纪人实时语音通话，经纪人将为您远程讲解房源细节，标注重要位置。</p>
                <button onClick={() => setInCall(true)} className="btn-primary flex items-center gap-2">
                  <Phone className="w-4 h-4" />呼叫 {selectedAgent.name}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-metal-100 mb-4">选择经纪人</h3>
              <div className="space-y-3">
                {MOCK_AGENTS.map((agent) => (
                  <div key={agent.id} onClick={() => setSelectedAgent(agent)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${selectedAgent.id === agent.id ? 'bg-aurora-500/10 border border-aurora-500/40' : 'bg-space-800/50 border border-transparent hover:border-metal-500/30'}`}>
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-space-600 to-space-700 border border-metal-500/30 flex items-center justify-center font-semibold text-metal-200">
                          {agent.name[0]}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-space-800 ${STATUS_MAP[agent.status].color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-metal-100">{agent.name}</span>
                          <span className="text-xs text-metal-400">{STATUS_MAP[agent.status].label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-metal-400">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" />{agent.rating}</span>
                          <span>成交{agent.deals}套</span>
                          <span>从业{agent.experience}年</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.specialties.map((s) => (
                            <span key={s} className="tag-chip text-[10px] py-0.5 px-2">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              {!showAppt ? (
                <button onClick={() => setShowAppt(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />预约看房
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-metal-100 flex items-center gap-2"><Calendar className="w-5 h-5 text-aurora-400" />预约看房</h3>
                  <div>
                    <label className="text-sm text-metal-300 mb-2 block flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-aurora-400" />选择日期</label>
                    {availableSlots.length === 0 ? (
                      <div className="text-sm text-coral-400 py-3">该房源暂无可预约时段，请稍后再试</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map(({ date }) => {
                          const d = new Date(date); const day = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
                          return (
                            <button key={date} onClick={() => { setApptDate(date); setApptTime(''); }}
                              className={`p-2 rounded-lg text-xs transition-all ${apptDate === date ? 'bg-aurora-500 text-space-900 font-bold' : 'bg-space-800/50 text-metal-300 hover:bg-space-700'}`}>
                              <div>{d.getMonth() + 1}/{d.getDate()}</div>
                              <div className="text-[10px] opacity-70">周{day}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-metal-300 mb-2 block flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-aurora-400" />选择时间</label>
                    {!apptDate ? (
                      <div className="text-sm text-metal-500 py-3">请先选择日期</div>
                    ) : availableTimeSlots.length === 0 ? (
                      <div className="text-sm text-coral-400 py-3">该日期已约满，请选择其他日期</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimeSlots.map((slot) => (
                          <button key={slot} onClick={() => setApptTime(slot)}
                            className={`py-1.5 rounded-lg text-xs transition-all ${apptTime === slot ? 'bg-aurora-500 text-space-900 font-bold' : 'bg-space-800/50 text-metal-300 hover:bg-space-700'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-metal-300 mb-2 block flex items-center gap-1"><User className="w-3.5 h-3.5 text-aurora-400" />您的姓名</label>
                    <input type="text" value={apptName} onChange={(e) => setApptName(e.target.value)} placeholder="请输入姓名" className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm text-metal-300 mb-2 block flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-aurora-400" />联系电话</label>
                    <input type="tel" value={apptPhone} onChange={(e) => setApptPhone(e.target.value)} placeholder="请输入手机号" className="input-field" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setShowAppt(false)} className="btn-secondary flex-1">取消</button>
                    <button onClick={submit} disabled={!apptDate || !apptTime || !apptName || !apptPhone}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="w-4 h-4" />提交预约
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
