import React, { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import ConfirmModal from '../components/ConfirmModal';
import { Cpu, Trash2, X, Globe, Plus, AlertCircle, Save, Settings2 } from 'lucide-react';

const AgentOrchestrator = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editedConfig, setEditedConfig] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // States for Adding New Agent
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    agent_code: "",
    system_prompt: "You are a helpful assistant.",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
    temperature: 0.7,
    rag_enabled: false,
    embedding_model: "amazon.titan-embed-text-v1",
    chunk_size: 1000,
    chunk_overlap: 200,
    max_chunks_retrieved: 5,
    similarity_threshold: 0.7,
    enabled_tools: [],
    tool_credentials: {},
    type: "general",
    rag_type: "string",
    rag_config: { "additionalProp1": {} }
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await agentApi.getList();
      setAgents(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (data) => ({
    agent_code: String(data.agent_code || ""),
    system_prompt: String(data.system_prompt || ""),
    model: String(data.model || ""),
    temperature: Number(data.temperature),
    rag_enabled: Boolean(data.rag_enabled),
    embedding_model: String(data.embedding_model || "amazon.titan-embed-text-v1"),
    chunk_size: Number(data.chunk_size) || 1000,
    chunk_overlap: Number(data.chunk_overlap) || 200,
    max_chunks_retrieved: Number(data.max_chunks_retrieved) || 5,
    similarity_threshold: Number(data.similarity_threshold) || 0.7,
    enabled_tools: Array.isArray(data.enabled_tools) ? data.enabled_tools : [],
    tool_credentials: data.tool_credentials || {},
    type: String(data.type || ""),
    rag_type: String(data.rag_type || "string"),
    rag_config: data.rag_config || { "additionalProp1": {} }
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload(newAgent);
      await agentApi.createConfig(payload);
      setShowAddModal(false);
      alert("SUCCESS: New Agent Registered");
      load();
    } catch (err) {
      alert(`CREATE_FAILED: ${err.response?.data?.detail || "Schema Mismatch"}`);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = buildPayload(editedConfig);
      const idForUrl = selectedAgent.id || selectedAgent.agent_id || selectedAgent.agent_code;
      await agentApi.updateConfig(idForUrl, payload);
      setShowConfirm(false);
      setSelectedAgent(null);
      load();
      alert("SUCCESS: Config Updated");
    } catch (err) {
      alert("UPDATE_FAILED");
    }
  };

  const handleDelete = async (e, agent) => {
    e.stopPropagation();
    const id = agent.id || agent.agent_id || agent.agent_code;
    if (window.confirm(`CRITICAL: Permanently decommission agent [${agent.agent_code}]?`)) {
      try {
        await agentApi.deleteAgent(id);
        alert("AGENT_DELETED");
        load();
      } catch (err) {
        alert("DELETE_FAILED");
      }
    }
  };

  if (loading) return <div className="p-40 text-center font-black text-black animate-pulse uppercase tracking-[0.5em] italic">Interrogating_Agent_Grid...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. TOPOGRAPHIC BANNER (ENGRO GREEN BG, BLACK TEXT) */}
      <div className="banner-engro-green w-full p-16 rounded-[2.5rem] border-2 border-black flex flex-col justify-center min-h-[220px] shadow-lg">
        <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter leading-none">List of Agent</h2>
        <p className="text-black font-bold text-xl mt-2 opacity-80 italic">Active Agent Nodes & Configurations</p>
      </div>

      <div className="flex justify-end px-4">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase flex items-center gap-2 border-2 border-black shadow-[6px_6px_0px_#000] hover:bg-black transition-all active:translate-y-1 active:shadow-none"
        >
          <Plus size={18} strokeWidth={3} /> Register New Agent
        </button>
      </div>

      {/* 2. GRID: HIGHLIGHTED WHITE TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map(agent => (
          <div 
            key={agent.agent_code} 
            className="bg-white border-2 border-black p-10 rounded-[3.5rem] shadow-[6px_6px_0px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
            onClick={() => { setSelectedAgent(agent); setEditedConfig({...agent}); }}
          >
            {/* Delete Button */}
            <button 
              onClick={(e) => handleDelete(e, agent)}
              className="absolute top-6 right-6 p-2.5 text-slate-300 hover:text-red-600 transition-colors border-2 border-transparent hover:border-black rounded-xl"
            >
              <Trash2 size={20} />
            </button>

            <div className="w-20 h-20 bg-slate-50 border-2 border-black rounded-[2rem] flex items-center justify-center text-black mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
              <Cpu size={36} />
            </div>

            <h3 className="text-xl font-black text-black uppercase italic tracking-tight">{agent.agent_code}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 mb-10">{agent.model}</p>
            
            <div className="w-full pt-8 border-t-2 border-black/5 flex justify-between items-center px-2">
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase italic tracking-widest">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse border border-black" /> Operational
                </div>
                <div className="p-3 border-2 border-black rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                    <Settings2 size={18} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ADD AGENT MODAL (HIGH CONTRAST) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreate} className="bg-white border-4 border-black w-full max-w-xl rounded-[4rem] p-12 space-y-8 shadow-[20px_20px_0px_rgba(0,0,0,0.2)] animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-black italic uppercase tracking-tighter">New_Node_Registration</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={32}/></button>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <InputField label="Agent Code (Unique ID)" value={newAgent.agent_code} onChange={v => setNewAgent({...newAgent, agent_code: v})} />
              <InputField label="Base Model" value={newAgent.model} onChange={v => setNewAgent({...newAgent, model: v})} />
              <div className="grid grid-cols-2 gap-5">
                <InputField label="Temperature" type="number" value={newAgent.temperature} onChange={v => setNewAgent({...newAgent, temperature: v})} />
                <InputField label="Type" value={newAgent.type} onChange={v => setNewAgent({...newAgent, type: v})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-4">Initial System Prompt</label>
                <textarea 
                  className="w-full h-32 bg-slate-50 border-2 border-black rounded-[2rem] p-6 text-sm font-bold outline-none focus:bg-white transition-all"
                  value={newAgent.system_prompt}
                  onChange={e => setNewAgent({...newAgent, system_prompt: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] border-2 border-black font-black text-xs uppercase tracking-[0.3em] shadow-[8px_8px_0px_#000] hover:bg-black transition-all active:shadow-none active:translate-y-1">
               Initialize_Neural_Agent
            </button>
          </form>
        </div>
      )}

      {/* 4. EDIT SIDE PANEL (HIGH CONTRAST) */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl h-full bg-white border-l-4 border-black p-12 flex flex-col animate-in slide-in-from-right shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b-2 border-black/5 pb-8">
              <div className="flex items-center gap-4">
                <Globe className="text-emerald-600" size={32} />
                <h3 className="text-3xl font-black text-black italic uppercase tracking-tighter">Config // {selectedAgent.agent_code}</h3>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-3 text-slate-400 hover:text-black hover:bg-slate-100 rounded-full transition-all"><X size={32}/></button>
            </div>
            
            <div className="flex-1 space-y-10 overflow-y-auto pr-6 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-4">System Instructions</label>
                <textarea 
                  className="w-full h-96 bg-slate-50 border-2 border-black rounded-[2.5rem] p-8 text-black font-bold text-sm outline-none focus:bg-white transition-all shadow-inner leading-relaxed"
                  value={editedConfig.system_prompt} 
                  onChange={e => setEditedConfig({...editedConfig, system_prompt: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <InputField label="Model Architecture" value={editedConfig.model} onChange={v => setEditedConfig({...editedConfig, model: v})} />
                <InputField label="Temperature" type="number" value={editedConfig.temperature} onChange={v => setEditedConfig({...editedConfig, temperature: v})} />
                <InputField label="Chunk Size" type="number" value={editedConfig.chunk_size} onChange={v => setEditedConfig({...editedConfig, chunk_size: v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest ml-4">RAG Status</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-black rounded-2xl p-4 text-xs font-black uppercase outline-none"
                    value={String(editedConfig.rag_enabled)} 
                    onChange={e => setEditedConfig({...editedConfig, rag_enabled: e.target.value === 'true'})}
                  >
                    <option value="true">Active_Agent_Link</option>
                    <option value="false">Disconnected</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)} className="mt-10 w-full bg-black py-6 rounded-[2rem] font-black text-xs text-white uppercase tracking-[0.4em] shadow-[8px_8px_0px_rgba(16,185,129,0.3)] hover:bg-emerald-600 transition-all active:translate-y-1 active:shadow-none">
               Commit_Agent_Update
            </button>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirm} 
        onCancel={() => setShowConfirm(false)} 
        onConfirm={handleUpdate} 
        original={selectedAgent} 
        edited={editedConfig} 
      />
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-4">{label}</label>
    <input 
      type={type} step={type === "number" ? "0.1" : undefined}
      className="w-full bg-slate-50 border-2 border-black rounded-2xl px-6 py-4 text-black font-bold text-xs outline-none focus:bg-white focus:ring-4 ring-emerald-500/5 transition-all shadow-inner"
      value={value} onChange={e => onChange(e.target.value)}
      required={true}
    />
  </div>
);

export default AgentOrchestrator;