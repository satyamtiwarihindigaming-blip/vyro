import { MusicTrack } from '../types';
import { apiRequest } from './api';
import { ROYALTY_FREE_TRACKS } from './musicCatalog';

// Extract YouTube Video ID from any standard or shortened YouTube URL
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

// Extract Spotify Track ID from Spotify URL or URI
export function extractSpotifyTrackId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/i);
  if (match) return match[1];
  const uriMatch = url.match(/spotify:track:([a-zA-Z0-9]+)/i);
  return uriMatch ? uriMatch[1] : null;
}

// Create a verified MusicTrack object from a YouTube URL
export function createTrackFromYouTube(
  url: string,
  titleHint = 'YouTube Sound Stream'
): MusicTrack | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return {
    id: `yt_${videoId}`,
    title: titleHint || `YouTube: ${videoId}`,
    artist: 'YouTube Creator Audio',
    audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
    coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    duration: 180,
    licenseType: 'YouTube Audio Embed',
    isOriginalAudio: false,
    youtubeVideoId: videoId,
    genre: 'YouTube Stream',
    mood: 'Trending',
  };
}

// Create a verified MusicTrack object from a Spotify URL
export function createTrackFromSpotify(
  url: string,
  titleHint = 'Spotify Hit Track'
): MusicTrack | null {
  const trackId = extractSpotifyTrackId(url);
  if (!trackId) return null;

  return {
    id: `spotify_${trackId}`,
    title: titleHint || 'Spotify Official Track',
    artist: 'Spotify Artist',
    audioUrl: `https://open.spotify.com/track/${trackId}`,
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80',
    duration: 180,
    licenseType: 'Spotify Official Embed',
    isOriginalAudio: false,
    spotifyTrackId: trackId,
    genre: 'Spotify Hit',
    mood: 'Vibe',
  };
}

// Curated Instant Popular & Bollywood Hits for zero-lag instant playback
export const TRENDING_GLOBAL_TRACKS: MusicTrack[] = ROYALTY_FREE_TRACKS;

// Music search service connecting frontend to the real JioSaavn / iTunes pipeline
export async function searchMusicTracks(query: string, limit = 25): Promise<MusicTrack[]> {
  try {
    const q = query.trim().toLowerCase();
    // Check local catalog first for instant hit matching
    const localMatches = ROYALTY_FREE_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.genre && t.genre.toLowerCase().includes(q)) ||
        (t.mood && t.mood.toLowerCase().includes(q))
    );

    const res = await apiRequest<{ tracks: MusicTrack[] }>(
      `/api/music/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const remoteTracks = res.tracks || [];

    // Merge without duplicates, prioritizing verified local 320kbps matches
    const seenIds = new Set<string>();
    const merged: MusicTrack[] = [];

    for (const track of [...localMatches, ...remoteTracks, ...ROYALTY_FREE_TRACKS]) {
      if (!seenIds.has(track.id) && !seenIds.has(track.title.toLowerCase())) {
        seenIds.add(track.id);
        seenIds.add(track.title.toLowerCase());
        merged.push(track);
      }
    }

    return merged.length > 0 ? merged : TRENDING_GLOBAL_TRACKS;
  } catch (err) {
    console.warn('Failed to search tracks:', err);
    return TRENDING_GLOBAL_TRACKS;
  }
}
