import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-vyro-primary/50 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-vyro-primary hover:bg-vyro-primaryHover text-white shadow-glow-purple',
    secondary: 'bg-vyro-card hover:bg-vyro-cardHover text-slate-200 border border-vyro-border',
    outline: 'border border-vyro-border hover:border-vyro-primary text-slate-300 hover:text-white bg-transparent',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
    gradient: 'bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan hover:opacity-95 text-white shadow-glow-pink',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
    icon: 'p-2 rounded-full aspect-square',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
