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
        <label htmlFor={inputId} className="block text-xs font-medium tracking-tight text-white/60">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-white/45 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-white/[0.07] border text-white placeholder-white/40 rounded-2xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:border-white/40 focus:bg-white/[0.11] focus:ring-2 focus:ring-white/15 ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-rose-400/80 bg-rose-500/[0.06]' : 'border-white/15 hover:border-white/25'} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-300 font-medium animate-fadeIn">{error}</p>
      )}
    </div>
  );
};
