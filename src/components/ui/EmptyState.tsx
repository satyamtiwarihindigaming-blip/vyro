import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`liquid-glass rounded-[28px] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
