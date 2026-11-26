import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Film, MessageCircle } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export const MobileNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-3 py-1.5 flex items-center justify-around select-none backdrop-blur-2xl bg-black/85">
      <NavLink
        to="/feed"
        onClick={() => soundEngine.playHapticClick()}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-all touch-spring ${
            isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Home className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        onClick={() => soundEngine.playHapticClick()}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-all touch-spring ${
            isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Compass className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Explore</span>
      </NavLink>

      {/* Center Floating Solar Saffron Shutter */}
      <NavLink
        to="/create"
        onClick={() => soundEngine.playHapticClick()}
        className="relative -top-3.5 p-3 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-[0_0_22px_rgba(245,158,11,0.55)] active:scale-95 transition-all duration-200 hover:scale-105"
        aria-label="Create Post"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </NavLink>

      <NavLink
        to="/reels"
        onClick={() => soundEngine.playHapticClick()}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-all touch-spring ${
            isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Film className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Reels</span>
      </NavLink>

      {/* Chat & In-Chat Games Tab */}
      <NavLink
        to="/direct"
        onClick={() => soundEngine.playHapticClick()}
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all touch-spring ${
            isActive ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 stroke-[2.2]" />
          {/* Active status indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
        </div>
        <span className="text-[10px] tracking-tight">Chat</span>
      </NavLink>
    </nav>
  );
};
