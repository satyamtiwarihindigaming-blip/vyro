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
  Users,
  Plus,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { apiRequest } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { AnyConversation, GroupConversation, DirectConversation, Message, User } from '../types';
import { MiniChess } from '../components/games/MiniChess';
import { LudoGame } from '../components/games/LudoGame';
import { Button } from '../components/ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';

type ChatTheme = 'obsidian' | 'neon' | 'cyber' | 'aurora';

const CHAT_THEMES: Record<ChatTheme, string> = {
  obsidian: 'bg-vyro-bg',
  neon: 'bg-gradient-to-b from-purple-950/60 via-vyro-bg to-pink-950/40',
  cyber: 'bg-gradient-to-b from-cyan-950/50 via-slate-950 to-indigo-950/50',
  aurora: 'bg-gradient-to-br from-emerald-950/40 via-vyro-bg to-purple-950/50',
};

export const DirectPage: React.FC = () => {
  const { currentUser, isPro } = useAuth();
  const { startCall, startGroupCall } = useCall();
  const navigate = useNavigate();
  void navigate;
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<AnyConversation[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [activeConvId, setActiveConvId] = useState<string | null>(
    searchParams.get('user') ? `conv_${searchParams.get('user')}` : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatTheme, setChatTheme] = useState<ChatTheme>('obsidian');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Group creation modal state
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // In-chat Mini-Game State
  const [gameActive, setGameActive] = useState(false);
  const [activeGameType, setActiveGameType] = useState<'ludo' | 'tictactoe' | 'chess'>('ludo');
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = async () => {
    if (!currentUser) return;
    try {
      const res = await apiRequest<{ conversations: AnyConversation[] }>('/api/conversations');
      const list = res.conversations || [];
      setConversations(list);
      if (!activeConvId && list.length > 0) {
        setActiveConvId(list[0].id);
      }
    } catch (err) {
      console.warn('Error loading conversations:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await apiRequest<{ users: User[] }>('/api/users');
      setAllUsers((res.users || []).filter((u) => u.id !== currentUser?.id));
    } catch {
      setAllUsers([]);
    }
  };

  const loadMessages = async (conv: AnyConversation | null) => {
    if (!currentUser || !conv) return;
    try {
      if (conv.type === 'group') {
        const res = await apiRequest<{ messages: Message[] }>(`/api/messages/group/${conv.groupId}`);
        setMessages(res.messages || []);
      } else {
        const res = await apiRequest<{ messages: Message[] }>(`/api/messages/${conv.partner.id}`);
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.warn('Error loading messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentUser?.id]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  useEffect(() => {
    if (!activeConv || !currentUser) return;
    loadMessages(activeConv);
    const poll = setInterval(() => loadMessages(activeConv), 2500);
    return () => clearInterval(poll);
  }, [activeConvId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !currentUser) return;

    const text = inputText.trim();
    setInputText('');
    try {
      let body: Record<string, unknown> = { content: text, messageType: 'text' };
      if (activeConv.type === 'group') {
        body.groupId = activeConv.groupId;
      } else {
        body.receiverId = activeConv.partner.id;
      }

      const res = await apiRequest<{ message: Message }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setMessages((prev) => [...prev, res.message]);
      loadConversations();
    } catch (err) {
      console.warn('Send message failed:', err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMemberIds.length === 0) return;

    setCreatingGroup(true);
    try {
      const res = await apiRequest<{ group: { id: string; name: string } }>('/api/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: newGroupName.trim(),
          memberIds: selectedMemberIds,
        }),
      });

      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedMemberIds([]);
      await loadConversations();
      setActiveConvId(`group_${res.group.id}`);
    } catch (err) {
      console.warn('Group creation failed:', err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const toggleSelectMember = (userId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
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
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) => {
    const q = userFilter.trim().toLowerCase().replace(/^@/, '');
    if (!q) return true;
    if (c.type === 'group') {
      return c.name.toLowerCase().includes(q);
    }
    return (
      c.partner.username.toLowerCase().includes(q) ||
      c.partner.displayName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-[calc(100vh-4.5rem)] max-w-6xl mx-auto flex rounded-2xl overflow-hidden glass-panel border border-vyro-border my-2">
      {/* Sidebar: Conversations List & New Group Button */}
      <div className="w-64 sm:w-80 border-r border-vyro-border/70 flex flex-col bg-vyro-card/50">
        <div className="p-3.5 border-b border-vyro-border space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Messages & Calls</h2>
            <button
              onClick={() => {
                loadAllUsers();
                setShowCreateGroup(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-vyro-primary/20 hover:bg-vyro-primary/30 text-vyro-primary text-xs font-bold flex items-center gap-1 transition-colors"
              title="Create New Group Chat"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Group</span>
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Search chats & groups..."
              className="w-full bg-vyro-bg border border-vyro-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-vyro-border/40">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {conversations.length === 0
                ? 'No chats or groups yet. Start one!'
                : `No result matching "${userFilter}"`}
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConvId;
              const isGroup = c.type === 'group';

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-vyro-primary/15' : 'hover:bg-white/5'
                  }`}
                >
                  {isGroup ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vyro-primary to-vyro-cyan flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <Avatar src={(c as DirectConversation).partner.avatarUrl} alt={(c as DirectConversation).partner.displayName} size="sm" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          {isGroup ? (c as GroupConversation).name : (c as DirectConversation).partner.displayName}
                        </span>
                        {!isGroup && (
                          <VerifiedBadge
                            isVerified={(c as DirectConversation).partner.isVerified}
                            isPro={(c as DirectConversation).partner.isPro}
                            proBadge={(c as DirectConversation).partner.proBadge}
                          />
                        )}
                        {isGroup && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[9px] font-bold text-slate-300">
                            {(c as GroupConversation).members.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {c.lastMessage
                        ? c.lastMessage.content
                        : isGroup
                        ? `${(c as GroupConversation).members.length} members in group`
                        : `@${(c as DirectConversation).partner.username}`}
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
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-3.5 border-b border-vyro-border flex items-center justify-between bg-vyro-card/40">
              <div className="flex items-center gap-3">
                {activeConv.type === 'group' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-vyro-primary to-vyro-cyan flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                ) : (
                  <Avatar
                    src={activeConv.partner.avatarUrl}
                    alt={activeConv.partner.displayName}
                    size="sm"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">
                      {activeConv.type === 'group' ? activeConv.name : activeConv.partner.displayName}
                    </span>
                    {activeConv.type === 'direct' && (
                      <VerifiedBadge
                        isVerified={activeConv.partner.isVerified}
                        isPro={activeConv.partner.isPro}
                        proBadge={activeConv.partner.proBadge}
                      />
                    )}
                    {activeConv.type === 'group' && (
                      <span className="px-2 py-0.5 rounded-full bg-vyro-cyan/20 text-vyro-cyan text-[10px] font-bold">
                        👥 {activeConv.members.length} members
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {activeConv.type === 'group'
                      ? activeConv.members.map((m) => `@${m.username}`).join(', ')
                      : `@${activeConv.partner.username}`}
                  </span>
                </div>
              </div>

              {/* Call & Tool Actions */}
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

                {/* Voice Call Button (Direct OR Group) */}
                <button
                  onClick={() => {
                    if (activeConv.type === 'group') {
                      startGroupCall(activeConv.members, 'voice', activeConv.name);
                    } else {
                      startCall(activeConv.partner, 'voice');
                    }
                  }}
                  className="p-2 rounded-xl bg-vyro-primary/15 text-vyro-primary hover:bg-vyro-primary hover:text-white transition-colors"
                  title={activeConv.type === 'group' ? 'Start Group Voice Call' : 'Start Live Voice Call'}
                >
                  <Phone className="w-4 h-4" />
                </button>

                {/* Video Call Button (Direct OR Group) */}
                <button
                  onClick={() => {
                    if (activeConv.type === 'group') {
                      startGroupCall(activeConv.members, 'video', activeConv.name);
                    } else {
                      startCall(activeConv.partner, 'video');
                    }
                  }}
                  className="p-2 rounded-xl bg-vyro-cyan/15 text-vyro-cyan hover:bg-vyro-cyan hover:text-white transition-colors"
                  title={activeConv.type === 'group' ? 'Start Group Video Call' : 'Start Live Video Call'}
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-chat Games Drawer */}
            {gameActive && (
              <div className="p-3 bg-vyro-card/95 border-b border-vyro-border flex flex-col items-center max-h-[500px] overflow-y-auto">
                <div className="flex items-center justify-between w-full max-w-sm mb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveGameType('ludo')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        activeGameType === 'ludo' ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white' : 'bg-vyro-bg text-slate-400'
                      }`}
                    >
                      🎲 Ludo
                    </button>
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

                {activeGameType === 'ludo' ? (
                  <LudoGame inChat />
                ) : activeGameType === 'tictactoe' ? (
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
                  <p>
                    {activeConv.type === 'group'
                      ? `Welcome to ${activeConv.name}! Send the first message or start a group call.`
                      : `Start a real conversation or live call with @${activeConv.partner.username}!`}
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  const senderName = m.sender ? m.sender.displayName : (isMe ? 'You' : 'Member');

                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* In group chats, display sender's name above message */}
                      {activeConv.type === 'group' && !isMe && (
                        <span className="text-[10px] font-bold text-vyro-primary mb-0.5 px-1">
                          {senderName}
                        </span>
                      )}
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

            {/* Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-vyro-border bg-vyro-card/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeConv.type === 'group'
                    ? `Message in ${activeConv.name}...`
                    : `Message ${activeConv.partner.displayName}...`
                }
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
            <p className="text-sm font-bold text-white">Select a Chat or Group Call</p>
            <p className="text-xs max-w-xs">
              Search any user, chat in groups, or start live voice & video calls.
            </p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border border-vyro-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-vyro-primary" />
                <h3 className="font-bold text-base text-white">Create Group Chat & Call</h3>
              </div>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Creators VIP Arena"
                  required
                  className="w-full bg-vyro-bg border border-vyro-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Members ({selectedMemberIds.length} chosen)
                </label>
                <div className="max-h-52 overflow-y-auto space-y-2 border border-vyro-border/60 rounded-xl p-2 bg-vyro-bg/50">
                  {allUsers.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No other users found.</p>
                  ) : (
                    allUsers.map((u) => {
                      const isSelected = selectedMemberIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleSelectMember(u.id)}
                          className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                            isSelected ? 'bg-vyro-primary/20 border border-vyro-primary/40' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar src={u.avatarUrl} alt={u.displayName} size="xs" />
                            <div>
                              <p className="text-xs font-bold text-white">{u.displayName}</p>
                              <p className="text-[10px] text-slate-400">@{u.username}</p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                              isSelected
                                ? 'bg-vyro-primary border-vyro-primary text-white'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowCreateGroup(false)}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  type="submit"
                  disabled={!newGroupName.trim() || selectedMemberIds.length === 0 || creatingGroup}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {creatingGroup ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
