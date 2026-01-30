import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, Wrench, FileText, LogOut, Fingerprint } from 'lucide-react';
import engroLogo from '../assets/engro-logo.png'; // Make sure the logo is in your assets folder

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => { 
    localStorage.removeItem('isAuthenticated'); 
    navigate('/login'); 
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 z-50">
      <div className="p-8 mb-4 flex flex-col gap-3">
        {/* LOGO REPLACEMENT */}
        <img src={engroLogo} alt="Engro" className="w-32 mb-2" />
        <div className="h-1 w-12 bg-emerald-500 rounded-full" />
        <h1 className="text-xl font-black text-slate-900 tracking-tighter italic mt-2">
          ADMIN<span className="text-emerald-600">.PANEL</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" />
        <NavItem to="/users" icon={<Users size={20}/>} label="Users" />
        <NavItem to="/access" icon={<Fingerprint size={20}/>} label="Access Control" />
        <NavItem to="/agents" icon={<Shield size={20}/>} label="Agents" />
        <NavItem to="/tools" icon={<Wrench size={20}/>} label="Agent Tools" />
        <NavItem to="/logs" icon={<FileText size={20}/>} label="Agent Logs" />
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all w-full px-4 py-3 font-bold text-sm uppercase tracking-widest">
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
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50 shadow-sm shadow-emerald-50 italic' 
        : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'
    }`}
  >
    {icon} <span>{label}</span>
  </NavLink>
);

export default Sidebar;