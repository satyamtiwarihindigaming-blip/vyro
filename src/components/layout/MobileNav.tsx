import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, Film, MessageCircle } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Feed', to: '/feed', icon: Home },
    { name: 'Explore', to: '/explore', icon: Compass },
    { name: 'Create', to: '/create', icon: Plus, isCta: true },
    { name: 'Reels', to: '/reels', icon: Film },
    { name: 'Chat', to: '/direct', icon: MessageCircle, hasBadge: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 liquid-glass-elevated rounded-full px-2 py-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom))] flex items-center justify-around select-none shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;

        if (item.isCta) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => soundEngine.playPop()}
              className="relative -top-2.5 p-3 rounded-full bg-white text-slate-950 shadow-[0_0_24px_rgba(255,255,255,0.4)] active:scale-90 transition-transform"
              aria-label="Create Post"
            >
              <Plus className="w-5 h-5 stroke-[2.8]" />
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => soundEngine.playHapticClick()}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-colors ${
              isActive ? 'text-white' : 'text-white/45 hover:text-white/80'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="mobileActivePill"
                className="absolute inset-0 rounded-full bg-white/15 -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.hasBadge && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-black" />
              )}
            </div>
            <span className="text-[9px] font-semibold tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
