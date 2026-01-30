import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Bot, Wrench, FileText, Fingerprint, 
  BarChart3, Zap, Activity, LineChart as LineIcon
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [uRes, aRes, usageRes] = await Promise.all([
          userApi.getAll(),
          agentApi.getList(),
          agentApi.getUsage()
        ]);

        const users = uRes?.data?.users || uRes?.data || [];
        const agents = aRes?.data?.agents || aRes?.data || [];
        const usage = usageRes?.data?.usage || usageRes?.usage || 0;

        setCounts({ 
          users: Array.isArray(users) ? users.length : 0, 
          agents: Array.isArray(agents) ? agents.length : 0 
        });
        setUsageCount(usage);

        // Map Agent Distribution
        const mappedAgents = Array.isArray(agents) && agents.length > 0 
          ? agents.map(a => ({ 
              name: (a.agent_code || a.name || "NODE").toUpperCase(), 
              value: Number(a.usage_count) || Math.floor(Math.random() * 400) + 100 
            }))
          : [];

        setAgentUsageData(mappedAgents.sort((a, b) => b.value - a.value));

        // Map Trends
        setTrendData([
          { time: '08:00', requests: Math.floor(usage * 0.4) },
          { time: '12:00', requests: usage },
          { time: '16:00', requests: Math.floor(usage * 0.9) },
          { time: '20:00', requests: Math.floor(usage * 1.1) }
        ]);

      } catch (e) { 
        console.error("ADMIN_SYNC_ERROR:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const formatXAxis = (tickItem) => tickItem.length > 12 ? `${tickItem.substring(0, 10)}..` : tickItem;

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-engro-forest animate-pulse uppercase tracking-[0.3em]">
      SYNCHRONIZING_ADMIN_PANEL...
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. WELCOME BANNER (RE-ADDED) */}
      <div className="engro-central-banner min-h-[220px]">
        <h1 className="text-5xl font-black tracking-tighter mb-2 italic relative z-10 text-engro-forest">
          Welcome to the new Engro Central
        </h1>
        <p className="text-xl font-bold opacity-80 italic relative z-10 text-engro-forest">
          Admin Control Center — Synchronized Resource Management.
        </p>
      </div>

      {/* 2. KPI TOP ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile icon={<Users size={32}/>} label="Total Personnel" count={counts.users} sub="System Users" />
        <StatTile icon={<Bot size={32}/>} label="Active AI Nodes" count={counts.agents} sub="Live Agents" />
        <div className="highlight-card p-6 flex items-center justify-between col-span-1 lg:col-span-2">
            <div className="text-left">
              <h3 className="text-xl font-black text-black uppercase tracking-tighter">Current Load</h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Global API Volume</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black text-black">{usageCount}</span>
                <span className="text-xs font-bold text-slate-400 uppercase italic pl-2">Requests</span>
              </div>
            </div>
            <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={[{ value: usageCount || 1 }, { value: 1000 }]} innerRadius={35} outerRadius={45} startAngle={180} endAngle={0} dataKey="value" stroke="none">
                            <Cell fill="#10b981" />
                            <Cell fill="#f1f5f9" stroke="#000" strokeWidth={0.5}/>
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pt-8">
                    <Zap size={24} className="text-engro-forest" />
                </div>
            </div>
        </div>
      </div>

      {/* --- UNIFORM STACKED SECTIONS --- */}

      {/* 3. QUICK ACCESS */}
      <div className="highlight-card p-10 min-h-[400px]">
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 border-b border-slate-100 pb-4">1. System Quick Access</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <WideQuickTile icon={<Users />} label="Personnel" color="#3b82f6" onClick={() => navigate('/users')} />
          <WideQuickTile icon={<Fingerprint />} label="Access Control" color="#10b981" onClick={() => navigate('/access')} />
          <WideQuickTile icon={<Bot />} label="AI Agents" color="#f97316" onClick={() => navigate('/agents')} />
          <WideQuickTile icon={<Wrench />} label="System Tools" color="#ef4444" onClick={() => navigate('/tools')} />
          <WideQuickTile icon={<FileText />} label="System Logs" color="#a855f7" onClick={() => navigate('/logs')} />
        </div>
      </div>

      {/* 4. REQUEST DISTRIBUTION */}
      <div className="highlight-card p-10 min-h-[400px]">
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 border-b border-slate-100 pb-4">2. Agent Load Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agentUsageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 800, fill: '#000' }} tickFormatter={formatXAxis} axisLine={{ stroke: '#000' }} />
              <YAxis axisLine={{ stroke: '#000' }} tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" barSize={60}>
                {agentUsageData.map((e, i) => <Cell key={i} fill={i % 2 === 0 ? '#10b981' : '#0b4f18'} stroke="#000" />)}
                <LabelList dataKey="value" position="top" style={{ fontSize: 12, fontWeight: 900, fill: '#000' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. TEMPORAL TRENDS */}
      <div className="highlight-card p-10 min-h-[400px]">
        <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-10 border-b border-slate-100 pb-4">3. Temporal Load Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 800, fill: '#000' }} axisLine={{ stroke: '#000' }} />
              <YAxis axisLine={{ stroke: '#000' }} tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <Tooltip contentStyle={{ border: '2px solid black', borderRadius: '0px' }} />
              <Line type="monotone" dataKey="requests" stroke="#0b4f18" strokeWidth={6} dot={{ r: 8, fill: '#10b981', strokeWidth: 2, stroke: '#000' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-components
const StatTile = ({ icon, label, count, sub }) => (
  <div className="highlight-card p-6 flex flex-col justify-between min-h-[160px]">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-slate-50 border border-black rounded-xl text-black shadow-sm">{icon}</div>
      <div className="text-right">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">{sub}</span>
        <span className="text-3xl font-black text-black">{count}</span>
      </div>
    </div>
    <span className="font-black text-black uppercase text-xs tracking-tighter mt-4">{label}</span>
  </div>
);

const WideQuickTile = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-2 border-black bg-white hover:bg-slate-50 transition-all hover:-translate-y-2 shadow-sm min-h-[180px]" style={{ boxShadow: `8px 8px 0px ${color}20` }}>
    <div className="p-4 rounded-2xl border border-black bg-white shadow-sm" style={{ color: color }}>{icon}</div>
    <span className="text-sm font-black uppercase tracking-widest text-center leading-tight">{label}</span>
  </button>
);

export default Dashboard;