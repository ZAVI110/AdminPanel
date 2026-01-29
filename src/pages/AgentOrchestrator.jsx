import React, { useState, useEffect } from 'react';
import { agentApi } from '../api/agentApi';
import ConfirmModal from '../components/ConfirmModal';
import { Cpu, Trash2, X, Globe, Plus, AlertCircle, Save } from 'lucide-react';

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
    e.stopPropagation(); // Prevents opening the side panel
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

  if (loading) return <div className="p-20 text-center font-mono text-indigo-600 animate-pulse uppercase tracking-[0.5em]">Syncing_Nodes...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">List of Agent</h2>
          <p className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase mt-2">Active Neural Nodes</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg"
        >
          <Plus size={16} /> Register New Agent
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div 
            key={agent.agent_code} 
            className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm hover:border-indigo-400 transition-all group cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
            onClick={() => { setSelectedAgent(agent); setEditedConfig({...agent}); }}
          >
            {/* Delete Button */}
            <button 
              onClick={(e) => handleDelete(e, agent)}
              className="absolute top-6 right-6 p-2 text-slate-200 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>

            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <Cpu size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{agent.agent_code}</h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1 mb-8">{agent.model}</p>
            <div className="flex items-center justify-center gap-2 text-emerald-500 text-[9px] font-black uppercase">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Operational
            </div>
          </div>
        ))}
      </div>

      {/* ADD AGENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreate} className="bg-white w-full max-w-xl rounded-[3rem] p-10 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">New_Node_Registration</h3>
              <button type="button" onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <InputField label="Agent Code (Unique ID)" value={newAgent.agent_code} onChange={v => setNewAgent({...newAgent, agent_code: v})} />
              <InputField label="Base Model" value={newAgent.model} onChange={v => setNewAgent({...newAgent, model: v})} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Temperature" type="number" value={newAgent.temperature} onChange={v => setNewAgent({...newAgent, temperature: v})} />
                <InputField label="Type" value={newAgent.type} onChange={v => setNewAgent({...newAgent, type: v})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial System Prompt</label>
                <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-mono outline-none"
                  value={newAgent.system_prompt}
                  onChange={e => setNewAgent({...newAgent, system_prompt: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">
               Initialize_Neural_Agent
            </button>
          </form>
        </div>
      )}

      {/* EDIT SIDE PANEL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl h-full bg-white border-l border-slate-200 p-10 flex flex-col animate-in slide-in-from-right rounded-l-[3.5rem] shadow-2xl">
            <div className="flex justify-between items-center mb-10 border-b pb-6">
              <div className="flex items-center gap-3">
                <Globe className="text-indigo-600" size={24} />
                <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">Config // {selectedAgent.agent_code}</h3>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">System Instructions</label>
                <textarea 
                  className="w-full h-80 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-slate-700 font-mono text-xs outline-none focus:border-indigo-400 shadow-inner"
                  value={editedConfig.system_prompt} 
                  onChange={e => setEditedConfig({...editedConfig, system_prompt: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InputField label="Model Architecture" value={editedConfig.model} onChange={v => setEditedConfig({...editedConfig, model: v})} />
                <InputField label="Temperature" type="number" value={editedConfig.temperature} onChange={v => setEditedConfig({...editedConfig, temperature: v})} />
                <InputField label="Chunk Size" type="number" value={editedConfig.chunk_size} onChange={v => setEditedConfig({...editedConfig, chunk_size: v})} />
                <InputField label="RAG Status" value={String(editedConfig.rag_enabled)} onChange={v => setEditedConfig({...editedConfig, rag_enabled: v === 'true'})} />
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)} className="mt-8 w-full bg-slate-900 py-5 rounded-2xl font-black text-xs text-white uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all">
               Commit_Neural_Update
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
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} step={type === "number" ? "0.1" : undefined}
      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-900 font-mono text-xs outline-none focus:border-indigo-400 transition-all shadow-inner"
      value={value} onChange={e => onChange(e.target.value)}
      required={true}
    />
  </div>
);

export default AgentOrchestrator;