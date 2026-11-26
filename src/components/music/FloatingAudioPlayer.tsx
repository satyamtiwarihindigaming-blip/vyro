import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  Shuffle,
} from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { SPRING_SHEET } from '../../lib/motion';

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

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed z-40 bottom-20 md:bottom-6 right-3 sm:right-6 select-none">
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
              className="w-10 h-10 rounded-full liquid-pill-cta flex items-center justify-center shrink-0 shadow-md active:scale-90 transition-transform"
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
              className="cursor-pointer max-w-[130px] sm:max-w-[180px]"
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
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>320kbps Studio Master</span>
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Minimize Player"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Album Art & Title with Dynamic Ambient Glow */}
            <div className="flex items-center gap-4 pt-1">
              <div className="relative shrink-0">
                {/* Glow behind art */}
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50 scale-105"
                  style={{ backgroundImage: `url(${currentTrack.coverUrl})`, backgroundSize: 'cover' }}
                />
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="relative w-16 h-16 rounded-2xl object-cover ring-1 ring-white/25 shadow-xl"
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

            {/* Progress Slider */}
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

              <div className="flex justify-between text-[11px] text-white/45 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
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
  );
};
