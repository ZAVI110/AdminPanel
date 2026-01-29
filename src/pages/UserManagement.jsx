import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import ConfirmModal from '../components/ConfirmModal';
import { 
  UserPlus, Search, Trash2, UserCircle, X, ShieldCheck, 
  Save, Loader2, Award, ArrowDownAZ, LayoutGrid
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('alpha'); 

  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [newUser, setNewUser] = useState({
    email: '', username: '', name: '', is_active: true,
    department: '', title: '', employeenumber: '',
    company: '', division: '', role_ids: []
  });

  useEffect(() => { 
    load(); 
    fetchRoles();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.getAll();
      const data = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setUsers(data);
    } catch (e) { 
      setUsers([]); 
    } finally { setLoading(false); }
  };

  const fetchRoles = async () => {
    try {
      const res = await userApi.getRoles();
      const roleData = Array.isArray(res.data) ? res.data : (res.data?.roles || []);
      setRoles(roleData);
    } catch (e) { console.error("Roles fetch error", e); }
  };

  // Helper to safely get role name for rendering or logic
  const getRoleName = (role) => {
    if (!role) return "";
    return typeof role === 'object' ? role.name : role;
  };

  const handleAssignRole = async (roleName) => {
    if (!selectedUser || !roleName) return;
    if (window.confirm(`Assign [${roleName}] to ${selectedUser.username}?`)) {
      try {
        await userApi.assignRole(roleName, selectedUser.username);
        await load();
        setSelectedUser(null); // Close panel to refresh state
        alert("ROLE_ASSIGNED");
      } catch (err) { alert("ASSIGN_FAILED"); }
    }
  };

  const handleRemoveRole = async (roleName) => {
    if (!selectedUser || !roleName) return;
    if (window.confirm(`Remove [${roleName}] from ${selectedUser.username}?`)) {
      try {
        await userApi.removeRole(roleName, selectedUser.username);
        await load();
        setSelectedUser(null); // Close panel to refresh state
        alert("ROLE_REMOVED");
      } catch (err) { alert("REMOVE_FAILED"); }
    }
  };

  const handleUpdate = async () => {
    try {
      await userApi.update(selectedUser.id, editedUser);
      setShowConfirm(false);
      setSelectedUser(null);
      await load();
      alert("UPDATED_SUCCESSFULLY");
    } catch (err) { alert("UPDATE_FAILED"); }
  };

  const getProcessedUsers = () => {
    let result = [...users].filter(user => {
      const s = search.toLowerCase();
      return (user?.name || "").toLowerCase().includes(s) || (user?.username || "").toLowerCase().includes(s);
    });

    if (sortBy === 'alpha') {
      return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      return result.sort((a, b) => {
        const roleA = getRoleName(a.roles?.[0]) || "ZZZZ";
        const roleB = getRoleName(b.roles?.[0]) || "ZZZZ";
        return roleA.localeCompare(roleB);
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 italic uppercase">User Registry</h2>
          <p className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase mt-1">Status: Secure_Connection_Active</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setSortBy('alpha')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${sortBy === 'alpha' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>A-Z</button>
            <button onClick={() => setSortBy('role')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${sortBy === 'role' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>BY ROLE</button>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
            <UserPlus size={18} /> ADD_USER
          </button>
        </div>
      </div>

      {/* 2. SEARCH */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          className="w-full bg-white border border-slate-200 rounded-[2rem] py-6 pl-16 pr-6 text-sm font-mono outline-none shadow-sm focus:border-indigo-400 transition-all"
          placeholder="QUERY_USER_DATABASE..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 3. GRID */}
      {loading ? (
        <div className="py-40 text-center font-mono text-indigo-500 animate-pulse uppercase tracking-[0.2em]">Syncing_Nodes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getProcessedUsers().map(user => (
            <div key={user.id || user.username} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setSelectedUser(user); setEditedUser({ ...user }); }}>
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    <UserCircle size={28}/>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase italic text-sm leading-tight">{user.name || user.username}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles?.map((r, i) => (
                        <span key={i} className="text-[7px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                          {getRoleName(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-mono uppercase italic">{user.username}</span>
                <ShieldCheck className={user.is_active ? "text-emerald-500" : "text-slate-200"} size={16} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. SIDE PANEL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-end p-4">
          <div className="w-full max-w-xl h-full bg-white rounded-[3rem] p-10 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 italic uppercase">Manage: {selectedUser.username}</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
              {/* ROLE MANAGEMENT */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Award size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Security_Roles</h4>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles?.map((role, idx) => {
                    const rName = getRoleName(role);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-indigo-100 pl-3 pr-1 py-1 rounded-xl shadow-sm">
                        <span className="text-[10px] font-black text-indigo-600 uppercase italic">{rName}</span>
                        <button onClick={() => handleRemoveRole(rName)} className="p-1 hover:text-red-500 text-slate-300 transition-colors"><X size={14}/></button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                  <select 
                    onChange={(e) => {
                       if(e.target.value) handleAssignRole(e.target.value);
                       e.target.value = "";
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono outline-none"
                  >
                    <option value="">+ Assign_Capability</option>
                    {roles.map(roleObj => {
                      const rName = getRoleName(roleObj);
                      // Don't show if user already has it
                      if ((selectedUser.roles || []).some(existing => getRoleName(existing) === rName)) return null;
                      return (
                        <option key={roleObj.id || rName} value={rName}>
                          {rName.toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* INPUTS */}
              <div className="space-y-4">
                {['name', 'email', 'department', 'title'].map(field => (
                  <div key={field} className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{field}</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono focus:border-indigo-400 outline-none" 
                      value={editedUser[field] || ''} 
                      onChange={e => setEditedUser({...editedUser, [field]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)} className="mt-8 w-full bg-indigo-600 py-5 rounded-[1.5rem] font-black text-xs text-white shadow-xl hover:bg-indigo-700 flex items-center justify-center gap-2 uppercase tracking-widest transition-all">
              <Save size={18} /> Update_Core_Metrics
            </button>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            userApi.create(newUser).then(() => { setShowCreate(false); load(); alert("CREATED"); });
          }} className="bg-white rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-slate-900 italic uppercase">Personnel_Registry</h3>
            <div className="grid grid-cols-2 gap-6">
              <input placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono shadow-inner" onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              <input placeholder="Username" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono shadow-inner" onChange={e => setNewUser({...newUser, username: e.target.value})} required />
              <input placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono shadow-inner col-span-2" onChange={e => setNewUser({...newUser, email: e.target.value})} required />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 text-slate-400 font-bold text-[10px] uppercase">Abort</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl">Initialize</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal isOpen={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={handleUpdate} original={selectedUser} edited={editedUser} />
    </div>
  );
};

export default UserManagement;