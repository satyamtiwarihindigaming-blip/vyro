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
    artist: 'Arijit Singh, Sachin-Jigar',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/27/61/eb2761c7-d606-0912-dff0-2dc6b69974bd/mzaf_2023722930851223219.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_lover_diljit',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/d5/7a/38d57a99-39fc-e901-7c45-fa6260ec83c1/mzaf_8083696285926392389.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_starboy',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_brown_munde',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/97/74/69/977469be-a9d5-35a7-80ad-ebe12a799ccc/mzaf_804867738726203367.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_kesariya',
    title: 'Kesariya (Brahmastra)',
    artist: 'Arijit Singh, Pritam',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_winning_speech',
    title: 'Winning Speech',
    artist: 'Karan Aujla, MXRCI',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e3/ae/b6/e3aeb64f-cadd-5830-c39f-6af51cd91670/mzaf_6001527501800958065.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/48/7c/36/487c3668-f7a4-4b1a-e09e-c74dae124dd9/5063483578089_cover.jpg/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_faded',
    title: 'Faded (EDM Anthem)',
    artist: 'Alan Walker',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent(
        'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ab/18/d9/ab18d9e9-01f0-27ea-3a51-6e08585a0072/mzaf_14299744081264843911.plus.aac.p.m4a'
      ),
    coverUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/0d/a3/1a/0da31af7-d0ff-9bee-c427-1b6d0336f6fc/886446321981.jpg/600x600bb.jpg',
    duration: 30,
    licenseType: 'Official Preview Audio',
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
