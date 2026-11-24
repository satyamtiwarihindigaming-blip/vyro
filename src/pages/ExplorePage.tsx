import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Film, Users, Compass } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';

export const ExplorePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
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

  const matchingPosts = posts.filter(
    (p) =>
      !query ||
      p.caption.toLowerCase().includes(query) ||
      p.user.username.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="glass-card rounded-2xl p-4 border border-vyro-border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search real creators, @usernames, or #hashtags..."
            className="w-full bg-vyro-bg border border-vyro-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
          />
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
          <h3 className="text-sm font-bold text-white">No Real Posts Found</h3>
          <p className="text-xs text-slate-400">
            Fake demo imagery has been cleared. Real user posts published in Studio will appear here!
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
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white font-bold text-xs">
                <span>❤️ {post.likesCount}</span>
                <span>@{post.user.username}</span>
              </div>

              {post.postType === 'reel' && (
                <span className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px]">
                  <Film className="w-3.5 h-3.5" />
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
