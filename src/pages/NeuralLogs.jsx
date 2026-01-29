import React, { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import { userApi } from '../api/userApi';
import { 
  Terminal, Clock, User, ChevronRight, 
  Eye, X, MessageSquare, Shield, Activity, FileText,
  ChevronLeft, Database, Cpu, Zap, AlertCircle 
} from 'lucide-react';

const NeuralLogs = () => {
  const [agents, setAgents] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const element = document.getElementById('log-top');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

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
    setCurrentPage(1);
    try {
      const res = await agentApi.getLogs(agentCode, 100);
      setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
    } catch (e) { setLogs([]); }
    finally { setLoading(false); }
  };

  const renderBeautifiedContent = (data) => {
    if (typeof data !== 'object' || data === null) return <span className="text-slate-700">{String(data)}</span>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {Object.entries(data).map(([key, value]) => {
          if (['timestamp', 'user_id', 'username', 'id'].includes(key)) return null;
          return (
            <div key={key} className="flex flex-col p-2 bg-white/50 border border-slate-100 rounded-lg">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 flex items-center gap-1">
                <div className="w-1 h-1 bg-indigo-400 rounded-full" /> {key.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-700 break-all">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredLogs = logs.filter(log => {
    if (!selectedUser) return true;
    // Checks both user_id and username against the selected identity
    return String(log.user_id) === String(selectedUser) || String(log.username) === String(selectedUser);
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogsSlice = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // Determine which state to show
  const hasActiveFilter = selectedAgent !== '' || selectedUser !== '';
  const hasResults = currentLogsSlice.length > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div id="log-top" className="absolute top-0" />

      {/* FILTER HEADER */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Neural Log Buffer</h2>
              <p className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase mt-2 font-bold italic">Audit Chain Discovery</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-400 font-mono text-[10px] uppercase border border-slate-100">
            <Activity size={12} className="text-emerald-500" /> Operational_Status: Nominal
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Zap size={12} /> Target Sequence (Agent) </label>
            <select value={selectedAgent} onChange={(e) => { setSelectedAgent(e.target.value); loadLogs(e.target.value); }} className="w-full bg-slate-900 text-white rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
              <option value="">Choose Agent Code</option>
              {agents.map((code, idx) => <option key={idx} value={code}>{String(code).toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><User size={12} /> Subject Identity (User) </label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-indigo-500 appearance-none cursor-pointer">
              <option value="">Global Broadcast (All Users)</option>
              {personnel.map(u => <option key={u.id} value={u.username}>{u.name || u.username}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* LOG CONTENT */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center font-mono py-20 text-indigo-500 animate-pulse uppercase tracking-[0.3em]">Decoding_Data_Packets...</div>
        ) : hasActiveFilter && hasResults ? (
          <>
            {currentLogsSlice.map((log, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm flex gap-6 items-start group hover:border-indigo-300 transition-all">
                <div className={`p-4 rounded-2xl border transition-colors ${log.error ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:text-indigo-600'}`}>
                   {log.error ? <AlertCircle size={20} /> : <Terminal size={20} />}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-slate-900 text-[9px] font-black text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">
                        <User size={10} /> {log.user_id || log.username || 'SYS_AUTH'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono italic">
                        <Clock size={10} /> {log.timestamp || 'T-Minus_0'}
                      </div>
                    </div>
                    <button onClick={() => setRaw(log)} className="p-2 text-slate-300 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all"><Database size={16} /></button>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl">
                     <div className="mb-4">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1 italic">Primary Message</p>
                        <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                          {log.message || log.input || "No text data in payload."}
                        </p>
                     </div>
                     <div className="border-t border-slate-100 pt-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Extended Metadata</p>
                        {renderBeautifiedContent(log)}
                     </div>
                  </div>
                </div>
              </div>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6 py-10">
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><ChevronLeft size={20} /></button>
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-12 h-12 rounded-2xl font-mono text-xs font-black transition-all border ${currentPage === i + 1 ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 scale-110" : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300"}`}>{i + 1}</button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm active:scale-95"><ChevronRight size={20} /></button>
                </div>
              </div>
            )}
          </>
        ) : hasActiveFilter ? (
          /* EMPTY STATE (Filters applied but no logs found) */
          <div className="py-40 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
            <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-mono uppercase text-xs tracking-widest italic px-10 text-center">No traffic logs found matching this filter combination.</p>
          </div>
        ) : (
          /* INITIAL STATE (Nothing selected) */
          <div className="py-40 text-center opacity-30">
            <FileText className="mx-auto text-slate-200 mb-6" size={80} />
            <p className="text-slate-900 font-black text-2xl uppercase tracking-[0.4em] italic text-center leading-tight">Awaiting_Neural_Target<br/><span className="text-sm font-mono tracking-widest text-slate-400">Select an agent or user above</span></p>
          </div>
        )}
      </div>

      {/* RAW PACKET MODAL */}
      {raw && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-white/5 w-full max-w-2xl rounded-[3rem] flex flex-col overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                 <h3 className="text-white font-mono text-[10px] uppercase tracking-[0.3em] flex items-center gap-2"><Terminal size={14} className="text-indigo-400" /> raw_packet_buffer</h3>
                 <button onClick={() => setRaw(null)} className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all"><X size={24}/></button>
              </div>
              <pre className="p-8 text-indigo-300 font-mono text-[11px] overflow-auto h-[60vh] custom-scrollbar">
                {JSON.stringify(raw, null, 2)}
              </pre>
           </div>
        </div>
      )}
    </div>
  );
};

export default NeuralLogs;