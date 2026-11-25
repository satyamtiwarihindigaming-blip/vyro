import { sendJson } from '../utils.js';

// Curated high-energy reaction GIFs fallback
const CURATED_GIFS = [
  {
    id: 'gif_1',
    title: 'Mind Blown Reaction',
    url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy_s.gif',
    width: 480,
    height: 270,
  },
  {
    id: 'gif_2',
    title: 'Fire Reaction',
    url: 'https://media.giphy.com/media/nrXif9YExO9EI/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/nrXif9YExO9EI/giphy_s.gif',
    width: 480,
    height: 360,
  },
  {
    id: 'gif_3',
    title: 'Celebrate Dance',
    url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy_s.gif',
    width: 480,
    height: 270,
  },
  {
    id: 'gif_4',
    title: 'Cyberpunk Neon Vibe',
    url: 'https://media.giphy.com/media/3o7btQ8jDTPGDpgc6I/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/3o7btQ8jDTPGDpgc6I/giphy_s.gif',
    width: 480,
    height: 270,
  },
  {
    id: 'gif_5',
    title: 'Laughing ROFL',
    url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy_s.gif',
    width: 480,
    height: 270,
  },
  {
    id: 'gif_6',
    title: 'Shocked Cat',
    url: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy_s.gif',
    width: 480,
    height: 360,
  },
];

export async function handleGifRoutes(req, res, pathname, urlObj) {
  if (pathname === '/api/gifs/search' && req.method === 'GET') {
    const q = (urlObj.searchParams.get('q') || '').trim();
    const limit = Math.min(parseInt(urlObj.searchParams.get('limit') || '20', 10), 30);

    if (!q) {
      return sendJson(res, 200, { gifs: CURATED_GIFS });
    }

    try {
      // Giphy public search API with standard public key
      const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(
        q
      )}&limit=${limit}&rating=g`;

      const response = await fetch(giphyUrl, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        throw new Error(`Giphy API responded with status ${response.status}`);
      }

      const data = await response.json();
      const results = (data.data || []).map((item) => ({
        id: item.id,
        title: item.title || 'Animated GIF',
        url: item.images?.fixed_height?.url || item.images?.original?.url,
        previewUrl: item.images?.fixed_height_still?.url || item.images?.preview_gif?.url,
        width: parseInt(item.images?.fixed_height?.width || '200', 10),
        height: parseInt(item.images?.fixed_height?.height || '200', 10),
      }));

      if (results.length > 0) {
        return sendJson(res, 200, { gifs: results });
      }

      return sendJson(res, 200, { gifs: CURATED_GIFS });
    } catch (err) {
      console.warn('Giphy search fallback triggered:', err.message);
      return sendJson(res, 200, { gifs: CURATED_GIFS });
    }
  }

  return false;
}
