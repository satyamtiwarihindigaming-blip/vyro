import React from 'react';
import { Loader2 } from 'lucide-react';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'saffron' | 'glass' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'saffron',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-tight rounded-2xl select-none tactile-press transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-extrabold',
  }[size];

  const variantStyles = {
    saffron:
      'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:brightness-110 active:shadow-inner border border-amber-400/40',
    glass:
      'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 backdrop-blur-md shadow-md',
    outline:
      'bg-transparent hover:bg-white/5 text-slate-200 hover:text-white border border-white/20 hover:border-amber-500/50',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border-transparent',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
