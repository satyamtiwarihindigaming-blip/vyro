import {
  loadDB,
  saveDB,
  hashPassword,
  verifyPassword,
  sanitizeUser,
  createSessionToken,
} from '../db.js';
import {
  sendJson,
  parseBody,
  getAuthUser,
  isValidUsernameFormat,
  RESERVED_USERNAMES,
} from '../utils.js';

const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 15 * 60 * 1000;
  }
  entry.count += 1;
  loginAttempts.set(ip, entry);
  return entry.count <= 20;
}

export async function handleAuthRoutes(req, res, pathname, urlObj) {
  const db = loadDB();

  if (req.method === 'GET' && pathname === '/api/auth/check-username') {
    const raw = (urlObj.searchParams.get('username') || '').trim().toLowerCase();
    if (!isValidUsernameFormat(raw)) {
      return sendJson(res, 200, { available: false, reason: 'invalid' });
    }
    if (RESERVED_USERNAMES.includes(raw)) {
      return sendJson(res, 200, { available: false, reason: 'reserved' });
    }
    const exists = db.users.some((u) => u.username.toLowerCase() === raw);
    return sendJson(res, 200, { available: !exists, reason: exists ? 'taken' : null });
  }

  if (req.method === 'POST' && pathname === '/api/auth/signup') {
    const body = await parseBody(req);
    const username = String(body.username || '').trim().toLowerCase();
    const email = String(body.email || '').trim().toLowerCase();
    const displayName = String(body.displayName || '').trim() || username;
    const pass = String(body.pass || '');

    if (!isValidUsernameFormat(username)) {
      return sendJson(res, 400, { error: 'Invalid username format (3-30 letters, numbers, dots, underscores).' });
    }
    if (RESERVED_USERNAMES.includes(username)) {
      return sendJson(res, 400, { error: 'This username is reserved.' });
    }
    if (db.users.some((u) => u.username.toLowerCase() === username)) {
      return sendJson(res, 409, { error: 'Username is already taken.' });
    }
    if (!email || !email.includes('@')) {
      return sendJson(res, 400, { error: 'Valid email address is required.' });
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return sendJson(res, 409, { error: 'An account with this email already exists.' });
    }
    if (pass.length < 6) {
      return sendJson(res, 400, { error: 'Password must be at least 6 characters.' });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username,
      displayName: displayName.slice(0, 60),
      email,
      passwordHash: hashPassword(pass),
      avatarUrl: '',
      coverUrl: '',
      bio: 'Creator on VYRO ⚡',
      role: 'user',
      isPrivate: false,
      isVerified: false,
      isPro: false,
      proBadge: '',
      themePreference: 'dark',
      profileAccent: 'purple',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDB();

    const token = createSessionToken(newUser);
    return sendJson(res, 201, { user: sanitizeUser(newUser), token });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return sendJson(res, 429, { error: 'Too many login attempts. Please wait a few minutes.' });
    }

    const body = await parseBody(req);
    const identifier = String(body.usernameOrEmail || '').trim().toLowerCase();
    const pass = String(body.pass || '');

    if (!identifier || !pass) {
      return sendJson(res, 400, { error: 'Username/email and password are required.' });
    }

    const user = db.users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );

    if (!user || !verifyPassword(pass, user.passwordHash)) {
      return sendJson(res, 401, { error: 'Invalid username/email or password.' });
    }

    const token = createSessionToken(user);
    return sendJson(res, 200, { user: sanitizeUser(user), token });
  }

  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = getAuthUser(req);
    if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, { user: sanitizeUser(user) });
  }

  if (req.method === 'PATCH' && pathname === '/api/auth/profile') {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });

    const body = await parseBody(req);
    const allowedThemes = ['dark', 'light', 'cyberpunk'];
    const allowedAccents = ['purple', 'pink', 'cyan', 'gold'];

    if (typeof body.displayName === 'string' && body.displayName.trim()) {
      authUser.displayName = body.displayName.trim().slice(0, 60);
    }
    if (typeof body.bio === 'string') {
      authUser.bio = body.bio.slice(0, 250);
    }
    if (typeof body.avatarUrl === 'string') {
      authUser.avatarUrl = body.avatarUrl;
    }
    if (typeof body.coverUrl === 'string') {
      authUser.coverUrl = body.coverUrl;
    }
    if (typeof body.isPrivate === 'boolean') {
      authUser.isPrivate = body.isPrivate;
    }
    if (allowedThemes.includes(body.themePreference)) {
      authUser.themePreference = body.themePreference;
    }
    if (authUser.isPro && allowedAccents.includes(body.profileAccent)) {
      authUser.profileAccent = body.profileAccent;
    }

    saveDB();
    return sendJson(res, 200, { user: sanitizeUser(authUser) });
  }

  if (req.method === 'DELETE' && pathname === '/api/auth/account') {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });

    if (authUser.role === 'admin' && db.users.filter((u) => u.role === 'admin').length <= 1) {
      return sendJson(res, 400, { error: 'Cannot delete the sole platform administrator account.' });
    }

    const uid = authUser.id;
    db.users = db.users.filter((u) => u.id !== uid);
    db.posts = db.posts.filter((p) => p.userId !== uid);
    db.stories = db.stories.filter((s) => s.userId !== uid);
    db.comments = db.comments.filter((c) => c.userId !== uid);
    db.likes = db.likes.filter((l) => l.userId !== uid);
    db.saves = db.saves.filter((s) => s.userId !== uid);
    db.follows = db.follows.filter((f) => f.followerId !== uid && f.followingId !== uid);
    db.messages = db.messages.filter((m) => m.senderId !== uid && m.receiverId !== uid);
    saveDB();

    return sendJson(res, 200, { success: true });
  }

  return false;
}
