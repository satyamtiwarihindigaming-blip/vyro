import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, Music, Volume2, VolumeX, Film, MapPin } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { useSocial } from '../context/SocialContext';
import { formatMetric } from '../lib/musicCatalog';
import { soundEngine } from '../lib/soundEngine';

export const ReelsPage: React.FC = () => {
  const { posts, toggleLike, toggleSave } = useSocial();
  const [isMuted, setIsMuted] = useState(false);

  const reels = posts.filter((p) => p.postType === 'reel' || p.postType === 'video');

  if (reels.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="glass-panel rounded-3xl p-10 border border-vyro-border space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-vyro-primary to-vyro-accent flex items-center justify-center text-white shadow-glow-purple">
            <Film className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">No Reels Yet</h2>
          <p className="text-xs text-slate-400">
            All fake demo reels have been removed. Capture and publish the first real Vertical Reel on VYRO!
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan text-white text-xs font-bold shadow-glow-pink"
          >
            <Film className="w-4 h-4" />
            <span>Create First Reel</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-16 md:pb-0">
      {reels.map((reel) => {
        const media = reel.media[0];
        return (
          <div
            key={reel.id}
            className="relative h-[calc(100vh-4.5rem)] snap-start rounded-3xl overflow-hidden glass-panel border border-vyro-border my-2 flex flex-col justify-between"
          >
            {media?.type === 'video' ? (
              <video
                src={media.url}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={media?.url}
                alt={reel.caption}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            <div className="relative z-10 p-4 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-white/80">
                VYRO Reels
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative z-10 p-4 flex items-end justify-between gap-4">
              <div className="space-y-3 flex-1">
                <Link to={`/${reel.user.username}`} className="flex items-center gap-2.5">
                  <Avatar src={reel.user.avatarUrl} alt={reel.user.displayName} size="sm" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{reel.user.username}</span>
                      <VerifiedBadge
                        isVerified={reel.user.isVerified}
                        isPro={reel.user.isPro}
                        proBadge={reel.user.proBadge}
                      />
                    </div>
                    {reel.location && (
                      <span className="text-[10px] text-rose-300 flex items-center gap-1 font-medium truncate max-w-[180px]">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        {reel.location}
                      </span>
                    )}
                  </div>
                </Link>

                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {reel.caption}
                </p>

                {reel.musicTrack && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
                    <Music className="w-3 h-3 text-vyro-accent animate-spin" />
                    <span className="truncate max-w-[200px]">{reel.musicTrack.title}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4 text-white">
                <button
                  onClick={() => {
                    soundEngine.playPop();
                    toggleLike(reel.id);
                  }}
                  className="flex flex-col items-center gap-1 active:scale-125 transition-transform"
                >
                  <div
                    className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md ${
                      reel.isLiked ? 'text-rose-500' : 'text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-rose-500' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold" title={`${reel.likesCount.toLocaleString()} likes`}>
                    {formatMetric(reel.likesCount)}
                  </span>
                </button>

                <div className="flex flex-col items-center gap-1">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold" title={`${reel.commentsCount.toLocaleString()} comments`}>
                    {formatMetric(reel.commentsCount)}
                  </span>
                </div>

                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Share</span>
                </button>

                <button
                  onClick={() => toggleSave(reel.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md ${
                      reel.isSaved ? 'text-vyro-primary' : 'text-white'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${reel.isSaved ? 'fill-vyro-primary' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold">Save</span>
                </button>

                {/* Rotating Vinyl Audio Disc (Instagram-Exact) */}
                <div
                  className="w-8 h-8 rounded-full border-2 border-white/60 overflow-hidden shadow-lg animate-[spin_4s_linear_infinite] mt-1 bg-black flex items-center justify-center cursor-pointer"
                  title={reel.musicTrack?.title || 'Original Audio'}
                >
                  {reel.musicTrack?.coverUrl ? (
                    <img
                      src={reel.musicTrack.coverUrl}
                      alt={reel.musicTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-vyro-primary to-vyro-accent flex items-center justify-center">
                      <Music className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
