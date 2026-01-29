import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate authentication
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <GlassCard className="w-full max-w-md p-10 border-indigo-500/20 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center mb-4">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Engro <span className="text-indigo-400">Core</span></h1>
          <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase mt-2">Secure_Admin_Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Credentials_ID</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-indigo-500/40 outline-none transition-all"
              placeholder="admin@engro.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Security_Key</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-white font-mono text-sm focus:border-indigo-500/40 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-xs tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_40px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 uppercase group"
          >
            Authenticate <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-mono uppercase tracking-widest">Encrypted_End_to_End</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;