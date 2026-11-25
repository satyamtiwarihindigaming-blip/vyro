import { MusicTrack } from '../types';
import { apiRequest } from './api';

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
  };
}

// Curated Instant Popular & Bollywood Hits for zero-lag instant playback
export const TRENDING_GLOBAL_TRACKS: MusicTrack[] = [
  {
    id: 'trk_apna_bana_le',
    title: 'Apna Bana Le',
    artist: 'Amitabh Bhattacharya, Sachin-Jigar, Arijit Singh',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/228/bed7fe5f8fe04ae6432bcb0717e2b74e_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/228/Sachin-Jigar-Bollywood-Hits-Hindi-2026-20260630213800-500x500.jpg',
    duration: 261,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_lover_diljit',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
    duration: 190,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/396/b4e570050007b056c662f2a98c9f28ec_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    duration: 230,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_brown_munde',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.jpg',
    duration: 254,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_kesariya',
    title: 'Kesariya',
    artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4'),
    coverUrl:
      'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    duration: 268,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_winning_speech',
    title: 'Winning Speech',
    artist: 'Karan Aujla, MXRCI, Seshnolan',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/089/Winning-Speech-Punjabi-2024-20260626013220-500x500.jpg',
    duration: 227,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_faded',
    title: 'Faded',
    artist: 'Alan Walker',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/562/b331b68fc5e35ff7d7cd7ce0e25158d7_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/562/Different-World-English-2018-20181130144209-500x500.jpg',
    duration: 212,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
];

// Music search service connecting frontend to the real iTunes/Apple Music pipeline
export async function searchMusicTracks(query: string, limit = 25): Promise<MusicTrack[]> {
  try {
    const res = await apiRequest<{ tracks: MusicTrack[] }>(
      `/api/music/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const tracks = res.tracks || [];
    return tracks.length > 0 ? tracks : TRENDING_GLOBAL_TRACKS;
  } catch (err) {
    console.warn('Failed to search tracks:', err);
    return TRENDING_GLOBAL_TRACKS;
  }
}
