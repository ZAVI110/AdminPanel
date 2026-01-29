import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Wrench, FileText, Zap, LogOut, Fingerprint } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => { 
    localStorage.removeItem('isAuthenticated'); 
    navigate('/login'); 
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 z-50">
      <div className="p-8 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight italic">
          ADMIN<span className="text-indigo-600">.PANEL </span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
        <NavItem to="/users" icon={<Users size={20}/>} label="Users" />
        
        {/* Added Access Control Navigation */}
        <NavItem to="/access" icon={<Fingerprint size={20}/>} label="Access Control" />
        
        <NavItem to="/agents" icon={<Shield size={20}/>} label="Agents" />
        <NavItem to="/tools" icon={<Wrench size={20}/>} label="Agent Tools" />
        <NavItem to="/logs" icon={<FileText size={20}/>} label="Agent Logs" />
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all w-full px-4 py-3 font-bold text-sm">
          <LogOut size={18} /> Terminate_Session
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${
      isActive 
        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}
  >
    {icon} <span>{label}</span>
  </NavLink>
);

export default Sidebar;