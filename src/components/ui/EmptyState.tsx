import React from 'react';

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
      className={`glass-panel rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4 border border-white/10 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-extrabold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-glow-sm hover:brightness-110 active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
