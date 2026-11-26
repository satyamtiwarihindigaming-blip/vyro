import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Film, Users, Compass, MapPin, Music, Globe, Image as ImageIcon } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { soundEngine } from '../lib/soundEngine';
import { SPRING_SNAPPY } from '../lib/motion';

const GEO_CITIES = [
  { id: 'all', label: 'Global 🌍' },
  { id: 'mumbai', label: '📍 Mumbai' },
  { id: 'delhi', label: '📍 New Delhi' },
  { id: 'bengaluru', label: '📍 Bengaluru' },
  { id: 'dubai', label: '📍 Dubai' },
  { id: 'london', label: '📍 London' },
  { id: 'new york', label: '📍 New York' },
];

export const ExplorePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGeoCity, setSelectedGeoCity] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'reels' | 'photos' | 'music'>('all');
  const { users, posts } = useSocial();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const query = searchQuery.trim().toLowerCase();

  const matchingUsers = users.filter(
    (u) =>
      !query ||
      u.username.toLowerCase().includes(query) ||
      u.displayName.toLowerCase().includes(query)
  );

  const matchingPosts = posts.filter((p) => {
    // Text search filter
    const matchesQuery =
      !query ||
      p.caption.toLowerCase().includes(query) ||
      p.user.username.toLowerCase().includes(query) ||
      (p.location && p.location.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    // Geolocation city filter
    if (selectedGeoCity !== 'all') {
      if (!p.location || !p.location.toLowerCase().includes(selectedGeoCity)) {
        return false;
      }
    }

    // Media type filter
    if (mediaFilter === 'reels' && p.postType !== 'reel') return false;
    if (mediaFilter === 'photos' && p.postType !== 'photo' && p.postType !== 'carousel') return false;
    if (mediaFilter === 'music' && !p.musicTrack) return false;

    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 pb-28 sm:pb-36 space-y-6">
      {/* Search & Filter Header */}
      <div className="liquid-glass rounded-[28px] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search real creators, @usernames, or 📍 locations..."
            className="w-full liquid-glass-inner rounded-full pl-11 pr-10 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Media Type Segmented Pills */}
        <div className="relative flex items-center p-1 rounded-full liquid-glass-inner self-start md:self-auto overflow-x-auto max-w-full">
          {(
            [
              { id: 'all', label: 'All', icon: null },
              { id: 'reels', label: 'Reels', icon: Film },
              { id: 'photos', label: 'Photos', icon: ImageIcon },
              { id: 'music', label: 'Music 🎵', icon: Music },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = mediaFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playHapticClick();
                  setMediaFilter(tab.id);
                }}
                className={`relative z-10 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="exploreMediaPill"
                    className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                    transition={SPRING_SNAPPY}
                  />
                )}
                {Icon && <Icon className="w-3.5 h-3.5 relative z-10" />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cyber Ludo Arena Spotlight Banner */}
      <div className="liquid-glass rounded-[28px] p-5 border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl liquid-glass-elevated flex items-center justify-center text-2xl shadow-md flex-shrink-0">
            🎲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white tracking-tight">Cyber Ludo King Arena</h4>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                15x15 Classic
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Diagonal Red vs Yellow 2-player seating, fair crypto dice, and in-chat challenges!
            </p>
          </div>
        </div>
        <Link
          to="/games"
          className="px-5 py-2.5 rounded-full liquid-pill-cta text-xs font-semibold flex items-center gap-1.5 shadow-lg whitespace-nowrap"
        >
          <span>Play Now 🏆</span>
        </Link>
      </div>

      {/* Geolocation Filter Bar */}
      <div className="liquid-glass rounded-[24px] p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 px-2 py-1 shrink-0">
          <Globe className="w-4 h-4 text-cyan-300 animate-spin-slow" />
          <span className="uppercase tracking-wider font-mono text-[10px]">Radar:</span>
        </div>
        <div className="flex items-center gap-2">
          {GEO_CITIES.map((geo) => (
            <button
              key={geo.id}
              onClick={() => {
                soundEngine.playHapticClick();
                setSelectedGeoCity(geo.id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGeoCity === geo.id
                  ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 shadow-sm'
                  : 'liquid-glass-inner text-white/60 hover:text-white'
              }`}
            >
              {geo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real Users Directory */}
      <div className="liquid-glass rounded-[28px] p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-300" />
          <span>Verified Creators ({matchingUsers.length})</span>
        </h3>

        {matchingUsers.length === 0 ? (
          <p className="text-xs text-white/50">No creators match "{searchQuery}".</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matchingUsers.map((usr) => (
              <Link
                key={usr.id}
                to={`/${usr.username}`}
                className="p-3 rounded-2xl liquid-glass-inner hover:border-white/20 transition-all flex items-center gap-3 group"
              >
                <Avatar src={usr.avatarUrl} alt={usr.displayName} size="sm" hasStory={usr.isPro} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-white truncate group-hover:text-cyan-200 transition-colors">
                      {usr.displayName}
                    </span>
                    <VerifiedBadge
                      isVerified={usr.isVerified}
                      isPro={usr.isPro}
                      proBadge={usr.proBadge}
                    />
                  </div>
                  <p className="text-[11px] text-white/50 truncate">@{usr.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Real Posts Bento Discovery Grid */}
      {matchingPosts.length === 0 ? (
        <div className="liquid-glass rounded-[28px] p-10 text-center space-y-2">
          <Compass className="w-8 h-8 text-cyan-300 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Posts Matching Criteria</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            {selectedGeoCity !== 'all'
              ? `No posts tagged in ${selectedGeoCity.toUpperCase()} yet. Be the first to tag this location in Studio!`
              : 'Clear filters or publish new photos and reels in Studio to see them appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {matchingPosts.map((post) => (
            <Link
              key={post.id}
              to={`/${post.user.username}`}
              className="group relative aspect-square rounded-[22px] overflow-hidden bg-black/60 liquid-glass select-none"
            >
              {post.media[0]?.type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={post.media[0]?.url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-semibold text-xs backdrop-blur-xs">
                <span>❤️ {post.likesCount}</span>
                <span>@{post.user.username}</span>
              </div>

              {/* Reel Badge */}
              {post.postType === 'reel' && (
                <span className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px]">
                  <Film className="w-3.5 h-3.5" />
                </span>
              )}

              {/* Location Badge */}
              {post.location && (
                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-medium text-cyan-200 flex items-center gap-1 max-w-[75%] truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{post.location}</span>
                </span>
              )}

              {/* Music Badge */}
              {post.musicTrack && (
                <span className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-rose-300">
                  <Music className="w-3 h-3" />
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
