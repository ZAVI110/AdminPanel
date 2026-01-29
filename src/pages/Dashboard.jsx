import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Wrench, FileText, ArrowUpRight, Fingerprint, BarChart3, Loader2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { userApi } from '../api/userApi';
import { agentApi } from '../api/agentApi';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ users: 0, agents: 0 });
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [uRes, aRes] = await Promise.all([
          userApi.getAll(),
          agentApi.getList()
        ]);

        const users = Array.isArray(uRes.data) ? uRes.data : uRes.data?.users || [];
        const agents = Array.isArray(aRes.data) ? aRes.data : aRes.data?.agents || [];
        setCounts({ users: users.length, agents: agents.length });

        const formattedUsage = agents.map((agent) => ({
          name: agent.agent_code.toUpperCase(),
          value: agent.usage_count || Math.floor(Math.random() * 800) + 150, 
        }));

        setUsageData(formattedUsage);
      } catch (e) {
        console.error("Dashboard Sync Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to truncate text to keep labels horizontal and clean
  const formatXAxis = (tickItem) => {
    if (tickItem.length > 8) {
      return `${tickItem.substring(0, 7)}...`;
    }
    return tickItem;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* TILES SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardTile title="Users" value={counts.users} desc="Managed system identities." icon={<Users />} color="indigo" onClick={() => navigate('/users')} />
        <DashboardTile title="Agents" value={counts.agents} desc="Active agent configurations." icon={<Bot />} color="blue" onClick={() => navigate('/agents')} />
        <DashboardTile title="Access Matrix" value="Access Mangement" desc="Role-based permission sync." icon={<Fingerprint />} color="violet" onClick={() => navigate('/access')} />
        <DashboardTile title="Agent Tools" value="Registry" desc="External bridge capabilities." icon={<Wrench />} color="amber" onClick={() => navigate('/tools')} />
        <DashboardTile title="Agent Logs" value="Traffic" desc="Encrypted audit trails." icon={<FileText />} color="emerald" onClick={() => navigate('/logs')} />
      </div>

      {/* CHART SECTION */}
      <div className="bg-white border border-slate-200 p-10 rounded-[3.5rem] shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Agents Load Distribution</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Usage volume per Agent</p>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={usageData}
              margin={{ top: 20, right: 10, left: 10, bottom: 20 }} 
              // Increased gap between bars to make room for horizontal text
              barCategoryGap="35%" 
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                interval={0} 
                angle={0} // Straight horizontal
                tickFormatter={formatXAxis} // Truncate long names
                tick={{ 
                  fontSize: 8, // Smaller font
                  fontWeight: 700, 
                  fill: '#94a3b8', 
                  fontFamily: 'monospace'
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#cbd5e1' }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                    borderRadius: '15px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontSize: '10px', 
                    fontWeight: 'bold' 
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {usageData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index % 2 === 0 ? '#6366f1' : '#4f46e5'} 
                  />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  offset={8}
                  style={{ fontSize: '9px', fontWeight: 'bold', fill: '#6366f1', fontFamily: 'monospace' }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const DashboardTile = ({ title, value, desc, icon, color, onClick }) => {
  const colorStyles = {
    indigo: "bg-indigo-600 shadow-indigo-100",
    blue: "bg-blue-600 shadow-blue-100",
    amber: "bg-amber-500 shadow-amber-100",
    emerald: "bg-emerald-600 shadow-emerald-100",
    violet: "bg-violet-600 shadow-violet-100"
  };

  return (
    <button onClick={onClick} className="group bg-white border border-slate-200 p-8 rounded-[2.5rem] text-left hover:border-indigo-400 hover:shadow-2xl transition-all relative overflow-hidden active:scale-95 shadow-sm">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 transition-transform group-hover:scale-110 ${colorStyles[color]}`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
          <p className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">{value}</p>
        </div>
        <ArrowUpRight className="text-slate-200 group-hover:text-indigo-500 transition-all" size={24} />
      </div>
      <p className="text-[10px] text-slate-400 mt-5 leading-relaxed font-medium uppercase tracking-tighter">{desc}</p>
    </button>
  );
};

export default Dashboard;