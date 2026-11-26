import { WebSocketServer, WebSocket } from 'ws';
import { verifySessionToken } from './db.js';

let wssInstance = null;

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  wssInstance = wss;

  // 25-second ping/pong heartbeat to defeat Render free-tier idle drops
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        ws.terminate();
      }
    });
  }, 25000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.userId = null;

    // Check token from query param if provided (/ws?token=...)
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const token = url.searchParams.get('token');
      if (token) {
        const user = verifySessionToken(token);
        if (user) {
          ws.userId = user.id;
        }
      }
    } catch {}

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'auth') {
          const user = verifySessionToken(msg.token);
          if (user) {
            ws.userId = user.id;
            ws.send(JSON.stringify({ type: 'auth_success', userId: user.id }));
          } else {
            ws.send(JSON.stringify({ type: 'auth_error', error: 'Invalid or expired token' }));
          }
        } else if (msg.type === 'ping') {
          ws.isAlive = true;
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        } else if (msg.type === 'chat_typing' && msg.recipientId) {
          broadcastWsEvent(
            { type: 'chat_typing', senderId: ws.userId, conversationId: msg.conversationId },
            [msg.recipientId]
          );
        } else if (msg.type === 'ludo_action' && msg.targetUserIds) {
          broadcastWsEvent(
            { type: 'ludo_action', data: msg.data, senderId: ws.userId },
            msg.targetUserIds
          );
        }
      } catch (err) {
        console.warn('WS message parse error:', err.message);
      }
    });

    ws.on('error', (err) => {
      console.warn('WS Client error:', err.message);
    });

    // Send initial handshake
    ws.send(JSON.stringify({ type: 'connected', heartbeatInterval: 25000 }));
  });

  console.log('⚡ VYRO WebSocket Server initialized with 25s Render heartbeat on /ws');
  return wss;
}

export function broadcastWsEvent(event, targetUserIds = null) {
  if (!wssInstance) return;
  const payload = JSON.stringify(event);

  wssInstance.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (!targetUserIds) {
        // Broadcast to all
        client.send(payload);
      } else {
        // Send to targeted users
        const targets = Array.isArray(targetUserIds) ? targetUserIds : [targetUserIds];
        if (client.userId && targets.includes(client.userId)) {
          client.send(payload);
        }
      }
    }
  });
}
