import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">
      {label}
    </label>
    <input
      className={`w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all outline-none ${className}`}
      {...props}
    />
  </div>
);