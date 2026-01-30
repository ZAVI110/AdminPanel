import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { 
  ShieldCheck, ShieldAlert, UserCheck, Plus, 
  Trash2, Fingerprint, X, Database, ArrowLeft 
} from 'lucide-react';

const AccessControl = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [globalPermissions, setGlobalPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermModal, setShowPermModal] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', description: '' });

  useEffect(() => { initialSystemLoad(); }, []);

  const initialSystemLoad = async () => {
    try {
      const [rRes, pRes, uRes] = await Promise.all([
        userApi.getRoles(),
        userApi.getPermissions(),
        userApi.getAll()
      ]);
      setRoles(rRes.data || []);
      setGlobalPermissions(pRes.data || []);
      setUsers(uRes.data || []);
    } catch (e) { console.error("Sync Error", e); }
    finally { setLoading(false); }
  };

  const getPName = (p) => (typeof p === 'object' ? p.name : p);

  const handleRoleSelection = async (roleName) => {
    if (!roleName) {
        setSelectedRole(null);
        return;
    }
    setIsProcessing(true);
    try {
        const res = await userApi.getRoleByName(roleName);
        setSelectedRole(res.data); 
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  const handleTogglePermission = async (permName, isAssigning) => {
    if (!selectedRole) return;
    setIsProcessing(true);
    try {
      let res;
      if (isAssigning) {
        res = await userApi.assignPermissionToRole(selectedRole.name, permName);
      } else {
        res = await userApi.removePermissionFromRole(selectedRole.name, permName);
      }
      const updatedRoleData = res.data;
      setSelectedRole(updatedRoleData);
      setRoles(prev => prev.map(r => r.name === updatedRoleData.name ? updatedRoleData : r));
    } catch (e) {
      console.error("Action Failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserRoleAction = async (action, roleName) => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      if (action === 'assign') await userApi.assignRolesToUser(selectedUser.username, [roleName]);
      else await userApi.removeRolesFromUser(selectedUser.username, [roleName]);
      const uRes = await userApi.getAll();
      const freshUsers = uRes.data || [];
      setUsers(freshUsers);
      setSelectedUser(freshUsers.find(u => u.username === selectedUser.username));
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  if (loading) return <div className="p-40 text-center font-black text-engro-forest animate-pulse uppercase tracking-[0.4em]">Establishing_Safe_Link...</div>;

  return (
    <div className={`p-8 max-w-[1600px] mx-auto space-y-10 transition-opacity duration-300 ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      
      {/* 1. TOPOGRAPHIC BANNER - Matched to Dashboard */}
      <div className="engro-central-banner min-h-[260px] flex items-center justify-between border-none shadow-sm">
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter mb-2 text-[#0b4f18]">Access Control</h1>
          <p className="text-xl font-medium text-[#0b4f18] opacity-90">Role-Permission Governance Engine</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-2 bg-white/20 hover:bg-white/40 text-[#0b4f18] px-6 py-3 rounded-2xl font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-slate-800">System Permissions</h2>
        <button 
          onClick={() => setShowPermModal(true)} 
          className="bg-[#10b981] text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Register New Capability
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ROLE PERMISSIONS BOX */}
        <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] space-y-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><ShieldCheck size={24} /></div>
            <h3 className="text-xl font-bold">Role Capabilities</h3>
          </div>
          
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20 transition-all cursor-pointer"
            onChange={(e) => handleRoleSelection(e.target.value)}
            value={selectedRole?.name || ""}
          >
            <option value="">-- Choose Role to Inspect --</option>
            {roles.map(r => <option key={r.name} value={r.name}>{r.name.toUpperCase()}</option>)}
          </select>

          {selectedRole ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-700 uppercase mb-4 tracking-widest">Active Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.permissions?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:border-red-200 transition-all group">
                        <span className="text-[11px] font-bold text-slate-700 uppercase">{getPName(p)}</span>
                        <button onClick={() => handleTogglePermission(getPName(p), false)} className="text-slate-300 group-hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Available Registry</p>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {globalPermissions
                      .filter(p => !selectedRole.permissions?.some(rp => getPName(rp) === getPName(p)))
                      .map(perm => (
                        <button 
                            key={getPName(perm)} 
                            onClick={() => handleTogglePermission(getPName(perm), true)} 
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all flex justify-between items-center group shadow-sm"
                        >
                          <span className="text-xs font-bold text-slate-600 uppercase">{getPName(perm)}</span>
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Plus size={16} />
                          </div>
                        </button>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
            <div className="py-24 text-center opacity-20 flex flex-col items-center">
                <ShieldAlert size={80} />
                <p className="text-xs font-bold uppercase mt-4 tracking-widest">Selection Required</p>
            </div>
          )}
        </div>

        {/* USER ASSIGNMENT BOX */}
        <div className="bg-white border border-slate-100 p-10 rounded-[2.5rem] space-y-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-800">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><UserCheck size={24} /></div>
            <h3 className="text-xl font-bold">User Assignment</h3>
          </div>
          
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20 transition-all cursor-pointer"
            onChange={(e) => setSelectedUser(users.find(u => u.username === e.target.value))}
            value={selectedUser?.username || ""}
          >
            <option value="">-- Choose User Identity --</option>
            {users.map(u => <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>)}
          </select>

          {selectedUser && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Granted Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles?.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm group">
                        <span className="text-[11px] font-bold text-slate-700 uppercase">{typeof r === 'object' ? r.name : r}</span>
                        <button onClick={() => handleUserRoleAction('remove', typeof r === 'object' ? r.name : r)} className="text-slate-300 group-hover:text-red-500 transition-colors"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Grant New Role</p>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {roles.filter(role => !(selectedUser.roles || []).some(ur => (typeof ur === 'object' ? ur.name : ur) === role.name)).map(role => (
                      <button 
                        key={role.name} 
                        onClick={() => handleUserRoleAction('assign', role.name)} 
                        className="w-full p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all flex justify-between items-center group shadow-sm"
                      >
                        <span className="text-xs font-bold text-slate-600 uppercase">{role.name}</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Plus size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* GLOBAL REGISTRY */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0b4f18] rounded-xl flex items-center justify-center text-white shadow-md">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Global Permission Registry</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Core Capability Metadata</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {globalPermissions.map(perm => (
            <div key={getPName(perm)} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl relative group hover:bg-white hover:shadow-md transition-all duration-300">
               <button onClick={async () => { if(window.confirm("Delete Global?")) { await userApi.deletePermission(getPName(perm)); initialSystemLoad(); } }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
               <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">{getPName(perm)}</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{perm.description || "No metadata provided."}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showPermModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <form 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              setIsProcessing(true);
              await userApi.createPermission(newPerm); 
              setShowPermModal(false); 
              initialSystemLoad(); 
              setIsProcessing(false);
            }} 
            className="bg-white rounded-[2.5rem] p-12 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Register Capability</h3>
                <button type="button" onClick={() => setShowPermModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Permission Identifier</label>
                    <input placeholder="E.G. ACCESS_ADMIN_PANEL" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20 transition-all" onChange={e => setNewPerm({...newPerm, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1">Description / Scope</label>
                    <textarea placeholder="Describe the authority level..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium h-24 outline-none focus:ring-2 ring-emerald-500/20 transition-all resize-none" onChange={e => setNewPerm({...newPerm, description: e.target.value})} />
                </div>
            </div>

            <button type="submit" className="w-full bg-[#10b981] text-white py-4 mt-8 rounded-2xl font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] transition-all">
                Commit to Registry
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccessControl;