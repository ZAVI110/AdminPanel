import React, { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import { userApi } from '../api/userApi';
import { 
  Terminal, Clock, User, ChevronRight, 
  Eye, X, MessageSquare, Shield, Activity, FileText,
  ChevronDown, ChevronUp, Database, Cpu, Zap, AlertCircle 
} from 'lucide-react';

const NeuralLogs = () => {
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

  // --- UPDATED: BEAUTIFIED TEXT RENDERER ---
  const renderBeautifiedContent = (data) => {
    if (typeof data !== 'object' || data === null) {
      return <span className="text-black font-extrabold">{String(data)}</span>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {Object.entries(data).map(([key, value]) => {
          // Skip internal technical IDs and timestamps already shown in header
          if (['timestamp', 'user_id', 'username', 'id', 'agent_code'].includes(key)) return null;

          let displayValue;
          if (typeof value === 'object' && value !== null) {
            // Recursive call for nested objects to keep everything beautified
            displayValue = (
              <div className="space-y-2 mt-2 border-l-2 border-emerald-500/20 pl-3">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{subKey.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-900">{String(subValue)}</span>
                  </div>
                ))}
              </div>
            );
          } else {
            displayValue = <span className="text-[11px] font-mono font-bold text-black break-all leading-tight">{String(value)}</span>;
          }

          return (
            <div key={key} className="flex flex-col p-4 bg-white border-2 border-black rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.15em] mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {key.replace(/_/g, ' ')}
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
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* 1. BANNER */}
      <div className="banner-engro-green w-full p-16 rounded-[2.5rem] border-2 border-black flex flex-col justify-center min-h-[250px] shadow-lg">
        <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter leading-none">Agent Log Buffer</h2>
        <p className="text-black font-bold text-xl mt-3 opacity-80 italic">Audit Chain Discovery & Incremental Analysis</p>
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white p-10 rounded-[3rem] border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.05)] space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-black/5 pb-6">
            <Activity size={24} className="text-emerald-600" />
            <h3 className="text-xl font-black text-black uppercase italic tracking-tight">Stream Selectors</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Zap size={14} className="text-emerald-500" /> Target Agent Node
            </label>
            <select 
                value={selectedAgent} 
                onChange={(e) => { setSelectedAgent(e.target.value); loadLogs(e.target.value); }} 
                className="w-full bg-black text-white rounded-2xl px-8 py-5 text-xs font-black uppercase outline-none border-2 border-black transition-all appearance-none cursor-pointer"
            >
              <option value="">-- SELECT SOURCE NODE --</option>
              {agents.map((code, idx) => <option key={idx} value={code}>{String(code).toUpperCase()}</option>)}
            </select>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <User size={14} className="text-emerald-500" /> Personnel Identity
            </label>
            <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)} 
                className="w-full bg-white border-2 border-black rounded-2xl px-8 py-5 text-xs font-black uppercase outline-none focus:bg-emerald-50 transition-all cursor-pointer shadow-inner"
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
          <div className="text-center font-black py-32 text-black animate-pulse uppercase tracking-[0.5em] italic">DECODING_DATA_STREAM...</div>
        ) : isSessionActive && currentLogsSlice.length > 0 ? (
          <>
            {currentLogsSlice.map((log, i) => (
              <div key={i} className="bg-white border-2 border-black p-10 rounded-[3.5rem] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-10 items-start group hover:-translate-y-1 transition-all duration-300">
                <div className={`p-6 rounded-[2rem] border-2 border-black transition-all ${log.error ? 'bg-red-600 text-white' : 'bg-black text-white group-hover:bg-emerald-600'}`}>
                   {log.error ? <AlertCircle size={28} /> : <Terminal size={28} />}
                </div>
                
                <div className="flex-1 space-y-6 w-full">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className="bg-black text-[10px] font-black text-white px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">
                        <User size={12} className="inline mr-2 mb-0.5" /> {log.user_id || log.username || 'SYSTEM_CORE'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-mono font-bold text-xs">
                        <Clock size={14} /> {log.timestamp || 'T-MINUS_0'}
                      </div>
                    </div>
                    <button onClick={() => setRaw(log)} className="p-4 text-black border-2 border-black rounded-2xl hover:bg-emerald-50 transition-all active:scale-90"><Database size={20} /></button>
                  </div>

                  <div className="bg-slate-50 border-2 border-black/5 p-8 rounded-[2.5rem]">
                      <div className="mb-6 pb-6 border-b-2 border-black/5">
                        <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-2 opacity-50">Transmission Content</p>
                        <p className="text-[17px] text-black font-bold italic leading-relaxed">
                          "{log.message || log.input || "Data payload is encrypted or empty."}"
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
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
                    className="bg-black text-white px-10 py-5 rounded-[2rem] border-2 border-black font-black text-xs uppercase tracking-[0.2em] shadow-[6px_6px_0px_#10b981] hover:bg-emerald-600 transition-all flex items-center gap-3 active:translate-y-1 active:shadow-none"
                  >
                    <ChevronDown size={20} strokeWidth={3} /> Load More Records
                  </button>
                )}

                {visibleLogsCount > INITIAL_VISIBLE_COUNT && (
                  <button 
                    onClick={handleLoadLess} 
                    className="bg-white text-black px-10 py-5 rounded-[2rem] border-2 border-black font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center gap-3 active:translate-y-1"
                  >
                    <ChevronUp size={20} strokeWidth={3} /> Minimize Stream
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-0.5 w-12 bg-black/10 rounded-full" />
                <p className="text-[11px] font-mono font-black text-slate-400 uppercase tracking-[0.5em]">
                    Visible: {currentLogsSlice.length} // Total: {filteredLogs.length}
                </p>
                <div className="h-0.5 w-12 bg-black/10 rounded-full" />
              </div>
            </div>
          </>
        ) : isSessionActive ? (
          <div className="py-48 text-center border-4 border-dashed border-black/10 rounded-[5rem] bg-white">
            <MessageSquare className="mx-auto text-slate-300 mb-6" size={80} />
            <p className="text-black font-black text-2xl uppercase tracking-widest italic">No filtered results in current sequence.</p>
          </div>
        ) : (
          <div className="py-56 text-center opacity-30">
            <FileText className="mx-auto text-black mb-10" size={120} />
            <p className="text-black font-black text-4xl uppercase tracking-[0.6em] italic leading-tight text-center">
                Awaiting_Agent_Target
            </p>
          </div>
        )}
      </div>

      {/* RAW PACKET MODAL */}
      {raw && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-zinc-950 border-2 border-emerald-500/40 w-full max-w-4xl rounded-[4rem] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-[0_0_100px_rgba(16,185,129,0.15)]">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black">
                 <div className="flex items-center gap-3">
                    <Terminal size={20} className="text-emerald-400" />
                    <h3 className="text-white font-mono text-xs uppercase tracking-[0.4em] font-black">raw_packet_buffer</h3>
                 </div>
                 <button onClick={() => setRaw(null)} className="text-white/40 hover:text-white border-2 border-white/10 p-3 rounded-2xl hover:bg-white/5 transition-all"><X size={28}/></button>
              </div>
              <pre className="p-12 text-emerald-400 font-mono text-[12px] overflow-auto h-[60vh] custom-scrollbar bg-black/50">
                {JSON.stringify(raw, null, 4)}
              </pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default NeuralLogs;