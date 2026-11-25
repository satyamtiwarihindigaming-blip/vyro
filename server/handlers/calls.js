import { loadDB, saveDB } from '../db.js';
import { sendJson, parseBody, getAuthUser } from '../utils.js';

function cleanOldCalls(db) {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  db.calls = (db.calls || []).filter((c) => new Date(c.createdAt).getTime() > cutoff);
}

export async function handleCallRoutes(req, res, pathname) {
  if (!pathname.startsWith('/api/calls')) return false;

  const authUser = getAuthUser(req);
  if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });

  const db = loadDB();
  cleanOldCalls(db);

  // Initiate a WebRTC call (Direct OR Multi-Participant Group Call)
  if (req.method === 'POST' && pathname === '/api/calls/initiate') {
    const body = await parseBody(req);
    const receiverId = String(body.receiverId || '');
    const participantIds = Array.isArray(body.participantIds) ? body.participantIds.filter(Boolean) : [];
    const isGroup = Boolean(body.isGroup || participantIds.length > 1);
    const groupTitle = String(body.groupTitle || '').trim().slice(0, 60) || 'Group Call';
    const callType = body.callType === 'voice' ? 'voice' : 'video';
    const offer = body.offer;

    const allRecipients = participantIds.length > 0 ? participantIds : (receiverId ? [receiverId] : []);
    if (allRecipients.length === 0 || !offer) {
      return sendJson(res, 400, { error: 'Recipient(s) and WebRTC offer are required.' });
    }

    // End any previous active ringing calls by this caller
    db.calls.forEach((c) => {
      if (c.callerId === authUser.id && c.status === 'ringing') {
        c.status = 'ended';
      }
    });

    const call = {
      id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      callerId: authUser.id,
      receiverId: allRecipients[0] || receiverId,
      participantIds: allRecipients,
      isGroup,
      groupTitle,
      callType,
      status: 'ringing',
      offer,
      answer: null,
      callerCandidates: [],
      receiverCandidates: [],
      createdAt: new Date().toISOString(),
    };

    db.calls.push(call);
    saveDB();
    return sendJson(res, 201, { call });
  }

  // Poll incoming ringing calls for logged-in user (Direct OR Group)
  if (req.method === 'GET' && pathname === '/api/calls/incoming') {
    const recentCutoff = Date.now() - 60 * 1000;
    const incoming = db.calls.find(
      (c) =>
        (c.receiverId === authUser.id || (c.participantIds && c.participantIds.includes(authUser.id))) &&
        c.callerId !== authUser.id &&
        c.status === 'ringing' &&
        new Date(c.createdAt).getTime() > recentCutoff
    );

    if (!incoming) return sendJson(res, 200, { call: null });

    const caller = db.users.find((u) => u.id === incoming.callerId);
    const participants = (incoming.participantIds || [incoming.receiverId])
      .map((pid) => db.users.find((u) => u.id === pid))
      .filter(Boolean)
      .map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        isVerified: Boolean(u.isVerified),
        isPro: Boolean(u.isPro),
      }));

    return sendJson(res, 200, {
      call: {
        ...incoming,
        participants,
        caller: caller
          ? {
              id: caller.id,
              username: caller.username,
              displayName: caller.displayName,
              avatarUrl: caller.avatarUrl,
              isVerified: Boolean(caller.isVerified),
              isPro: Boolean(caller.isPro),
            }
          : null,
      },
    });
  }

  // Invite user to ongoing call
  if (req.method === 'POST' && pathname.endsWith('/invite')) {
    const callId = pathname.replace('/api/calls/', '').replace('/invite', '');
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return sendJson(res, 404, { error: 'Call session not found.' });

    const body = await parseBody(req);
    const targetUserId = String(body.userId || '');
    if (!targetUserId) return sendJson(res, 400, { error: 'Target user ID is required.' });

    call.participantIds = call.participantIds || [call.receiverId];
    if (!call.participantIds.includes(targetUserId)) {
      call.participantIds.push(targetUserId);
    }
    call.isGroup = true;
    saveDB();

    return sendJson(res, 200, { call });
  }

  // Answer incoming call with SDP answer
  if (req.method === 'POST' && pathname.endsWith('/answer')) {
    const callId = pathname.replace('/api/calls/', '').replace('/answer', '');
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return sendJson(res, 404, { error: 'Call session not found.' });
    if (call.receiverId !== authUser.id) return sendJson(res, 403, { error: 'Forbidden' });

    const body = await parseBody(req);
    if (!body.answer) return sendJson(res, 400, { error: 'SDP answer is required.' });

    call.answer = body.answer;
    call.status = 'connected';
    saveDB();
    return sendJson(res, 200, { call });
  }

  // Exchange WebRTC ICE candidates
  if (req.method === 'POST' && pathname.endsWith('/ice')) {
    const callId = pathname.replace('/api/calls/', '').replace('/ice', '');
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return sendJson(res, 404, { error: 'Call session not found.' });
    if (call.callerId !== authUser.id && call.receiverId !== authUser.id) {
      return sendJson(res, 403, { error: 'Forbidden' });
    }

    const body = await parseBody(req);
    if (body.candidate) {
      if (authUser.id === call.callerId) {
        call.callerCandidates.push(body.candidate);
      } else {
        call.receiverCandidates.push(body.candidate);
      }
      saveDB();
    }
    return sendJson(res, 200, { ok: true });
  }

  // End or decline call
  if (req.method === 'POST' && pathname.endsWith('/end')) {
    const callId = pathname.replace('/api/calls/', '').replace('/end', '');
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return sendJson(res, 404, { error: 'Call session not found.' });
    if (call.callerId !== authUser.id && call.receiverId !== authUser.id) {
      return sendJson(res, 403, { error: 'Forbidden' });
    }

    call.status =
      call.status === 'ringing' && authUser.id === call.receiverId ? 'rejected' : 'ended';
    saveDB();
    return sendJson(res, 200, { call });
  }

  // Poll specific call status & remote candidates
  if (req.method === 'GET' && pathname.startsWith('/api/calls/')) {
    const callId = pathname.replace('/api/calls/', '');
    const call = db.calls.find((c) => c.id === callId);
    if (!call) return sendJson(res, 404, { error: 'Call session not found.' });
    if (call.callerId !== authUser.id && call.receiverId !== authUser.id) {
      return sendJson(res, 403, { error: 'Forbidden' });
    }
    return sendJson(res, 200, { call });
  }

  return false;
}
