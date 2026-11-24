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
    id: 'trk_cc0_1',
    title: 'Neon Horizon (Ambient Synth)',
    artist: 'VYRO Sound Collective',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    duration: 154,
    licenseType: 'Creative Commons CC0',
    isOriginalAudio: false,
    genre: 'Synthwave',
    mood: 'Energetic',
  },
  {
    id: 'trk_cc0_2',
    title: 'Serene View (Chill Beat)',
    artist: 'Mixkit Open Library',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
    duration: 180,
    licenseType: 'Royalty-Free Open Audio',
    isOriginalAudio: false,
    genre: 'Lo-Fi',
    mood: 'Chill',
  },
  {
    id: 'trk_cc0_3',
    title: 'Deep Urban Pulse (Trap Beat)',
    artist: 'Mixkit Open Library',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80',
    duration: 128,
    licenseType: 'CC0 Public Domain',
    isOriginalAudio: false,
    genre: 'Hip Hop',
    mood: 'Hype',
  },
  {
    id: 'trk_cc0_4',
    title: 'Desi Dhol Energy (Club Mix)',
    artist: 'VYRO Beats Studio',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    duration: 165,
    licenseType: 'Royalty-Free Commercial',
    isOriginalAudio: false,
    genre: 'Desi / Bollywood',
    mood: 'Dance',
  },
  {
    id: 'trk_cc0_5',
    title: 'Drift Phonk Hyper (Slowed + Reverb)',
    artist: 'Nightcore collective',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&auto=format&fit=crop&q=80',
    duration: 140,
    licenseType: 'CC0 Open Beat',
    isOriginalAudio: false,
    genre: 'Phonk',
    mood: 'Dark Drift',
  },
  {
    id: 'trk_cc0_6',
    title: 'Midnight Tokyo Sunset',
    artist: 'Lofi Records',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-141.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
    duration: 195,
    licenseType: 'CC0 Public License',
    isOriginalAudio: false,
    genre: 'Lo-Fi',
    mood: 'Study / Chill',
  },
];
