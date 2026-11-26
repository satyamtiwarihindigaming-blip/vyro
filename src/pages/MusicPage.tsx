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
} from 'lucide-react';
import { motion } from 'framer-motion';
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
import { SPRING_SNAPPY } from '../lib/motion';
import { SmartCover } from '../components/music/SmartCover';

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
          const art = (t.artist || '').toLowerCase();
          if (selectedGenre === 'haryanvi') {
            return g.includes('haryanvi') || art.includes('addi') || art.includes('dhanda') || art.includes('masoom') || art.includes('gulzaar') || art.includes('diler');
          }
          if (selectedGenre === 'punjabi') {
            return g.includes('punjabi') || art.includes('diljit') || art.includes('aujla') || art.includes('shubh') || art.includes('sidhu') || art.includes('dhillon') || art.includes('randhawa');
          }
          if (selectedGenre === 'bollywood') {
            return g.includes('bollywood') || art.includes('arijit') || art.includes('pritam') || art.includes('vishal') || art.includes('jasleen') || art.includes('sachin') || art.includes('chauhan');
          }
          if (selectedGenre === 'global') {
            return g.includes('global') || g.includes('synthwave') || art.includes('weeknd') || art.includes('walker') || art.includes('post malone') || art.includes('dua lipa');
          }
          if (selectedGenre === 'lofi') {
            return g.includes('lofi') || g.includes('chill') || art.includes('anuv') || art.includes('kuhad') || art.includes('ritviz');
          }
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
        playTrack(track, tracks);
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

  const topSpotlight = TRENDING_GLOBAL_TRACKS[0];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 pb-24 md:pb-12">
      {/* Top Discover Spotlight Hero Banner */}
      {topSpotlight && (
        <div className="relative rounded-[32px] overflow-hidden liquid-glass border border-white/15 p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Radio className="w-48 h-48 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <SmartCover
                  src={topSpotlight.coverUrl}
                  title={topSpotlight.title}
                  artist={topSpotlight.artist}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl group-hover:scale-105 transition-transform"
                />
                <button
                  onClick={() => handlePlayToggle(topSpotlight)}
                  className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isPlaying && currentTrack?.id === topSpotlight.id
                      ? 'bg-gradient-to-tr from-cyan-500/50 to-blue-600/50 border border-cyan-400 text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.5)] scale-105'
                      : 'bg-black/70 backdrop-blur-md border border-white/25 text-white hover:bg-white/20 hover:scale-105 active:scale-95 shadow-xl'
                  }`}
                  aria-label="Play spotlight track"
                >
                  {isPlaying && currentTrack?.id === topSpotlight.id ? (
                    <Pause className="w-5 h-5 text-cyan-300 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 text-white fill-white/80" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full liquid-glass-inner text-amber-300 text-[10px] font-semibold uppercase tracking-wider">
                  <Flame className="w-3 h-3 fill-amber-300" />
                  <span>#1 Trending Now</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {topSpotlight.title}
                </h2>
                <p className="text-xs text-white/70 font-medium">{topSpotlight.artist}</p>
                <div className="flex items-center gap-2 text-[11px] text-white/50 pt-1">
                  <span className="px-2 py-0.5 rounded-full liquid-glass-inner font-medium">
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
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600/40 via-indigo-600/40 to-cyan-600/40 border border-white/25 hover:border-cyan-400/60 text-white text-xs font-semibold shadow-xl active:scale-95 transition-all flex items-center gap-2 backdrop-blur-xl"
              >
                <Plus className="w-4 h-4 stroke-[3] text-cyan-300" />
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
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre.id
                ? 'bg-white/20 border border-white/30 text-white shadow-sm'
                : 'liquid-glass-inner text-white/60 hover:text-white'
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>

      {/* Smart Search Bar with Recommendations */}
      <div className="space-y-3">
        <div className="liquid-glass rounded-full p-2 px-4 border border-white/10 flex items-center gap-3">
          <Search className="w-4 h-4 text-white/40 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, singers, artists, or genres..."
            className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-cyan-300 animate-spin shrink-0 mr-1" />}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-white/40 hover:text-white px-2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Recommendation Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1 shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Discover:</span>
          </div>
          {TRENDING_SEARCH_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEngine.playHapticClick();
                setSearchQuery(sug.query);
              }}
              className="px-3 py-1 rounded-full liquid-glass-inner text-[11px] font-semibold text-white/70 hover:text-white whitespace-nowrap transition-colors"
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paste YouTube / Spotify URL Card */}
      <form onSubmit={handleLinkSound} className="liquid-glass rounded-[28px] p-5 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-rose-400" />
          <span>Link Any External YouTube Video or Spotify Track</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="Paste YouTube (youtu.be/...) or Spotify (open.spotify.com/track/...) link..."
            className="flex-1 liquid-glass-inner rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition"
          />
          <button
            type="submit"
            disabled={!externalUrl.trim()}
            className="px-5 py-2.5 rounded-full liquid-pill-cta text-white text-xs font-semibold transition disabled:opacity-40 shadow-lg"
          >
            Load Track
          </button>
        </div>

        {/* Embedded External Player if Loaded */}
        {activeExternalTrack && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                <span>{activeExternalTrack.title}</span>
              </span>
              <button
                type="button"
                onClick={() => handleUseAudio(activeExternalTrack)}
                className="text-xs font-semibold text-cyan-300 hover:underline"
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
      <div className="liquid-glass rounded-[28px] p-5 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3 px-2 flex items-center justify-between">
          <span>
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedGenre !== 'all'
              ? `${selectedGenre.toUpperCase()} Curated Tracks`
              : 'Trending Master Tracks'}
          </span>
          <span className="text-[10px] text-white/60 font-mono">{tracks.length} tracks</span>
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
                  ? 'bg-white/15 border-white/20 shadow-md'
                  : 'liquid-glass-inner hover:bg-white/10 border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Indicator */}
                  <div
                    className={`w-6 text-center font-bold text-xs shrink-0 ${
                      rank === 1
                        ? 'text-amber-300 text-sm'
                        : rank === 2
                        ? 'text-white/80'
                        : rank === 3
                        ? 'text-amber-500'
                        : 'text-white/40'
                    }`}
                  >
                    {rank <= 3 ? `0${rank}` : rank}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayToggle(track)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isThisTrackPlaying || isExternalActive
                        ? 'bg-gradient-to-tr from-cyan-500/40 to-blue-600/40 border border-cyan-400/80 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                        : 'bg-black/60 hover:bg-white/15 border border-white/20 text-white shadow-md hover:scale-105 active:scale-95 backdrop-blur-md'
                    }`}
                    aria-label={isThisTrackPlaying ? 'Pause track' : 'Play track'}
                  >
                    {isThisTrackPlaying || isExternalActive ? (
                      <Pause className="w-5 h-5 text-cyan-300 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5 text-white fill-white/90" />
                    )}
                  </button>

                  <SmartCover
                    src={track.coverUrl}
                    title={track.title}
                    artist={track.artist}
                    className="w-11 h-11 rounded-2xl shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate leading-tight flex items-center gap-1.5">
                      <span>{track.title}</span>
                      {track.youtubeVideoId && (
                        <span className="text-[9px] bg-rose-600 text-white px-1 rounded font-bold">YT</span>
                      )}
                      {track.spotifyTrackId && (
                        <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-bold">Spotify</span>
                      )}
                      {track.genre && (
                        <span className="text-[9px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded-full font-medium">
                          {track.genre}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/50 truncate pt-0.5">
                      {track.artist} {track.plays ? `• ${track.plays} plays` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseAudio(track)}
                    className="text-xs px-3.5 py-1.5 rounded-full liquid-glass-inner hover:bg-white/15 text-white font-semibold transition whitespace-nowrap active:scale-95 flex items-center gap-1"
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
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                      <iframe
                        src={`https://www.youtube.com/embed/${track.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                        title={track.title}
                        className="w-full h-full border-0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  ) : track.spotifyTrackId ? (
                    <div className="w-full rounded-2xl overflow-hidden bg-black shadow-lg">
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

        {/* Endless Continuous Stream Discovery Footer */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={async () => {
              soundEngine.playPop();
              setIsSearching(true);
              const terms = ['Diljit', 'Arijit', 'Karan Aujla', 'Sidhu Moose Wala', 'Shubh', 'Dhanda Nyoliwala', 'The Weeknd'];
              const randomTerm = terms[Math.floor(Math.random() * terms.length)];
              const extra = await searchMusicTracks(randomTerm, 15);
              if (extra.length > 0) {
                const combined = [...tracks];
                const existingIds = new Set(combined.map((t) => t.id));
                for (const t of extra) {
                  if (!existingIds.has(t.id)) {
                    combined.push(t);
                    existingIds.add(t.id);
                  }
                }
                setTracks(combined);
              }
              setIsSearching(false);
            }}
            disabled={isSearching}
            className="px-6 py-2.5 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white/80 hover:text-white transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>Load More Continuous Hits & Stream Endless Songs ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
