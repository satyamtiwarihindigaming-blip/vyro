import React from 'react';
import { Play, Pause, ShieldCheck, Plus } from 'lucide-react';
import { MOCK_MUSIC_TRACKS } from '../lib/mockData';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';

export const MusicPage: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const navigate = useNavigate();

  const handleUseAudio = () => {
    navigate('/create');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Legal Music Disclaimer Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-vyro-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vyro-cyan to-blue-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>VYRO Legal Sound Hub</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                100% DMCA Safe
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Curated Creative Commons Zero (CC0) and Original Creator Audio. Safe for reels, posts, and monetization.
            </p>
          </div>
        </div>

        <button className="px-3.5 py-2 rounded-xl bg-vyro-primary hover:bg-vyro-primaryHover text-white text-xs font-bold transition-all shadow-glow-purple/20 flex items-center gap-1.5 whitespace-nowrap">
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Original Beat</span>
        </button>
      </div>

      {/* Featured Track Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 glass-panel border border-vyro-border flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-glow-pink">
          <img
            src={MOCK_MUSIC_TRACKS[0].coverUrl}
            alt={MOCK_MUSIC_TRACKS[0].title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              if (currentTrack?.id === MOCK_MUSIC_TRACKS[0].id) {
                togglePlay();
              } else {
                playTrack(MOCK_MUSIC_TRACKS[0]);
              }
            }}
            className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-vyro-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-lg"
          >
            {isPlaying && currentTrack?.id === MOCK_MUSIC_TRACKS[0].id ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vyro-accent">Track of the Day</span>
          <h3 className="text-xl font-bold text-white">{MOCK_MUSIC_TRACKS[0].title}</h3>
          <p className="text-xs text-slate-300">By @{MOCK_MUSIC_TRACKS[0].artist} • {MOCK_MUSIC_TRACKS[0].licenseType}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              1,420 Reels created
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              Synthwave / Cyber
            </span>
            <button
              onClick={handleUseAudio}
              className="text-[11px] px-3 py-1 rounded-full bg-vyro-primary text-white font-bold hover:bg-vyro-primaryHover"
            >
              Sync in Studio
            </button>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="glass-card rounded-2xl p-4 border border-vyro-border space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
          Trending Creator & Open Tracks
        </h3>

        {MOCK_MUSIC_TRACKS.map((track) => {
          const isThisTrackPlaying = isPlaying && currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              className="p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between gap-4 border border-transparent hover:border-vyro-border"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (currentTrack?.id === track.id) {
                      togglePlay();
                    } else {
                      playTrack(track);
                    }
                  }}
                  className="w-9 h-9 rounded-xl bg-vyro-card border border-vyro-border text-slate-200 hover:text-white flex items-center justify-center flex-shrink-0 hover:border-vyro-primary"
                >
                  {isThisTrackPlaying ? (
                    <Pause className="w-4 h-4 text-vyro-primary" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{track.title}</p>
                  <p className="text-[11px] text-slate-400">@{track.artist} • {track.licenseType}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-mono">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={handleUseAudio}
                  className="px-3 py-1 rounded-lg bg-vyro-primary/20 text-vyro-primary hover:bg-vyro-primary hover:text-white text-xs font-bold transition-all"
                >
                  Use Audio
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
