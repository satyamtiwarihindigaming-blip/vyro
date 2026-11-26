import React, { useRef } from 'react';

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
  onMouseMove,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current.style.setProperty('--mouse-x', `${x}px`);
      cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
    onMouseMove?.(e);
  };

  const variantStyles = {
    base: '',
    raised: 'border-white/25',
    highlight: 'border-amber-400/35 shadow-[0_0_30px_rgba(245,158,11,0.12)]',
  }[variant];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`${elevated ? 'liquid-glass-elevated' : 'liquid-glass'} p-5 sm:p-6 ${variantStyles} ${
        interactive
          ? 'cursor-pointer hover:-translate-y-1 hover:border-white/30 transition-all duration-300'
          : ''
      } ${className}`}
      {...props}
    >
      {/* Specular highlight rim */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
