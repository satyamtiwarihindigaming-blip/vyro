import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getAuthToken } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export type WsConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

interface WebSocketContextType {
  status: WsConnectionStatus;
  sendMessage: (type: string, data?: Record<string, unknown>) => void;
  subscribe: (type: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<WsConnectionStatus>('connecting');
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const isSecure = window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = getAuthToken();
    const url = `${protocol}//${host}/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    setStatus((prev) => (prev === 'connected' ? 'reconnecting' : 'connecting'));

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        retryCountRef.current = 0;
        setToastMessage('Live Realtime Connected ⚡');
        setShowStatusToast(true);
        setTimeout(() => setShowStatusToast(false), 2000);

        // Authenticate if token exists
        if (token) {
          ws.send(JSON.stringify({ type: 'auth', token }));
        }

        // Start 25s ping loop for Render free-tier keep-alive
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const callbacks = listenersRef.current.get(msg.type);
          if (callbacks) {
            callbacks.forEach((cb) => {
              try {
                cb(msg.data || msg.message || msg);
              } catch (e) {
                console.warn('WS listener error:', e);
              }
            });
          }
        } catch {
          // ignore non-json
        }
      };

      ws.onerror = () => {
        // Handled in onclose
      };

      ws.onclose = () => {
        if (pingTimerRef.current) clearInterval(pingTimerRef.current);
        setStatus('reconnecting');
        setToastMessage('⚡ Reconnecting to VYRO live stream...');
        setShowStatusToast(true);

        // Exponential backoff: 1.5s, 3s, 6s, 10s (max 15s)
        const delay = Math.min(1500 * Math.pow(1.5, retryCountRef.current), 15000);
        retryCountRef.current += 1;

        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch {
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, data?: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  const subscribe = useCallback((type: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(callback);

    return () => {
      const set = listenersRef.current.get(type);
      if (set) {
        set.delete(callback);
        if (set.size === 0) listenersRef.current.delete(type);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, sendMessage, subscribe }}>
      {children}

      {/* Floating Status Toast for Reconnection / Render Wakeup */}
      <AnimatePresence>
        {showStatusToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          >
            <div
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-2 backdrop-blur-xl border shadow-xl ${
                status === 'connected'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50'
                  : 'bg-amber-950/80 border-amber-500/40 text-amber-300 shadow-amber-950/50'
              }`}
            >
              {status === 'connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{toastMessage}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{toastMessage}</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
