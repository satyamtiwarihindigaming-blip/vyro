import { loadDB, saveDB, sanitizeUser } from '../db.js';
import { sendJson, parseBody, getAuthUser } from '../utils.js';

export async function handleChatRoutes(req, res, pathname) {
  const db = loadDB();
  const authUser = getAuthUser(req);

  // Group creation endpoint
  if (pathname === '/api/groups' && req.method === 'POST') {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to create groups.' });
    const body = await parseBody(req);
    const name = String(body.name || '').trim().slice(0, 60) || 'VYRO Creators Squad';
    const memberIds = Array.isArray(body.memberIds) ? body.memberIds.filter(Boolean) : [];
    if (!memberIds.includes(authUser.id)) memberIds.push(authUser.id);

    const newGroup = {
      id: `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      creatorId: authUser.id,
      memberIds,
      avatarUrl: body.avatarUrl || '',
      createdAt: new Date().toISOString(),
    };

    if (!db.groups) db.groups = [];
    db.groups.push(newGroup);

    // Initial system announcement in group
    db.messages.push({
      id: `msg_${Date.now()}`,
      conversationId: `group_${newGroup.id}`,
      groupId: newGroup.id,
      senderId: authUser.id,
      content: `🎉 Group "${name}" created! Tap the Video or Voice Call buttons above to start a live Group Call.`,
      messageType: 'text',
      isRead: true,
      createdAt: new Date().toISOString(),
    });

    saveDB();
    return sendJson(res, 201, { group: newGroup });
  }

  // Get conversations (Direct 1-to-1 + Group chats)
  if (pathname === '/api/conversations' && req.method === 'GET') {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to access messages.' });

    // Direct conversations
    const otherUsers = db.users.filter((u) => u.id !== authUser.id);
    const directConversations = otherUsers.map((partner) => {
      const thread = db.messages.filter(
        (m) =>
          !m.groupId &&
          ((m.senderId === authUser.id && m.receiverId === partner.id) ||
            (m.senderId === partner.id && m.receiverId === authUser.id))
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

    // Group conversations
    const myGroups = (db.groups || []).filter((g) => g.memberIds && g.memberIds.includes(authUser.id));
    const groupConversations = myGroups.map((group) => {
      const thread = db.messages.filter((m) => m.groupId === group.id);
      const lastMessage = thread.length > 0 ? thread[thread.length - 1] : null;
      const members = group.memberIds
        .map((id) => db.users.find((u) => u.id === id))
        .filter(Boolean)
        .map(sanitizeUser);

      return {
        id: `group_${group.id}`,
        type: 'group',
        groupId: group.id,
        name: group.name,
        avatarUrl: group.avatarUrl || '',
        creatorId: group.creatorId,
        members,
        lastMessage,
        unreadCount: 0,
        updatedAt: lastMessage ? lastMessage.createdAt : group.createdAt,
      };
    });

    const all = [...groupConversations, ...directConversations];
    all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sendJson(res, 200, { conversations: all });
  }

  // Get messages for a group
  if (req.method === 'GET' && pathname.startsWith('/api/messages/group/')) {
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });
    const groupId = decodeURIComponent(pathname.replace('/api/messages/group/', ''));
    const group = (db.groups || []).find((g) => g.id === groupId);
    if (!group || !group.memberIds.includes(authUser.id)) {
      return sendJson(res, 403, { error: 'You are not a member of this group.' });
    }

    const thread = db.messages
      .filter((m) => m.groupId === groupId)
      .map((m) => {
        const sender = db.users.find((u) => u.id === m.senderId);
        return {
          ...m,
          sender: sanitizeUser(sender),
        };
      });

    return sendJson(res, 200, { messages: thread });
  }

  // Get messages for direct 1-to-1 chat
  if (req.method === 'GET' && pathname.startsWith('/api/messages/')) {
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });
    const partnerId = decodeURIComponent(pathname.replace('/api/messages/', ''));

    // Mark unread messages from partner as read
    let updated = false;
    const thread = db.messages.filter((m) => {
      const belongs =
        !m.groupId &&
        ((m.senderId === authUser.id && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === authUser.id));
      if (belongs && m.receiverId === authUser.id && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
      return belongs;
    });
    if (updated) saveDB();

    return sendJson(res, 200, { messages: thread });
  }

  // Send message (Direct OR Group)
  if (req.method === 'POST' && pathname === '/api/messages') {
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req);
    const content = String(body.content || '').trim().slice(0, 2000);
    const messageType = ['text', 'image', 'video', 'audio', 'game', 'shared_post'].includes(body.messageType)
      ? body.messageType
      : 'text';

    if (!content && !body.mediaUrl) {
      return sendJson(res, 400, { error: 'Message content or media is required.' });
    }

    // Handle Group message
    if (body.groupId) {
      const group = (db.groups || []).find((g) => g.id === body.groupId);
      if (!group || !group.memberIds.includes(authUser.id)) {
        return sendJson(res, 403, { error: 'Not a member of this group.' });
      }

      const msg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        conversationId: `group_${body.groupId}`,
        groupId: body.groupId,
        senderId: authUser.id,
        content,
        mediaUrl: body.mediaUrl || undefined,
        messageType,
        isRead: true,
        createdAt: new Date().toISOString(),
      };

      db.messages.push(msg);
      saveDB();

      return sendJson(res, 201, {
        message: {
          ...msg,
          sender: sanitizeUser(authUser),
        },
      });
    }

    // Handle Direct 1-to-1 message
    const receiverId = String(body.receiverId || '');
    if (!receiverId) {
      return sendJson(res, 400, { error: 'Receiver ID is required.' });
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
