import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SPRING_SNAPPY } from '../../lib/motion';
import { soundEngine } from '../../lib/soundEngine';

export interface TactileButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'saffron' | 'glass' | 'outline' | 'ghost' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold tracking-tight rounded-full select-none focus:outline-none disabled:opacity-40 disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-bold',
  }[size];

  const variantStyles = {
    primary: 'liquid-pill-cta',
    saffron:
      'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-300/50',
    glass:
      'bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md shadow-sm',
    outline:
      'bg-transparent hover:bg-white/10 text-white/90 hover:text-white border border-white/25',
    ghost:
      'bg-transparent hover:bg-white/10 text-white/70 hover:text-white border-transparent',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm',
  }[variant];

  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1.5, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={SPRING_SNAPPY}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
      onClick={(e) => {
        soundEngine.playHapticClick();
        if (props.onClick) props.onClick(e);
      }}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </motion.button>
  );
};
