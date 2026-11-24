import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause, Volume2, VolumeX, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';

export const FloatingAudioPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, progress, seek, volume, setVolume, currentTime, duration } = useAudio();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        isExpanded
          ? 'bottom-16 md:bottom-4 right-4 left-4 sm:left-auto sm:w-96 glass-panel rounded-2xl p-4 shadow-2xl border border-vyro-primary/40'
          : 'bottom-16 md:bottom-4 right-4 glass-card rounded-full p-2 pr-4 shadow-glow-purple border border-vyro-border flex items-center gap-3'
      }`}
    >
      {!isExpanded ? (
        <>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-vyro-primary to-vyro-accent text-white flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div
            className="cursor-pointer select-none max-w-[130px] sm:max-w-[180px]"
            onClick={() => setIsExpanded(true)}
          >
            <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
            <p className="text-[10px] text-slate-400 truncate">@{currentTrack.artist}</p>
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className="text-slate-400 hover:text-white p-1"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-vyro-accent flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CC0 Legal Audio</span>
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-[11px] text-slate-400 truncate">@{currentTrack.artist}</p>
              <span className="text-[9px] text-vyro-cyan">{currentTrack.licenseType}</span>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1">
            <div
              className="w-full h-1.5 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                seek(pos * 100);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                className="text-slate-400 hover:text-white"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 accent-vyro-primary bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-vyro-primary hover:bg-vyro-primaryHover text-white flex items-center justify-center shadow-glow-purple"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
