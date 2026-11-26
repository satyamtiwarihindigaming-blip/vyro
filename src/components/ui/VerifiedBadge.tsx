import React from 'react';
import { BadgeCheck, Crown } from 'lucide-react';

export interface VerifiedBadgeProps {
  isVerified?: boolean;
  isPro?: boolean;
  proBadge?: string;
  size?: 'sm' | 'md';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified,
  isPro,
  proBadge,
  size = 'sm',
}) => {
  if (!isVerified && !isPro) return null;

  const iconSize = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';

  return (
    <span className="inline-flex items-center gap-1 select-none">
      {isVerified && (
        <span title="Verified Creator" className="inline-flex items-center">
          <BadgeCheck
            className={`${iconSize} text-sky-400 fill-sky-400/20 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]`}
          />
        </span>
      )}
      {isPro && (
        <span
          title="VYRO Pro Creator"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-semibold tracking-wide backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.25)]"
        >
          <Crown className="w-2.5 h-2.5" />
          <span>{proBadge || 'PRO'}</span>
        </span>
      )}
    </span>
  );
};
