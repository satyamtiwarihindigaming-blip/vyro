import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music,
  Volume2,
  VolumeX,
  Film,
  MapPin,
  Play,
  Pause,
  Zap,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { useSocial } from '../context/SocialContext';
import { useAudio } from '../context/AudioContext';
import { formatMetric } from '../lib/musicCatalog';
import { soundEngine } from '../lib/soundEngine';
import { SPRING_SNAPPY } from '../lib/motion';

export const ReelsPage: React.FC = () => {
  const { posts, toggleLike, toggleSave } = useSocial();
  const { playTrack } = useAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{ id: string; x: number; y: number } | null>(null);

  // Play/Pause State & Indicator
  const [pausedReels, setPausedReels] = useState<Record<string, boolean>>({});
  const [playPauseIndicator, setPlayPauseIndicator] = useState<{ reelId: string; type: 'play' | 'pause' } | null>(null);

  // Press-and-Hold 2X Speed State
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const holdSpeedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const lastTapTimeRef = useRef<{ time: number; reelId: string }>({ time: 0, reelId: '' });
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reels = posts.filter((p) => p.postType === 'reel' || p.postType === 'video');

  const triggerReactionBurst = (reelId: string, x: number, y: number) => {
    soundEngine.playPop();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 40]);
      } catch {}
    }
    toggleLike(reelId);

    const burstId = `burst_${Date.now()}`;
    setHeartBurst({ id: burstId, x, y });
    setTimeout(() => {
      setHeartBurst((prev) => (prev?.id === burstId ? null : prev));
    }, 900);
  };

  const handlePointerDown = (reelId: string) => {
    holdSpeedTimerRef.current = setTimeout(() => {
      const vid = videoRefs.current[reelId];
      if (vid) {
        vid.playbackRate = 2.0;
        setIsFastForwarding(true);
        soundEngine.playHapticClick();
      }
    }, 220);
  };

  const handlePointerUpOrCancel = (reelId: string) => {
    if (holdSpeedTimerRef.current) {
      clearTimeout(holdSpeedTimerRef.current);
      holdSpeedTimerRef.current = null;
    }
    if (isFastForwarding) {
      const vid = videoRefs.current[reelId];
      if (vid) {
        vid.playbackRate = 1.0;
      }
      setIsFastForwarding(false);
    }
  };

  const handleTapOrDoubleTap = (e: React.MouseEvent<HTMLDivElement>, reelId: string) => {
    if (isFastForwarding) return;

    const now = Date.now();
    const lastTap = lastTapTimeRef.current;
    const isDouble = lastTap.reelId === reelId && now - lastTap.time < 280;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDouble) {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      lastTapTimeRef.current = { time: 0, reelId: '' };
      triggerReactionBurst(reelId, x, y);
    } else {
      lastTapTimeRef.current = { time: now, reelId };
      singleTapTimeoutRef.current = setTimeout(() => {
        // Single Tap: Toggle Play / Pause
        const vid = videoRefs.current[reelId];
        if (vid) {
          if (vid.paused) {
            vid.play().catch(() => {});
            setPausedReels((prev) => ({ ...prev, [reelId]: false }));
            setPlayPauseIndicator({ reelId, type: 'play' });
          } else {
            vid.pause();
            setPausedReels((prev) => ({ ...prev, [reelId]: true }));
            setPlayPauseIndicator({ reelId, type: 'pause' });
          }
          soundEngine.playHapticClick();
          setTimeout(() => {
            setPlayPauseIndicator((curr) => (curr?.reelId === reelId ? null : curr));
          }, 650);
        }
      }, 280);
    }
  };

  if (reels.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="liquid-glass rounded-[32px] p-10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl liquid-glass-elevated flex items-center justify-center text-white shadow-lg">
            <Film className="w-7 h-7 text-white/90" />
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">No Reels Yet</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            All fake demo reels have been removed. Capture and publish the first real Vertical Reel on VYRO!
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full liquid-pill-cta text-xs font-semibold shadow-xl"
          >
            <Film className="w-4 h-4" />
            <span>Create First Reel</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] max-w-md mx-auto overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-16 md:pb-0 select-none">
      {reels.map((reel) => {
        const media = reel.media[0];
        const isPaused = pausedReels[reel.id] || false;

        return (
          <div
            key={reel.id}
            className="relative h-[calc(100vh-5.5rem)] snap-start rounded-[32px] overflow-hidden liquid-glass my-2 flex flex-col justify-between select-none border border-white/15 shadow-2xl"
          >
            {/* Click & Hold Media Layer */}
            <div
              onClick={(e) => handleTapOrDoubleTap(e, reel.id)}
              onPointerDown={() => handlePointerDown(reel.id)}
              onPointerUp={() => handlePointerUpOrCancel(reel.id)}
              onPointerLeave={() => handlePointerUpOrCancel(reel.id)}
              onPointerCancel={() => handlePointerUpOrCancel(reel.id)}
              className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center"
            >
              {media?.type === 'video' ? (
                <video
                  ref={(el) => (videoRefs.current[reel.id] = el)}
                  src={media.url}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.currentTime === 0) v.currentTime = 0.05;
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={media?.url}
                  alt={reel.caption}
                  className="w-full h-full object-cover pointer-events-none"
                />
              )}

              {/* Ambient bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

              {/* Center Play/Pause Indicator Toast */}
              <AnimatePresence>
                {playPauseIndicator?.reelId === reel.id && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={SPRING_SNAPPY}
                    className="w-16 h-16 rounded-full liquid-glass-elevated flex items-center justify-center text-white pointer-events-none z-20 shadow-2xl"
                  >
                    {playPauseIndicator.type === 'play' ? (
                      <Play className="w-8 h-8 ml-1 fill-white" />
                    ) : (
                      <Pause className="w-8 h-8 fill-white" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 2X Speed Active Pill Badge */}
              <AnimatePresence>
                {isFastForwarding && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={SPRING_SNAPPY}
                    className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full liquid-glass-elevated border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xl animate-pulse pointer-events-none"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-300" />
                    <span>2X Speed ⚡</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spring Reaction Burst at (x, y) */}
              <AnimatePresence>
                {heartBurst && (
                  <motion.div
                    key={heartBurst.id}
                    initial={{ opacity: 0, scale: 0.3, y: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.3, 1.1, 0.9], y: -40 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING_SNAPPY}
                    style={{ left: heartBurst.x, top: heartBurst.y }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
                  >
                    <div className="relative flex items-center justify-center">
                      <Heart className="w-28 h-28 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_35px_rgba(244,63,94,0.95)]" />
                      <span className="absolute -top-3 -right-3 text-amber-300 text-xl animate-ping">✨</span>
                      <span className="absolute -bottom-2 -left-2 text-pink-300 text-base animate-ping">✨</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Top Bar Chrome */}
            <div className="relative z-10 p-4 flex items-center justify-between pointer-events-auto">
              <span className="text-xs font-semibold tracking-wider uppercase text-white/80 liquid-glass-inner px-3 py-1 rounded-full">
                VYRO Reels
              </span>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-full liquid-glass-inner text-white hover:bg-white/20 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom & Right Action Rail Chrome */}
            <div className="relative z-10 p-4 flex items-end justify-between gap-4 pointer-events-auto">
              <div className="space-y-3 flex-1 liquid-glass-inner rounded-2xl p-3.5">
                <Link to={`/${reel.user.username}`} className="flex items-center gap-2.5">
                  <Avatar src={reel.user.avatarUrl} alt={reel.user.displayName} size="sm" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{reel.user.username}</span>
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

                <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                  {reel.caption}
                </p>

                {reel.musicTrack && (
                  <button
                    type="button"
                    onClick={() => reel.musicTrack && playTrack(reel.musicTrack)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] text-white/80 hover:text-white transition-all text-left"
                  >
                    <Music className="w-3 h-3 text-rose-400 animate-spin" />
                    <span className="truncate max-w-[180px]">{reel.musicTrack.title}</span>
                  </button>
                )}
              </div>

              {/* Action Rail */}
              <div className="flex flex-col items-center gap-3 text-white">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => triggerReactionBurst(reel.id, 180, 260)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`p-3 rounded-full liquid-glass-inner ${
                      reel.isLiked ? 'text-rose-500' : 'text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-rose-500' : ''}`} />
                  </div>
                  <span className="text-[10px] font-semibold" title={`${reel.likesCount.toLocaleString()} likes`}>
                    {formatMetric(reel.likesCount)}
                  </span>
                </motion.button>

                <div className="flex flex-col items-center gap-1">
                  <div className="p-3 rounded-full liquid-glass-inner text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold" title={`${reel.commentsCount.toLocaleString()} comments`}>
                    {formatMetric(reel.commentsCount)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => {
                    soundEngine.playPop();
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="p-3 rounded-full liquid-glass-inner text-white">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold">Share</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => toggleSave(reel.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`p-3 rounded-full liquid-glass-inner ${
                      reel.isSaved ? 'text-amber-400' : 'text-white'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${reel.isSaved ? 'fill-amber-400' : ''}`} />
                  </div>
                  <span className="text-[10px] font-semibold">Save</span>
                </motion.button>

                {/* Rotating Translucent Vinyl Audio Disc */}
                <div
                  onClick={() => reel.musicTrack && playTrack(reel.musicTrack)}
                  className="w-9 h-9 rounded-full border-2 border-white/60 overflow-hidden shadow-lg animate-[spin_4s_linear_infinite] mt-1 bg-black/80 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  title={reel.musicTrack?.title || 'Original Audio'}
                >
                  {reel.musicTrack?.coverUrl ? (
                    <img
                      src={reel.musicTrack.coverUrl}
                      alt={reel.musicTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center">
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
