import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import ConfirmModal from '../components/ConfirmModal';
import { 
  UserPlus, Search, Trash2, UserCircle, X, ShieldCheck, 
  Save, Loader2, Award, ArrowDownAZ, LayoutGrid, Activity
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
        setSelectedUser(null);
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
        setSelectedUser(null);
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

  if (loading) return <div className="p-40 text-center font-black text-black animate-pulse uppercase tracking-[0.4em] italic">Interrogating_Personnel_Database...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. TOPOGRAPHIC BANNER (ENGRO GREEN BG, BLACK TEXT) */}
      <div className="banner-engro-green w-full p-16 rounded-[2.5rem] border-2 border-black flex flex-col justify-center min-h-[220px] shadow-lg">
        <h2 className="text-5xl font-black text-black italic uppercase tracking-tighter leading-none">Personnel Registry</h2>
        <p className="text-black font-bold text-xl mt-3 opacity-80 italic">Authorized System Identity Management</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* 2. SEARCH: HIGHLIGHTED WHITE TILE */}
        <div className="relative w-full md:max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={20} strokeWidth={3} />
          <input 
            className="w-full bg-white border-2 border-black rounded-[2rem] py-6 pl-16 pr-6 text-sm font-black uppercase tracking-widest outline-none shadow-[6px_6px_0px_rgba(0,0,0,0.05)] focus:border-emerald-600 transition-all"
            placeholder="QUERY_USER_DATABASE..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex bg-white border-2 border-black p-1.5 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.05)]">
            <button onClick={() => setSortBy('alpha')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'alpha' ? 'bg-black text-white shadow-md' : 'text-black hover:bg-slate-50'}`}>A-Z</button>
            <button onClick={() => setSortBy('role')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'role' ? 'bg-black text-white shadow-md' : 'text-black hover:bg-slate-50'}`}>BY ROLE</button>
          </div>
          <button 
            onClick={() => setShowCreate(true)} 
            className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase shadow-[6px_6px_0px_#000] border-2 border-black hover:bg-black transition-all active:translate-y-1 active:shadow-none flex items-center gap-2"
          >
            <UserPlus size={18} strokeWidth={3} /> INITIALIZE_USER
          </button>
        </div>
      </div>

      {/* 3. USER GRID: HIGHLIGHTED WHITE TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {getProcessedUsers().map(user => (
          <div key={user.id || user.username} className="bg-white border-2 border-black p-8 rounded-[3rem] shadow-[6px_6px_0px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5 cursor-pointer" onClick={() => { setSelectedUser(user); setEditedUser({ ...user }); }}>
                <div className="w-16 h-16 bg-slate-50 border-2 border-black rounded-[1.5rem] flex items-center justify-center text-black group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                  <UserCircle size={32}/>
                </div>
                <div>
                  <h4 className="font-black text-black uppercase italic text-lg leading-tight tracking-tight">{user.name || user.username}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {user.roles?.map((r, i) => (
                      <span key={i} className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-black uppercase tracking-tighter shadow-sm">
                        {getRoleName(r)}
                      </span>
                    ))}
                    {(!user.roles || user.roles.length === 0) && <span className="text-[8px] text-slate-300 font-bold uppercase tracking-tighter italic">No Roles Found</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t-2 border-black/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-black font-black uppercase tracking-widest">{user.username}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{user.department || 'GEN_OPS'}</span>
              </div>
              <div className={`p-3 rounded-xl border-2 border-black shadow-sm ${user.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. SIDE PANEL (HIGH CONTRAST) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-end p-4 animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white border-l-4 border-black p-12 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-10 pb-8 border-b-2 border-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-lg"><UserCircle size={28}/></div>
                <h3 className="text-2xl font-black text-black italic uppercase tracking-tighter leading-none">Manage // {selectedUser.username}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 hover:text-black transition-all"><X size={32}/></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar">
              {/* ROLE MANAGEMENT SECTION */}
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-black space-y-6 shadow-inner relative overflow-hidden">
                <div className="flex items-center gap-3 text-emerald-700">
                  <Award size={20} strokeWidth={3} />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] italic">Authority_Matrix</h4>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {selectedUser.roles?.map((role, idx) => {
                    const rName = getRoleName(role);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-white border-2 border-black pl-4 pr-2 py-2 rounded-xl shadow-sm">
                        <span className="text-[11px] font-black text-black uppercase italic">{rName}</span>
                        <button onClick={() => handleRemoveRole(rName)} className="p-1 hover:text-red-600 text-slate-300 transition-colors"><X size={14} strokeWidth={3}/></button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-black/10">
                  <select 
                    onChange={(e) => {
                       if(e.target.value) handleAssignRole(e.target.value);
                       e.target.value = "";
                    }}
                    className="w-full bg-white border-2 border-black rounded-2xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:bg-emerald-50 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">+ Assign_Capability</option>
                    {roles.map(roleObj => {
                      const rName = getRoleName(roleObj);
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

              {/* INPUT FIELDS */}
              <div className="space-y-6">
                {['name', 'email', 'department', 'title'].map(field => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-4">{field}</label>
                    <input 
                      className="w-full bg-slate-50 border-2 border-black rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white transition-all shadow-inner" 
                      value={editedUser[field] || ''} 
                      onChange={e => setEditedUser({...editedUser, [field]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)} className="mt-10 w-full bg-emerald-600 py-6 rounded-[2rem] border-2 border-black font-black text-xs text-white shadow-[8px_8px_0px_#000] hover:bg-black flex items-center justify-center gap-3 uppercase tracking-[0.3em] transition-all active:translate-y-1 active:shadow-none">
              <Save size={20} strokeWidth={3} /> Sync_Personnel_Data
            </button>
          </div>
        </div>
      )}

      {/* CREATE MODAL (HIGH CONTRAST) */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            userApi.create(newUser).then(() => { setShowCreate(false); load(); alert("CREATED"); });
          }} className="bg-white border-4 border-black rounded-[4rem] p-16 w-full max-w-2xl shadow-[20px_20px_0px_rgba(0,0,0,0.2)] space-y-10 animate-in zoom-in-95">
            <h3 className="text-4xl font-black text-black italic uppercase tracking-tighter">Initialize_Personnel</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-1 space-y-2">
                 <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Legal Name</label>
                 <input placeholder="Full Name" className="w-full bg-slate-50 border-2 border-black rounded-3xl p-6 text-sm font-bold outline-none focus:bg-white transition-all" onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              </div>
              <div className="col-span-1 space-y-2">
                 <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Identifier</label>
                 <input placeholder="Username" className="w-full bg-slate-50 border-2 border-black rounded-3xl p-6 text-sm font-bold outline-none focus:bg-white transition-all" onChange={e => setNewUser({...newUser, username: e.target.value})} required />
              </div>
              <div className="col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-black uppercase ml-4 tracking-widest">Auth Endpoint</label>
                 <input placeholder="Email Address" className="w-full bg-slate-50 border-2 border-black rounded-3xl p-6 text-sm font-bold outline-none focus:bg-white transition-all shadow-inner" onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              </div>
            </div>
            <div className="flex gap-6 pt-6">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-black transition-colors">Abort_Creation</button>
              <button type="submit" className="flex-[2] bg-emerald-600 text-white py-6 rounded-[2rem] border-2 border-black font-black text-sm uppercase tracking-[0.3em] shadow-[8px_8px_0px_#000] hover:bg-black transition-all active:translate-y-1 active:shadow-none">Initialize_Registry</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal isOpen={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={handleUpdate} original={selectedUser} edited={editedUser} />
    </div>
  );
};

export default UserManagement;