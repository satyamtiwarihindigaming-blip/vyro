import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Film, Users, Compass, MapPin, Music, Globe, Image as ImageIcon } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { soundEngine } from '../lib/soundEngine';

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
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="glass-card rounded-2xl p-4 border border-vyro-border flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search real creators, @usernames, #hashtags, or 📍 locations..."
            className="w-full bg-vyro-bg border border-vyro-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Media Type Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              setMediaFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mediaFilter === 'all'
                ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              setMediaFilter('reels');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mediaFilter === 'reels'
                ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Reels</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              setMediaFilter('photos');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mediaFilter === 'photos'
                ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              setMediaFilter('music');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mediaFilter === 'music'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-glow-pink'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music 🎵</span>
          </button>
        </div>
      </div>

      {/* Cyber Ludo Arena Spotlight Banner */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-glow-gold flex-shrink-0">
            🎲
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>Cyber Ludo King Arena</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live 15x15
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              3D pawns, procedural audio, smart bot, and in-chat challenges!
            </p>
          </div>
        </div>
        <Link
          to="/games"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-extrabold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] whitespace-nowrap"
        >
          <span>Play Now 🏆</span>
        </Link>
      </div>

      {/* Geolocation Filter Bar */}
      <div className="glass-card rounded-2xl p-3 border border-vyro-border flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 px-2 py-1 shrink-0">
          <Globe className="w-4 h-4 text-vyro-cyan animate-spin-slow" />
          <span className="uppercase tracking-wider font-mono text-[10px]">Geo Radar:</span>
        </div>
        <div className="flex items-center gap-2">
          {GEO_CITIES.map((geo) => (
            <button
              key={geo.id}
              onClick={() => {
                soundEngine.playHapticClick();
                setSelectedGeoCity(geo.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedGeoCity === geo.id
                  ? 'bg-vyro-cyan/20 border-vyro-cyan text-vyro-cyan shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {geo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real Users Directory */}
      <div className="glass-card rounded-2xl p-5 border border-vyro-border space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Users className="w-4 h-4 text-vyro-cyan" />
          <span>Verified & Real Creators ({matchingUsers.length})</span>
        </h3>

        {matchingUsers.length === 0 ? (
          <p className="text-xs text-slate-500">No creators match "{searchQuery}".</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matchingUsers.map((usr) => (
              <Link
                key={usr.id}
                to={`/${usr.username}`}
                className="p-3 rounded-xl bg-vyro-bg/70 border border-vyro-border hover:border-vyro-primary/50 transition-all flex items-center gap-3"
              >
                <Avatar src={usr.avatarUrl} alt={usr.displayName} size="sm" hasStory={usr.isPro} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{usr.displayName}</span>
                    <VerifiedBadge
                      isVerified={usr.isVerified}
                      isPro={usr.isPro}
                      proBadge={usr.proBadge}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">@{usr.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Real Posts Grid */}
      {matchingPosts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center border border-vyro-border space-y-2">
          <Compass className="w-8 h-8 text-vyro-primary mx-auto" />
          <h3 className="text-sm font-bold text-white">No Posts Matching Criteria</h3>
          <p className="text-xs text-slate-400">
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
              className="group relative aspect-square rounded-2xl overflow-hidden bg-vyro-card border border-vyro-border select-none"
            >
              {post.media[0]?.type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={post.media[0]?.url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold text-xs">
                <span>❤️ {post.likesCount}</span>
                <span>@{post.user.username}</span>
              </div>

              {/* Reel Badge */}
              {post.postType === 'reel' && (
                <span className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px]">
                  <Film className="w-3.5 h-3.5" />
                </span>
              )}

              {/* Location Badge */}
              {post.location && (
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-vyro-cyan flex items-center gap-1 border border-vyro-cyan/30 max-w-[75%] truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{post.location}</span>
                </span>
              )}

              {/* Music Badge */}
              {post.musicTrack && (
                <span className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-pink-400 border border-pink-500/30">
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
