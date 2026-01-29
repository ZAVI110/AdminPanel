import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users as UsersIcon, Bot, Zap } from 'lucide-react';

const Sidebar = () => (
  <aside className="w-72 bg-slate-950 border-r border-white/5 flex flex-col sticky top-0 h-screen">
    <div className="p-8 mb-10 flex items-center gap-3">
      <div className="w-10 h-10 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white"><Zap size={24} fill="white" /></div>
      <h1 className="text-xl font-black text-white italic tracking-tighter">ENGRO <span className="text-indigo-400 font-light">CORE</span></h1>
    </div>
    <nav className="flex-1 px-4 space-y-2">
      <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Neural_Dashboard" />
      <NavItem to="/users" icon={<UsersIcon size={20}/>} label="User_Directory" />
      <NavItem to="/agents" icon={<Bot size={20}/>} label="Agent_Orchestrator" />
    </nav>
  </aside>
);

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${isActive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    {icon} <span>{label}</span>
  </NavLink>
);

export const Layout = () => (
  <div className="flex min-h-screen">
    <Sidebar />
    <main className="flex-1 bg-slate-950"><Outlet /></main>
  </div>
);