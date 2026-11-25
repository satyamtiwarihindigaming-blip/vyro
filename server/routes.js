import { loadDB } from './db.js';
import { sendJson } from './utils.js';
import { handleAuthRoutes } from './handlers/auth.js';
import { handleSocialRoutes } from './handlers/social.js';
import { handleChatRoutes } from './handlers/chat.js';
import { handleAdminRoutes } from './handlers/admin.js';
import { handleCallRoutes } from './handlers/calls.js';
import { handleMusicRoutes } from './handlers/music.js';
import { handleGifRoutes } from './handlers/gifs.js';

export async function handleApiRequest(req, res) {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (pathname === '/api/health' || pathname === '/health') {
    const db = loadDB();
    return sendJson(res, 200, {
      status: 'ok',
      service: 'vyro-web',
      usersCount: db.users.length,
      postsCount: db.posts.length,
      timestamp: new Date().toISOString(),
    });
  }

  if (!pathname.startsWith('/api/')) {
    return false;
  }

  try {
    if ((await handleAuthRoutes(req, res, pathname, urlObj)) !== false) return true;
    if ((await handleAdminRoutes(req, res, pathname)) !== false) return true;
    if ((await handleCallRoutes(req, res, pathname)) !== false) return true;
    if ((await handleChatRoutes(req, res, pathname)) !== false) return true;
    if ((await handleMusicRoutes(req, res, pathname, urlObj)) !== false) return true;
    if ((await handleGifRoutes(req, res, pathname, urlObj)) !== false) return true;
    if ((await handleSocialRoutes(req, res, pathname, urlObj)) !== false) return true;

    sendJson(res, 404, { error: 'API route not found' });
    return true;
  } catch (err) {
    console.error('API Error:', err);
    sendJson(res, err.message === 'Payload too large' ? 413 : 500, {
      error: err.message || 'Internal Server Error',
    });
    return true;
  }
}
