import React from 'react';
import { Link } from 'react-router-dom';
import { soundEngine } from '../../lib/soundEngine';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  onLogoClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, onLogoClick }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg tracking-wider',
    md: 'text-2xl tracking-widest',
    lg: 'text-3xl tracking-[0.2em]',
    xl: 'text-4xl tracking-[0.25em]',
  };

  const handleClick = (e: React.MouseEvent) => {
    soundEngine.playHapticClick();
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      className="flex items-center gap-3 group select-none focus:outline-none"
      title="VYRO — 1B Creator Platform"
    >
      {/* Aerodynamic Prismatic Monogram Insignia */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center flex-shrink-0`}>
        {/* Dynamic Backlight Halo Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan rounded-2xl blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 will-change-transform" />

        {/* Outer Titanium Facet Border */}
        <div className="relative w-full h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-white/40 via-vyro-primary/60 to-vyro-cyan/50 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Animated Specular Shimmer Sweep */}
          <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

          {/* Deep AMOLED Obsidian Core Well */}
          <div className="w-full h-full bg-vyro-bg/95 rounded-[14px] flex items-center justify-center relative overflow-hidden">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4/5 h-4/5 transform group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_12px_rgba(139,92,246,0.6)]"
            >
              <defs>
                {/* Outer Wing Gradient */}
                <linearGradient id="vyro-wing-left" x1="6" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E2E8F0" />
                  <stop offset="0.5" stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#EC4899" />
                </linearGradient>

                <linearGradient id="vyro-wing-right" x1="42" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="0.5" stopColor="#06B6D4" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>

                {/* Inner Optical Prism Gradient */}
                <linearGradient id="vyro-prism" x1="24" y1="14" x2="24" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F43F5E" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>

                {/* Core Laser Node Radial Glow */}
                <radialGradient id="vyro-core-glow" cx="24" cy="20" r="6" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00F0FF" />
                  <stop offset="0.6" stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Left Aerodynamic Wing */}
              <path
                d="M8 10L24 40L21 40L5 13C4.5 12 5 10 6.5 10H8Z"
                fill="url(#vyro-wing-left)"
              />

              {/* Right Aerodynamic Wing */}
              <path
                d="M40 10L24 40L27 40L43 13C43.5 12 43 10 41.5 10H40Z"
                fill="url(#vyro-wing-right)"
              />

              {/* Stereoscopic Inner Wing Ribbons */}
              <path
                d="M14 11L24 33L19 33L11 15C10.5 14 11 12 12.5 11H14Z"
                fill="url(#vyro-prism)"
                opacity="0.9"
              />
              <path
                d="M34 11L24 33L29 33L37 15C37.5 14 37 12 35.5 11H34Z"
                fill="url(#vyro-wing-right)"
                opacity="0.9"
              />

              {/* Central Kinetic Creator Node */}
              <circle cx="24" cy="20" r="5" fill="url(#vyro-core-glow)" className="animate-pulse" />
              <circle cx="24" cy="20" r="2.2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      </div>

      {/* Typography with Sub-Pixel Kinetic Spacing */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-vyro-accent drop-shadow-sm ${textSizes[size]}`}
          >
            VYRO
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-[10px] uppercase font-bold tracking-[0.35em] text-vyro-cyan/90 -mt-1">
              OS • 1B CREATOR PLATFORM
            </span>
          ) : null}
        </div>
      )}
    </Link>
  );
};
