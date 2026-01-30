import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import ConfirmModal from '../components/ConfirmModal';
import { 
  UserPlus, Search, Trash2, UserCircle, X, ShieldCheck, 
  Save, Loader2, Award, ArrowDownAZ, LayoutGrid, Activity, ArrowLeft
} from 'lucide-react';

const UserManagement = () => {
  const navigate = useNavigate();
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
      } catch (err) { alert("REMOVE_FAILED"); }
    }
  };

  const handleUpdate = async () => {
    try {
      await userApi.update(selectedUser.id, editedUser);
      setShowConfirm(false);
      setSelectedUser(null);
      await load();
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

  if (loading) return <div className="p-40 text-center font-black text-engro-forest animate-pulse uppercase tracking-[0.4em]">Interrogating_Personnel_Database...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* 1. TOPOGRAPHIC BANNER */}
      <div className="engro-central-banner min-h-[260px] flex items-center justify-between border-none shadow-sm px-16">
        <div className="relative z-10">
          <h1 className="text-6xl font-black tracking-tighter mb-2 text-[#0b4f18]">Personnel Registry</h1>
          <p className="text-xl font-medium text-[#0b4f18] opacity-90">Authorized System Identity Management</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-2 bg-white/20 hover:bg-white/40 text-[#0b4f18] px-6 py-3 rounded-2xl font-bold transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        {/* 2. SEARCH TILE */}
        <div className="relative w-full md:max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            className="w-full bg-white border border-slate-100 rounded-[2rem] py-6 pl-16 pr-6 text-sm font-bold uppercase tracking-widest outline-none shadow-sm focus:ring-2 ring-emerald-500/10 transition-all"
            placeholder="QUERY_USER_DATABASE..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {/* GREEN A-Z BUTTONS */}
          <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
            <button 
              onClick={() => setSortBy('alpha')} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'alpha' ? 'bg-[#10b981] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              A-Z
            </button>
            <button 
              onClick={() => setSortBy('role')} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'role' ? 'bg-[#10b981] text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              BY ROLE
            </button>
          </div>
          <button 
            onClick={() => setShowCreate(true)} 
            className="bg-[#10b981] text-white px-8 py-5 rounded-2xl font-bold text-xs uppercase shadow-sm hover:bg-[#0b4f18] transition-all flex items-center gap-2"
          >
            <UserPlus size={18} /> Initialize User
          </button>
        </div>
      </div>

      {/* 3. USER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {getProcessedUsers().map(user => (
          <div key={user.id || user.username} className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5 cursor-pointer" onClick={() => { setSelectedUser(user); setEditedUser({ ...user }); }}>
                <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-500 group-hover:bg-[#10b981] group-hover:text-white transition-all">
                  <UserCircle size={32}/>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-lg leading-tight tracking-tight">{user.name || user.username}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {user.roles?.map((r, i) => (
                      <span key={i} className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                        {getRoleName(r)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.username}</span>
                <span className="text-[11px] text-slate-600 font-bold uppercase mt-0.5">{user.department || 'GEN_OPS'}</span>
              </div>
              <div className={`p-3 rounded-xl ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. SIDE PANEL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-end p-4 animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white rounded-[3rem] p-12 flex flex-col shadow-2xl animate-in slide-in-from-right overflow-hidden">
            <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white"><UserCircle size={28}/></div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Manage // {selectedUser.username}</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-all"><X size={32}/></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 text-[#10b981]">
                  <Award size={20} />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Authority Matrix</h4>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles?.map((role, idx) => {
                    const rName = getRoleName(role);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-slate-100 pl-4 pr-2 py-2 rounded-xl shadow-sm">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">{rName}</span>
                        <button onClick={() => handleRemoveRole(rName)} className="p-1 hover:text-red-500 text-slate-300 transition-colors"><X size={14} /></button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-200/50">
                  <select 
                    onChange={(e) => {
                       if(e.target.value) handleAssignRole(e.target.value);
                       e.target.value = "";
                    }}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 ring-emerald-500/10 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">+ Assign Capability</option>
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

              <div className="space-y-6">
                {['name', 'email', 'department', 'title'].map(field => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">{field}</label>
                    <input 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all" 
                      value={editedUser[field] || ''} 
                      onChange={e => setEditedUser({...editedUser, [field]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)} className="mt-10 w-full bg-[#10b981] text-white py-6 rounded-[2rem] font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] flex items-center justify-center gap-3 transition-all">
              <Save size={20} /> Sync Personnel Data
            </button>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            userApi.create(newUser).then(() => { setShowCreate(false); load(); });
          }} className="bg-white rounded-[4rem] p-16 w-full max-w-2xl shadow-2xl space-y-10 animate-in zoom-in-95">
            <h3 className="text-4xl font-bold text-slate-800 tracking-tighter">Initialize Personnel</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-1 space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Legal Name</label>
                 <input placeholder="Full Name" className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              </div>
              <div className="col-span-1 space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Identifier</label>
                 <input placeholder="Username" className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewUser({...newUser, username: e.target.value})} required />
              </div>
              <div className="col-span-2 space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Auth Endpoint</label>
                 <input placeholder="Email Address" className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold outline-none focus:bg-white focus:ring-2 ring-emerald-500/10 transition-all" onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              </div>
            </div>
            <div className="flex gap-6 pt-6">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Abort Creation</button>
              <button type="submit" className="flex-[2] bg-[#10b981] text-white py-6 rounded-[2rem] font-bold text-sm uppercase shadow-sm hover:bg-[#0b4f18] transition-all">Initialize Registry</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal isOpen={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={handleUpdate} original={selectedUser} edited={editedUser} />
    </div>
  );
};

export default UserManagement;