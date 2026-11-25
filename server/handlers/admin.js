import { loadDB, saveDB, sanitizeUser } from '../db.js';
import { sendJson, parseBody, getAuthUser } from '../utils.js';

export async function handleAdminRoutes(req, res, pathname) {
  if (!pathname.startsWith('/api/admin')) return false;

  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'admin') {
    return sendJson(res, 403, { error: 'Forbidden: Administrator access required.' });
  }

  const db = loadDB();

  // Admin Dashboard Overview
  if (req.method === 'GET' && pathname === '/api/admin/overview') {
    const users = db.users.map(sanitizeUser);
    const posts = db.posts.map((p) => {
      const author = db.users.find((u) => u.id === p.userId);
      return {
        ...p,
        authorUsername: author ? author.username : 'deleted',
        likesCount: db.likes.filter((l) => l.postId === p.id).length,
        commentsCount: db.comments.filter((c) => c.postId === p.id).length,
      };
    });

    return sendJson(res, 200, {
      stats: {
        totalUsers: db.users.length,
        verifiedUsers: db.users.filter((u) => u.isVerified).length,
        proUsers: db.users.filter((u) => u.isPro).length,
        totalPosts: db.posts.length,
        totalStories: db.stories.length,
        totalMessages: db.messages.length,
        openReports: db.reports.filter((r) => r.status === 'open').length,
      },
      users,
      posts,
      reports: db.reports,
    });
  }

  // Toggle Blue Tick (Verified Badge)
  if (req.method === 'POST' && pathname.startsWith('/api/admin/users/') && pathname.endsWith('/verify')) {
    const targetId = pathname.replace('/api/admin/users/', '').replace('/verify', '');
    const target = db.users.find((u) => u.id === targetId);
    if (!target) return sendJson(res, 404, { error: 'User not found.' });

    target.isVerified = !target.isVerified;
    saveDB();
    return sendJson(res, 200, { user: sanitizeUser(target) });
  }

  // Toggle Pro Features Tier
  if (req.method === 'POST' && pathname.startsWith('/api/admin/users/') && pathname.endsWith('/pro')) {
    const targetId = pathname.replace('/api/admin/users/', '').replace('/pro', '');
    const target = db.users.find((u) => u.id === targetId);
    if (!target) return sendJson(res, 404, { error: 'User not found.' });

    const body = await parseBody(req).catch(() => ({}));
    target.isPro = !target.isPro;
    target.proBadge = target.isPro ? (String(body.proBadge || '').trim() || 'Pro') : '';
    saveDB();
    return sendJson(res, 200, { user: sanitizeUser(target) });
  }

  // Update Followers Count Advantage (e.g. 1 Billion)
  if (req.method === 'POST' && (pathname === '/api/admin/set-followers' || (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/followers')))) {
    const body = await parseBody(req).catch(() => ({}));
    const targetId = pathname === '/api/admin/set-followers'
      ? body.userId
      : pathname.replace('/api/admin/users/', '').replace('/followers', '');
    const target = db.users.find((u) => u.id === targetId);
    if (!target) return sendJson(res, 404, { error: 'User not found.' });

    const count = parseInt(body.followersCount, 10);
    target.followersCount = isNaN(count) ? 1000000000 : count;
    saveDB();
    return sendJson(res, 200, { user: sanitizeUser(target) });
  }

  // Update Role
  if (req.method === 'POST' && pathname.startsWith('/api/admin/users/') && pathname.endsWith('/role')) {
    const targetId = pathname.replace('/api/admin/users/', '').replace('/role', '');
    const target = db.users.find((u) => u.id === targetId);
    if (!target) return sendJson(res, 404, { error: 'User not found.' });

    const body = await parseBody(req);
    if (!['user', 'creator', 'admin'].includes(body.role)) {
      return sendJson(res, 400, { error: 'Invalid role.' });
    }
    if (target.id === authUser.id && body.role !== 'admin') {
      return sendJson(res, 400, { error: 'Cannot demote yourself while logged in as admin.' });
    }

    target.role = body.role;
    saveDB();
    return sendJson(res, 200, { user: sanitizeUser(target) });
  }

  // Delete User
  if (req.method === 'DELETE' && pathname.startsWith('/api/admin/users/')) {
    const targetId = pathname.replace('/api/admin/users/', '');
    if (targetId === authUser.id) {
      return sendJson(res, 400, { error: 'Cannot delete your own active admin account.' });
    }
    const exists = db.users.some((u) => u.id === targetId);
    if (!exists) return sendJson(res, 404, { error: 'User not found.' });

    db.users = db.users.filter((u) => u.id !== targetId);
    db.posts = db.posts.filter((p) => p.userId !== targetId);
    db.stories = db.stories.filter((s) => s.userId !== targetId);
    db.comments = db.comments.filter((c) => c.userId !== targetId);
    db.likes = db.likes.filter((l) => l.userId !== targetId);
    db.saves = db.saves.filter((s) => s.userId !== targetId);
    db.follows = db.follows.filter((f) => f.followerId !== targetId && f.followingId !== targetId);
    db.messages = db.messages.filter((m) => m.senderId !== targetId && m.receiverId !== targetId);
    saveDB();
    return sendJson(res, 200, { success: true });
  }

  // Resolve Report
  if (req.method === 'POST' && pathname.startsWith('/api/admin/reports/') && pathname.endsWith('/resolve')) {
    const reportId = pathname.replace('/api/admin/reports/', '').replace('/resolve', '');
    const report = db.reports.find((r) => r.id === reportId);
    if (!report) return sendJson(res, 404, { error: 'Report not found.' });

    const body = await parseBody(req).catch(() => ({}));
    report.status = body.status === 'dismissed' ? 'dismissed' : 'resolved';
    saveDB();
    return sendJson(res, 200, { report });
  }

  // Platform Broadcast (Admin announcement to all registered users)
  if (req.method === 'POST' && pathname === '/api/admin/broadcast') {
    const body = await parseBody(req);
    const content = String(body.content || '').trim().slice(0, 2000);
    if (!content) return sendJson(res, 400, { error: 'Broadcast message content is required.' });

    const targetUsers = db.users.filter((u) => u.id !== authUser.id);
    const now = new Date().toISOString();
    let sentCount = 0;

    targetUsers.forEach((user) => {
      db.messages.push({
        id: `msg_broad_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        conversationId: `conv_${user.id}`,
        senderId: authUser.id,
        receiverId: user.id,
        content: `📢 [OFFICIAL PLATFORM BROADCAST]\n${content}`,
        messageType: 'text',
        isRead: false,
        createdAt: now,
      });
      sentCount++;
    });

    saveDB();
    return sendJson(res, 200, { success: true, deliveredTo: sentCount });
  }

  // Direct Admin Message to a specific user
  if (req.method === 'POST' && pathname === '/api/admin/message') {
    const body = await parseBody(req);
    const targetUserId = String(body.targetUserId || '');
    const content = String(body.content || '').trim().slice(0, 2000);
    if (!targetUserId || !content) {
      return sendJson(res, 400, { error: 'Target user ID and content are required.' });
    }

    const target = db.users.find((u) => u.id === targetUserId);
    if (!target) return sendJson(res, 404, { error: 'Target user not found.' });

    const msg = {
      id: `msg_admin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId: `conv_${targetUserId}`,
      senderId: authUser.id,
      receiverId: targetUserId,
      content: `⚡ [ADMIN DIRECT NOTICE]\n${content}`,
      messageType: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(msg);
    saveDB();
    return sendJson(res, 201, { message: msg });
  }

  // Audit Recent Platform Messages
  if (req.method === 'GET' && pathname === '/api/admin/messages') {
    const recent = db.messages
      .slice(-60)
      .reverse()
      .map((m) => {
        const sender = db.users.find((u) => u.id === m.senderId);
        const receiver = db.users.find((u) => u.id === m.receiverId);
        return {
          ...m,
          senderUsername: sender ? sender.username : 'unknown',
          receiverUsername: receiver ? receiver.username : (m.groupId ? 'Group' : 'unknown'),
        };
      });
    return sendJson(res, 200, { messages: recent });
  }

  return false;
}
