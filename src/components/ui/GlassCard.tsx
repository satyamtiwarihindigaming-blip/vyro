import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  variant?: 'base' | 'raised' | 'highlight';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  elevated = false,
  interactive = false,
  variant = 'base',
  className = '',
  ...props
}) => {
  const variantStyles = {
    base: 'bg-[#0B101D]/70 border-white/[0.08]',
    raised: 'bg-[#0F172A]/80 border-white/[0.12]',
    highlight: 'bg-gradient-to-b from-[#0F172A]/90 to-[#0B101D]/90 border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.08)]',
  }[variant];

  return (
    <div
      className={`relative rounded-3xl p-4 sm:p-5 backdrop-blur-xl border shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] ${variantStyles} ${
        interactive
          ? 'hover:border-amber-500/35 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.7),0_0_16px_rgba(245,158,11,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
          : ''
      } ${elevated ? 'shadow-2xl' : ''} ${className}`}
      {...props}
    >
      {/* Top-left specular highlight rim */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none rounded-t-3xl" />
      {children}
    </div>
  );
};
