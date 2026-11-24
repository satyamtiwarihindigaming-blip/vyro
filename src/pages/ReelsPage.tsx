import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

export const ReelsPage: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({
    post_1: true,
  });

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const reels = [
    {
      id: 'reel_1',
      videoUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=80',
      user: {
        username: 'cyber_aura',
        displayName: 'Aura Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        isVerified: true,
      },
      caption: 'Generative chromatic ripples in 60fps 🌌 CC0 Original Audio #visuals #future',
      music: 'Tokyo Rain Echoes — @cyber_aura',
      likes: 12400,
      comments: 320,
    },
    {
      id: 'reel_2',
      videoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      user: {
        username: 'neon_zen',
        displayName: 'Kai Thorne',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        isVerified: false,
      },
      caption: 'Testing the new modular synth rack with live filter resonance 🎹 Drop your thoughts below!',
      music: 'Neon Horizon (Original Audio) — @neon_zen',
      likes: 8900,
      comments: 184,
    },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-16 md:pb-0">
      {reels.map((reel) => {
        const isLiked = likedMap[reel.id];
        return (
          <div
            key={reel.id}
            className="relative h-[calc(100vh-4.5rem)] snap-start rounded-3xl overflow-hidden glass-panel border border-vyro-border my-2 flex flex-col justify-between"
          >
            {/* Background Media */}
            <img
              src={reel.videoUrl}
              alt={reel.caption}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Top Bar */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-white/80">VYRO Reels</span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom Content & Creator Info */}
            <div className="relative z-10 p-4 flex items-end justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <Avatar src={reel.user.avatarUrl} alt={reel.user.displayName} size="sm" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{reel.user.username}</span>
                    {reel.user.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-vyro-cyan" />}
                  </div>
                  <button className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold hover:bg-white/30 backdrop-blur-md">
                    Follow
                  </button>
                </div>

                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                  {reel.caption}
                </p>

                {/* Audio Sync Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
                  <Music className="w-3 h-3 text-vyro-accent animate-spin" />
                  <span className="truncate max-w-[200px]">{reel.music}</span>
                </div>
              </div>

              {/* Right Vertical Action Rail */}
              <div className="flex flex-col items-center gap-4 text-white">
                <button
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 active:scale-125 transition-transform"
                >
                  <div className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md ${isLiked ? 'text-rose-500' : 'text-white'}`}>
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold">{(reel.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">{reel.comments}</span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Share</span>
                </button>

                <button className="flex flex-col items-center gap-1">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold">Save</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
