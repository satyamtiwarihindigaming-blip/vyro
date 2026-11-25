import { sendJson } from '../utils.js';
import { Readable } from 'stream';

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// Curated verified FULL LENGTH 320kbps Studio Master tracks
const CURATED_FALLBACK_TRACKS = [
  {
    id: 'trk_apna_bana_le',
    title: 'Apna Bana Le',
    artist: 'Amitabh Bhattacharya, Sachin-Jigar, Arijit Singh',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/228/bed7fe5f8fe04ae6432bcb0717e2b74e_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/228/Sachin-Jigar-Bollywood-Hits-Hindi-2026-20260630213800-500x500.jpg',
    duration: 261,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_lover_diljit',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg',
    duration: 190,
    genre: 'Punjabi Pop',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/396/b4e570050007b056c662f2a98c9f28ec_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    duration: 230,
    genre: 'Pop / Synthwave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_brown_munde',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.jpg',
    duration: 254,
    genre: 'Hip Hop / Punjabi',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_kesariya',
    title: 'Kesariya',
    artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg',
    duration: 268,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_winning_speech',
    title: 'Winning Speech',
    artist: 'Karan Aujla, MXRCI, Seshnolan',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/089/Winning-Speech-Punjabi-2024-20260626013220-500x500.jpg',
    duration: 227,
    genre: 'Punjabi Rap',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
  {
    id: 'trk_faded',
    title: 'Faded',
    artist: 'Alan Walker',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/562/b331b68fc5e35ff7d7cd7ce0e25158d7_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/562/Different-World-English-2018-20181130144209-500x500.jpg',
    duration: 212,
    genre: 'Electronic / Dance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
  },
];

export async function handleMusicRoutes(req, res, pathname, urlObj) {
  // High-performance streaming proxy with Byte-Range support (HTTP 206) and pipe streaming
  if (pathname === '/api/music/proxy' && req.method === 'GET') {
    const targetUrl = urlObj.searchParams.get('url');
    if (!targetUrl) return sendJson(res, 400, { error: 'url parameter is required' });

    try {
      const upstreamHeaders = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: '*/*',
      };
      if (req.headers.range) {
        upstreamHeaders['Range'] = req.headers.range;
      }

      const audioRes = await fetch(targetUrl, {
        headers: upstreamHeaders,
        signal: AbortSignal.timeout(15000),
      });

      if (!audioRes.ok && audioRes.status !== 206) {
        return sendJson(res, audioRes.status, { error: `Remote audio returned status ${audioRes.status}` });
      }

      const resHeaders = {
        'Content-Type': audioRes.headers.get('content-type') || 'audio/mp4',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      };
      if (audioRes.headers.get('content-range')) {
        resHeaders['Content-Range'] = audioRes.headers.get('content-range');
      }
      if (audioRes.headers.get('content-length')) {
        resHeaders['Content-Length'] = audioRes.headers.get('content-length');
      }

      res.writeHead(audioRes.status === 206 ? 206 : 200, resHeaders);
      if (audioRes.body) {
        Readable.fromWeb(audioRes.body).pipe(res);
      } else {
        const buffer = Buffer.from(await audioRes.arrayBuffer());
        res.end(buffer);
      }
      return true;
    } catch (err) {
      console.warn('Audio proxy error:', err.message);
      return sendJson(res, 502, { error: 'Failed to fetch audio stream' });
    }
  }

  // Full length songs search endpoint
  if (pathname === '/api/music/search' && req.method === 'GET') {
    const q = (urlObj.searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '25', 10), 50);

    if (!q) {
      return sendJson(res, 200, { tracks: CURATED_FALLBACK_TRACKS });
    }

    // Try JioSaavn Full Song Search First
    try {
      const saavnUrl = `https://jiosaavn-api-sage.vercel.app/api/search/songs?query=${encodeURIComponent(q)}&limit=${limit}`;
      const saavnRes = await fetch(saavnUrl, {
        headers: { 'User-Agent': 'VYRO-Engine/2.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (saavnRes.ok) {
        const data = await saavnRes.json();
        const rawResults = data.data?.results || [];
        if (rawResults.length > 0) {
          const results = rawResults
            .filter((song) => song.downloadUrl && song.downloadUrl.length > 0)
            .map((song) => {
              const bestDownload =
                song.downloadUrl.find((d) => d.quality === '320kbps')?.url ||
                song.downloadUrl.find((d) => d.quality === '160kbps')?.url ||
                song.downloadUrl[song.downloadUrl.length - 1]?.url;
              const bestCover =
                song.image?.find((i) => i.quality === '500x500')?.url ||
                song.image?.[song.image.length - 1]?.url ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
              const artistNames =
                song.artists?.primary?.map((a) => a.name).join(', ') || song.artist || 'Original Artist';
              const durationSec = song.duration || 210;
              const mins = Math.floor(durationSec / 60);
              const secs = durationSec % 60;

              return {
                id: `saavn_${song.id}`,
                title: decodeHtml(song.name),
                artist: decodeHtml(artistNames),
                audioUrl: `/api/music/proxy?url=${encodeURIComponent(bestDownload)}`,
                coverUrl: bestCover,
                duration: durationSec,
                genre: song.language || 'Popular Master',
                licenseType: `Full Song (${mins}:${secs < 10 ? '0' : ''}${secs})`,
                isOriginalAudio: false,
              };
            });

          if (results.length > 0) {
            return sendJson(res, 200, { tracks: results });
          }
        }
      }
    } catch (err) {
      console.warn('JioSaavn full songs search failed, falling back:', err.message);
    }

    // Secondary fallback: iTunes / Curated
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=${limit}`;
      const response = await fetch(itunesUrl, {
        headers: { 'User-Agent': 'VYRO-Social-Engine/2.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
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
            licenseType: 'Official Preview Stream',
            isOriginalAudio: false,
          }));

        if (results.length > 0) {
          return sendJson(res, 200, { tracks: results });
        }
      }
    } catch {
      // Continue to local filter
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
  }

  return false;
}
