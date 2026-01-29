import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';

const ConfirmModal = ({ isOpen, onCancel, onConfirm, original, edited }) => {
  if (!isOpen || !original || !edited) return null;

  // 1. Logic to find EXACTLY what changed
  const diffs = Object.keys(edited).filter(key => {
    // Compare as strings to avoid issues with number vs string types
    return String(original[key]) !== String(edited[key]);
  });

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-indigo-500/30 bg-white p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Review_Changes</h4>
            <p className="text-[10px] text-slate-400 uppercase font-mono">System Modification Protocol</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <p className="text-slate-600 text-xs font-medium">The following parameters will be updated in the Core Database:</p>
          
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-h-60 overflow-y-auto space-y-4">
            {diffs.length > 0 ? diffs.map(key => (
              <div key={key} className="space-y-1">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{key.replace('_', ' ')}</span>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-red-400 line-through truncate max-w-[100px]">{String(original[key]) || 'NULL'}</span>
                  <ArrowRight size={12} className="text-slate-300" />
                  <span className="text-emerald-600 font-bold truncate max-w-[150px]">{String(edited[key])}</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-[10px] text-center italic">No detectable changes found in buffer.</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600">Abort</button>
          <button 
            disabled={diffs.length === 0}
            onClick={onConfirm} 
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50"
          >
            Confirm_Push
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;