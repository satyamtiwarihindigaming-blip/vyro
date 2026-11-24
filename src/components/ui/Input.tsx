import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-vyro-card/80 border text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-vyro-primary/50 focus:border-vyro-primary ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-500' : 'border-vyro-border hover:border-slate-600'} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-400 animate-fadeIn">{error}</p>
      )}
    </div>
  );
};
