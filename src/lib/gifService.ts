import { apiRequest } from './api';

export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

export async function searchGifs(query: string, limit = 20): Promise<GifItem[]> {
  try {
    const res = await apiRequest<{ gifs: GifItem[] }>(
      `/api/gifs/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return res.gifs || [];
  } catch (err) {
    console.warn('Failed to fetch GIFs:', err);
    return [];
  }
}
