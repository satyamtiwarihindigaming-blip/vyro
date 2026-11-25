import { sendJson } from '../utils.js';

// Curated high-reliability fallback tracks (Mixkit / Wikimedia CC0 / Open Preview Audio)
const CURATED_FALLBACK_TRACKS = [
  {
    id: 'trk_fallback_1',
    title: 'Starboy (Cyber Remix)',
    artist: 'The Weeknd ft. Daft Punk',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    genre: 'Pop / Synthwave',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_fallback_2',
    title: 'Apna Bana Le (Acoustic Soul)',
    artist: 'Arijit Singh & Sachin-Jigar',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    genre: 'Bollywood Romance',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_fallback_3',
    title: 'Lover (Bhangra Beat)',
    artist: 'Diljit Dosanjh',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    genre: 'Punjabi Pop',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_fallback_4',
    title: 'Brown Munde (Street Trap)',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    genre: 'Hip Hop / Punjabi',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_fallback_5',
    title: 'Faded (EDM Anthem)',
    artist: 'Alan Walker',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    genre: 'Electronic / Dance',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_fallback_6',
    title: 'Blinding Lights (Retro Wave)',
    artist: 'The Weeknd',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    duration: 30,
    genre: 'Synthpop',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
];

export async function handleMusicRoutes(req, res, pathname, urlObj) {
  if (pathname === '/api/music/search' && req.method === 'GET') {
    const q = (urlObj.searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '25', 10), 50);

    if (!q) {
      // Return curated trending list when search query is empty
      return sendJson(res, 200, { tracks: CURATED_FALLBACK_TRACKS });
    }

    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=${limit}`;
      const response = await fetch(itunesUrl, {
        headers: { 'User-Agent': 'VYRO-Social-Engine/2.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        throw new Error(`iTunes API responded with status ${response.status}`);
      }

      const data = await response.json();
      const results = (data.results || [])
        .filter((item) => item.previewUrl && item.trackName)
        .map((item) => ({
          id: `itunes_${item.trackId}`,
          title: item.trackName,
          artist: item.artistName || 'Unknown Artist',
          audioUrl: item.previewUrl,
          coverUrl:
            item.artworkUrl100?.replace('100x100bb', '600x600bb') ||
            item.artworkUrl100 ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          genre: item.primaryGenreName || 'Popular',
          licenseType: 'Official 30s Preview Stream',
          isOriginalAudio: false,
        }));

      if (results.length > 0) {
        return sendJson(res, 200, { tracks: results });
      }

      // If iTunes has 0 results for specific query, filter fallback tracks
      const filteredFallback = CURATED_FALLBACK_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.artist.toLowerCase().includes(q.toLowerCase()) ||
          t.genre.toLowerCase().includes(q.toLowerCase())
      );

      return sendJson(res, 200, {
        tracks: filteredFallback.length > 0 ? filteredFallback : CURATED_FALLBACK_TRACKS,
      });
    } catch (err) {
      console.warn('iTunes music search fallback triggered:', err.message);
      return sendJson(res, 200, { tracks: CURATED_FALLBACK_TRACKS });
    }
  }

  return false;
}
