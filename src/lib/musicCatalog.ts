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

export const ROYALTY_FREE_TRACKS: (MusicTrack & { genre?: string; mood?: string })[] = [
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
    genre: 'Pop / Synthwave',
    mood: 'Cyber',
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
    genre: 'Hip Hop / Punjabi',
    mood: 'Trap',
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
    genre: 'Punjabi Rap',
    mood: 'Hype',
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
    genre: 'Electronic / Dance',
    mood: 'Festival',
  },
];
