import { MusicTrack } from '../types';
import { apiRequest } from './api';

// Music search service connecting frontend to the real iTunes/Apple Music pipeline
export async function searchMusicTracks(query: string, limit = 25): Promise<MusicTrack[]> {
  try {
    const res = await apiRequest<{ tracks: MusicTrack[] }>(
      `/api/music/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return res.tracks || [];
  } catch (err) {
    console.warn('Failed to search tracks:', err);
    return [];
  }
}
