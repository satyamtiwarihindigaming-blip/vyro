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
    id: 'trk_warning_addi',
    title: 'WARNING 🔥',
    artist: 'Addi Kalyan',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/954/e37c06d82421134763d9300f421e06e5_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/954/Warning-Hindi-2024-20240408143209-500x500.jpg',
    duration: 176,
    genre: 'Haryanvi Hype',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '42.5M',
    trendingRank: 1,
  },
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
    plays: '94.2M',
    trendingRank: 2,
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
    plays: '88.1M',
    trendingRank: 3,
  },
  {
    id: 'trk_pehle_bhi_main',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/092/81b52beea90f186f27cf5c5eead972c8_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    duration: 250,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '78.3M',
    trendingRank: 4,
  },
  {
    id: 'trk_starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/396/b4e570050007b056c662f2a98c9f28ec_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.jpg',
    duration: 230,
    genre: 'Global Pop',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '145M',
    trendingRank: 5,
  },
  {
    id: 'trk_softly_karan',
    title: 'Softly',
    artist: 'Karan Aujla, IKKY',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.jpg',
    duration: 155,
    genre: 'Punjabi Wave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '69.4M',
    trendingRank: 6,
  },
  {
    id: 'trk_chaleya',
    title: 'Chaleya',
    artist: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    duration: 200,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '112M',
    trendingRank: 7,
  },
  {
    id: 'trk_brown_munde',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.jpg',
    duration: 254,
    genre: 'Punjabi Wave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '110M',
    trendingRank: 8,
  },
  {
    id: 'trk_up_to_u',
    title: 'Up To U',
    artist: 'Dhanda Nyoliwala',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/550/22e2015af1db7f3ed1068bad878ec8b6_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/550/Up-To-U-Hindi-2024-20240321160618-500x500.jpg',
    duration: 188,
    genre: 'Haryanvi Hype',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '38.7M',
    trendingRank: 9,
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
    plays: '132M',
    trendingRank: 10,
  },
  {
    id: 'trk_husn',
    title: 'Husn',
    artist: 'Anuv Jain',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/436/13795b7aa2e87393366162b9e6a6fe88_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg',
    duration: 217,
    genre: 'Lofi & Chill',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '85.6M',
    trendingRank: 11,
  },
  {
    id: 'trk_winning_speech',
    title: 'Winning Speech',
    artist: 'Karan Aujla, MXRCI, Seshnolan',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/089/Winning-Speech-Punjabi-2024-20260626013220-500x500.jpg',
    duration: 227,
    genre: 'Punjabi Wave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '64.2M',
    trendingRank: 12,
  },
  {
    id: 'trk_faded',
    title: 'Faded',
    artist: 'Alan Walker',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/562/b331b68fc5e35ff7d7cd7ce0e25158d7_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/562/Different-World-English-2018-20181130144209-500x500.jpg',
    duration: 212,
    genre: 'Global Pop',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '180M',
    trendingRank: 13,
  },
  {
    id: 'trk_295_sidhu',
    title: '295 🔥',
    artist: 'Sidhu Moose Wala',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/264/354784a3c1032cf2b17b629009951be4_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/264/Moosetape-Punjabi-2021-20210514193524-500x500.jpg',
    duration: 270,
    genre: 'Punjabi Wave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '220M',
    trendingRank: 14,
  },
  {
    id: 'trk_cheques_shubh',
    title: 'Cheques',
    artist: 'Shubh',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/078/2c16f2c733f39a4441586716aeb7f9fc_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/078/Still-Rollin-Punjabi-2023-20230519124449-500x500.jpg',
    duration: 183,
    genre: 'Punjabi Wave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '154M',
    trendingRank: 15,
  },
  {
    id: 'trk_baller_shubh',
    title: 'Baller',
    artist: 'Shubh, Ikky',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/514/b429d47ec548324bf8364d1f274642fe_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/514/Baller-Punjabi-2022-20220909054707-500x500.jpg',
    duration: 148,
    genre: 'Punjabi Wave',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '138M',
    trendingRank: 16,
  },
  {
    id: 'trk_badnam_gabru',
    title: 'Badnam Gabru',
    artist: 'Masoom Sharma',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/393/c0f8ca7c0303ba7a840e6988894273df_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/393/Badnam-Gabru-Haryanvi-2023-20230911075641-500x500.jpg',
    duration: 195,
    genre: 'Haryanvi Hype',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '52.1M',
    trendingRank: 17,
  },
  {
    id: 'trk_kothi_gulzaar',
    title: 'Kothi',
    artist: 'Gulzaar Chhaniwala',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/495/36e6fe43a164b18f0293d0bb69d4be2a_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/495/Kothi-Haryanvi-2021-20210729051838-500x500.jpg',
    duration: 210,
    genre: 'Haryanvi Hype',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '49.8M',
    trendingRank: 18,
  },
  {
    id: 'trk_moto_diler',
    title: 'Moto',
    artist: 'Diler Kharkiya',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/012/6fe0718d0954b4231b528a478b274e44_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/012/Moto-Haryanvi-2020-20200109153022-500x500.jpg',
    duration: 180,
    genre: 'Haryanvi Hype',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '85M',
    trendingRank: 19,
  },
  {
    id: 'trk_satranga_arijit',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/284/d4808383f5cb6cb0c3ee64c391741699_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/284/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    duration: 271,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '115M',
    trendingRank: 20,
  },
  {
    id: 'trk_heeriye_jasleen',
    title: 'Heeriye',
    artist: 'Jasleen Royal, Arijit Singh',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/022/b77f98b25114798e984f483c6ea62a6b_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.jpg',
    duration: 194,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '160M',
    trendingRank: 21,
  },
  {
    id: 'trk_o_maahi_arijit',
    title: 'O Maahi',
    artist: 'Pritam, Arijit Singh, Irshad Kamil',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/045/63eb21258679eeff133d1b82cfeb5e3f_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/045/Dunki-Drop-5-O-Maahi-Hindi-2023-20231211111004-500x500.jpg',
    duration: 233,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '98M',
    trendingRank: 22,
  },
  {
    id: 'trk_tum_se_hi',
    title: 'Tum Se Hi',
    artist: 'Pritam, Mohit Chauhan',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/264/3dfa538a7c2936718ab60b9c3f41ea8d_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/264/Jab-We-Met-Hindi-2007-20190629141029-500x500.jpg',
    duration: 323,
    genre: 'Bollywood Romance',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '210M',
    trendingRank: 23,
  },
  {
    id: 'trk_blinding_lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/714/233c16260a4f5b55e378f45a0b77cbf9_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/714/After-Hours-English-2020-20200320000540-500x500.jpg',
    duration: 200,
    genre: 'Global Pop',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '320M',
    trendingRank: 24,
  },
  {
    id: 'trk_sunflower_post',
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/958/0cb9ef7190f7a602c8c4e4787a748259_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/958/Spider-Man-Into-the-Spider-Verse-Soundtrack-From-Inspired-by-the-Motion-Picture-English-2018-20181213071836-500x500.jpg',
    duration: 158,
    genre: 'Global Pop',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '280M',
    trendingRank: 25,
  },
  {
    id: 'trk_levitating_dua',
    title: 'Levitating',
    artist: 'Dua Lipa',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/935/9ffb01bc06579f195feee6c13ab690ea_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/935/Future-Nostalgia-English-2020-20200326083030-500x500.jpg',
    duration: 203,
    genre: 'Global Pop',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '195M',
    trendingRank: 26,
  },
  {
    id: 'trk_baarishein_anuv',
    title: 'Baarishein',
    artist: 'Anuv Jain',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/492/c03565fcf1c5d95e7ad7845fefba35d4_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/492/Baarishein-Hindi-2018-20220624053641-500x500.jpg',
    duration: 208,
    genre: 'Lofi & Chill',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '95M',
    trendingRank: 27,
  },
  {
    id: 'trk_kasoor_prateek',
    title: 'Kasoor',
    artist: 'Prateek Kuhad',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/839/ad3331b67f1b4a0558197171d18f509e_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/839/Kasoor-Hindi-2020-20200729111005-500x500.jpg',
    duration: 198,
    genre: 'Lofi & Chill',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '74M',
    trendingRank: 28,
  },
  {
    id: 'trk_alag_aasmaan',
    title: 'Alag Aasmaan',
    artist: 'Anuv Jain',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/712/937eeb178b61c9b68a4e3fa3bb4b8407_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/712/Alag-Aasmaan-Hindi-2020-20220624053640-500x500.jpg',
    duration: 212,
    genre: 'Lofi & Chill',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '68M',
    trendingRank: 29,
  },
  {
    id: 'trk_liggi_ritviz',
    title: 'Liggi',
    artist: 'Ritviz',
    audioUrl: '/api/music/proxy?url=' + encodeURIComponent('https://aac.saavncdn.com/750/9e00eb231849a6060c41031c2c2f6d20_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/750/DEV-Hindi-2019-20191220054323-500x500.jpg',
    duration: 181,
    genre: 'Lofi & Chill',
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    plays: '82M',
    trendingRank: 30,
  },
];

