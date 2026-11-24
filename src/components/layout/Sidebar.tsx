import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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

export const Sidebar: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
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
    logout();
    navigate('/');
  };

  return (
    <>
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
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold text-white rounded-full ${
                      item.badge === 'ADMIN'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-gradient-to-r from-vyro-accent to-rose-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Create Studio CTA & Session Info */}
        <div className="pt-4 border-t border-vyro-border/70 space-y-3">
          <NavLink
            to="/create"
            className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan hover:opacity-95 shadow-glow-pink transition-all duration-200 active:scale-95"
          >
            <PlusSquare className="w-5 h-5" />
            <span>Studio & Camera</span>
          </NavLink>

          {currentUser ? (
            <div className="p-3 rounded-xl bg-vyro-card/60 border border-vyro-border flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    @{currentUser.username}
                  </p>
                  <VerifiedBadge
                    isVerified={currentUser.isVerified}
                    isPro={currentUser.isPro}
                    proBadge={currentUser.proBadge}
                  />
                </div>
                <p className="text-[10px] text-slate-400 truncate capitalize">
                  {currentUser.role} Account
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-vyro-card hover:bg-vyro-cardHover border border-vyro-border text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4 text-vyro-primary" />
              <span>Sign In / Join VYRO</span>
            </button>
          )}
        </div>
      </aside>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode="login" />
    </>
  );
};
