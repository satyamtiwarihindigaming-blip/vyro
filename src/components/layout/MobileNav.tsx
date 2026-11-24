import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, Film, MessageCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-vyro-border/70 pb-safe px-3 py-2 flex items-center justify-around select-none">
      <NavLink
        to="/feed"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-vyro-primary' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-vyro-primary' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">Explore</span>
      </NavLink>

      {/* Center Floating Create Shutter */}
      <NavLink
        to="/create"
        className="relative -top-4 p-3 rounded-full bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan text-white shadow-glow-pink active:scale-95 transition-transform"
        aria-label="Create Post"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </NavLink>

      <NavLink
        to="/reels"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            isActive ? 'text-vyro-primary' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Film className="w-5 h-5" />
        <span className="text-[10px] font-medium">Reels</span>
      </NavLink>

      {isAdmin ? (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'
            }`
          }
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px] font-medium">Admin</span>
        </NavLink>
      ) : (
        <NavLink
          to="/direct"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              isActive ? 'text-vyro-primary' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Chat</span>
        </NavLink>
      )}
    </nav>
  );
};
