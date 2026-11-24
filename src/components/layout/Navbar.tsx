import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Music, Gamepad2 } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { currentUser } = useAuth();
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-vyro-border/60 px-4 py-3 flex items-center justify-between">
      {/* Brand Logo (Visible on mobile & tablet) */}
      <div className="flex items-center gap-4">
        <Logo size="sm" />
      </div>

      {/* Global Quick Search */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search creators, CC0 music, or #vibes..."
            className="w-full bg-vyro-card/80 border border-vyro-border rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Link to Music & Games on Mobile Header */}
        <Link
          to="/music"
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Music"
        >
          <Music className="w-5 h-5" />
        </Link>
        <Link
          to="/games"
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Games"
        >
          <Gamepad2 className="w-5 h-5" />
        </Link>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-vyro-accent rounded-full shadow-glow-pink" />
        </button>

        {/* User Avatar */}
        {currentUser && (
          <Link to={`/${currentUser.username}`}>
            <Avatar
              src={currentUser.avatarUrl}
              alt={currentUser.displayName}
              size="sm"
              hasStory
            />
          </Link>
        )}
      </div>
    </header>
  );
};
