import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { SPRING_SNAPPY } from '../../lib/motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger';
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
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-full select-none focus:outline-none disabled:opacity-40 disabled:pointer-events-none transition-colors';

  const variants = {
    primary: 'liquid-pill-cta',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md shadow-sm',
    outline: 'border border-white/20 hover:border-white/40 text-white/90 hover:text-white bg-transparent',
    ghost: 'text-white/70 hover:text-white hover:bg-white/10 bg-transparent',
    gradient: 'liquid-pill-cta',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 font-semibold',
    icon: 'p-2.5 rounded-full aspect-square',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1.5, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={SPRING_SNAPPY}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : null}
      {children}
    </motion.button>
  );
};
