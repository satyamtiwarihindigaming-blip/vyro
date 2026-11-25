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
];
