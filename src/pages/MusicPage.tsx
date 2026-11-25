import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus, Search, Link as LinkIcon, Music, Loader2 } from 'lucide-react';
import {
  searchMusicTracks,
  createTrackFromYouTube,
  createTrackFromSpotify,
  TRENDING_GLOBAL_TRACKS,
} from '../lib/musicService';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MusicTrack } from '../types';
import { soundEngine } from '../lib/soundEngine';

export const MusicPage: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<MusicTrack[]>(TRENDING_GLOBAL_TRACKS);
  const [isSearching, setIsSearching] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [activeExternalTrack, setActiveExternalTrack] = useState<MusicTrack | null>(null);

  // Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setTracks(TRENDING_GLOBAL_TRACKS);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchMusicTracks(searchQuery.trim());
      setTracks(res.length > 0 ? res : TRENDING_GLOBAL_TRACKS);
      setIsSearching(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLinkSound = (e: React.FormEvent) => {
    e.preventDefault();
    const url = externalUrl.trim();
    if (!url) return;

    const yt = createTrackFromYouTube(url);
    if (yt) {
      setActiveExternalTrack(yt);
      soundEngine.playPop();
      return;
    }
    const sp = createTrackFromSpotify(url);
    if (sp) {
      setActiveExternalTrack(sp);
      soundEngine.playPop();
      return;
    }
    alert('Please enter a valid YouTube or Spotify link.');
  };

  const handleUseAudio = (track?: MusicTrack) => {
    soundEngine.playHapticClick();
    void track;
    navigate('/create');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-vyro-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-glow-pink">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>VYRO Global Music & Sound Hub</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                YouTube • Spotify • Apple
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Search millions of trending tracks or link any YouTube or Spotify song for instant Reel & Post sync.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleUseAudio()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-vyro-primary to-vyro-accent text-white text-xs font-bold transition-all shadow-glow-purple flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Sync in Studio</span>
        </button>
      </div>

      {/* Paste YouTube / Spotify URL Card */}
      <form onSubmit={handleLinkSound} className="glass-card rounded-2xl p-4 border border-vyro-border space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-rose-400" />
          <span>Link Any YouTube Video or Spotify Song</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Paste YouTube (youtu.be/...) or Spotify (open.spotify.com/track/...) link..."
            className="flex-1 bg-vyro-bg border border-vyro-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
          <button
            type="submit"
            disabled={!externalUrl.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold transition disabled:opacity-40 shadow-glow-pink"
          >
            Load Track
          </button>
        </div>

        {/* Embedded External Player if Loaded */}
        {activeExternalTrack && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                <span>{activeExternalTrack.title}</span>
              </span>
              <button
                type="button"
                onClick={() => handleUseAudio(activeExternalTrack)}
                className="text-xs font-bold text-vyro-cyan hover:underline"
              >
                Use this in Studio →
              </button>
            </div>
            {activeExternalTrack.youtubeVideoId ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${activeExternalTrack.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                  title={activeExternalTrack.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : activeExternalTrack.spotifyTrackId ? (
              <div className="w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                <iframe
                  src={`https://open.spotify.com/embed/track/${activeExternalTrack.spotifyTrackId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
        )}
      </form>

      {/* Music Search Input */}
      <div className="glass-card rounded-2xl p-3 border border-vyro-border flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search millions of songs (Arijit Singh, Diljit Dosanjh, The Weeknd, Sidhu Moosewala, Taylor Swift)..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        {isSearching && <Loader2 className="w-4 h-4 text-vyro-accent animate-spin shrink-0 mr-1" />}
      </div>

      {/* Tracks List */}
      <div className="glass-card rounded-2xl p-4 border border-vyro-border space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center justify-between">
          <span>{searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Global & Bollywood Hits'}</span>
          <span className="text-[10px] text-vyro-accent font-mono">{tracks.length} tracks</span>
        </h3>

        {tracks.map((track) => {
          const isThisTrackPlaying = isPlaying && currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              className="p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between gap-4 border border-transparent hover:border-vyro-border"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => {
                    if (currentTrack?.id === track.id) togglePlay();
                    else playTrack(track);
                  }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vyro-primary to-vyro-accent text-white flex items-center justify-center shrink-0 shadow-glow-purple hover:scale-105 transition-transform"
                >
                  {isThisTrackPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 text-white" />
                  )}
                </button>
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">{track.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {track.artist} • {track.licenseType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleUseAudio(track)}
                className="text-xs px-3 py-1.5 rounded-xl bg-vyro-primary/20 hover:bg-vyro-primary text-vyro-primary hover:text-white font-bold transition whitespace-nowrap"
              >
                Use Sound
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};