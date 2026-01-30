import React, { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import { Wrench, Plus, Globe, Cpu, Settings2, X, ShieldAlert } from 'lucide-react';

const AgentTools = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [allDefinitions, setAllDefinitions] = useState([]); 
  const [agentEnabledTools, setAgentEnabledTools] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newTool, setNewTool] = useState({
    tool_id: '', name: '', description: '', version: '1.0.0',
    base_url: '', endpoint_path: '', http_method: 'GET',
    authentication_type: 'none', authentication_config: {},
    headers: {}, parameters: [], request_body_schema: {},
    response_schema: {}, timeout: 30, retry_count: 3, enabled: true
  });

  useEffect(() => {
    agentApi.getList().then(res => setAgents(res.data || []));
    fetchGlobalDefinitions();
  }, []);

  const fetchGlobalDefinitions = async () => {
    try {
      const res = await agentApi.getDefinitions(true);
      setAllDefinitions(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error("Registry fetch failed", e); }
  };

  const loadAgentPermissions = async (agentCode) => {
    setLoading(true);
    try {
      const res = await agentApi.getTools(agentCode);
      if (res.data && Array.isArray(res.data.enabled_tools)) {
        setAgentEnabledTools(res.data.enabled_tools);
      } else {
        setAgentEnabledTools([]);
      }
    } catch (e) { 
      setAgentEnabledTools([]); 
    } finally { setLoading(false); }
  };

  const handleToggleTool = async (toolId) => {
    if (!selectedAgent) return;
    const isCurrentlyEnabled = agentEnabledTools.includes(toolId);

    try {
      if (isCurrentlyEnabled) {
        await agentApi.disableTool(selectedAgent.agent_code, toolId);
      } else {
        await agentApi.enableTool(selectedAgent.agent_code, toolId);
      }
      await loadAgentPermissions(selectedAgent.agent_code);
    } catch (err) {
      alert("Toggle Action Failed: " + (err.response?.data?.detail || "Check console"));
    }
  };

  const handleCreateNewDefinition = async (e) => {
    e.preventDefault();
    try {
      await agentApi.createDefinition(newTool);
      alert("NEW TOOL REGISTERED IN GLOBAL_REGISTRY");
      setShowCreateModal(false);
      fetchGlobalDefinitions();
    } catch (err) {
      alert("REGISTRATION FAILED: Check schema compatibility");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. TOPOGRAPHIC HEADER (ENGRO GREEN BG, BLACK TEXT) */}
      <div className="banner-engro-green w-full p-16 rounded-[2.5rem] border-2 border-black flex flex-col justify-center min-h-[220px] shadow-lg">
        <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter leading-none">Agent Capabilities</h2>
        <p className="text-black font-bold text-xl mt-2 opacity-80 italic">Agent Bridge & API Tool Registry</p>
      </div>

      {/* 2. SELECTION BAR */}
      <div className="bg-white border-2 border-black p-8 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-6 shadow-[6px_6px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Settings2 size={24} />
            </div>
            <div>
                <h3 className="text-lg font-black text-black uppercase italic leading-none">Active Target</h3>
                <p className="text-[10px] text-emerald-600 font-black tracking-widest uppercase mt-1">
                    {selectedAgent ? `Node: ${selectedAgent.agent_code}` : 'Awaiting Selection'}
                </p>
            </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <select 
            onChange={(e) => {
              const agent = agents.find(a => a.agent_code === e.target.value);
              if (agent) { 
                setSelectedAgent(agent); 
                loadAgentPermissions(agent.agent_code); 
              }
            }}
            className="bg-slate-50 border-2 border-black rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none cursor-pointer min-w-[240px] focus:bg-emerald-50 transition-all"
          >
            <option value="">Select Agent Node</option>
            {agents.map(a => <option key={a.agent_code} value={a.agent_code}>{a.agent_code.toUpperCase()}</option>)}
          </select>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-black transition-all active:translate-y-1 active:shadow-none"
          >
            <Plus size={18} className="inline mr-2" strokeWidth={3} /> Add New Tool
          </button>
        </div>
      </div>

      {/* 3. MAIN CAPABILITY GRID */}
      {loading ? (
        <div className="py-40 text-center font-black text-black animate-pulse uppercase tracking-[0.4em]">SYNCING_CAPABILITIES...</div>
      ) : !selectedAgent ? (
        <div className="py-40 text-center border-4 border-dashed border-black/10 rounded-[4rem] bg-white shadow-inner">
            <Cpu className="mx-auto text-black/20 mb-6" size={80} />
            <p className="text-black font-black text-2xl uppercase tracking-[0.2em] italic">Assign Node to Manage Agent Tools</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allDefinitions.map((tool, idx) => {
            const isEnabled = agentEnabledTools.includes(tool.tool_id);
            return (
              <div key={idx} className={`bg-white border-2 p-10 rounded-[3.5rem] transition-all relative ${isEnabled ? 'border-black shadow-[8px_8px_0px_#10b981] scale-[1.02]' : 'border-black/10 opacity-60 hover:opacity-100 hover:border-black shadow-sm'}`}>
                <div className="flex justify-between items-start mb-8">
                    <div className={`w-16 h-16 rounded-2xl border-2 border-black flex items-center justify-center transition-all ${isEnabled ? 'bg-black text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                        <Wrench size={28} />
                    </div>
                    
                    {/* PHYSICAL TOGGLE SWITCH */}
                    <button 
                        type="button"
                        onClick={() => handleToggleTool(tool.tool_id)}
                        className={`w-16 h-9 rounded-full relative border-2 border-black transition-colors duration-300 ${isEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white border border-black rounded-full transition-all shadow-sm ${isEnabled ? 'left-9' : 'left-1'}`} />
                    </button>
                </div>

                <h4 className="text-xl font-black text-black uppercase italic leading-tight mb-2">{tool.name}</h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight h-12 overflow-hidden leading-relaxed">{tool.description || "Capability available in global registry."}</p>
                
                <div className="pt-8 mt-8 border-t-2 border-black/5 flex justify-between items-center font-black text-[10px] uppercase tracking-widest">
                    <span className={isEnabled ? 'text-emerald-600' : 'text-slate-300'}>
                        {isEnabled ? '● Link_Active' : '○ Offline'}
                    </span>
                    <Globe size={16} className={isEnabled ? 'text-black' : 'text-slate-200'} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. REGISTER NEW TOOL MODAL (HIGH CONTRAST) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <form onSubmit={handleCreateNewDefinition} className="bg-white border-4 border-black rounded-[4rem] p-12 w-full max-w-3xl shadow-[20px_20px_0px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto space-y-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b-2 border-black/5 pb-6">
                <h3 className="text-4xl font-black text-black italic uppercase tracking-tighter">Register Capability</h3>
                <button type="button" onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all"><X size={32} /></button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-emerald-700 uppercase ml-4 tracking-[0.2em]">Identification Matrix</label>
                    <input placeholder="TOOL_ID (unique_snake_case)" className="w-full bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-black uppercase outline-none focus:bg-white transition-all shadow-inner" onChange={e => setNewTool({...newTool, tool_id: e.target.value})} required />
                    <input placeholder="DISPLAY_NAME" className="w-full bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-black uppercase outline-none focus:bg-white transition-all shadow-inner" onChange={e => setNewTool({...newTool, name: e.target.value})} required />
                    <textarea placeholder="TECHNICAL_DESCRIPTION" className="w-full bg-slate-50 border-2 border-black rounded-[2rem] p-6 text-sm font-bold h-32 outline-none focus:bg-white transition-all shadow-inner" onChange={e => setNewTool({...newTool, description: e.target.value})} required />
                </div>

                <div className="col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-emerald-700 uppercase ml-4 tracking-[0.2em]">Connectivity Schema</label>
                    <input placeholder="BASE_URL (https://api.engro.com)" className="w-full bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-mono font-bold outline-none focus:bg-white transition-all shadow-inner" onChange={e => setNewTool({...newTool, base_url: e.target.value})} required />
                </div>
                
                <input placeholder="ENDPOINT_PATH (/v1/execute)" className="bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-mono font-bold outline-none focus:bg-white transition-all shadow-inner" onChange={e => setNewTool({...newTool, endpoint_path: e.target.value})} required />
                
                <select className="bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-black uppercase outline-none cursor-pointer appearance-none" onChange={e => setNewTool({...newTool, http_method: e.target.value})}>
                    <option value="GET">HTTP_GET</option>
                    <option value="POST">HTTP_POST</option>
                    <option value="PUT">HTTP_PUT</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-black text-white py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-[8px_8px_0px_#10b981] hover:bg-emerald-600 transition-all active:shadow-none active:translate-y-1">
               Commit_To_Global_Registry
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgentTools;