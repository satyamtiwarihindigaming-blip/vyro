import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  Smile,
  Image as ImageIcon,
  Sparkles,
  Mic,
  MicOff,
  Play,
  Pause,
  Sticker,
  Flame,
  Heart,
  Laugh,
  Rocket,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import { useWebSocket } from '../context/WebSocketContext';
import { apiRequest } from '../lib/api';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { AnyConversation, GroupConversation, DirectConversation, Message, User } from '../types';
import { MiniChess } from '../components/games/MiniChess';
import { LudoGame } from '../components/games/LudoGame';
import { Button } from '../components/ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { soundEngine } from '../lib/soundEngine';

type ChatTheme = 'ios_midnight' | 'ios_saffron' | 'ios_rose' | 'ios_emerald' | 'ios_cyber';

const CHAT_THEMES: Record<ChatTheme, { name: string; bg: string; badge: string; bubbleClass: string }> = {
  ios_midnight: {
    name: 'Apple Midnight Glass',
    bg: 'bg-[#060911] shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]',
    badge: 'from-slate-700 to-slate-950',
    bubbleClass: 'from-slate-800 to-slate-900 text-white border-white/20',
  },
  ios_saffron: {
    name: 'Solar Saffron iOS',
    bg: 'bg-gradient-to-b from-[#1a1205]/90 via-[#060911] to-[#120a02]/95',
    badge: 'from-amber-500 to-amber-700',
    bubbleClass: 'from-amber-500 via-amber-400 to-amber-600 text-slate-950 border-amber-300/40',
  },
  ios_rose: {
    name: 'Neon Rose Liquid',
    bg: 'bg-gradient-to-b from-[#220713]/80 via-[#060911] to-[#19040c]/90',
    badge: 'from-rose-500 to-pink-700',
    bubbleClass: 'from-rose-500 via-rose-400 to-pink-600 text-white border-rose-300/40',
  },
  ios_emerald: {
    name: 'Aurora Emerald',
    bg: 'bg-gradient-to-b from-[#031c13]/80 via-[#060911] to-[#01140e]/90',
    badge: 'from-emerald-500 to-teal-700',
    bubbleClass: 'from-emerald-500 via-emerald-400 to-teal-600 text-slate-950 border-emerald-300/40',
  },
  ios_cyber: {
    name: 'Cyber Crystal Cyan',
    bg: 'bg-gradient-to-b from-[#021824]/80 via-[#060911] to-[#040e1f]/90',
    badge: 'from-cyan-500 to-blue-700',
    bubbleClass: 'from-cyan-500 via-cyan-400 to-blue-600 text-slate-950 border-cyan-300/40',
  },
};

// Audio Message Bubble Component with Waveform Player
const AudioMessageBubble: React.FC<{ url: string; isMe: boolean }> = ({ url, isMe }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    soundEngine.playPop();
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  return (
    <div className="flex items-center gap-3 py-1 px-1 select-none">
      <button
        type="button"
        onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
          isMe ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
        }`}
        aria-label={playing ? 'Pause Voice Note' : 'Play Voice Note'}
      >
        {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
      </button>

      {/* Animated iOS Waveform Bars */}
      <div className="flex items-center gap-1 h-6">
        {[4, 12, 18, 10, 22, 14, 20, 8, 16, 6].map((h, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-200 ${
              isMe ? 'bg-slate-950/70' : 'bg-amber-400'
            } ${playing ? 'animate-pulse' : 'opacity-60'}`}
            style={{ height: `${playing ? Math.max(4, (h * Math.random() * 1.5).toFixed(0)) : h}px` }}
          />
        ))}
      </div>

      <span className={`text-[10px] font-mono font-bold ${isMe ? 'text-slate-900' : 'text-amber-300'}`}>
        Voice Note
      </span>
    </div>
  );
};

