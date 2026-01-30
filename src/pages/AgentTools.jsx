import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentApi } from '../api/agentApi';
import { Wrench, Plus, Globe, Cpu, Settings2, X, ShieldAlert, ArrowLeft } from 'lucide-react';

const AgentTools = () => {
  const navigate = useNavigate();
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
      alert("NEW TOOL REGISTERED");
      setShowCreateModal(false);
      fetchGlobalDefinitions();
    } catch (err) {
      alert("REGISTRATION FAILED");
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. TOPOGRAPHIC HEADER */}
      <div className="engro-central-banner min-h-[260px] flex items-center justify-between border-none shadow-sm px-16">
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter mb-2 text-[#0b4f18]">Agent Capabilities</h1>
          <p className="text-xl font-medium text-[#0b4f18] opacity-90">Agent Bridge & API Tool Registry</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-2 bg-white/20 hover:bg-white/40 text-[#0b4f18] px-6 py-3 rounded-2xl font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      {/* 2. SELECTION BAR */}
      <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                <Settings2 size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 leading-none">Active Target</h3>
                <p className="text-[11px] text-emerald-600 font-black tracking-widest uppercase mt-1">
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
            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold uppercase outline-none cursor-pointer min-w-[240px] focus:ring-2 ring-emerald-500/10 transition-all"
          >
            <option value="">Select Agent Node</option>
            {agents.map(a => <option key={a.agent_code} value={a.agent_code}>{a.agent_code.toUpperCase()}</option>)}
          </select>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-[#10b981] text-white px-8 py-4 rounded-2xl font-bold text-xs tracking-widest uppercase shadow-sm hover:bg-[#0b4f18] transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add New Tool
          </button>
        </div>
      </div>

      {/* 3. MAIN CAPABILITY GRID */}
      {loading ? (
        <div className="py-40 text-center font-black text-engro-forest animate-pulse uppercase tracking-widest">SYNCING_CAPABILITIES...</div>
      ) : !selectedAgent ? (
        <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-white">
            <Cpu className="mx-auto text-slate-200 mb-6" size={80} />
            <p className="text-slate-400 font-bold text-2xl uppercase tracking-widest">Assign Node to Manage Agent Tools</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allDefinitions.map((tool, idx) => {
            const isEnabled = agentEnabledTools.includes(tool.tool_id);
            return (
              <div key={idx} className={`bg-white border p-10 rounded-[3.5rem] transition-all relative ${isEnabled ? 'border-emerald-100 shadow-md scale-[1.02]' : 'border-slate-100 opacity-60 hover:opacity-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isEnabled ? 'bg-emerald-50 text-[#10b981]' : 'bg-slate-50 text-slate-400'}`}>
                        <Wrench size={28} />
                    </div>
                    
                    {/* PHYSICAL TOGGLE SWITCH */}
                    <button 
                        type="button"
                        onClick={() => handleToggleTool(tool.tool_id)}
                        className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${isEnabled ? 'bg-[#10b981]' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${isEnabled ? 'left-8' : 'left-1'}`} />
                    </button>
                </div>

                <h4 className="text-xl font-bold text-slate-800 uppercase mb-2 leading-tight">{tool.name}</h4>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-tight h-12 overflow-hidden leading-relaxed">{tool.description || "Capability available in global registry."}</p>
                
                <div className="pt-8 mt-8 border-t border-slate-50 flex justify-between items-center font-bold text-[10px] uppercase tracking-widest">
                    <span className={isEnabled ? 'text-emerald-600' : 'text-slate-300'}>
                        {isEnabled ? '● Link Active' : '○ Offline'}
                    </span>
                    <Globe size={16} className={isEnabled ? 'text-[#10b981]' : 'text-slate-200'} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. REGISTER NEW TOOL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={handleCreateNewDefinition} className="bg-white rounded-[4rem] p-12 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">Register Capability</h3>
                <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-all"><X size={28} /></button>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-emerald-600 uppercase ml-2 tracking-widest">Identification Matrix</label>
                    <input placeholder="TOOL_ID (unique_snake_case)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewTool({...newTool, tool_id: e.target.value})} required />
                    <input placeholder="DISPLAY_NAME" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewTool({...newTool, name: e.target.value})} required />
                    <textarea placeholder="TECHNICAL_DESCRIPTION" className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium h-32 outline-none focus:ring-2 ring-emerald-500/10 transition-all resize-none" onChange={e => setNewTool({...newTool, description: e.target.value})} required />
                </div>

                <div className="col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-emerald-600 uppercase ml-2 tracking-widest">Connectivity Schema</label>
                    <input placeholder="BASE_URL (https://api.engro.com)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-mono font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewTool({...newTool, base_url: e.target.value})} required />
                </div>
                
                <input placeholder="ENDPOINT_PATH (/v1/execute)" className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-mono font-bold outline-none focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewTool({...newTool, endpoint_path: e.target.value})} required />
                
                <select className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold uppercase outline-none cursor-pointer appearance-none" onChange={e => setNewTool({...newTool, http_method: e.target.value})}>
                    <option value="GET">HTTP GET</option>
                    <option value="POST">HTTP POST</option>
                    <option value="PUT">HTTP PUT</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-[#10b981] text-white py-6 rounded-[2.5rem] font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] transition-all">
                Commit to Global Registry
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgentTools;