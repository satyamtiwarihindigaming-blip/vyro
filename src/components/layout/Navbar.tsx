import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Music,
  Gamepad2,
  ShieldAlert,
  LogIn,
  X,
  Palette,
  Users,
} from 'lucide-react';
import { Logo } from './Logo';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../lib/api';
import { User } from '../../types';
import { AuthModal } from '../auth/AuthModal';
import { soundEngine } from '../../lib/soundEngine';

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
      {/* Floating Spatial VisionOS Header Pill */}
      <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-6xl rounded-full px-4 sm:px-6 py-2 liquid-glass-elevated flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Logo size="sm" showText={true} />
        </div>

        {/* Fast Live Username Search Bar */}
        <div ref={searchWrapRef} className="relative flex-1 max-w-md mx-1 sm:mx-3">
          <form onSubmit={handleSubmit}>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Search creators @username..."
              className="w-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 rounded-full pl-10 pr-8 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/[0.14] focus:ring-2 focus:ring-white/15 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                className="absolute left-0 right-0 top-12 z-50 rounded-[24px] liquid-glass-elevated p-4 max-h-96 overflow-y-auto space-y-3 shadow-2xl border-white/25"
              >
                {!searchTerm.trim() ? (
                  /* Empty state: Featured Creators & Dedicated Music Notice */
                  <div className="space-y-3 select-none">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Featured Creators & Founders</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/satyam');
                          }}
                          className="p-2.5 rounded-2xl liquid-glass-inner flex items-center gap-2.5 text-left"
                        >
                          <Avatar size="sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" alt="satyam" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">@satyam</p>
                            <p className="text-[10px] text-amber-300 font-medium truncate">Root Founder • 1B</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdown(false);
                            navigate('/vyro_admin');
                          }}
                          className="p-2.5 rounded-2xl liquid-glass-inner flex items-center gap-2.5 text-left"
                        >
                          <Avatar size="sm" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300" alt="vyro_admin" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">@vyro_admin</p>
                            <p className="text-[10px] text-emerald-300 font-medium truncate">Security Lead • 1B</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Quick navigation to dedicated Music Hub */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                        <Music className="w-3.5 h-3.5 text-amber-400" />
                        <span>Looking for songs or playlists?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/music');
                        }}
                        className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition"
                      >
                        Open Music Hub →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Typed State: Creators (@username) Search Only */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <p className="text-[10px] font-semibold text-white/45 uppercase tracking-wider">
                        Creators (@username)
                      </p>
                      {searchResults.length > 0 && (
                        <span className="text-[10px] text-white/40">
                          {searchResults.length} found
                        </span>
                      )}
                    </div>

                    {isSearching ? (
                      <p className="text-xs text-white/50 p-3 text-center">Searching creators...</p>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center space-y-1">
                        <p className="text-xs text-white/70">No creators match "{searchTerm}"</p>
                        <p className="text-[11px] text-white/40">Check spelling or search another username</p>
                      </div>
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
                            className="w-full p-2.5 rounded-2xl liquid-glass-inner flex items-center gap-2.5 text-left group"
                          >
                            <Avatar src={u.avatarUrl} alt={u.displayName} size="xs" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                                  @{u.username}
                                </span>
                                <VerifiedBadge
                                  isVerified={u.isVerified}
                                  isPro={u.isPro}
                                  proBadge={u.proBadge}
                                />
                              </div>
                              <p className="text-[11px] text-white/50 truncate">{u.displayName}</p>
                            </div>
                            <span className="text-[10px] font-medium text-white/40 group-hover:text-white/80">
                              View →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Cyber Ludo */}
          <Link
            to="/games"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Cyber Ludo Arena"
          >
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline text-xs font-semibold">Ludo</span>
          </Link>

          {/* Music Hub */}
          <Link
            to="/music"
            className="p-2 sm:px-3 sm:py-1.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Music Hub"
          >
            <Music className="w-4 h-4 text-pink-400" />
            <span className="hidden xl:inline text-xs font-semibold">Music</span>
          </Link>

          {/* Theme Selector */}
          <button
            onClick={openThemePicker}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
            title="Switch Theme"
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline text-xs font-semibold">Themes</span>
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:bg-amber-500/25 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Admin Panel"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {currentUser ? (
            <Link to={`/${currentUser.username}`} className="flex items-center gap-2 pl-1">
              <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-white/90">
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
              className="liquid-pill-cta text-xs px-4 py-1.5 flex items-center gap-1.5 font-semibold"
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
