import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  Send,
  Gamepad2,
  X,
  Palette,
  Crown,
  MessageCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { apiRequest } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { DirectConversation, Message } from '../types';
import { MiniChess } from '../components/games/MiniChess';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

type ChatTheme = 'obsidian' | 'neon' | 'cyber' | 'aurora';

const CHAT_THEMES: Record<ChatTheme, string> = {
  obsidian: 'bg-vyro-bg',
  neon: 'bg-gradient-to-b from-purple-950/60 via-vyro-bg to-pink-950/40',
  cyber: 'bg-gradient-to-b from-cyan-950/50 via-slate-950 to-indigo-950/50',
  aurora: 'bg-gradient-to-br from-emerald-950/40 via-vyro-bg to-purple-950/50',
};

export const DirectPage: React.FC = () => {
  const { currentUser, isPro } = useAuth();
  const { startCall } = useCall();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatTheme, setChatTheme] = useState<ChatTheme>('obsidian');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // In-chat Mini-Game State
  const [gameActive, setGameActive] = useState(false);
  const [activeGameType, setActiveGameType] = useState<'tictactoe' | 'chess'>('tictactoe');
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    if (!currentUser) return;
    try {
      const res = await apiRequest<{ conversations: DirectConversation[] }>('/api/conversations');
      setConversations(res.conversations || []);
      if (!activePartnerId && res.conversations?.length > 0) {
        setActivePartnerId(res.conversations[0].partner.id);
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    }
  };

  const loadMessages = async (partnerId: string) => {
    if (!currentUser || !partnerId) return;
    try {
      const res = await apiRequest<{ messages: Message[] }>(`/api/messages/${partnerId}`);
      setMessages(res.messages || []);
    } catch (err) {
      console.warn('Error loading messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!activePartnerId || !currentUser) return;
    loadMessages(activePartnerId);
    const poll = setInterval(() => loadMessages(activePartnerId), 2500);
    return () => clearInterval(poll);
  }, [activePartnerId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId || !currentUser) return;

    const text = inputText.trim();
    setInputText('');
    try {
      const res = await apiRequest<{ message: Message }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: activePartnerId, content: text, messageType: 'text' }),
      });
      setMessages((prev) => [...prev, res.message]);
      loadConversations();
    } catch (err) {
      console.warn('Send message failed:', err);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;
    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="glass-panel rounded-3xl p-8 border border-vyro-border space-y-4">
          <MessageCircle className="w-10 h-10 text-vyro-primary mx-auto" />
          <h2 className="text-lg font-bold text-white">Direct Messaging & Calls</h2>
          <p className="text-xs text-slate-400">
            Sign in to message real users and start live WebRTC voice & video calls.
          </p>
          <Button variant="gradient" size="sm" onClick={() => navigate('/')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) => {
    const q = userFilter.trim().toLowerCase().replace(/^@/, '');
    if (!q) return true;
    return (
      c.partner.username.toLowerCase().includes(q) ||
      c.partner.displayName.toLowerCase().includes(q)
    );
  });

  const activeConv = conversations.find((c) => c.partner.id === activePartnerId);
  const partner = activeConv?.partner;

  return (
    <div className="h-[calc(100vh-4.5rem)] max-w-6xl mx-auto flex rounded-2xl overflow-hidden glass-panel border border-vyro-border my-2">
      {/* Real Users List + Fast Username Search */}
      <div className="w-64 sm:w-80 border-r border-vyro-border/70 flex flex-col bg-vyro-card/50">
        <div className="p-3.5 border-b border-vyro-border space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Messages & Calls</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {conversations.length} Active
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Fast search @username..."
              className="w-full bg-vyro-bg border border-vyro-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-vyro-border/40">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {conversations.length === 0
                ? 'No other real users registered yet.'
                : `No user found matching "${userFilter}"`}
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.partner.id === activePartnerId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActivePartnerId(c.partner.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-vyro-primary/15' : 'hover:bg-white/5'
                  }`}
                >
                  <Avatar src={c.partner.avatarUrl} alt={c.partner.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          {c.partner.displayName}
                        </span>
                        <VerifiedBadge
                          isVerified={c.partner.isVerified}
                          isPro={c.partner.isPro}
                          proBadge={c.partner.proBadge}
                        />
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-vyro-accent text-white text-[9px] font-bold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {c.lastMessage ? c.lastMessage.content : `@${c.partner.username}`}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col relative transition-colors ${CHAT_THEMES[chatTheme]}`}>
        {partner ? (
          <>
            <div className="p-3.5 border-b border-vyro-border flex items-center justify-between bg-vyro-card/40">
              <div className="flex items-center gap-3">
                <Avatar src={partner.avatarUrl} alt={partner.displayName} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{partner.displayName}</span>
                    <VerifiedBadge
                      isVerified={partner.isVerified}
                      isPro={partner.isPro}
                      proBadge={partner.proBadge}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">@{partner.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {isPro && (
                  <div className="relative">
                    <button
                      onClick={() => setShowThemePicker(!showThemePicker)}
                      className="p-2 rounded-xl text-amber-400 hover:bg-white/5 transition-colors flex items-center gap-1"
                      title="Pro Chat Themes"
                    >
                      <Palette className="w-4 h-4" />
                    </button>
                    {showThemePicker && (
                      <div className="absolute right-0 top-10 z-30 w-40 rounded-xl glass-panel border border-vyro-border p-2 space-y-1 shadow-2xl">
                        <p className="text-[10px] font-bold text-amber-400 px-2 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> PRO Themes
                        </p>
                        {(['obsidian', 'neon', 'cyber', 'aurora'] as ChatTheme[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setChatTheme(t);
                              setShowThemePicker(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs capitalize ${
                              chatTheme === t
                                ? 'bg-vyro-primary text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setGameActive(!gameActive)}
                  className="p-2 rounded-xl text-slate-300 hover:text-vyro-accent hover:bg-white/5 transition-colors"
                  title="In-Chat Games"
                >
                  <Gamepad2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startCall(partner, 'voice')}
                  className="p-2 rounded-xl bg-vyro-primary/15 text-vyro-primary hover:bg-vyro-primary hover:text-white transition-colors"
                  title="Start Live Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startCall(partner, 'video')}
                  className="p-2 rounded-xl bg-vyro-cyan/15 text-vyro-cyan hover:bg-vyro-cyan hover:text-white transition-colors"
                  title="Start Live Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {gameActive && (
              <div className="p-4 bg-vyro-card/90 border-b border-vyro-border flex flex-col items-center">
                <div className="flex items-center justify-between w-full max-w-sm mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveGameType('tictactoe')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        activeGameType === 'tictactoe' ? 'bg-vyro-primary text-white' : 'bg-vyro-bg text-slate-400'
                      }`}
                    >
                      Tic-Tac-Toe
                    </button>
                    <button
                      onClick={() => setActiveGameType('chess')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        activeGameType === 'chess' ? 'bg-vyro-primary text-white' : 'bg-vyro-bg text-slate-400'
                      }`}
                    >
                      Cyber Chess
                    </button>
                  </div>
                  <button onClick={() => setGameActive(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeGameType === 'tictactoe' ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 w-48 h-48">
                      {board.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCellClick(idx)}
                          className="w-full h-full rounded-xl bg-vyro-bg border border-vyro-border text-lg font-bold flex items-center justify-center hover:bg-vyro-card text-white"
                        >
                          {cell === 'X' ? <span className="text-vyro-primary">X</span> : cell === 'O' ? <span className="text-vyro-accent">O</span> : ''}
                        </button>
                      ))}
                    </div>
                    {calculateWinner(board) && (
                      <p className="mt-2 text-xs font-bold text-emerald-400">
                        Winner: Player {calculateWinner(board)}! 🎉
                      </p>
                    )}
                  </>
                ) : (
                  <MiniChess />
                )}
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500">
                  <p>Start a real conversation or live call with @{partner.username}!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-vyro-primary to-vyro-primaryHover text-white rounded-br-none shadow-glow-purple/20'
                            : 'bg-vyro-card border border-vyro-border text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-vyro-border bg-vyro-card/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${partner.displayName}...`}
                className="flex-1 bg-vyro-bg border border-vyro-border rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-vyro-primary text-white disabled:opacity-40 hover:bg-vyro-primaryHover shadow-glow-purple/40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 text-slate-400">
            <MessageCircle className="w-10 h-10 text-vyro-primary/60" />
            <p className="text-sm font-bold text-white">Select a User to Chat or Call</p>
            <p className="text-xs max-w-xs">
              Search any @username in the sidebar to send instant messages or start live voice & video calls.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
