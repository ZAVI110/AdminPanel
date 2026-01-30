import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { ShieldCheck, ShieldAlert, UserCheck, Plus, Trash2, Fingerprint, X, Database } from 'lucide-react';

const AccessControl = () => {
  const [roles, setRoles] = useState([]);
  const [globalPermissions, setGlobalPermissions] = useState([]); // The Global Set (G)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null); // The Assigned Set (A)
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
      alert("Backend sync failed. Is the permission deleted from global registry?");
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

  if (loading) return <div className="p-40 text-center font-black italic text-black animate-pulse uppercase tracking-[0.4em]">Establishing_Safe_Link...</div>;

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-10 transition-opacity ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      
      {/* 1. TOPOGRAPHIC BANNER (ENGRO GREEN BG, BLACK TEXT) */}
      <div className="banner-engro-green w-full p-16 rounded-[2.5rem] border-2 border-black flex flex-col justify-center min-h-[250px] relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter leading-none">Access Control</h2>
          <p className="text-black font-bold text-xl mt-2 opacity-80 italic">Role-Permission Difference Engine</p>
        </div>
      </div>

      <div className="flex justify-end px-4">
        <button 
          onClick={() => setShowPermModal(true)} 
          className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase shadow-[6px_6px_0px_#000] border-2 border-black hover:bg-black transition-all active:translate-y-1 active:shadow-none"
        >
          + Register_New_Capability
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ROLE PERMISSIONS BOX: HIGHLIGHTED WHITE TILE */}
        <div className="bg-white border-2 border-black p-10 rounded-[3.5rem] space-y-8 shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 text-black">
            <ShieldCheck size={28} className="text-emerald-600" />
            <h3 className="text-xl font-black uppercase italic tracking-tight">Role Capabilities</h3>
          </div>
          
          <select 
            className="w-full bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-black uppercase tracking-widest outline-none focus:bg-emerald-50 focus:border-emerald-600 transition-all cursor-pointer"
            onChange={(e) => handleRoleSelection(e.target.value)}
            value={selectedRole?.name || ""}
          >
            <option value="">-- Choose Role to Inspect --</option>
            {roles.map(r => <option key={r.name} value={r.name}>{r.name.toUpperCase()}</option>)}
          </select>

          {selectedRole ? (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* SET A: ACTIVE CAPABILITIES */}
               <div className="p-8 bg-emerald-50/30 rounded-[2.5rem] border-2 border-black border-dashed">
                  <p className="text-[10px] font-black text-emerald-700 uppercase mb-5 tracking-[0.2em] italic">Active_Capabilities</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedRole.permissions?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white border-2 border-black px-4 py-2 rounded-xl shadow-sm">
                        <span className="text-[11px] font-black text-black uppercase italic">{getPName(p)}</span>
                        <button onClick={() => handleTogglePermission(getPName(p), false)} className="text-slate-300 hover:text-red-600 transition-colors"><X size={14} strokeWidth={3}/></button>
                      </div>
                    ))}
                    {(!selectedRole.permissions || selectedRole.permissions.length === 0) && (
                        <p className="text-[11px] text-slate-400 font-bold italic">No permissions assigned to this node.</p>
                    )}
                  </div>
               </div>

               {/* SET G - A: AVAILABLE TO LINK */}
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Available_Registry</p>
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-4 custom-scrollbar">
                    {globalPermissions
                      .filter(p => !selectedRole.permissions?.some(rp => getPName(rp) === getPName(p)))
                      .map(perm => (
                        <button 
                            key={getPName(perm)} 
                            onClick={() => handleTogglePermission(getPName(perm), true)} 
                            className="w-full p-5 bg-white border-2 border-black rounded-2xl hover:border-emerald-600 hover:-translate-y-1 transition-all flex justify-between items-center group shadow-sm active:scale-95"
                        >
                          <span className="text-[11px] font-black text-black uppercase italic">{getPName(perm)}</span>
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-black flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Plus size={16} strokeWidth={3} />
                          </div>
                        </button>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
            <div className="py-24 text-center opacity-20 flex flex-col items-center">
                <ShieldAlert size={80} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase mt-4 tracking-[0.3em]">Selection_Required</p>
            </div>
          )}
        </div>

        {/* USER ASSIGNMENT BOX: HIGHLIGHTED WHITE TILE */}
        <div className="bg-white border-2 border-black p-10 rounded-[3.5rem] space-y-8 shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 text-black">
            <UserCheck size={28} className="text-emerald-600" />
            <h3 className="text-xl font-black uppercase italic tracking-tight">User Assignment</h3>
          </div>
          
          <select 
            className="w-full bg-slate-50 border-2 border-black rounded-2xl p-6 text-sm font-black uppercase tracking-widest outline-none focus:bg-emerald-50 focus:border-emerald-600 transition-all cursor-pointer shadow-inner"
            onChange={(e) => setSelectedUser(users.find(u => u.username === e.target.value))}
            value={selectedUser?.username || ""}
          >
            <option value="">-- Choose User Identity --</option>
            {users.map(u => <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>)}
          </select>

          {selectedUser && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-black border-dashed">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-5 tracking-[0.2em] italic">Granted_Roles</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedUser.roles?.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white border-2 border-black px-4 py-2 rounded-xl shadow-sm">
                        <span className="text-[11px] font-black text-black uppercase italic">{typeof r === 'object' ? r.name : r}</span>
                        <button onClick={() => handleUserRoleAction('remove', typeof r === 'object' ? r.name : r)} className="text-slate-300 hover:text-red-600 transition-colors"><X size={14} strokeWidth={3}/></button>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Grant_New_Role</p>
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-4 custom-scrollbar">
                    {roles.filter(role => !(selectedUser.roles || []).some(ur => (typeof ur === 'object' ? ur.name : ur) === role.name)).map(role => (
                      <button 
                        key={role.name} 
                        onClick={() => handleUserRoleAction('assign', role.name)} 
                        className="w-full p-5 bg-white border-2 border-black rounded-2xl hover:border-emerald-600 hover:-translate-y-1 transition-all flex justify-between items-center group shadow-sm active:scale-95"
                      >
                        <span className="text-[11px] font-black text-black uppercase">{role.name}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-black flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* GLOBAL REGISTRY: HIGHLIGHTED WHITE TILE */}
      <div className="bg-white border-2 border-black rounded-[3.5rem] p-12 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Database size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-black italic uppercase tracking-tighter">Global Permission Registry</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Core Capability Metadata</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {globalPermissions.map(perm => (
            <div key={getPName(perm)} className="bg-slate-50 border-2 border-black p-8 rounded-[2.5rem] relative group hover:bg-white hover:shadow-xl transition-all duration-300">
               <button onClick={async () => { if(window.confirm("Delete Global?")) { await userApi.deletePermission(getPName(perm)); initialSystemLoad(); } }} className="absolute top-6 right-6 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={18}/></button>
               <h4 className="text-[12px] font-black text-black uppercase italic mb-2 tracking-tight">{getPName(perm)}</h4>
               <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight">{perm.description || "No metadata provided."}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: BLACK OUTLINED */}
      {showPermModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <form 
            onSubmit={async (e) => { 
              e.preventDefault(); 
              setIsProcessing(true);
              await userApi.createPermission(newPerm); 
              setShowPermModal(false); 
              initialSystemLoad(); 
              setIsProcessing(false);
            }} 
            className="bg-white border-4 border-black rounded-[4rem] p-16 w-full max-w-2xl shadow-[20px_20px_0px_rgba(0,0,0,0.2)] animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-black text-black italic uppercase tracking-tighter">New_Capability</h3>
                <button type="button" onClick={() => setShowPermModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all"><X size={32}/></button>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-black uppercase ml-4 tracking-[0.2em]">Permission Identifier</label>
                    <input placeholder="E.G. ACCESS_ADMIN_PANEL" className="w-full bg-slate-50 border-2 border-black rounded-3xl p-6 text-sm font-black uppercase outline-none focus:bg-white focus:ring-4 ring-emerald-500/10 transition-all" onChange={e => setNewPerm({...newPerm, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-black uppercase ml-4 tracking-[0.2em]">Description / Scope</label>
                    <textarea placeholder="Describe the authority level..." className="w-full bg-slate-50 border-2 border-black rounded-[2.5rem] p-8 text-sm font-bold h-32 outline-none focus:bg-white transition-all" onChange={e => setNewPerm({...newPerm, description: e.target.value})} />
                </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white py-8 mt-10 rounded-[2.5rem] border-2 border-black font-black text-sm uppercase tracking-[0.3em] shadow-[8px_8px_0px_#000] hover:bg-black transition-all active:shadow-none active:translate-y-1">
                Commit_To_Registry
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccessControl;