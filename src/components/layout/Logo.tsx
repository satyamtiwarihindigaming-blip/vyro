import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link to="/" className="flex items-center gap-2.5 group select-none">
      {/* Original Geometric V-Orb Glyphic Logo */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 blur-sm opacity-70" />
        <div className="relative w-full h-full bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan rounded-xl p-[2px] shadow-glow-purple">
          <div className="w-full h-full bg-vyro-bg rounded-[10px] flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5/6 h-5/6 text-white group-hover:scale-110 transition-transform duration-300"
            >
              {/* Dynamic stylized V with pulse node */}
              <path
                d="M7 8L16 25L25 8"
                stroke="url(#vyro-grad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="14" r="3" fill="#EC4899" className="animate-pulse" />
              <defs>
                <linearGradient id="vyro-grad" x1="7" y1="8" x2="25" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B5CF6" />
                  <stop offset="0.5" stopColor="#EC4899" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {showText && (
        <span className={`font-extrabold tracking-wider ${textSizes[size]} gradient-text-primary`}>
          VYRO
        </span>
      )}
    </Link>
  );
};
