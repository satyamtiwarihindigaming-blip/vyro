import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Music, Gamepad2, ShieldAlert, LogIn, X, Palette } from 'lucide-react';
import { Logo } from './Logo';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../lib/api';
import { User } from '../../types';
import { AuthModal } from '../auth/AuthModal';

export const Navbar: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { openThemePicker } = useTheme();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fast live search user by username (120ms debounce)
  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiRequest<{ users: User[] }>(
          `/api/users/search?q=${encodeURIComponent(q)}`
        );
        setSearchResults(res.users || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-vyro-border/60 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo size="sm" showText={true} />
        </div>

        {/* Fast Live Username Search Bar */}
        <div ref={searchWrapRef} className="relative flex-1 max-w-md mx-2">
          <form onSubmit={handleSubmit}>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Fast search @username..."
              className="w-full bg-vyro-card/90 border border-vyro-border rounded-xl pl-10 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <AnimatePresence>
            {showDropdown && searchTerm.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-11 z-50 rounded-2xl glass-panel border border-vyro-border shadow-2xl p-2 max-h-80 overflow-y-auto"
              >
                {isSearching ? (
                  <p className="text-xs text-slate-400 p-3 text-center">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">
                    No user found for "{searchTerm}"
                  </p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchTerm('');
                          navigate(`/${u.username}`);
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center gap-3 text-left transition-colors"
                      >
                        <Avatar src={u.avatarUrl} alt={u.displayName} size="xs" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              @{u.username}
                            </span>
                            <VerifiedBadge
                              isVerified={u.isVerified}
                              isPro={u.isPro}
                              proBadge={u.proBadge}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{u.displayName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Cyber Ludo & Arcade */}
          <Link
            to="/games"
            className="p-2 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors flex items-center gap-1.5 touch-spring"
            title="Play Cyber Ludo Arena"
          >
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span className="hidden xl:inline text-xs font-bold text-slate-200">Ludo</span>
          </Link>

          {/* 320kbps Music Hub */}
          <Link
            to="/music"
            className="p-2 rounded-xl text-slate-300 hover:text-pink-300 hover:bg-white/10 transition-colors flex items-center gap-1.5 touch-spring"
            title="Full Master Music Studio"
          >
            <Music className="w-5 h-5 text-pink-400" />
            <span className="hidden xl:inline text-xs font-bold text-slate-200">Music</span>
          </Link>

          {/* Luxury Theme Selector */}
          <button
            onClick={openThemePicker}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 touch-spring"
            title="Switch Luxury Theme"
          >
            <Palette className="w-5 h-5 text-vyro-accent" />
            <span className="hidden lg:inline text-xs font-bold text-slate-200">Themes</span>
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-all flex items-center gap-1.5 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)] touch-spring"
              title="Founder / Admin Console"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {currentUser ? (
            <Link to={`/${currentUser.username}`} className="flex items-center gap-2 touch-spring">
              <div className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-200">
                <span>@{currentUser.username}</span>
                <VerifiedBadge
                  isVerified={currentUser.isVerified}
                  isPro={currentUser.isPro}
                  proBadge={currentUser.proBadge}
                />
              </div>
              <Avatar
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                size="sm"
                hasStory={currentUser.isPro}
              />
            </Link>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-vyro-primary to-vyro-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-purple/30 touch-spring"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode="login" />
    </>
  );
};
