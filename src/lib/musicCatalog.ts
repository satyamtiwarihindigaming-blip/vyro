import { MusicTrack } from '../types';

export function formatMetric(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    return (num % 1_000_000_000 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'B';
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    return (num % 1_000_000 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
  }
  if (num >= 10_000) {
    const val = num / 1_000;
    return (num % 1_000 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'K';
  }
  return num.toLocaleString();
}

export const MUSIC_GENRES = [
  { id: 'all', label: '🔥 All Trending' },
  { id: 'haryanvi', label: '💥 Haryanvi Hype' },
  { id: 'punjabi', label: '🎙️ Punjabi Wave' },
  { id: 'bollywood', label: '💖 Bollywood Romance' },
  { id: 'global', label: '⚡ Global Pop' },
  { id: 'lofi', label: '🌙 Lofi & Chill' },
];

export const TRENDING_SEARCH_SUGGESTIONS = [
  { label: '🔥 Warning (Addi Kalyan)', query: 'Warning Addi Kalyan' },
  { label: '🎵 Lover (Diljit Dosanjh)', query: 'Lover Diljit' },
  { label: '💖 Apna Bana Le', query: 'Apna Bana Le' },
  { label: '💥 Brown Munde', query: 'Brown Munde' },
  { label: '⚡ Starboy (The Weeknd)', query: 'Starboy' },
  { label: '🎧 Softly (Karan Aujla)', query: 'Softly Karan Aujla' },
  { label: '🌟 Pehle Bhi Main', query: 'Pehle Bhi Main' },
  { label: '🔥 Up To U (Dhanda Nyoliwala)', query: 'Up To U Dhanda' },
  { label: '🌙 Husn (Anuv Jain)', query: 'Husn Anuv Jain' },
  { label: '💃 Chaleya (Jawan)', query: 'Chaleya' },
];

export const ROYALTY_FREE_TRACKS: MusicTrack[] = [
  {
    id: 'trk_warning_addi',
    title: 'WARNING 🔥',
    artist: 'Addi Kalyan',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/954/e37c06d82421134763d9300f421e06e5_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/954/Warning-Hindi-2024-20240408143209-500x500.jpg',
    duration: 176,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Haryanvi Hype',
    mood: 'Gym / Trap',
    plays: '42.5M',
    trendingRank: 1,
  },
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
    genre: 'Bollywood Romance',
    mood: 'Romantic',
    plays: '94.2M',
    trendingRank: 2,
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
    genre: 'Punjabi Pop',
    mood: 'Energetic',
    plays: '88.1M',
    trendingRank: 3,
  },
  {
    id: 'trk_pehle_bhi_main',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/092/81b52beea90f186f27cf5c5eead972c8_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg',
    duration: 250,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Bollywood Romance',
    mood: 'Soulful',
    plays: '78.3M',
    trendingRank: 4,
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
    genre: 'Global Pop',
    mood: 'Cyber',
    plays: '145M',
    trendingRank: 5,
  },
  {
    id: 'trk_softly_karan',
    title: 'Softly',
    artist: 'Karan Aujla, IKKY',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.jpg',
    duration: 155,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Punjabi Wave',
    mood: 'Vibe',
    plays: '69.4M',
    trendingRank: 6,
  },
  {
    id: 'trk_chaleya',
    title: 'Chaleya',
    artist: 'Anirudh Ravichander, Arijit Singh, Shilpa Rao',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg',
    duration: 200,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Bollywood Romance',
    mood: 'Party',
    plays: '112M',
    trendingRank: 7,
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
    genre: 'Punjabi Wave',
    mood: 'Trap',
    plays: '110M',
    trendingRank: 8,
  },
  {
    id: 'trk_up_to_u',
    title: 'Up To U',
    artist: 'Dhanda Nyoliwala',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/550/22e2015af1db7f3ed1068bad878ec8b6_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/550/Up-To-U-Hindi-2024-20240321160618-500x500.jpg',
    duration: 188,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Haryanvi Hype',
    mood: 'Aggressive',
    plays: '38.7M',
    trendingRank: 9,
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
    genre: 'Bollywood Romance',
    mood: 'Soulful',
    plays: '132M',
    trendingRank: 10,
  },
  {
    id: 'trk_husn',
    title: 'Husn',
    artist: 'Anuv Jain',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/436/13795b7aa2e87393366162b9e6a6fe88_320.mp4'),
    coverUrl: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg',
    duration: 217,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Lofi & Chill',
    mood: 'Lofi Chill',
    plays: '85.6M',
    trendingRank: 11,
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
    genre: 'Punjabi Wave',
    mood: 'Hype',
    plays: '64.2M',
    trendingRank: 12,
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
    genre: 'Global Pop',
    mood: 'Festival',
    plays: '180M',
    trendingRank: 13,
  },
  {
    id: 'trk_295_sidhu',
    title: '295 🔥',
    artist: 'Sidhu Moose Wala',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/264/354784a3c1032cf2b17b629009951be4_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    duration: 270,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Punjabi Wave',
    mood: 'Legendary',
    plays: '220M',
    trendingRank: 14,
  },
  {
    id: 'trk_cheques_shubh',
    title: 'Cheques',
    artist: 'Shubh',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/078/2c16f2c733f39a4441586716aeb7f9fc_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    duration: 183,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Punjabi Wave',
    mood: 'Hype Trap',
    plays: '154M',
    trendingRank: 15,
  },
  {
    id: 'trk_baller_shubh',
    title: 'Baller',
    artist: 'Shubh, Ikky',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/514/b429d47ec548324bf8364d1f274642fe_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
    duration: 148,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Punjabi Wave',
    mood: 'Trap',
    plays: '138M',
    trendingRank: 16,
  },
  {
    id: 'trk_badnam_gabru',
    title: 'Badnam Gabru',
    artist: 'Masoom Sharma',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/393/c0f8ca7c0303ba7a840e6988894273df_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    duration: 195,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Haryanvi Hype',
    mood: 'Gangster',
    plays: '52.1M',
    trendingRank: 17,
  },
  {
    id: 'trk_kothi_gulzaar',
    title: 'Kothi',
    artist: 'Gulzaar Chhaniwala',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/495/36e6fe43a164b18f0293d0bb69d4be2a_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
    duration: 210,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Haryanvi Hype',
    mood: 'Desi Trap',
    plays: '49.8M',
    trendingRank: 18,
  },
  {
    id: 'trk_moto_diler',
    title: 'Moto',
    artist: 'Diler Kharkiya',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/012/6fe0718d0954b4231b528a478b274e44_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80',
    duration: 180,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Haryanvi Hype',
    mood: 'Romantic Haryanvi',
    plays: '85M',
    trendingRank: 19,
  },
  {
    id: 'trk_satranga_arijit',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/284/d4808383f5cb6cb0c3ee64c391741699_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-50712825e617?w=500&auto=format&fit=crop&q=80',
    duration: 271,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Bollywood Romance',
    mood: 'Melodic',
    plays: '115M',
    trendingRank: 20,
  },
  {
    id: 'trk_heeriye_jasleen',
    title: 'Heeriye',
    artist: 'Jasleen Royal, Arijit Singh',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/022/b77f98b25114798e984f483c6ea62a6b_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    duration: 194,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Bollywood Romance',
    mood: 'Dreamy',
    plays: '160M',
    trendingRank: 21,
  },
  {
    id: 'trk_o_maahi_arijit',
    title: 'O Maahi',
    artist: 'Pritam, Arijit Singh, Irshad Kamil',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/045/63eb21258679eeff133d1b82cfeb5e3f_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    duration: 233,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Bollywood Romance',
    mood: 'Soulful',
    plays: '98M',
    trendingRank: 22,
  },
  {
    id: 'trk_tum_se_hi',
    title: 'Tum Se Hi',
    artist: 'Pritam, Mohit Chauhan',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/264/3dfa538a7c2936718ab60b9c3f41ea8d_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80',
    duration: 323,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Bollywood Romance',
    mood: 'Evergreen',
    plays: '210M',
    trendingRank: 23,
  },
  {
    id: 'trk_blinding_lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/714/233c16260a4f5b55e378f45a0b77cbf9_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    duration: 200,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Global Pop',
    mood: 'Synthwave 80s',
    plays: '320M',
    trendingRank: 24,
  },
  {
    id: 'trk_sunflower_post',
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/958/0cb9ef7190f7a602c8c4e4787a748259_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=80',
    duration: 158,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Global Pop',
    mood: 'Feel Good',
    plays: '280M',
    trendingRank: 25,
  },
  {
    id: 'trk_levitating_dua',
    title: 'Levitating',
    artist: 'Dua Lipa',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/935/9ffb01bc06579f195feee6c13ab690ea_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1445985543470-41fdd5c31447?w=500&auto=format&fit=crop&q=80',
    duration: 203,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Global Pop',
    mood: 'Disco Pop',
    plays: '195M',
    trendingRank: 26,
  },
  {
    id: 'trk_baarishein_anuv',
    title: 'Baarishein',
    artist: 'Anuv Jain',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/492/c03565fcf1c5d95e7ad7845fefba35d4_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80',
    duration: 208,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Lofi & Chill',
    mood: 'Acoustic Rain',
    plays: '95M',
    trendingRank: 27,
  },
  {
    id: 'trk_kasoor_prateek',
    title: 'Kasoor',
    artist: 'Prateek Kuhad',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/839/ad3331b67f1b4a0558197171d18f509e_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    duration: 198,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Lofi & Chill',
    mood: 'Indie Romance',
    plays: '74M',
    trendingRank: 28,
  },
  {
    id: 'trk_alag_aasmaan',
    title: 'Alag Aasmaan',
    artist: 'Anuv Jain',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/712/937eeb178b61c9b68a4e3fa3bb4b8407_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80',
    duration: 212,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Lofi & Chill',
    mood: 'Peaceful',
    plays: '68M',
    trendingRank: 29,
  },
  {
    id: 'trk_liggi_ritviz',
    title: 'Liggi',
    artist: 'Ritviz',
    audioUrl:
      '/api/music/proxy?url=' +
      encodeURIComponent('https://aac.saavncdn.com/750/9e00eb231849a6060c41031c2c2f6d20_320.mp4'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    duration: 181,
    licenseType: 'Full Song (320kbps Studio Master)',
    isOriginalAudio: false,
    genre: 'Lofi & Chill',
    mood: 'Desi Electronic',
    plays: '82M',
    trendingRank: 30,
  },
];
