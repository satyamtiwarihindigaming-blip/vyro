import { sendJson } from '../utils.js';

// Curated verified Apple Music preview tracks for zero-lag instant playback
const CURATED_FALLBACK_TRACKS = [
  {
    id: 'trk_apna_bana_le',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/27/61/eb2761c7-d606-0912-dff0-2dc6b69974bd/mzaf_2023722930851223219.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/600x600bb.jpg',
    duration: 30,
    genre: 'Bollywood Romance',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_lover_diljit',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/d5/7a/38d57a99-39fc-e901-7c45-fa6260ec83c1/mzaf_8083696285926392389.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg',
    duration: 30,
    genre: 'Punjabi Pop',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_starboy',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
    duration: 30,
    genre: 'Pop / Synthwave',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_brown_munde',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/97/74/69/977469be-a9d5-35a7-80ad-ebe12a799ccc/mzaf_804867738726203367.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/600x600bb.jpg',
    duration: 30,
    genre: 'Hip Hop / Punjabi',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_kesariya',
    title: 'Kesariya (Brahmastra)',
    artist: 'Arijit Singh, Pritam',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg',
    duration: 30,
    genre: 'Bollywood Romance',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_winning_speech',
    title: 'Winning Speech',
    artist: 'Karan Aujla, MXRCI',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e3/ae/b6/e3aeb64f-cadd-5830-c39f-6af51cd91670/mzaf_6001527501800958065.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/48/7c/36/487c3668-f7a4-4b1a-e09e-c74dae124dd9/5063483578089_cover.jpg/600x600bb.jpg',
    duration: 30,
    genre: 'Punjabi Rap',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
  {
    id: 'trk_faded',
    title: 'Faded',
    artist: 'Alan Walker',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ab/18/d9/ab18d9e9-01f0-27ea-3a51-6e08585a0072/mzaf_14299744081264843911.plus.aac.p.m4a'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/0d/a3/1a/0da31af7-d0ff-9bee-c427-1b6d0336f6fc/886446321981.jpg/600x600bb.jpg',
    duration: 30,
    genre: 'Electronic / Dance',
    licenseType: 'Official Preview Audio',
    isOriginalAudio: false,
  },
];

export async function handleMusicRoutes(req, res, pathname, urlObj) {
  // Audio streaming proxy to bypass CORS and forbidden referrer headers
  if (pathname === '/api/music/proxy' && req.method === 'GET') {
    const targetUrl = urlObj.searchParams.get('url');
    if (!targetUrl) return sendJson(res, 400, { error: 'url parameter is required' });

    try {
      const audioRes = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: '*/*',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!audioRes.ok) {
        return sendJson(res, audioRes.status, { error: `Remote audio returned status ${audioRes.status}` });
      }

      res.writeHead(200, {
        'Content-Type': 'audio/mp4',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      });

      const buffer = Buffer.from(await audioRes.arrayBuffer());
      res.end(buffer);
      return true;
    } catch (err) {
      console.warn('Audio proxy error:', err.message);
      return sendJson(res, 502, { error: 'Failed to fetch audio stream' });
    }
  }

  if (pathname === '/api/music/search' && req.method === 'GET') {
    const q = (urlObj.searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '25', 10), 50);

    if (!q) {
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
          audioUrl: `/api/music/proxy?url=${encodeURIComponent(item.previewUrl)}`,
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
