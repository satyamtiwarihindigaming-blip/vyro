import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Compass,
  Film,
  PlusSquare,
  MessageCircle,
  Music,
  Gamepad2,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const profileUsername = currentUser?.username || 'nova';

  const navItems = [
    { name: 'Feed', to: '/feed', icon: Home },
    { name: 'Explore', to: '/explore', icon: Compass },
    { name: 'Reels', to: '/reels', icon: Film, badge: 'HOT' },
    { name: 'Messages', to: '/direct', icon: MessageCircle, unread: 2 },
    { name: 'Music Hub', to: '/music', icon: Music },
    { name: 'Arcade', to: '/games', icon: Gamepad2 },
    { name: 'Profile', to: `/${profileUsername}`, icon: User },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen sticky top-0 bg-vyro-bg/95 border-r border-vyro-border/70 p-5 z-40 select-none">
      <div className="px-2 py-4">
        <Logo size="md" />
      </div>

      <nav className="flex-1 mt-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-vyro-primary/15 text-vyro-primary border border-vyro-primary/30 shadow-glow-purple/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-vyro-accent to-rose-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              {item.unread && (
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-vyro-primary text-white rounded-full">
                  {item.unread}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Create Studio CTA */}
      <div className="pt-4 border-t border-vyro-border/70 space-y-3">
        <NavLink
          to="/create"
          className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan hover:opacity-95 shadow-glow-pink transition-all duration-200 active:scale-95"
        >
          <PlusSquare className="w-5 h-5" />
          <span>Studio & Camera</span>
        </NavLink>

        {/* Pro Banner / Ethos */}
        <div className="p-3 rounded-xl bg-vyro-card/60 border border-vyro-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-vyro-accent/20 flex items-center justify-center text-vyro-accent">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Zero Spyware</p>
            <p className="text-slate-400 text-[11px]">Free, Private & Fast</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
