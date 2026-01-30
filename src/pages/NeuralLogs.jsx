import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentApi } from '../api/agentApi';
import { userApi } from '../api/userApi';
import { 
  Terminal, Clock, User, ChevronRight, 
  Eye, X, MessageSquare, Shield, Activity, FileText,
  ChevronDown, ChevronUp, Database, Cpu, Zap, AlertCircle, ArrowLeft 
} from 'lucide-react';

const NeuralLogs = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState(null);
  
  const INITIAL_VISIBLE_COUNT = 10;
  const [visibleLogsCount, setVisibleLogsCount] = useState(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    const initializeFilters = async () => {
      try {
        const [agentRes, userRes] = await Promise.all([
          agentApi.getAgentCodes(),
          userApi.getAll()
        ]);
        const agentData = Array.isArray(agentRes.data) ? agentRes.data : (agentRes.data.agent_codes || []);
        const userData = Array.isArray(userRes.data) ? userRes.data : (userRes.data.users || []);
        setAgents(agentData);
        setPersonnel(userData);
      } catch (e) { console.error("Filter initialization failed", e); }
    };
    initializeFilters();
  }, []);

  const loadLogs = async (agentCode) => {
    if (!agentCode) return;
    setLoading(true);
    setVisibleLogsCount(INITIAL_VISIBLE_COUNT);
    try {
      const res = await agentApi.getLogs(agentCode, 100);
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch (e) { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedUser && !selectedAgent && agents.length > 0) {
      loadLogs(agents[0]);
    }
  }, [selectedUser, agents, selectedAgent]);

  const renderBeautifiedContent = (data) => {
    if (typeof data !== 'object' || data === null) {
      return <span className="text-slate-800 font-bold">{String(data)}</span>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {Object.entries(data).map(([key, value]) => {
          if (['timestamp', 'user_id', 'username', 'id', 'agent_code'].includes(key)) return null;

          let displayValue;
          if (typeof value === 'object' && value !== null) {
            displayValue = (
              <div className="space-y-2 mt-2 border-l-2 border-emerald-100 pl-3">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{subKey.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800">{String(subValue)}</span>
                  </div>
                ))}
              </div>
            );
          } else {
            displayValue = <span className="text-[11px] font-mono font-bold text-slate-700 break-all leading-tight">{String(value)}</span>;
          }

          return (
            <div key={key} className="flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {key.replace(/_/g, ' ')}
              </span>
              {displayValue}
            </div>
          );
        })}
      </div>
    );
  };

  const filteredLogs = logs.filter(log => {
    if (!selectedUser) return true;
    return String(log.user_id) === String(selectedUser) || String(log.username) === String(selectedUser);
  });

  const currentLogsSlice = filteredLogs.slice(0, visibleLogsCount);
  const isSessionActive = selectedAgent !== '' || selectedUser !== '';

  const handleLoadMore = () => setVisibleLogsCount(prev => prev + 10);
  const handleLoadLess = () => setVisibleLogsCount(INITIAL_VISIBLE_COUNT);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* 1. BANNER */}
      <div className="engro-central-banner min-h-[260px] flex items-center justify-between border-none shadow-sm px-16">
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter mb-2 text-[#0b4f18]">Agent Log Buffer</h1>
          <p className="text-xl font-medium text-[#0b4f18] opacity-90">Audit Chain Discovery & Analysis</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-2 bg-white/20 hover:bg-white/40 text-[#0b4f18] px-6 py-3 rounded-2xl font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="p-3 bg-emerald-50 rounded-xl text-[#10b981]"><Activity size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800">Stream Selectors</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <Zap size={14} className="text-emerald-500" /> Target Agent Node
            </label>
            <select 
                value={selectedAgent} 
                onChange={(e) => { setSelectedAgent(e.target.value); loadLogs(e.target.value); }} 
                className="w-full bg-slate-900 text-white rounded-2xl px-8 py-5 text-xs font-bold uppercase outline-none transition-all cursor-pointer hover:bg-black"
            >
              <option value="">-- SELECT SOURCE NODE --</option>
              {agents.map((code, idx) => <option key={idx} value={code}>{String(code).toUpperCase()}</option>)}
            </select>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <User size={14} className="text-emerald-500" /> Personnel Identity
            </label>
            <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 text-xs font-bold uppercase outline-none focus:ring-2 ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="">GLOBAL BROADCAST (ALL USERS)</option>
              {personnel.map(u => <option key={u.id} value={u.username}>{u.name || u.username}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 3. LOG CONTENT STREAM */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center font-black py-32 text-slate-400 animate-pulse uppercase tracking-widest italic">DECODING_DATA_STREAM...</div>
        ) : isSessionActive && currentLogsSlice.length > 0 ? (
          <>
            {currentLogsSlice.map((log, i) => (
              <div key={i} className="bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-sm flex flex-col md:flex-row gap-10 items-start group hover:shadow-md transition-all duration-300">
                <div className={`p-6 rounded-[2rem] transition-all ${log.error ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-[#10b981] group-hover:bg-[#10b981] group-hover:text-white'}`}>
                   {log.error ? <AlertCircle size={28} /> : <Terminal size={28} />}
                </div>
                
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="bg-slate-900 text-[10px] font-bold text-white px-5 py-2 rounded-full uppercase tracking-widest shadow-sm">
                        <User size={12} className="inline mr-2 mb-0.5" /> {log.user_id || log.username || 'SYSTEM_CORE'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-mono font-bold text-xs">
                        <Clock size={14} /> {log.timestamp || 'T-MINUS_0'}
                      </div>
                    </div>
                    <button onClick={() => setRaw(log)} className="p-4 text-slate-400 bg-slate-50 rounded-2xl hover:bg-emerald-50 hover:text-[#10b981] transition-all"><Database size={20} /></button>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem]">
                      <div className="mb-6 pb-6 border-b border-slate-200/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transmission Content</p>
                        <p className="text-[17px] text-slate-800 font-bold leading-relaxed">
                          "{log.message || log.input || "Data payload is encrypted or empty."}"
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Cpu size={14} /> Agent Metadata Matrix
                        </p>
                        {renderBeautifiedContent(log)}
                      </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col items-center gap-8 py-16">
              <div className="flex gap-4">
                {visibleLogsCount < filteredLogs.length && (
                  <button 
                    onClick={handleLoadMore} 
                    className="bg-[#10b981] text-white px-10 py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#0b4f18] transition-all flex items-center gap-3"
                  >
                    <ChevronDown size={20} /> Load More Records
                  </button>
                )}

                {visibleLogsCount > INITIAL_VISIBLE_COUNT && (
                  <button 
                    onClick={handleLoadLess} 
                    className="bg-white text-slate-400 px-10 py-5 rounded-[2rem] border border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
                  >
                    <ChevronUp size={20} /> Minimize Stream
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-slate-200" />
                <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Visible: {currentLogsSlice.length} // Total: {filteredLogs.length}
                </p>
                <div className="h-px w-12 bg-slate-200" />
              </div>
            </div>
          </>
        ) : isSessionActive ? (
          <div className="py-48 text-center border-2 border-dashed border-slate-100 rounded-[5rem] bg-white">
            <MessageSquare className="mx-auto text-slate-200 mb-6" size={80} />
            <p className="text-slate-400 font-bold text-2xl uppercase tracking-widest">No results found.</p>
          </div>
        ) : (
          <div className="py-56 text-center opacity-10">
            <FileText className="mx-auto text-slate-900 mb-10" size={120} />
            <p className="text-slate-900 font-black text-4xl uppercase tracking-[0.4em] text-center">
                Awaiting_Agent_Target
            </p>
          </div>
        )}
      </div>

      {/* RAW PACKET MODAL */}
      {raw && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-slate-950 w-full max-w-4xl rounded-[4rem] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Terminal size={20} className="text-emerald-400" />
                    <h3 className="text-white font-mono text-xs uppercase tracking-widest font-black">raw_packet_buffer</h3>
                 </div>
                 <button onClick={() => setRaw(null)} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={28}/></button>
              </div>
              <pre className="p-12 text-emerald-400 font-mono text-[12px] overflow-auto h-[60vh] custom-scrollbar bg-black/20">
                {JSON.stringify(raw, null, 4)}
              </pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default NeuralLogs;