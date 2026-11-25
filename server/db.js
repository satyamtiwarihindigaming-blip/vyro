import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VYRO_DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'vyro_db.json');

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'VyroAdmin@2026';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  return safeUser;
}

function createInitialDatabase() {
  const adminId = 'usr_admin_vyro';
  const now = new Date().toISOString();

  return {
    authSecret: process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex'),
    users: [
      {
        id: adminId,
        username: 'vyro_admin',
        displayName: 'VYRO Official Admin',
        email: 'admin@vyro.world',
        passwordHash: hashPassword(ADMIN_PASSWORD),
        avatarUrl: '',
        coverUrl: '',
        bio: 'Official Founder & Platform Administrator of VYRO.',
        role: 'admin',
        isPrivate: false,
        isVerified: true,
        isPro: true,
        proBadge: 'Founder',
        themePreference: 'cyberpunk',
        profileAccent: 'purple',
        followersCount: 1000000000,
        followingCount: 0,
        postsCount: 0,
        createdAt: now,
      },
    ],
    follows: [], // { followerId, followingId, createdAt }
    posts: [],   // Real posts created by real users
    comments: [], // { id, postId, userId, text, createdAt }
    likes: [],   // { postId, userId }
    saves: [],   // { postId, userId }
    stories: [], // Real 24h stories
    messages: [], // { id, senderId, receiverId, content, messageType, mediaUrl, createdAt, isRead }
    groups: [],   // { id, name, creatorId, memberIds: [], avatarUrl, createdAt }
    calls: [],    // Real WebRTC signaling sessions
    reports: [], // { id, reporterId, targetType, targetId, reason, status, createdAt }
  };
}

let dbState = null;

export function loadDB() {
  if (dbState) return dbState;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(raw);
      if (!dbState.calls) dbState.calls = [];
      if (!dbState.groups) dbState.groups = [];
      // Ensure admin exists and creator accounts have 1 Billion followers + full badges
      if (!dbState.users || !dbState.users.some((u) => u.role === 'admin')) {
        const fresh = createInitialDatabase();
        dbState.users = [fresh.users[0], ...(dbState.users || [])];
      }
      dbState.users.forEach((u) => {
        const un = u.username?.toLowerCase() || '';
        if (u.role === 'admin' || un === 'satyam' || un === 'vyro_admin') {
          u.role = 'admin';
          u.isVerified = true;
          u.isPro = true;
          u.proBadge = u.proBadge || 'Founder';
          u.followersCount = Math.max(u.followersCount || 0, 1000000000); // 1 Billion!
        }
      });
    } else {
      dbState = createInitialDatabase();
      saveDB();
    }
  } catch (err) {
    console.error('Database load error, initializing clean state:', err);
    dbState = createInitialDatabase();
  }

  return dbState;
}

export function saveDB() {
  if (!dbState) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database save error:', err);
  }
}

export function createSessionToken(user) {
  const db = loadDB();
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64url');

  const sig = crypto
    .createHmac('sha256', db.authSecret)
    .update(payload)
    .digest('base64url');

  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const db = loadDB();
  const [payload, sig] = token.split('.');

  const expectedSig = crypto
    .createHmac('sha256', db.authSecret)
    .update(payload)
    .digest('base64url');

  if (sig.length !== expectedSig.length) return null;
  const validSig = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!validSig) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    const user = db.users.find((u) => u.id === decoded.sub);
    return user || null;
  } catch {
    return null;
  }
}
