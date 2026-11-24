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
        <span title="Verified Account (Blue Tick)" className="inline-flex items-center">
          <BadgeCheck
            className={`${iconSize} text-sky-400 fill-sky-500/20 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]`}
          />
        </span>
      )}
      {isPro && (
        <span
          title="VYRO Pro Creator Features Unlocked"
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-vyro-primary via-vyro-accent to-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-glow-purple/40"
        >
          <Crown className="w-2.5 h-2.5" />
          <span>{proBadge || 'PRO'}</span>
        </span>
      )}
    </span>
  );
};
