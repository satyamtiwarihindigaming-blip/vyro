import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Plus,
  Search,
  Link as LinkIcon,
  Music,
  Loader2,
  Flame,
  Radio,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  searchMusicTracks,
  createTrackFromYouTube,
  createTrackFromSpotify,
  TRENDING_GLOBAL_TRACKS,
} from '../lib/musicService';
import { MUSIC_GENRES, TRENDING_SEARCH_SUGGESTIONS } from '../lib/musicCatalog';
import { useAudio } from '../context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MusicTrack } from '../types';
import { soundEngine } from '../lib/soundEngine';

export const MusicPage: React.FC = () => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [tracks, setTracks] = useState<MusicTrack[]>(TRENDING_GLOBAL_TRACKS);
  const [isSearching, setIsSearching] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [activeExternalTrack, setActiveExternalTrack] = useState<MusicTrack | null>(null);

  // Filter or search tracks
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      if (selectedGenre === 'all') {
        setTracks(TRENDING_GLOBAL_TRACKS);
      } else {
        const filtered = TRENDING_GLOBAL_TRACKS.filter((t) => {
          const g = (t.genre || '').toLowerCase();
          if (selectedGenre === 'haryanvi') return g.includes('haryanvi');
          if (selectedGenre === 'punjabi') return g.includes('punjabi');
          if (selectedGenre === 'bollywood') return g.includes('bollywood');
          if (selectedGenre === 'global') return g.includes('global') || g.includes('synthwave');
          if (selectedGenre === 'lofi') return g.includes('lofi') || g.includes('indie');
          return true;
        });
        setTracks(filtered.length > 0 ? filtered : TRENDING_GLOBAL_TRACKS);
      }
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchMusicTracks(q);
      setTracks(res.length > 0 ? res : TRENDING_GLOBAL_TRACKS);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre]);

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

  const handlePlayToggle = (track: MusicTrack) => {
    soundEngine.playPop();
    if (track.youtubeVideoId || track.spotifyTrackId) {
      setActiveExternalTrack(activeExternalTrack?.id === track.id ? null : track);
    } else {
      if (currentTrack?.id === track.id) {
        togglePlay();
      } else {
        playTrack(track);
      }
    }
  };

  const handleUseAudio = (track?: MusicTrack) => {
    soundEngine.playHapticClick();
    if (track) {
      navigate(`/create?audioId=${encodeURIComponent(track.id)}&mode=reel`);
    } else {
      navigate('/create');
    }
  };

  const topSpotlight = TRENDING_GLOBAL_TRACKS[0]; // WARNING - Addi Kalyan

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-12">
      {/* Top Discover Spotlight Hero Banner */}
      {topSpotlight && (
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-amber-500/30 p-6 sm:p-8 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-600/15 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Radio className="w-48 h-48 text-amber-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <img
                  src={topSpotlight.coverUrl}
                  alt={topSpotlight.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-2xl border border-white/20 group-hover:scale-105 transition-transform"
                />
                <button
                  onClick={() => handlePlayToggle(topSpotlight)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-glow-gold hover:scale-110 active:scale-95 transition-all"
                  aria-label="Play spotlight track"
                >
                  {isPlaying && currentTrack?.id === topSpotlight.id ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 ml-1 text-white" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Flame className="w-3 h-3 fill-white" />
                  <span>#1 Trending Now</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {topSpotlight.title}
                </h2>
                <p className="text-xs text-amber-200 font-semibold">{topSpotlight.artist}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-300 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/10 font-bold">
                    {topSpotlight.genre}
                  </span>
                  <span>•</span>
                  <span>{topSpotlight.plays} Streams</span>
                  <span>•</span>
                  <span>320kbps Master</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUseAudio(topSpotlight)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-vyro-primary text-white text-xs font-black shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Sync in Reel Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discover Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {MUSIC_GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => {
              soundEngine.playHapticClick();
              setSelectedGenre(genre.id);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              selectedGenre === genre.id
                ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white border-transparent shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-105'
                : 'bg-vyro-card/80 border-white/10 text-slate-300 hover:text-white hover:border-white/25'
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Smart Search Bar with Recommendations */}
      <div className="space-y-3">
        <div className="glass-card rounded-2xl p-3.5 border border-vyro-border flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search millions of tracks (Warning, Diljit, Arijit, Karan Aujla, Starboy, Pehle Bhi Main)..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-vyro-accent animate-spin shrink-0 mr-1" />}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Recommendation Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Discover:</span>
          </div>
          {TRENDING_SEARCH_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEngine.playHapticClick();
                setSearchQuery(sug.query);
              }}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paste YouTube / Spotify URL Card */}
      <form onSubmit={handleLinkSound} className="glass-card rounded-2xl p-4 border border-vyro-border space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-rose-400" />
          <span>Link Any External YouTube Video or Spotify Track</span>
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

      {/* Tracks List */}
      <div className="glass-card rounded-2xl p-4 border border-vyro-border space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center justify-between">
          <span>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedGenre !== 'all'
              ? `${selectedGenre.toUpperCase()} Curated Tracks`
              : 'Trending Master Tracks'}
          </span>
          <span className="text-[10px] text-vyro-accent font-mono">{tracks.length} tracks</span>
        </h3>

        {tracks.map((track, idx) => {
          const isThisTrackPlaying = isPlaying && currentTrack?.id === track.id;
          const isExternalActive = activeExternalTrack?.id === track.id;
          const rank = track.trendingRank || idx + 1;

          return (
            <div
              key={track.id}
              className={`p-3 rounded-2xl transition-all border flex flex-col gap-2 ${
                isThisTrackPlaying
                  ? 'bg-vyro-primary/10 border-vyro-primary/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                  : 'hover:bg-white/5 border-transparent hover:border-vyro-border'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Indicator */}
                  <div
                    className={`w-6 text-center font-black text-xs shrink-0 ${
                      rank === 1
                        ? 'text-amber-400 text-sm'
                        : rank === 2
                        ? 'text-slate-300'
                        : rank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {rank <= 3 ? `0${rank}` : rank}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayToggle(track)}
                    className="w-11 h-11 rounded-xl bg-gradient-to-tr from-vyro-primary to-vyro-accent text-white flex items-center justify-center shrink-0 shadow-glow-purple hover:scale-105 active:scale-95 transition-transform"
                    aria-label={isThisTrackPlaying ? 'Pause track' : 'Play track'}
                  >
                    {isThisTrackPlaying || isExternalActive ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5 text-white" />
                    )}
                  </button>

                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-tight flex items-center gap-1.5">
                      <span>{track.title}</span>
                      {track.youtubeVideoId && (
                        <span className="text-[9px] bg-rose-600 text-white px-1 rounded font-bold">YT</span>
                      )}
                      {track.spotifyTrackId && (
                        <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-bold">Spotify</span>
                      )}
                      {track.genre && (
                        <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded-full font-medium">
                          {track.genre}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate pt-0.5">
                      {track.artist} {track.plays ? `• ${track.plays} plays` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseAudio(track)}
                    className="text-xs px-3.5 py-1.5 rounded-xl bg-vyro-primary/20 hover:bg-vyro-primary text-vyro-primary hover:text-white font-bold transition whitespace-nowrap active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Use Sound</span>
                  </button>
                </div>
              </div>

              {/* In-place interactive player for YouTube/Spotify tracks */}
              {isExternalActive && (
                <div className="w-full pt-2 border-t border-white/10">
                  {track.youtubeVideoId ? (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                      <iframe
                        src={`https://www.youtube.com/embed/${track.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                        title={track.title}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  ) : track.spotifyTrackId ? (
                    <div className="w-full rounded-xl overflow-hidden bg-black shadow-lg">
                      <iframe
                        src={`https://open.spotify.com/embed/track/${track.spotifyTrackId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Music Bar when track is playing */}
      {currentTrack && isPlaying && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 p-3 rounded-2xl glass-panel border border-vyro-primary/50 shadow-[0_0_25px_rgba(139,92,246,0.35)] flex items-center justify-between gap-4 backdrop-blur-2xl bg-black/90">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0 animate-vinyl"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{currentTrack.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
              <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Equalizer animation */}
            <div className="hidden sm:flex items-end gap-0.5 h-4">
              <span className="w-0.5 bg-pink-400 rounded-full animate-eq-1" />
              <span className="w-0.5 bg-pink-400 rounded-full animate-eq-2" />
              <span className="w-0.5 bg-pink-400 rounded-full animate-eq-3" />
              <span className="w-0.5 bg-pink-400 rounded-full animate-eq-4" />
            </div>

            <button
              onClick={() => togglePlay()}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleUseAudio(currentTrack)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-vyro-primary to-vyro-accent text-white text-xs font-bold shadow-glow-purple flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Use in Reel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
