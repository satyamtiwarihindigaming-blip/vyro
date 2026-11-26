import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';
import { SmartCover } from './SmartCover';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronUp,
  ChevronDown,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  Shuffle,
  X,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { SPRING_SHEET, SPRING_SNAPPY } from '../../lib/motion';

export const FloatingAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    progress,
    seek,
    volume,
    setVolume,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    toggleRepeat,
    toggleShuffle,
  } = useAudio();

  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTopIsland, setShowTopIsland] = useState(false);
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Strictly hide audio floating player on Reels to prevent overlapping video UI
  const isHiddenRoute = location.pathname === '/reels';

  // iPhone-Style Top Dynamic Island Animation on Play / Track Change
  useEffect(() => {
    if (currentTrack && isPlaying) {
      setShowTopIsland(true);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = setTimeout(() => {
        setShowTopIsland(false);
      }, 4200);
    }
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [currentTrack?.id, isPlaying]);

  if (!currentTrack || isHiddenRoute) return null;

  const seekRelative = (deltaSecs: number) => {
    soundEngine.playHapticClick();
    if (duration > 0) {
      const target = Math.max(0, Math.min(duration, currentTime + deltaSecs));
      seek((target / duration) * 100);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* 1. iPhone-Style Dynamic Island Top Notification Banner */}
      <AnimatePresence>
        {showTopIsland && currentTrack && (
          <motion.div
            initial={{ y: -70, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -70, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <div
              onClick={() => {
                soundEngine.playPop();
                setIsExpanded(true);
                setShowTopIsland(false);
              }}
              className="px-3.5 py-2 rounded-full liquid-glass-elevated border border-white/25 shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform backdrop-blur-2xl"
            >
              <SmartCover
                src={currentTrack.coverUrl}
                title={currentTrack.title}
                artist={currentTrack.artist}
                className="w-7 h-7 rounded-full ring-1 ring-white/30 shrink-0"
                showVinylGrooves={false}
              />
              <div className="max-w-[130px] sm:max-w-[200px] text-left min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-white/60 truncate leading-tight">
                  {currentTrack.artist}
                </p>
              </div>
              {/* Mini Equalizer Animated Waveform */}
              <div className="flex items-end gap-0.5 h-3.5 px-1 shrink-0">
                <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-bounce" />
                <span className="w-0.5 h-3.5 bg-violet-400 rounded-full animate-pulse" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playPop();
                  togglePlay();
                }}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Persistent Floating Audio Dock (Non-Colliding Across All OS) */}
      <div className="fixed z-40 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 right-3 sm:right-6 select-none">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* Mini Liquid Capsule */
            <motion.div
              key="mini-player"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={SPRING_SHEET}
              className="liquid-glass-elevated rounded-full p-2 pr-4 flex items-center gap-3 shadow-2xl border-white/20"
            >
              {/* Play/Pause Button */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  togglePlay();
                }}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md active:scale-90 transition-transform border border-white/20"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current stroke-[2.5]" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5 fill-current stroke-[2.5]" />
                )}
              </button>

              {/* Track Info */}
              <div
                className="cursor-pointer max-w-[120px] sm:max-w-[180px]"
                onClick={() => setIsExpanded(true)}
              >
                <p className="text-xs font-semibold text-white truncate">{currentTrack.title}</p>
                <p className="text-[10px] text-white/50 truncate font-medium">@{currentTrack.artist}</p>
              </div>

              {/* Next Track */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  playNext();
                }}
                className="text-white/50 hover:text-white p-1 transition-colors"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Expand Drawer */}
              <button
                onClick={() => setIsExpanded(true)}
                className="text-white/50 hover:text-white p-1 transition-colors"
                title="Expand Player"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            /* Expanded Apple Music Liquid Card */
            <motion.div
              key="expanded-player"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={SPRING_SHEET}
              className="liquid-glass-elevated rounded-[30px] p-6 w-[calc(100vw-1.5rem)] sm:w-[380px] shadow-2xl border-white/25 space-y-4"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>VYRO Spatial Audio</span>
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  title="Minimize Player"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

            {/* Album Art & Title with Dynamic Ambient Glow & Swipe Next/Prev */}
            <div className="flex items-center gap-4 pt-1">
              <div className="relative shrink-0">
                {/* Glow behind art */}
                <div
                  className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 ${
                    isPlaying ? 'opacity-70 scale-110' : 'opacity-40 scale-100'
                  }`}
                  style={{ backgroundImage: `url(${currentTrack.coverUrl})`, backgroundSize: 'cover' }}
                />
                <motion.img
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -35) {
                      soundEngine.playPop();
                      playNext();
                    } else if (info.offset.x > 35) {
                      soundEngine.playPop();
                      playPrev();
                    }
                  }}
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="relative w-16 h-16 rounded-2xl object-cover ring-1 ring-white/25 shadow-xl cursor-grab active:cursor-grabbing"
                  title="Swipe left/right to change tracks"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-snug">{currentTrack.title}</p>
                <p className="text-xs text-white/60 truncate pt-0.5">{currentTrack.artist}</p>
                <div className="flex items-center gap-2 pt-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {currentTrack.genre || 'Trending'}
                  </span>
                  {repeatMode === 'one' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Looping 🔂
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Slider & Touch Jump Seek (-10s / +10s) */}
            <div className="space-y-1.5 pt-2">
              <div
                className="w-full h-1.5 bg-white/15 hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  seek(Math.max(0, Math.min(100, pos * 100)));
                }}
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-100 shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/45 font-mono">
                <div className="flex items-center gap-1.5">
                  <span>{formatTime(currentTime)}</span>
                  <button
                    type="button"
                    onClick={() => seekRelative(-10)}
                    className="px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-[10px] text-white/60 hover:text-white transition flex items-center gap-0.5"
                    title="Jump back 10 seconds"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>-10s</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => seekRelative(10)}
                    className="px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-[10px] text-white/60 hover:text-white transition flex items-center gap-0.5"
                    title="Jump forward 10 seconds"
                  >
                    <span>+10s</span>
                    <RotateCw className="w-2.5 h-2.5" />
                  </button>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Control Deck */}
            <div className="flex items-center justify-between pt-1">
              {/* Shuffle */}
              <button
                onClick={() => {
                  soundEngine.playHapticClick();
                  toggleShuffle();
                }}
                className={`p-2.5 rounded-full transition-all ${
                  isShuffle
                    ? 'text-white bg-white/20 border border-white/30'
                    : 'text-white/45 hover:text-white hover:bg-white/10'
                }`}
                title={isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Skip Prev */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  playPrev();
                }}
                className="p-2.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Center Play/Pause Pill */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  togglePlay();
                }}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full liquid-pill-cta flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current stroke-[2.5]" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5 fill-current stroke-[2.5]" />
                )}
              </button>

              {/* Skip Next */}
              <button
                onClick={() => {
                  soundEngine.playPop();
                  playNext();
                }}
                className="p-2.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={() => {
                  soundEngine.playHapticClick();
                  toggleRepeat();
                }}
                className={`p-2.5 rounded-full transition-all ${
                  repeatMode !== 'off'
                    ? 'text-white bg-white/20 border border-white/30'
                    : 'text-white/45 hover:text-white hover:bg-white/10'
                }`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
                className="text-white/50 hover:text-white transition-colors"
                title={volume === 0 ? 'Unmute' : 'Mute'}
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white/80" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-white bg-white/15 rounded-lg cursor-pointer"
              />

              <span className="text-[10px] text-white/40 font-mono w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};
