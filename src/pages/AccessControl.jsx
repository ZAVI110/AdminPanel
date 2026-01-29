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

  // Helper to normalize permission naming
  const getPName = (p) => (typeof p === 'object' ? p.name : p);

  // --- TRIGGERED BY ROLE DROPDOWN ---
  const handleRoleSelection = async (roleName) => {
    if (!roleName) {
        setSelectedRole(null);
        return;
    }
    setIsProcessing(true);
    try {
        const res = await userApi.getRoleByName(roleName);
        setSelectedRole(res.data); // Set A is updated
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  // --- TRIGGERED BY ADD/REMOVE BUTTONS ---
  const handleTogglePermission = async (permName, isAssigning) => {
    if (!selectedRole) return;
    setIsProcessing(true);
    try {
      let res;
      if (isAssigning) {
        // Hits POST /roles/{role}/assign-permission/{perm}
        res = await userApi.assignPermissionToRole(selectedRole.name, permName);
      } else {
        // Hits DELETE /roles/{role}/remove-permission/{perm}
        res = await userApi.removePermissionFromRole(selectedRole.name, permName);
      }

      // Since your backend returns the updated role object in the response body...
      const updatedRoleData = res.data;

      // ...we update the local state with that specific object.
      // This ensures Active Capabilities are updated instantly and correctly.
      setSelectedRole(updatedRoleData);
      
      // Keep the main roles list in sync
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

  if (loading) return <div className="p-40 text-center font-black italic text-indigo-600 animate-pulse uppercase tracking-[0.4em]">Establishing_Safe_Link...</div>;

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-8 transition-opacity ${isProcessing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl"><Fingerprint /></div>
          <div><h2 className="text-2xl font-black text-slate-900 italic uppercase">Access Control</h2><p className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase italic font-bold">Role-Permission Difference Engine</p></div>
        </div>
        <button onClick={() => setShowPermModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-indigo-700 transition-all">+ Register_Permission</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROLE PERMISSIONS BOX */}
        <div className="bg-white border border-slate-200 rounded-[3rem] p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600"><ShieldCheck size={20} /><h3 className="font-black uppercase italic text-slate-900">Role Capabilities</h3></div>
          
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono shadow-inner outline-none focus:border-indigo-400"
            onChange={(e) => handleRoleSelection(e.target.value)}
            value={selectedRole?.name || ""}
          >
            <option value="">-- Choose Role to Inspect --</option>
            {roles.map(r => <option key={r.name} value={r.name}>{r.name.toUpperCase()}</option>)}
          </select>

          {selectedRole ? (
            <div className="space-y-6">
               {/* SET A: ACTIVE CAPABILITIES */}
               <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <p className="text-[9px] font-black text-indigo-600 uppercase mb-4 tracking-widest">Active_Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.permissions?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-indigo-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 uppercase italic shadow-sm">
                        {getPName(p)}
                        <button onClick={() => handleTogglePermission(getPName(p), false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={12}/></button>
                      </div>
                    ))}
                    {(!selectedRole.permissions || selectedRole.permissions.length === 0) && (
                        <p className="text-[10px] text-slate-400 italic">No permissions assigned.</p>
                    )}
                  </div>
               </div>

               {/* SET G - A: AVAILABLE TO LINK */}
               <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Available_to_Link</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {globalPermissions
                      .filter(p => !selectedRole.permissions?.some(rp => getPName(rp) === getPName(p)))
                      .map(perm => (
                        <button 
                            key={getPName(perm)} 
                            onClick={() => handleTogglePermission(getPName(perm), true)} 
                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-400 transition-all flex justify-between items-center group active:scale-95 shadow-sm"
                        >
                          <span className="text-[10px] font-black text-slate-600 uppercase italic">{getPName(perm)}</span>
                          <Plus size={14} className="text-slate-200 group-hover:text-indigo-600" />
                        </button>
                    ))}
                  </div>
               </div>
            </div>
          ) : <div className="py-20 text-center opacity-10 flex flex-col items-center"><ShieldAlert size={64} /><p className="text-[10px] font-black uppercase mt-2">Select_Role_to_View_Diff</p></div>}
        </div>

        {/* USER ASSIGNMENT BOX */}
        <div className="bg-white border border-slate-200 rounded-[3rem] p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500"><UserCheck size={20} /><h3 className="font-black uppercase italic text-slate-900">User Assignment</h3></div>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono shadow-inner focus:border-emerald-400 outline-none"
            onChange={(e) => setSelectedUser(users.find(u => u.username === e.target.value))}
            value={selectedUser?.username || ""}
          >
            <option value="">-- Choose User --</option>
            {users.map(u => <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>)}
          </select>
          {selectedUser && (
            <div className="space-y-6">
               <div className="p-6 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-100 shadow-inner">
                  <p className="text-[9px] font-black text-emerald-600 uppercase mb-4 tracking-widest">Granted_Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles?.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-emerald-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 uppercase italic shadow-sm">
                        {typeof r === 'object' ? r.name : r}
                        <button onClick={() => handleUserRoleAction('remove', typeof r === 'object' ? r.name : r)} className="text-slate-300 hover:text-red-500"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase ml-1 tracking-widest">Available_Roles</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {roles.filter(role => !(selectedUser.roles || []).some(ur => (typeof ur === 'object' ? ur.name : ur) === role.name)).map(role => (
                      <button key={role.name} onClick={() => handleUserRoleAction('assign', role.name)} className="w-full p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-400 transition-all flex justify-between items-center group active:scale-95 shadow-sm">
                        <span className="text-[10px] font-black text-slate-600 uppercase">{role.name}</span>
                        <Plus size={14} className="text-slate-200 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
      
      {/* GLOBAL REGISTRY */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-8">
        <div className="flex items-center gap-3"><Database className="text-indigo-600" size={24} /><h3 className="text-xl font-black text-slate-900 italic uppercase">Global Permission Registry</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {globalPermissions.map(perm => (
            <div key={getPName(perm)} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] relative group hover:border-indigo-200 transition-all shadow-inner">
               <button onClick={async () => { await userApi.deletePermission(getPName(perm)); initialSystemLoad(); }} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
               <h4 className="text-[11px] font-black text-slate-800 uppercase italic mb-1">{getPName(perm)}</h4>
               <p className="text-[9px] text-slate-400 font-mono line-clamp-2 uppercase leading-tight">{perm.description || "No description provided."}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showPermModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={async (e) => { e.preventDefault(); await userApi.createPermission(newPerm); setShowPermModal(false); initialSystemLoad(); }} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-900 italic uppercase mb-8">Registry_Entry</h3>
            <input placeholder="Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm mb-4 outline-none focus:border-indigo-400" onChange={e => setNewPerm({...newPerm, name: e.target.value})} required />
            <textarea placeholder="Description" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm mb-8 outline-none h-24 shadow-inner" onChange={e => setNewPerm({...newPerm, description: e.target.value})} />
            <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700">Add to Registry</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AccessControl;