import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentApi } from '../api/agentApi';
import ConfirmModal from '../components/ConfirmModal';
import { Cpu, Trash2, X, Globe, Plus, AlertCircle, Save, Settings2, ArrowLeft } from 'lucide-react';

const AgentOrchestrator = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editedConfig, setEditedConfig] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
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
        load();
      } catch (err) {
        alert("DELETE_FAILED");
      }
    }
  };

  if (loading) return <div className="p-40 text-center font-black text-engro-forest animate-pulse uppercase tracking-[0.5em]">Interrogating_Agent_Grid...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. TOPOGRAPHIC BANNER */}
      <div className="engro-central-banner min-h-[260px] flex items-center justify-between border-none shadow-sm px-16">
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter mb-2 text-[#0b4f18]">AI Agent Nodes</h1>
          <p className="text-xl font-medium text-[#0b4f18] opacity-90">Active Agent Nodes & Configurations</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-2 bg-white/20 hover:bg-white/40 text-[#0b4f18] px-6 py-3 rounded-2xl font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-slate-800">Agent Registry</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#10b981] text-white px-8 py-5 rounded-2xl font-bold text-xs uppercase shadow-sm hover:bg-[#0b4f18] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Register New Agent
        </button>
      </div>

      {/* 2. GRID: CLEAN WHITE TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map(agent => (
          <div 
            key={agent.agent_code} 
            className="bg-white border border-slate-100 p-10 rounded-[3.5rem] shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
            onClick={() => { setSelectedAgent(agent); setEditedConfig({...agent}); }}
          >
            <button 
              onClick={(e) => handleDelete(e, agent)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={20} />
            </button>

            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-500 mb-8 group-hover:bg-[#10b981] group-hover:text-white transition-all duration-500">
              <Cpu size={36} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{agent.agent_code}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 mb-10">{agent.model}</p>
            
            <div className="w-full pt-8 border-t border-slate-50 flex justify-between items-center px-2">
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" /> Operational
                </div>
                <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Settings2 size={18} />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ADD AGENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-bold text-slate-800 tracking-tighter">Initialize Node</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400"><X size={32}/></button>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <InputField label="Agent Code (Unique ID)" value={newAgent.agent_code} onChange={v => setNewAgent({...newAgent, agent_code: v})} />
              <InputField label="Base Model" value={newAgent.model} onChange={v => setNewAgent({...newAgent, model: v})} />
              <div className="grid grid-cols-2 gap-5">
                <InputField label="Temperature" type="number" value={newAgent.temperature} onChange={v => setNewAgent({...newAgent, temperature: v})} />
                <InputField label="Type" value={newAgent.type} onChange={v => setNewAgent({...newAgent, type: v})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Initial System Prompt</label>
                <textarea 
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-sm font-medium outline-none focus:ring-2 ring-emerald-500/10 transition-all resize-none"
                  value={newAgent.system_prompt}
                  onChange={e => setNewAgent({...newAgent, system_prompt: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#10b981] text-white py-6 rounded-[2rem] font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] transition-all">
                Initialize Neural Agent
            </button>
          </form>
        </div>
      )}

      {/* 4. EDIT SIDE PANEL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl h-full bg-white rounded-[3rem] p-12 flex flex-col animate-in slide-in-from-right shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-[#10b981] rounded-xl"><Globe size={28} /></div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">Config // {selectedAgent.agent_code}</h3>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-3 text-slate-400 hover:bg-slate-50 rounded-full transition-all"><X size={32}/></button>
            </div>
            
            <div className="flex-1 space-y-10 overflow-y-auto pr-6 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-4">System Instructions</label>
                <textarea 
                  className="w-full h-80 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 text-slate-700 font-medium text-sm outline-none focus:ring-2 ring-emerald-500/10 transition-all resize-none leading-relaxed"
                  value={editedConfig.system_prompt} 
                  onChange={e => setEditedConfig({...editedConfig, system_prompt: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <InputField label="Model Architecture" value={editedConfig.model} onChange={v => setEditedConfig({...editedConfig, model: v})} />
                <InputField label="Temperature" type="number" value={editedConfig.temperature} onChange={v => setEditedConfig({...editedConfig, temperature: v})} />
                <InputField label="Chunk Size" type="number" value={editedConfig.chunk_size} onChange={v => setEditedConfig({...editedConfig, chunk_size: v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">RAG Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold uppercase outline-none focus:ring-2 ring-emerald-500/10"
                    value={String(editedConfig.rag_enabled)} 
                    onChange={e => setEditedConfig({...editedConfig, rag_enabled: e.target.value === 'true'})}
                  >
                    <option value="true">Active Agent Link</option>
                    <option value="false">Disconnected</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)} className="mt-10 w-full bg-[#10b981] text-white py-6 rounded-[2rem] font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] transition-all">
                Commit Agent Update
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
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <input 
      type={type} step={type === "number" ? "0.1" : undefined}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 font-bold text-xs outline-none focus:ring-2 ring-emerald-500/10 transition-all shadow-sm"
      value={value} onChange={e => onChange(e.target.value)}
      required={true}
    />
  </div>
);

export default AgentOrchestrator;