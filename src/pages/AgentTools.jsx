import React, { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import { Wrench, Plus, ShieldCheck, AlertCircle, Loader2, Globe, Cpu, Settings2, X } from 'lucide-react';

const AgentTools = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [allDefinitions, setAllDefinitions] = useState([]); 
  const [agentEnabledTools, setAgentEnabledTools] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // State for new tool registration (matches your provided schema)
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
      console.log("API Response for Tools:", res.data);

      // FIX: Your API returns an object { enabled_tools: ['string_id', ...] }
      if (res.data && Array.isArray(res.data.enabled_tools)) {
        setAgentEnabledTools(res.data.enabled_tools);
      } else {
        setAgentEnabledTools([]);
      }
    } catch (e) { 
      console.error("Failed to load agent tools", e);
      setAgentEnabledTools([]); 
    } finally { setLoading(false); }
  };

  const handleToggleTool = async (toolId) => {
    if (!selectedAgent) return;
    
    // Check if the toolId exists in the array of strings
    const isCurrentlyEnabled = agentEnabledTools.includes(toolId);

    try {
      if (isCurrentlyEnabled) {
        await agentApi.disableTool(selectedAgent.agent_code, toolId);
      } else {
        await agentApi.enableTool(selectedAgent.agent_code, toolId);
      }
      // Refresh strictly for this agent
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
      fetchGlobalDefinitions(); // Refresh registry grid
    } catch (err) {
      alert("REGISTRATION FAILED: " + (err.response?.data?.detail || "Check schema compatibility"));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Settings2 size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-900 italic uppercase leading-none">Agent Tools</h2>
                <p className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase mt-1">
                    {selectedAgent ? `Node: ${selectedAgent.agent_code}` : 'Awaiting Node Selection'}
                </p>
            </div>
        </div>
        
        <div className="flex gap-4">
          <select 
            onChange={(e) => {
              const agent = agents.find(a => a.agent_code === e.target.value);
              if (agent) { 
                setSelectedAgent(agent); 
                loadAgentPermissions(agent.agent_code); 
              }
            }}
            className="bg-slate-100 rounded-2xl px-6 py-3 text-xs font-black uppercase outline-none cursor-pointer min-w-[220px]"
          >
            <option value="">Select Agent Node</option>
            {agents.map(a => <option key={a.agent_code} value={a.agent_code}>{a.agent_code.toUpperCase()}</option>)}
          </select>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={20} className="mr-2" /> Add New Tool
          </button>
        </div>
      </div>

      {/* 2. MAIN CAPABILITY GRID */}
      {!selectedAgent ? (
        <div className="py-40 text-center border-4 border-dashed border-slate-100 rounded-[4rem]">
            <Cpu className="mx-auto text-slate-200 mb-6" size={64} />
            <p className="text-slate-400 font-black text-2xl uppercase tracking-[0.2em] italic">Assign Node to Manage Tools</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allDefinitions.map((tool, idx) => {
            const isEnabled = agentEnabledTools.includes(tool.tool_id);
            return (
              <div key={idx} className={`bg-white border-2 p-8 rounded-[3rem] transition-all relative ${isEnabled ? 'border-indigo-500 shadow-xl scale-[1.02]' : 'border-slate-100 opacity-60 hover:opacity-100'}`}>
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Wrench size={24} />
                    </div>
                    
                    {/* TOGGLE SWITCH */}
                    <button 
                        type="button"
                        onClick={() => handleToggleTool(tool.tool_id)}
                        className={`w-16 h-8 rounded-full relative transition-colors duration-300 ${isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isEnabled ? 'left-9' : 'left-1'}`} />
                    </button>
                </div>

                <h4 className="text-lg font-black text-slate-900 uppercase italic leading-tight">{tool.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-3 uppercase h-10 overflow-hidden">{tool.description || "Capability available in registry."}</p>
                
                <div className="pt-6 mt-6 border-t border-slate-50 flex justify-between items-center font-black text-[9px] uppercase">
                    <span className={isEnabled ? 'text-emerald-600' : 'text-slate-300'}>
                        {isEnabled ? '● Link_Active' : '○ Available'}
                    </span>
                    <Globe size={14} className={isEnabled ? 'text-indigo-500' : 'text-slate-200'} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. REGISTER NEW TOOL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewDefinition} className="bg-white rounded-[3.5rem] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-3xl font-black text-slate-900 italic uppercase">Global_Registry_Add</h3>
                <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-red-500"><X size={32} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 uppercase ml-2">Identify</label>
                    <input placeholder="TOOL_ID" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono focus:border-indigo-500 outline-none" onChange={e => setNewTool({...newTool, tool_id: e.target.value})} required />
                    <input placeholder="TOOL_NAME" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono focus:border-indigo-500 outline-none" onChange={e => setNewTool({...newTool, name: e.target.value})} required />
                    <textarea placeholder="DESCRIPTION" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono h-24 focus:border-indigo-500 outline-none" onChange={e => setNewTool({...newTool, description: e.target.value})} required />
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-indigo-600 uppercase ml-2">Connectivity</label>
                    <input placeholder="BASE_URL (https://...)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono" onChange={e => setNewTool({...newTool, base_url: e.target.value})} required />
                </div>
                
                <input placeholder="PATH (/api/v1)" className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono" onChange={e => setNewTool({...newTool, endpoint_path: e.target.value})} required />
                
                <select className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono appearance-none" onChange={e => setNewTool({...newTool, http_method: e.target.value})}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                </select>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
               Commit_To_Registry
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgentTools;