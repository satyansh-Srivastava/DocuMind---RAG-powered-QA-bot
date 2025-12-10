import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-3 select-none ${className}`}>
    {/* Icon: Minimal frame with a core accent */}
    <div className="w-6 h-6 border border-zinc-600 rounded bg-zinc-900 flex items-center justify-center shadow-sm">
      <div className="w-2 h-2 bg-yellow-400 rounded-[1px] shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
    </div>
    
    {/* Text: Modern, wide tracking */}
    <span className="text-lg tracking-[0.2em] font-medium text-zinc-100">
      DOCU<span className="text-yellow-400 font-bold">MIND</span>
    </span>
  </div>
);