const ALLOWED_AUDIO_DOMAINS = [
  'saavncdn.com',
  'aac.saavncdn.com',
  'c.saavncdn.com',
  'apple.com',
  'audio-ssl.itunes.apple.com',
  'itunes.apple.com',
  'scdn.co',
  'p.scdn.co',
  'jiosaavn.com',
  'images.unsplash.com',
  'unsplash.com',
  'archive.org',
  'freesound.org',
  'cdn.freesound.org',
];

export function isAllowedAudioUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();

    // Reject localhost, local domain names
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Reject direct IPv4 addresses (including private, loopback, link-local metadata)
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      return false; // Direct raw IP access blocked
    }

    // Reject IPv6 addresses
    if (hostname === '::1' || hostname.startsWith('[') || hostname.includes(':')) {
      return false;
    }

    // Check against allowed domains whitelist
    const isAllowed = ALLOWED_AUDIO_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
    return isAllowed;
  } catch {
    return false;
  }
}

export async function handleMusicRoutes(req, res, pathname, urlObj) {
  // High-performance streaming proxy with SSRF protection, redirect validation, Byte-Range support (HTTP 206) and pipe streaming
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

      let currentUrl = targetUrl;
      let audioRes = null;
      const MAX_REDIRECTS = 3;

      for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
        if (!isAllowedAudioUrl(currentUrl)) {
          return sendJson(res, 403, { error: 'Target URL or redirect destination is not allowed' });
        }

        audioRes = await fetch(currentUrl, {
          headers: upstreamHeaders,
          redirect: 'manual',
          signal: AbortSignal.timeout(15000),
        });

        if ([301, 302, 303, 307, 308].includes(audioRes.status)) {
          const location = audioRes.headers.get('location');
          if (!location) {
            return sendJson(res, 502, { error: 'Redirect location header missing' });
          }
          currentUrl = new URL(location, currentUrl).toString();
          continue;
        }
        break;
      }

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
