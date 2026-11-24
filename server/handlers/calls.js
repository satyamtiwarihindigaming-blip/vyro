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

  // Initiate a WebRTC call with SDP offer
  if (req.method === 'POST' && pathname === '/api/calls/initiate') {
    const body = await parseBody(req);
    const receiverId = String(body.receiverId || '');
    const callType = body.callType === 'voice' ? 'voice' : 'video';
    const offer = body.offer;

    if (!receiverId || !offer) {
      return sendJson(res, 400, { error: 'Receiver ID and WebRTC offer are required.' });
    }
    const receiver = db.users.find((u) => u.id === receiverId);
    if (!receiver) return sendJson(res, 404, { error: 'Recipient not found.' });

    // End any previous active ringing calls by this caller
    db.calls.forEach((c) => {
      if (c.callerId === authUser.id && c.status === 'ringing') {
        c.status = 'ended';
      }
    });

    const call = {
      id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      callerId: authUser.id,
      receiverId,
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

  // Poll incoming ringing calls for logged-in user
  if (req.method === 'GET' && pathname === '/api/calls/incoming') {
    const recentCutoff = Date.now() - 60 * 1000;
    const incoming = db.calls.find(
      (c) =>
        c.receiverId === authUser.id &&
        c.status === 'ringing' &&
        new Date(c.createdAt).getTime() > recentCutoff
    );

    if (!incoming) return sendJson(res, 200, { call: null });

    const caller = db.users.find((u) => u.id === incoming.callerId);
    return sendJson(res, 200, {
      call: {
        ...incoming,
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
