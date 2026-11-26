import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ShieldAlert,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { AuthModal } from '../auth/AuthModal';
import { soundEngine } from '../../lib/soundEngine';

export const Sidebar: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);

  const navItems = [
    { name: 'Feed', to: '/feed', icon: Home },
    { name: 'Explore', to: '/explore', icon: Compass },
    { name: 'Reels', to: '/reels', icon: Film, badge: 'NEW' },
    { name: 'Messages', to: '/direct', icon: MessageCircle },
    { name: 'Music Hub', to: '/music', icon: Music },
    { name: 'Arcade', to: '/games', icon: Gamepad2 },
    ...(currentUser
      ? [{ name: 'Profile', to: `/${currentUser.username}`, icon: User }]
      : []),
    ...(isAdmin
      ? [{ name: 'Admin Panel', to: '/admin', icon: ShieldAlert, badge: 'ADMIN' }]
      : []),
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    soundEngine.playHapticClick();
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Floating Spatial Sidebar Dock (visionOS Glass Material) */}
      <aside className="hidden md:flex flex-col fixed left-4 top-24 bottom-6 z-30 w-64 lg:w-72 rounded-[28px] liquid-glass-elevated p-5 select-none shadow-2xl">
        <div className="px-2 py-2 mb-2">
          <Logo size="md" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => soundEngine.playHapticClick()}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-[16px] text-xs font-semibold transition-all duration-200 group ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {/* Framer Motion Sliding Active Pill */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 rounded-[16px] bg-white/[0.12] border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.12)] -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive ? 'text-amber-400 bg-amber-400/10' : 'text-white/70 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 icon-pop-ambient" />
                  </div>
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      item.badge === 'ADMIN'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Studio CTA & Session Dock */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <NavLink
            to="/create"
            onClick={() => soundEngine.playPop()}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full font-semibold text-xs liquid-pill-cta"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Studio & Camera</span>
          </NavLink>

          {currentUser ? (
            <div className="flex items-center justify-between p-2 rounded-2xl liquid-glass-inner">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                  {currentUser.username.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">@{currentUser.username}</p>
                  <p className="text-[10px] text-white/40 truncate">{currentUser.displayName}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-white/40 hover:text-rose-400 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-full text-xs font-medium text-white/75 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </aside>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode="login" />
    </>
  );
};
