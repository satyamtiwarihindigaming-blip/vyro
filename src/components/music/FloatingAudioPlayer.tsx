import React, { useState } from 'react';
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
  Music2,
} from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

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
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isExpanded
          ? 'bottom-16 md:bottom-4 right-3 left-3 sm:left-auto sm:w-[410px] glass-panel rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-amber-500/35 bg-[#0B101D]/90 backdrop-blur-2xl'
          : 'bottom-16 md:bottom-4 right-4 glass-card rounded-full p-2 pr-4 shadow-[0_10px_30px_rgba(0,0,0,0.7)] border border-white/15 flex items-center gap-3 backdrop-blur-xl bg-[#0B101D]/80'
      }`}
    >
      {!isExpanded ? (
        <>
          {/* Mini Dock Player */}
          <button
            onClick={() => {
              soundEngine.playPop();
              togglePlay();
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.45)] active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current stroke-[2.5]" /> : <Play className="w-4 h-4 ml-0.5 fill-current stroke-[2.5]" />}
          </button>

          <div
            className="cursor-pointer select-none max-w-[130px] sm:max-w-[180px]"
            onClick={() => setIsExpanded(true)}
          >
            <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-amber-300/80 truncate font-medium">@{currentTrack.artist}</p>
          </div>

          <button
            onClick={() => {
              soundEngine.playPop();
              playNext();
            }}
            className="text-slate-400 hover:text-white p-1 transition-colors"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(true)}
            className="text-slate-400 hover:text-white p-1 transition-colors"
            title="Expand Full Player"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </>
      ) : (
        /* Apple Music & Spotify Liquid Glass Expanded Sheet */
        <div className="space-y-4 select-none">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Song • 320kbps Studio Master</span>
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Minimize Player"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Album Art & Title with Ambient Glow */}
          <div className="flex items-center gap-4 pt-1">
            <div className="relative group shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-2xl ${
                  isPlaying ? 'ring-2 ring-amber-400/50' : ''
                }`}
              />
              {isPlaying && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-1">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-amber-400 rounded-full animate-eq-1" />
                    <span className="w-0.5 bg-amber-400 rounded-full animate-eq-2" />
                    <span className="w-0.5 bg-amber-400 rounded-full animate-eq-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-white truncate leading-snug">{currentTrack.title}</p>
              <p className="text-xs text-amber-200/90 font-semibold truncate pt-0.5">{currentTrack.artist}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                  {currentTrack.genre || 'Trending Master'}
                </span>
                {repeatMode === 'one' && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Looping Track 🔂
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1.5 pt-1">
            <div
              className="w-full h-2 bg-slate-800/80 rounded-full cursor-pointer relative overflow-hidden border border-white/5"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seek(Math.max(0, Math.min(100, pos * 100)));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Apple Music Style Playback Control Deck */}
          <div className="flex items-center justify-between pt-1">
            {/* Shuffle Button */}
            <button
              onClick={() => {
                soundEngine.playHapticClick();
                toggleShuffle();
              }}
              className={`p-2.5 rounded-xl transition-all ${
                isShuffle
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Skip Previous */}
            <button
              onClick={() => {
                soundEngine.playPop();
                playPrev();
              }}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Primary Center Play / Pause Shutter */}
            <button
              onClick={() => {
                soundEngine.playPop();
                togglePlay();
              }}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-[0_0_24px_rgba(245,158,11,0.55)] hover:scale-105 active:scale-95 transition-all duration-150"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current stroke-[3]" />
              ) : (
                <Play className="w-6 h-6 ml-0.5 fill-current stroke-[3]" />
              )}
            </button>

            {/* Skip Next */}
            <button
              onClick={() => {
                soundEngine.playPop();
                playNext();
              }}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Next Track (Auto-Play Next)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* Repeat Mode Cycle Button (Off -> All -> One -> Off) */}
            <button
              onClick={() => {
                soundEngine.playHapticClick();
                toggleRepeat();
              }}
              className={`p-2.5 rounded-xl transition-all ${
                repeatMode !== 'off'
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume Control Bar */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
              className="text-slate-400 hover:text-white transition-colors"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
            />

            <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
