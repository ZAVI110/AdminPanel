import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Bot, Wrench, FileText, Fingerprint, 
  Zap, Calendar as CalendarIcon, Clock, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LabelList, PieChart, Pie,
  LineChart, Line
} from 'recharts';
import { userApi } from '../api/userApi';
import { agentApi } from '../api/agentApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ users: 0, agents: 0 });
  const [usageCount, setUsageCount] = useState(0); 
  const [agentUsageData, setAgentUsageData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const fetchData = async () => {
    try {
      const [uRes, aRes, usageRes] = await Promise.all([
        userApi.getAll(),
        agentApi.getList(),
        agentApi.getUsage()
      ]);

      const users = uRes?.data?.users || uRes?.data || [];
      const agents = aRes?.data?.agents || aRes?.data || [];
      setCounts({ 
        users: Array.isArray(users) ? users.length : 0, 
        agents: Array.isArray(agents) ? agents.length : 0 
      });

      const usagePayload = usageRes?.data?.usage || usageRes?.usage || {};
      const totalLoad = usagePayload.total || 0;
      setUsageCount(totalLoad);

      if (usagePayload.per_agent) {
        const chartArray = Object.entries(usagePayload.per_agent).map(([name, count]) => ({
          name: name.toUpperCase().replace(/_/g, ' '),
          value: Number(count) || 0
        }));
        setAgentUsageData(chartArray.sort((a, b) => b.value - a.value));
      }

      setTrendData([
        { time: '08:00', requests: Math.floor(totalLoad * 0.4) },
        { time: '12:00', requests: totalLoad },
        { time: '16:00', requests: Math.floor(totalLoad * 0.9) },
        { time: '20:00', requests: Math.floor(totalLoad * 1.1) }
      ]);

    } catch (e) { 
      console.error("ADMIN_SYNC_ERROR:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-engro-forest animate-pulse uppercase tracking-[0.3em]">
      SYNCHRONIZING_ADMIN_PANEL...
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. WELCOME BANNER */}
      <div className="engro-central-banner min-h-[260px] border-none shadow-sm">
        <h1 className="text-6xl font-black tracking-tighter mb-4 relative z-10 text-[#0b4f18]">
          Welcome to the new engro central
        </h1>
        <p className="text-xl font-medium relative z-10 text-[#0b4f18] opacity-90">
          A redesigned experience — faster, simpler, and more connected.
        </p>
      </div>

      {/* 2. KPI TOP ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile 
            icon={<Users size={30} className="text-blue-500" />} 
            label="Total Personnel" 
            count={counts.users} 
            sub="System Users" 
            iconBg="bg-blue-50"
        />
        <StatTile 
            icon={<Bot size={30} className="text-orange-500" />} 
            label="Active AI Nodes" 
            count={counts.agents} 
            sub="Live Agents" 
            iconBg="bg-orange-50"
        />
        <div className="bg-white rounded-3xl p-8 flex items-center justify-between col-span-1 lg:col-span-2 shadow-sm border border-slate-100">
            <div className="text-left">
              <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Current Load</h3>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-[0.15em] mt-1">Global API Volume</p>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-6xl font-black text-black tracking-tighter">{usageCount}</span>
                <span className="text-sm font-bold text-slate-400 uppercase italic">Requests</span>
              </div>
            </div>
            <div className="relative w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                          data={[{ value: usageCount || 1 }, { value: Math.max(1000, usageCount * 1.5) }]} 
                          innerRadius={40} outerRadius={50} 
                          startAngle={180} endAngle={0} 
                          dataKey="value" stroke="none"
                        >
                            <Cell fill="#10b981" />
                            <Cell fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pt-10 text-emerald-500">
                    <Zap size={28} className={usageCount > 800 ? "animate-bounce text-red-500" : ""} />
                </div>
            </div>
        </div>
      </div>

      {/* 3. SIDE-BY-SIDE QUICK ACCESS & SYSTEM INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-10 shadow-sm">
          <div className="mb-8">
            <h3 className="text-[28px] font-bold text-[#1a2b4b] tracking-tight">Quick Access</h3>
            <p className="text-[15px] font-medium text-slate-500 mt-1">Access your most used applications & services</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickTile icon={<Users size={24}/>} label="Personnel" color="#3b82f6" onClick={() => navigate('/users')} />
            <QuickTile icon={<Fingerprint size={24}/>} label="Access" color="#10b981" onClick={() => navigate('/access')} />
            <QuickTile icon={<Bot size={24}/>} label="AI Agents" color="#f97316" onClick={() => navigate('/agents')} />
            <QuickTile icon={<Wrench size={24}/>} label="Tools" color="#ef4444" onClick={() => navigate('/tools')} />
            <QuickTile icon={<FileText size={24}/>} label="Logs" color="#a855f7" onClick={() => navigate('/logs')} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-xl font-bold text-[#1a2b4b]">System Status</h3>
               <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Active</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-50">
                <CalendarIcon size={20} className="text-[#0b4f18]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Schedule</p>
                  <p className="text-sm font-bold text-slate-700">No maintenance found</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-50">
                <Clock size={20} className="text-[#0b4f18]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Server Time</p>
                  <p className="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-[#0b4f18]">
            <span className="text-xs font-bold">Neural Sync: 100%</span>
            <CheckCircle size={18} />
          </div>
        </div>
      </div>

      {/* 4. AGENT LOAD DISTRIBUTION */}
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 border-b-2 border-slate-50 pb-6">
          2. Agent Load Distribution
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentUsageData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                interval={0}
                tick={{ fontSize: 10, fontWeight: 900, fill: '#000' }} 
                axisLine={false} 
              />
              <YAxis axisLine={false} tick={{ fontSize: 11, fontWeight: 900 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" barSize={55} radius={[4, 4, 0, 0]}>
                {agentUsageData.map((e, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? '#10b981' : '#0b4f18'} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 900, fill: '#000' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. TEMPORAL TRENDS */}
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 border-b-2 border-slate-50 pb-6">
          3. Temporal Load Trends
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 900, fill: '#000' }} axisLine={false} />
              <YAxis axisLine={false} tick={{ fontSize: 11, fontWeight: 900 }} />
              <Tooltip contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: '900' }} />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="#0b4f18" 
                strokeWidth={6} 
                dot={{ r: 8, fill: '#10b981', strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ icon, label, count, sub, iconBg }) => (
  <div className="bg-white rounded-3xl p-8 flex flex-col justify-between min-h-[180px] shadow-sm border border-slate-100">
    <div className="flex justify-between items-start">
      <div className={`p-4 ${iconBg} rounded-2xl text-black`}>{icon}</div>
      <div className="text-right">
        <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">{sub}</span>
        <span className="text-4xl font-black text-black tracking-tighter">{count}</span>
      </div>
    </div>
    <span className="font-black text-black uppercase text-sm tracking-tight mt-6">{label}</span>
  </div>
);

const QuickTile = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center group transition-all"
  >
    <div className="w-full aspect-square bg-white border border-slate-50 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:border-slate-100 hover:shadow-md transition-all">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <span className="text-[12px] font-bold text-[#1a2b4b] tracking-tight">{label}</span>
    </div>
  </button>
);

export default Dashboard;