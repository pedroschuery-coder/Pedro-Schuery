
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">R$</span>
        <input
          id={id}
          {...props}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        />
      </div>
    </div>
  );
};
