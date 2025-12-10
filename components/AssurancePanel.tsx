import React from 'react';
import { Button } from './Button';

interface AssurancePanelProps {
  toc: string[];
  docTitle: string;
  onConfirm: () => void;
  onRetake: () => void;
}

export const AssurancePanel: React.FC<AssurancePanelProps> = ({ toc, docTitle, onConfirm, onRetake }) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Analysis Complete</h2>
        <p className="text-zinc-400">
          We've successfully parsed <span className="text-yellow-400">{docTitle}</span>. 
          Please verify the structure below.
        </p>
      </div>

      <div className="bg-zinc-900 border border-yellow-400/30 rounded-xl overflow-hidden shadow-[0_0_30px_-10px_rgba(250,204,21,0.1)]">
        <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-6 py-3 flex items-center justify-between">
          <span className="text-yellow-400 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Structure Detected
          </span>
          <span className="text-zinc-500 text-xs">{toc.length} Sections Found</span>
        </div>
        
        <div className="p-6 max-h-[300px] overflow-y-auto">
          {toc.length > 0 ? (
            <ul className="space-y-3">
              {toc.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-zinc-300 text-sm group">
                  <span className="text-yellow-500/50 mt-1 font-mono text-xs">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="group-hover:text-white transition-colors border-b border-transparent group-hover:border-zinc-700 pb-0.5">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-zinc-500 italic">No explicit headers found, but full text is available for query.</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Button variant="outline" onClick={onRetake}>
          Upload Different File
        </Button>
        <Button onClick={onConfirm} className="min-w-[160px]">
          Proceed to Chat
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Button>
      </div>
    </div>
  );
};