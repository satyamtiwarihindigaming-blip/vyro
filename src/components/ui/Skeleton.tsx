import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', circle = false, ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-white/[0.06] border border-white/[0.04] ${
        circle ? 'rounded-full' : 'rounded-2xl'
      } ${className}`}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
};
