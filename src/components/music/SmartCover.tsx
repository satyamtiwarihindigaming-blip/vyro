import React, { useState } from 'react';
import { Disc3, Music2 } from 'lucide-react';

interface SmartCoverProps {
  src?: string;
  title: string;
  artist?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showVinylGrooves?: boolean;
}

// Procedural aesthetic gradient generator based on song title hash
const GRADIENT_PALETTES = [
  'from-violet-600 via-indigo-700 to-slate-900',
  'from-amber-600 via-rose-700 to-purple-950',
  'from-cyan-600 via-blue-700 to-slate-950',
  'from-emerald-600 via-teal-800 to-zinc-950',
  'from-rose-600 via-pink-700 to-neutral-950',
  'from-fuchsia-600 via-purple-800 to-slate-950',
  'from-orange-500 via-red-700 to-stone-950',
  'from-indigo-500 via-sky-700 to-slate-900',
];

function getPaletteIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % GRADIENT_PALETTES.length;
}

export const SmartCover: React.FC<SmartCoverProps> = ({
  src,
  title,
  artist,
  className = 'w-11 h-11 rounded-2xl',
  showVinylGrooves = true,
}) => {
  const [hasError, setHasError] = useState(false);

  // If no source or failed to load, render deterministic procedural vinyl cover
  if (!src || hasError) {
    const palette = GRADIENT_PALETTES[getPaletteIndex(title + (artist || ''))];
    const initials = title
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'VY';

    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${palette} border border-white/15 flex items-center justify-center select-none shadow-lg ${className}`}
        title={`${title}${artist ? ` - ${artist}` : ''}`}
      >
        {/* Vinyl record procedural micro-grooves */}
        {showVinylGrooves && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-[85%] h-[85%] rounded-full border border-white/20" />
            <div className="absolute w-[65%] h-[65%] rounded-full border border-white/15" />
            <div className="absolute w-[45%] h-[45%] rounded-full border border-white/20" />
            <div className="absolute w-[25%] h-[25%] rounded-full bg-black/40 border border-white/30" />
          </div>
        )}

        {/* Specular sheen reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

        {/* Dynamic center glyph / initials */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-1">
          <Music2 className="w-4 h-4 text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mb-0.5" />
          <span className="text-[10px] font-bold text-white tracking-wider leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {initials}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`object-cover border border-white/10 shrink-0 shadow-md ${className}`}
    />
  );
};
