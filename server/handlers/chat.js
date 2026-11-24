import { loadDB, saveDB, sanitizeUser } from '../db.js';
import { sendJson, parseBody, getAuthUser } from '../utils.js';

export async function handleChatRoutes(req, res, pathname) {
  const db = loadDB();
  const authUser = getAuthUser(req);

  if (pathname === '/api/conversations' && req.method === 'GET') {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to access messages.' });

    const otherUsers = db.users.filter((u) => u.id !== authUser.id);
    const conversations = otherUsers.map((partner) => {
      const thread = db.messages.filter(
        (m) =>
          (m.senderId === authUser.id && m.receiverId === partner.id) ||
          (m.senderId === partner.id && m.receiverId === authUser.id)
      );
      const lastMessage = thread.length > 0 ? thread[thread.length - 1] : null;
      const unreadCount = thread.filter(
        (m) => m.receiverId === authUser.id && !m.isRead
      ).length;

      return {
        id: `conv_${partner.id}`,
        type: 'direct',
        partner: sanitizeUser(partner),
        lastMessage,
        unreadCount,
        updatedAt: lastMessage ? lastMessage.createdAt : partner.createdAt,
      };
    });

    // Sort conversations with most recent activity first
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sendJson(res, 200, { conversations });
  }

  if (req.method === 'GET' && pathname.startsWith('/api/messages/')) {
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });
    const partnerId = decodeURIComponent(pathname.replace('/api/messages/', ''));

    // Mark unread messages from partner as read
    let updated = false;
    const thread = db.messages.filter((m) => {
      const belongs =
        (m.senderId === authUser.id && m.receiverId === partnerId) ||
        (m.senderId === partnerId && m.receiverId === authUser.id);
      if (belongs && m.receiverId === authUser.id && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
      return belongs;
    });
    if (updated) saveDB();

    return sendJson(res, 200, { messages: thread });
  }

  if (req.method === 'POST' && pathname === '/api/messages') {
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req);
    const receiverId = String(body.receiverId || '');
    const content = String(body.content || '').trim().slice(0, 2000);
    const messageType = ['text', 'image', 'video', 'audio', 'game', 'shared_post'].includes(body.messageType)
      ? body.messageType
      : 'text';

    if (!receiverId || (!content && !body.mediaUrl)) {
      return sendJson(res, 400, { error: 'Receiver and message content are required.' });
    }

    const receiver = db.users.find((u) => u.id === receiverId);
    if (!receiver) return sendJson(res, 404, { error: 'Recipient user not found.' });

    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      conversationId: `conv_${receiverId}`,
      senderId: authUser.id,
      receiverId,
      content,
      mediaUrl: body.mediaUrl || undefined,
      messageType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(msg);
    saveDB();

    return sendJson(res, 201, { message: msg });
  }

  return false;
}