export const DirectPage: React.FC = () => {
  const { currentUser, isPro } = useAuth();
  const { startCall, startGroupCall } = useCall();
  const { subscribe } = useWebSocket();
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
  const [chatTheme, setChatTheme] = useState<ChatTheme>('ios_saffron');
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

  // Emojis, GIFs, Stickers, Media, Voice Notes
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const QUICK_EMOJIS = ['🔥', '❤️', '😂', '👏', '🚀', '💯', '🎲', '🎵', '✨', '⚡', '👑', '🥳', '😎', '🙏'];

  const STICKER_PACKS = [
    {
      category: '🔥 Hype & Energy',
      stickers: [
        { name: 'Fire Hype', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
        { name: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
        { name: 'Lit Dance', url: 'https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif' },
      ],
    },
    {
      category: '💖 Vibes & Love',
      stickers: [
        { name: 'Heart Pop', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
        { name: 'Cheers Laugh', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif' },
        { name: 'Victory Cheer', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif' },
      ],
    },
    {
      category: '🎲 Gaming Champ',
      stickers: [
        { name: 'Gamer Win', url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif' },
        { name: 'Level Up', url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' },
      ],
    },
  ];

  const QUICK_GIFS = [
    { name: 'Victory Dance', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif' },
    { name: 'Fire / Hype', url: 'https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif' },
    { name: 'Mind Blown', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
    { name: 'Laughing', url: 'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif' },
    { name: 'Gaming Time', url: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif' },
  ];

  const handleSendGameAction = async (text: string) => {
    if (!activeConv || !currentUser) return;
    try {
      const payload =
        activeConv.type === 'group'
          ? { conversationId: activeConv.id, content: text }
          : { receiverId: activeConv.partner.id, content: text };

      const res = await apiRequest<{ message: Message }>('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch {
      // Ignore background notification failure
    }
  };

  const handleSendMediaMessage = async (mediaDataUrl: string, type: 'image' | 'audio' | 'text') => {
    if (!activeConv || !currentUser) return;
    try {
      soundEngine.playPop();
      let body: Record<string, unknown> = {
        content: type === 'image' ? '📷 Photo' : type === 'audio' ? '🎤 Voice Note' : mediaDataUrl,
        mediaUrl: mediaDataUrl,
        messageType: type === 'image' ? 'image' : type === 'audio' ? 'audio' : 'text',
      };
      if (activeConv.type === 'group') {
        body.groupId = activeConv.groupId;
      } else {
        body.receiverId = activeConv.partner.id;
      }

      const res = await apiRequest<{ message: Message }>('/api/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.warn('Failed to send media:', err);
    }
  };

  const handleSendGifOrSticker = async (url: string) => {
    if (!activeConv || !currentUser) return;
    setShowGifPicker(false);
    setShowStickerPicker(false);
    await handleSendMediaMessage(url, 'text');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleSendMediaMessage(base64, 'image');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice Recording Engine
  const startVoiceRecording = async () => {
    try {
      soundEngine.playHapticClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          handleSendMediaMessage(base64Audio, 'audio');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Mic error:', err);
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopVoiceRecording = (send: boolean) => {
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecordingAudio) {
      if (!send) {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } else {
        mediaRecorderRef.current.stop();
      }
    }
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
  };

  const handleLaunchLudo = () => {
    soundEngine.playPop();
    setGameActive(true);
    setActiveGameType('ludo');
    handleSendGameAction('🎲 Started a live Ludo Match! Tap the dice to roll and play with me!');
  };

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
      const filtered = (res.users || []).filter((u) => u.id !== currentUser?.id);
      if (filtered.length >= 2) {
        setAllUsers(filtered);
      } else {
        const mockOthers: User[] = [
          {
            id: 'mock_1',
            username: 'arijit_music',
            displayName: 'Arijit Singh Official',
            email: 'arijit@vyro.internal',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            role: 'creator',
            isPrivate: false,
            isVerified: true,
            isPro: true,
            themePreference: 'dark',
            followersCount: 42000000,
            followingCount: 15,
            postsCount: 88,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mock_2',
            username: 'diljit_crew',
            displayName: 'Diljit Dosanjh',
            email: 'diljit@vyro.internal',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            role: 'creator',
            isPrivate: false,
            isVerified: true,
            isPro: true,
            themePreference: 'dark',
            followersCount: 35000000,
            followingCount: 40,
            postsCount: 120,
            createdAt: new Date().toISOString(),
          },
        ];
        setAllUsers([...filtered, ...mockOthers]);
      }
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

  // Real-time WebSocket listener for immediate instant message delivery
  useEffect(() => {
    const unsub = subscribe('new_message', (newMsg: Message) => {
      if (!newMsg) return;
      const isForActive =
        (activeConv?.type === 'group' && newMsg.groupId === activeConv.groupId) ||
        (activeConv?.type === 'direct' &&
          (newMsg.senderId === activeConv.partner.id ||
            newMsg.receiverId === activeConv.partner.id));

      if (isForActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          soundEngine.playPop();
          return [...prev, newMsg];
        });
      }
      loadConversations();
    });

    return () => unsub();
  }, [subscribe, activeConv?.id]);

  useEffect(() => {
    if (!activeConv || !currentUser) return;
    loadMessages(activeConv);
    const poll = setInterval(() => loadMessages(activeConv), 5000);
    return () => clearInterval(poll);
  }, [activeConvId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !currentUser) return;

    soundEngine.playPop();
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
        <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4 shadow-2xl">
          <MessageCircle className="w-10 h-10 text-amber-400 mx-auto" />
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

  const currentThemeConfig = CHAT_THEMES[chatTheme] || CHAT_THEMES.ios_saffron;

  return (
    <div className={`h-[calc(100vh-4.5rem)] max-w-6xl mx-auto flex rounded-3xl overflow-hidden glass-panel border border-white/10 my-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${currentThemeConfig.bg}`}>
      {/* Hidden File Input for Image Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Sidebar: Conversations List & New Group Button */}
      <div className={`w-full md:w-80 border-r border-white/10 flex-col bg-[#0B101D]/75 backdrop-blur-xl ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3.5 border-b border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              <span>Messages & Calls</span>
            </h2>
            <button
              onClick={() => {
                soundEngine.playPop();
                loadAllUsers();
                setShowCreateGroup(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors"
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
              className="w-full bg-[#060911]/90 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
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
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setActiveConvId(c.id);
                  }}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-all ${
                    isSelected ? 'bg-amber-500/15 border-l-2 border-amber-400' : 'hover:bg-white/5'
                  }`}
                >
                  {isGroup ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-xs shadow-md">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <Avatar
                      src={c.partner.avatarUrl}
                      alt={c.partner.displayName}
                      size="sm"
                      isOnline={true}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate">
                        {isGroup ? c.name : c.partner.displayName}
                      </p>
                      {c.lastMessage && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.lastMessage ? c.lastMessage.content : isGroup ? 'Group Created' : 'No messages yet'}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeConvId ? 'flex' : 'hidden md:flex'}`}>
        {activeConv ? (
          <>
            {/* iOS Specular Glass Header Bar */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0B101D]/60 backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {activeConv.type === 'group' ? (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs">
                    <Users className="w-4 h-4" />
                  </div>
                ) : (
                  <Avatar
                    src={activeConv.partner.avatarUrl}
                    alt={activeConv.partner.displayName}
                    size="xs"
                    isOnline={true}
                  />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
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
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        👥 {activeConv.members.length}
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

              {/* Call & Tool Actions Deck */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* iPhone Theme Selector Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      soundEngine.playHapticClick();
                      setShowThemePicker(!showThemePicker);
                    }}
                    className="p-2 rounded-xl text-amber-400 hover:bg-white/10 transition-colors flex items-center gap-1 border border-amber-400/30 shadow-sm"
                    title="Switch iPhone Liquid Themes"
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showThemePicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        className="absolute right-0 top-11 z-50 w-52 rounded-2xl glass-panel border border-white/15 p-3 space-y-2 shadow-2xl bg-[#0B101D]/95 backdrop-blur-2xl"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> iPhone Glass Themes
                        </p>
                        <div className="space-y-1">
                          {(Object.keys(CHAT_THEMES) as ChatTheme[]).map((key) => {
                            const t = CHAT_THEMES[key];
                            const isCurrent = chatTheme === key;
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  soundEngine.playPop();
                                  setChatTheme(key);
                                  setShowThemePicker(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-amber-500/20 text-white font-extrabold border border-amber-400/40'
                                    : 'text-slate-300 hover:bg-white/10'
                                }`}
                              >
                                <span>{t.name}</span>
                                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${t.badge} ring-1 ring-white/30`} />
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playPop();
                    setGameActive(!gameActive);
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-white/10 transition-colors"
                  title="In-Chat Games (Ludo, Chess, Tic-Tac-Toe)"
                >
                  <Gamepad2 className="w-4 h-4" />
                </button>

                {/* Voice Call Button */}
                <button
                  onClick={() => {
                    soundEngine.playPop();
                    if (activeConv.type === 'group') {
                      startGroupCall(activeConv.members, 'voice', activeConv.name);
                    } else {
                      startCall(activeConv.partner, 'voice');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition-all flex items-center gap-1.5 text-xs font-bold border border-amber-400/30"
                  title={activeConv.type === 'group' ? 'Start Group Voice Call' : 'Start Live Voice Call'}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice</span>
                </button>

                {/* Video Call Button */}
                <button
                  onClick={() => {
                    soundEngine.playPop();
                    if (activeConv.type === 'group') {
                      startGroupCall(activeConv.members, 'video', activeConv.name);
                    } else {
                      startCall(activeConv.partner, 'video');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                  title={activeConv.type === 'group' ? 'Start Group Video Call' : 'Start Live Video Call'}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video ⚡</span>
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
                        activeGameType === 'ludo' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950' : 'bg-vyro-bg text-slate-400'
                      }`}
                    >
                      🎲 Ludo
                    </button>
                    <button
                      onClick={() => setActiveGameType('tictactoe')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        activeGameType === 'tictactoe' ? 'bg-amber-500 text-slate-950' : 'bg-vyro-bg text-slate-400'
                      }`}
                    >
                      Tic-Tac-Toe
                    </button>
                    <button
                      onClick={() => setActiveGameType('chess')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        activeGameType === 'chess' ? 'bg-amber-500 text-slate-950' : 'bg-vyro-bg text-slate-400'
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
                  <LudoGame inChat onGameAction={(text) => handleSendGameAction(text)} />
                ) : activeGameType === 'tictactoe' ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 w-48 h-48">
                      {board.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCellClick(idx)}
                          className="w-full h-full rounded-xl bg-vyro-bg border border-vyro-border text-lg font-bold flex items-center justify-center hover:bg-vyro-card text-white"
                        >
                          {cell === 'X' ? <span className="text-amber-400">X</span> : cell === 'O' ? <span className="text-rose-400">O</span> : ''}
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

            {/* Messages Stream with iPhone Fluid Motion */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-white text-sm">
                    {activeConv.type === 'group'
                      ? `Welcome to ${activeConv.name}!`
                      : `Chat with @${activeConv.partner.username}`}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Send stickers, images, voice notes, or play live Ludo in chat!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  const senderName = m.sender ? m.sender.displayName : (isMe ? 'You' : 'Member');
                  const isGif = m.content.startsWith('http') && (m.content.includes('.gif') || m.content.includes('giphy.com'));
                  const isLudoMsg = m.content.includes('🎲') || m.content.includes('Ludo');
                  const isAudioMsg = m.messageType === 'audio' || (m.mediaUrl && m.mediaUrl.startsWith('data:audio'));
                  const isImageMsg = m.messageType === 'image' || (m.mediaUrl && m.mediaUrl.startsWith('data:image'));

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.94, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      {activeConv.type === 'group' && !isMe && (
                        <span className="text-[10px] font-bold text-amber-400 mb-0.5 px-1">
                          {senderName}
                        </span>
                      )}

                      {/* iPhone Glass Liquid Message Bubble */}
                      <div
                        className={`relative max-w-[80%] sm:max-w-[70%] px-3.5 py-2.5 rounded-3xl text-xs leading-relaxed transition-all shadow-md ${
                          isMe
                            ? `bg-gradient-to-tr ${currentThemeConfig.bubbleClass} rounded-br-sm shadow-[0_4px_16px_rgba(0,0,0,0.4)]`
                            : 'glass-card bg-[#0F172A]/85 text-slate-100 rounded-bl-sm border border-white/10 shadow-[0_4px_18px_rgba(0,0,0,0.5)]'
                        } ${isLudoMsg ? 'border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : ''}`}
                      >
                        {/* Top specular highlight rim */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-t-3xl" />

                        {isAudioMsg ? (
                          <AudioMessageBubble url={m.mediaUrl || m.content} isMe={isMe} />
                        ) : isImageMsg ? (
                          <div className="space-y-1">
                            <img
                              src={m.mediaUrl || m.content}
                              alt="Shared photo"
                              onClick={() => setLightboxImage(m.mediaUrl || m.content)}
                              className="max-w-[260px] sm:max-w-[320px] max-h-[240px] rounded-2xl object-cover cursor-pointer hover:brightness-105 shadow-xl transition-all"
                            />
                            {m.content && m.content !== '📷 Photo' && (
                              <p className="text-xs pt-1 px-1">{m.content}</p>
                            )}
                          </div>
                        ) : isGif ? (
                          <img
                            src={m.content}
                            alt="Shared GIF"
                            className="max-w-[220px] max-h-[170px] rounded-2xl object-cover shadow-lg my-1"
                          />
                        ) : (
                          <div>
                            <p className="break-words">{m.content}</p>
                            {isLudoMsg && !isMe && !gameActive && (
                              <button
                                type="button"
                                onClick={() => {
                                  soundEngine.playPop();
                                  setGameActive(true);
                                  setActiveGameType('ludo');
                                }}
                                className="mt-2 px-3 py-1 rounded-xl bg-slate-950 text-amber-400 font-bold text-[10px] flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform border border-amber-400/40"
                              >
                                <Gamepad2 className="w-3.5 h-3.5" />
                                <span>Play Ludo Together 🎲</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] text-slate-500 mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar (Toggled) */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 py-2 bg-[#0B101D]/90 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar"
                >
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        soundEngine.playHapticClick();
                        setInputText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-lg hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Stickers Tray (Toggled) */}
            <AnimatePresence>
              {showStickerPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-[#0B101D]/95 border-t border-white/10 space-y-3 max-h-60 overflow-y-auto no-scrollbar"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sticker className="w-3.5 h-3.5" /> Animated Stickers
                    </span>
                    <button type="button" onClick={() => setShowStickerPicker(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {STICKER_PACKS.map((pack, pIdx) => (
                      <div key={pIdx} className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400">{pack.category}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {pack.stickers.map((s, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSendGifOrSticker(s.url)}
                              className="group relative rounded-2xl overflow-hidden aspect-video border border-white/10 hover:border-amber-400 transition-all hover:scale-105 active:scale-95 shadow-md"
                            >
                              <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold p-0.5 text-center truncate">
                                {s.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick GIF Picker (Toggled) */}
            <AnimatePresence>
              {showGifPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-[#0B101D]/95 border-t border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trending GIFs</span>
                    <button type="button" onClick={() => setShowGifPicker(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {QUICK_GIFS.map((gif) => (
                      <button
                        key={gif.name}
                        type="button"
                        onClick={() => handleSendGifOrSticker(gif.url)}
                        className="group relative rounded-xl overflow-hidden aspect-video border border-white/10 hover:border-amber-400 transition-all active:scale-95 shadow-md"
                      >
                        <img src={gif.url} alt={gif.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-bold p-0.5 text-center truncate">
                          {gif.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Voice Recording Bar (When Recording) */}
            {isRecordingAudio ? (
              <div className="p-3 border-t border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-300">
                    Recording Audio ({recordingSeconds}s)...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stopVoiceRecording(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => stopVoiceRecording(true)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Send Audio</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Input Deck */
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-white/10 bg-[#0B101D]/75 backdrop-blur-xl flex items-center gap-2 relative"
              >
                {/* Emoji Bar Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowGifPicker(false);
                    setShowStickerPicker(false);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    showEmojiPicker ? 'text-amber-400 bg-white/10' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Stickers Tray Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setShowStickerPicker(!showStickerPicker);
                    setShowGifPicker(false);
                    setShowEmojiPicker(false);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    showStickerPicker ? 'text-amber-400 bg-white/10' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Sticker Packs"
                >
                  <Sticker className="w-4 h-4" />
                </button>

                {/* GIF Picker Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setShowGifPicker(!showGifPicker);
                    setShowEmojiPicker(false);
                    setShowStickerPicker(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-black tracking-wider transition-colors ${
                    showGifPicker ? 'text-amber-400 bg-white/10' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Send Reaction GIF"
                >
                  GIF
                </button>

                {/* Photo / Image Attachment Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPop();
                    fileInputRef.current?.click();
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors"
                  title="Attach Photo / Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Live Microphone Voice Note Button */}
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                  title="Record Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Quick Ludo Launch */}
                <button
                  type="button"
                  onClick={handleLaunchLudo}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                  title="Launch Ludo Match"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ludo</span>
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeConv.type === 'group'
                      ? `Message in ${activeConv.name}...`
                      : `Message ${activeConv.partner.displayName}...`
                  }
                  className="flex-1 bg-[#060911]/90 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold disabled:opacity-40 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 text-slate-400">
            <MessageCircle className="w-10 h-10 text-amber-400/60" />
            <p className="text-sm font-bold text-white">Select a Chat or Group Call</p>
            <p className="text-xs max-w-xs">
              Search any user, chat in groups, or start live voice & video calls.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Shared Photos */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxImage}
              alt="Enlarged photo"
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain border border-white/20"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl bg-[#0B101D]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
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
                  className="w-full bg-[#060911] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Members ({selectedMemberIds.length} chosen)
                </label>
                <div className="max-h-52 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-2 bg-[#060911]/60">
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
                            isSelected ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-white/5'
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
                                ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold'
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
