import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Scissors, X, Check, Music } from 'lucide-react';
import { MusicTrack } from '../../types';
import { soundEngine } from '../../lib/soundEngine';

interface AudioTrimmerModalProps {
  isOpen: boolean;
  track: MusicTrack;
  onClose: () => void;
  onConfirmTrim: (trimmedTrack: MusicTrack & { startOffset: number; trimDuration: number }) => void;
}

export const AudioTrimmerModal: React.FC<AudioTrimmerModalProps> = ({
  isOpen,
  track,
  onClose,
  onConfirmTrim,
}) => {
  const [snippetDuration, setSnippetDuration] = useState<15 | 30 | 60>(30);
  const [startOffset, setStartOffset] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalDuration = Math.max(track.duration || 30, 30);
  const maxStartOffset = Math.max(0, totalDuration - snippetDuration);

  // Initialize Audio
  useEffect(() => {
    if (!isOpen) return;
    const streamUrl =
      track.audioUrl.startsWith('http') && !track.audioUrl.includes('/api/music/proxy')
        ? `/api/music/proxy?url=${encodeURIComponent(track.audioUrl)}`
        : track.audioUrl;
    const audio = new Audio(streamUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setPlaybackTime(audio.currentTime);
      if (audio.currentTime >= startOffset + snippetDuration) {
        audio.currentTime = startOffset;
        audio.play().catch(() => {});
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(startOffset);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [isOpen, track.audioUrl, startOffset, snippetDuration]);

  const togglePlay = () => {
    soundEngine.playPop();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startOffset;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setStartOffset(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleApply = () => {
    soundEngine.playHapticClick();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onConfirmTrim({
      ...track,
      startOffset,
      trimDuration: snippetDuration,
    });
    onClose();
  };

  if (!isOpen) return null;

  // Waveform visualization bars
  const waveBars = Array.from({ length: 48 }, (_, i) => {
    const height = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.8) * 12;
    const barProgress = (i / 48) * totalDuration;
    const isInsideSnippet = barProgress >= startOffset && barProgress <= startOffset + snippetDuration;
    return { height, isInsideSnippet };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg liquid-glass-elevated rounded-[30px] p-6 shadow-2xl space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-vyro-primary to-vyro-accent text-white shadow-glow-pink">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Waveform Audio Trimmer</h3>
              <p className="text-xs text-slate-400">Select exact hook for your Reel or Story</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Info Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/50 border border-white/10">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-12 h-12 rounded-xl object-cover border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-white truncate">{track.title}</h4>
            <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
          </div>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-vyro-primary to-vyro-accent text-white flex items-center justify-center shadow-glow-purple hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
        </div>

        {/* Snippet Duration Picker */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Hook Duration:
          </span>
          <div className="flex gap-2">
            {([15, 30, 60] as const).map((dur) => (
              <button
                key={dur}
                onClick={() => {
                  soundEngine.playHapticClick();
                  setSnippetDuration(dur);
                  if (startOffset > Math.max(0, totalDuration - dur)) {
                    setStartOffset(Math.max(0, totalDuration - dur));
                  }
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition ${
                  snippetDuration === dur
                    ? 'bg-vyro-primary text-white border-vyro-accent shadow-glow-purple'
                    : 'bg-zinc-900 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Visual Waveform & Scrubber */}
        <div className="space-y-2">
          <div className="h-16 bg-black/60 border border-white/10 rounded-2xl p-2 flex items-center justify-between gap-1 relative overflow-hidden">
            {waveBars.map((bar, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  bar.isInsideSnippet
                    ? 'bg-gradient-to-t from-vyro-primary to-vyro-accent shadow-glow-pink'
                    : 'bg-white/15'
                }`}
                style={{ height: `${bar.height}px` }}
              />
            ))}
          </div>

          {/* Slider Control */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={maxStartOffset}
              step={0.5}
              value={startOffset}
              onChange={handleSliderChange}
              className="w-full accent-vyro-primary cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Start: 00:{Math.floor(startOffset).toString().padStart(2, '0')}</span>
              <span className="text-vyro-cyan font-bold">
                End: 00:{Math.floor(startOffset + snippetDuration).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-vyro-primary to-vyro-accent text-white text-xs font-bold transition shadow-glow-pink flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Apply Trimmed Hook
          </button>
        </div>
      </div>
    </div>
  );
};
