import React from 'react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-indigo-500/30 transition-all duration-500 ${className}`}>
    {children}
  </div>
);

export default GlassCard;