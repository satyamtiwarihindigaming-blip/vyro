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
  Reply,
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
import { SPRING_SNAPPY, SPRING_SMOOTH } from '../lib/motion';

type ChatTheme = 'ios_midnight' | 'ios_saffron' | 'ios_rose' | 'ios_emerald' | 'ios_cyber' | 'nano_banana' | 'nano_banana_dark';

const CHAT_THEMES: Record<ChatTheme, { name: string; bg: string; bgImage?: string; badge: string; bubbleClass: string; accent: string }> = {
  nano_banana: {
    name: 'Nano Banana Silk 🍌',
    bg: 'bg-black/40',
    bgImage: "url('/themes/nano_banana_ambient.svg')",
    badge: 'from-amber-400 to-amber-600',
    bubbleClass: 'from-amber-400/90 via-amber-500/90 to-yellow-600/90 text-black font-semibold border-amber-300/60 shadow-[0_4px_24px_rgba(245,158,11,0.25)]',
    accent: 'text-amber-300',
  },
  nano_banana_dark: {
    name: 'Nano Banana Obsidian 🍌',
    bg: 'bg-black/60',
    bgImage: "url('/themes/nano_banana_ambient.svg')",
    badge: 'from-amber-500 to-yellow-700',
    bubbleClass: 'from-neutral-900/95 via-amber-950/50 to-neutral-900/95 text-amber-200 border-amber-500/35 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
    accent: 'text-amber-400',
  },
  ios_midnight: {
    name: 'Apple Midnight Glass',
    bg: 'bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]',
    badge: 'from-slate-700 to-slate-900',
    bubbleClass: 'from-white/20 to-white/10 text-white border-white/25',
    accent: 'text-white/80',
  },
  ios_saffron: {
    name: 'Solar Saffron iOS',
    bg: 'bg-gradient-to-b from-amber-950/30 via-black/60 to-black/80',
    badge: 'from-amber-500 to-amber-700',
    bubbleClass: 'from-amber-500/80 via-amber-600/80 to-amber-700/80 text-white border-amber-300/40',
    accent: 'text-amber-400',
  },
  ios_rose: {
    name: 'Neon Rose Liquid',
    bg: 'bg-gradient-to-b from-rose-950/30 via-black/60 to-black/80',
    badge: 'from-rose-500 to-pink-700',
    bubbleClass: 'from-rose-500/80 via-pink-600/80 to-rose-700/80 text-white border-rose-300/40',
    accent: 'text-rose-400',
  },
  ios_emerald: {
    name: 'Aurora Emerald',
    bg: 'bg-gradient-to-b from-emerald-950/30 via-black/60 to-black/80',
    badge: 'from-emerald-500 to-teal-700',
    bubbleClass: 'from-emerald-500/80 via-teal-600/80 to-emerald-700/80 text-white border-emerald-300/40',
    accent: 'text-emerald-400',
  },
  ios_cyber: {
    name: 'Cyber Crystal Cyan',
    bg: 'bg-gradient-to-b from-cyan-950/30 via-black/60 to-black/80',
    badge: 'from-cyan-500 to-blue-700',
    bubbleClass: 'from-cyan-500/80 via-blue-600/80 to-indigo-700/80 text-white border-cyan-300/40',
    accent: 'text-cyan-400',
  },
};

function getPartnerPresence(partner?: User | null): { isOnline: boolean; label: string } {
  if (!partner) return { isOnline: false, label: 'Offline' };
  const isSpecialOnline = partner.username === 'satyam' || partner.username === 'vyro_admin';
  if (partner.lastActiveAt) {
    const diffMs = Date.now() - new Date(partner.lastActiveAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 4) {
      return { isOnline: true, label: 'Online' };
    } else if (diffMins < 60) {
      return { isOnline: false, label: `Active ${diffMins}m ago` };
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return { isOnline: false, label: `Active ${diffHours}h ago` };
      }
      return { isOnline: false, label: 'Active yesterday' };
    }
  }
  if (isSpecialOnline) {
    return { isOnline: true, label: 'Online' };
  }
  return { isOnline: false, label: 'Active 18m ago' };
}

// Audio Message Bubble Component with Waveform Player
const AudioMessageBubble: React.FC<{ url: string; isMe: boolean; accentColor?: string }> = ({ url, isMe }) => {
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
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
          isMe ? 'bg-white/20 text-white' : 'liquid-glass-elevated text-white'
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
              isMe ? 'bg-white/80' : 'bg-white/60'
            } ${playing ? 'animate-pulse' : 'opacity-60'}`}
            style={{ height: `${playing ? Math.max(4, Math.round(h * (0.8 + Math.random() * 0.6))) : h}px` }}
          />
        ))}
      </div>

      <span className="text-[10px] font-mono font-medium text-white/70">
        Voice Note
      </span>
    </div>
  );
};

export const DirectPage: React.FC = () => {
  const { currentUser } = useAuth();
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
  const [chatTheme, setChatTheme] = useState<ChatTheme>('nano_banana');
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

  // Swipe to reply & In-Chat Reactions
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, Record<string, number>>>({});
  const [messageBurst, setMessageBurst] = useState<{ id: string; msgId: string; x: number; y: number; emoji: string } | null>(null);

  const handleReaction = (msgId: string, emoji: string) => {
    soundEngine.playPop();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30]);
    }
    setMessageReactions((prev) => {
      const current = prev[msgId] || {};
      const newCount = (current[emoji] || 0) + 1;
      return {
        ...prev,
        [msgId]: {
          ...current,
          [emoji]: newCount,
        },
      };
    });
  };

  const handleBubbleDoubleTap = (e: React.MouseEvent, m: Message) => {
    e.stopPropagation();
    soundEngine.playPop();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 40]);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const burstId = `burst_${Date.now()}`;
    setMessageBurst({ id: burstId, msgId: m.id, x, y, emoji: '❤️' });
    handleReaction(m.id, '❤️');
    setTimeout(() => {
      setMessageBurst((curr) => (curr?.id === burstId ? null : curr));
    }, 1200);
  };

  // Voice Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

      const res = await apiRequest<{ message: Message }>('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.warn('Media send failed:', err);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleSendMediaMessage(reader.result as string, 'image');
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      soundEngine.playPop();
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mr.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopVoiceRecording = (send: boolean) => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.onstop = () => {
        if (send && audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            handleSendMediaMessage(reader.result as string, 'audio');
          };
          reader.readAsDataURL(blob);
        }
      };
      mr.stop();
    }
    setIsRecordingAudio(false);
  };

  const handleSendGifOrSticker = (url: string) => {
    soundEngine.playPop();
    handleSendMediaMessage(url, 'text');
    setShowGifPicker(false);
    setShowStickerPicker(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawText = inputText.trim();
    if (!rawText || !activeConv || !currentUser) return;

    soundEngine.playPop();
    setInputText('');

    const replyContext = replyingToMessage;
    setReplyingToMessage(null);

    const text = replyContext
      ? `💬 Replying to @${replyContext.sender ? replyContext.sender.username : 'member'}: "${replyContext.content.slice(0, 40)}..."\n${rawText}`
      : rawText;

    try {
      const payload =
        activeConv.type === 'group'
          ? { groupId: activeConv.groupId, content: text }
          : { receiverId: activeConv.partner.id, content: text };

      const res = await apiRequest<{ message: Message }>('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.warn('Send message error:', err);
    }
  };

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
      setAllUsers(filtered);
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
    loadMessages(activeConv);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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
    });
    return () => unsub();
  }, [activeConv]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMemberIds.length === 0) return;
    setCreatingGroup(true);
    soundEngine.playPop();
    try {
      const res = await apiRequest<{ conversation: GroupConversation }>('/api/chat/groups', {
        method: 'POST',
        body: JSON.stringify({
          name: newGroupName.trim(),
          memberIds: selectedMemberIds,
        }),
      });
      if (res.conversation) {
        setConversations((prev) => [res.conversation, ...prev]);
        setActiveConvId(res.conversation.id);
        setShowCreateGroup(false);
        setNewGroupName('');
        setSelectedMemberIds([]);
      }
    } catch (err) {
      console.warn('Failed to create group:', err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || calculateWinner(board)) return;
    soundEngine.playHapticClick();
    const nextBoard = [...board];
    nextBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
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
        <div className="liquid-glass rounded-[32px] p-8 space-y-4 shadow-2xl">
          <MessageCircle className="w-10 h-10 text-cyan-300 mx-auto" />
          <h2 className="text-lg font-semibold text-white tracking-tight">Direct Messaging & Calls</h2>
          <p className="text-xs text-white/60">
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
    <div
      className={`h-[calc(100vh-6rem)] max-w-6xl mx-auto flex rounded-[32px] overflow-hidden liquid-glass my-2 shadow-2xl relative ${currentThemeConfig.bg}`}
      style={{
        backgroundImage: currentThemeConfig.bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Hidden File Input for Image Attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-80 border-r border-white/10 flex-col liquid-glass-inner ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-white flex items-center gap-2 tracking-tight">
              <MessageCircle className="w-4 h-4 text-cyan-300" />
              <span>Direct Messages</span>
            </h2>
            <button
              onClick={() => {
                soundEngine.playPop();
                loadAllUsers();
                setShowCreateGroup(true);
              }}
              className="px-3 py-1 rounded-full liquid-glass-inner hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Create New Group Chat"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Group</span>
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Search chats & groups..."
              className="w-full liquid-glass-inner rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-white/50">
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
                    isSelected ? 'bg-white/15' : 'hover:bg-white/5'
                  }`}
                >
                  {isGroup ? (
                    <div className="w-10 h-10 rounded-full liquid-pill-cta flex items-center justify-center text-white font-bold text-xs shadow-md">
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
                      <p className="text-xs font-semibold text-white truncate">
                        {isGroup ? c.name : c.partner.displayName}
                      </p>
                      {c.lastMessage && (
                        <span className="text-[10px] text-white/40">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 truncate">
                      {c.lastMessage ? c.lastMessage.content : isGroup ? 'Group Created' : 'No messages yet'}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full liquid-pill-cta text-white text-[10px] font-bold flex items-center justify-center">
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
            {/* Header Bar */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-3 liquid-glass-inner">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="md:hidden p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {activeConv.type === 'group' ? (
                  <div className="w-9 h-9 rounded-full liquid-pill-cta flex items-center justify-center text-white font-semibold text-xs">
                    <Users className="w-4 h-4" />
                  </div>
                ) : (
                  <Avatar
                    src={activeConv.partner.avatarUrl}
                    alt={activeConv.partner.displayName}
                    size="xs"
                    isOnline={getPartnerPresence(activeConv.partner).isOnline}
                  />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">
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
                      <span className="px-2 py-0.5 rounded-full liquid-glass-inner text-cyan-200 text-[10px] font-semibold">
                        👥 {activeConv.members.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {activeConv.type === 'group' ? (
                      <span className="text-white/50 truncate">
                        {activeConv.members.map((m) => `@${m.username}`).join(', ')}
                      </span>
                    ) : (
                      (() => {
                        const presence = getPartnerPresence(activeConv.partner);
                        return (
                          <>
                            {presence.isOnline ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Online</span>
                              </span>
                            ) : (
                              <span className="text-white/45">{presence.label}</span>
                            )}
                            <span className="text-white/30">•</span>
                            <span className="text-white/45 truncate">@{activeConv.partner.username}</span>
                          </>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>

              {/* Call & Tool Actions Deck */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Theme Selector Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      soundEngine.playHapticClick();
                      setShowThemePicker(!showThemePicker);
                    }}
                    className="p-2 rounded-full liquid-glass-inner text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                    title="Switch Liquid Themes"
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showThemePicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        className="absolute right-0 top-11 z-50 w-52 rounded-2xl liquid-glass-elevated border border-white/15 p-3 space-y-2 shadow-2xl"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-300" /> Liquid Glass Themes
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
                                    ? 'bg-white/20 text-white font-semibold'
                                    : 'text-white/70 hover:bg-white/10'
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
                  className="p-2 rounded-full liquid-glass-inner text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                  title="In-Chat Games"
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
                  className="px-3.5 py-1.5 rounded-full liquid-glass-inner hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Start Live Voice Call"
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
                  className="px-3.5 py-1.5 rounded-full liquid-pill-cta text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-lg"
                  title="Start Live Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">FaceTime</span>
                </button>
              </div>
            </div>

            {/* In-chat Games Drawer */}
            {gameActive && (
              <div className="p-3 liquid-glass-inner border-b border-white/10 flex flex-col items-center max-h-[500px] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between w-full max-w-sm mb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveGameType('ludo')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        activeGameType === 'ludo' ? 'liquid-pill-cta text-white' : 'liquid-glass-inner text-white/60'
                      }`}
                    >
                      🎲 Ludo
                    </button>
                    <button
                      onClick={() => setActiveGameType('tictactoe')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        activeGameType === 'tictactoe' ? 'liquid-pill-cta text-white' : 'liquid-glass-inner text-white/60'
                      }`}
                    >
                      Tic-Tac-Toe
                    </button>
                    <button
                      onClick={() => setActiveGameType('chess')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        activeGameType === 'chess' ? 'liquid-pill-cta text-white' : 'liquid-glass-inner text-white/60'
                      }`}
                    >
                      Mini Chess
                    </button>
                  </div>
                  <button onClick={() => setGameActive(false)} className="text-white/60 hover:text-white">
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
                          className="w-full h-full rounded-2xl liquid-glass-inner text-lg font-semibold flex items-center justify-center hover:bg-white/15 text-white"
                        >
                          {cell === 'X' ? <span className="text-amber-300">X</span> : cell === 'O' ? <span className="text-rose-400">O</span> : ''}
                        </button>
                      ))}
                    </div>
                    {calculateWinner(board) && (
                      <p className="mt-2 text-xs font-semibold text-emerald-400">
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
            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-white/50 space-y-2">
                  <div className="w-12 h-12 rounded-2xl liquid-glass-elevated flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <p className="font-semibold text-white text-sm">
                    {activeConv.type === 'group'
                      ? `Welcome to ${activeConv.name}!`
                      : `Chat with @${activeConv.partner.username}`}
                  </p>
                  <p className="text-[11px] text-white/50 max-w-xs">
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
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={SPRING_SNAPPY}
                      className={`flex flex-col group/msg relative ${isMe ? 'items-end' : 'items-start'}`}
                      onMouseEnter={() => setHoveredMessageId(m.id)}
                      onMouseLeave={() => setHoveredMessageId((curr) => (curr === m.id ? null : curr))}
                    >
                      {activeConv.type === 'group' && !isMe && (
                        <span className="text-[10px] font-semibold text-white/60 mb-0.5 px-1">
                          {senderName}
                        </span>
                      )}

                      {/* Message Bubble Container with Swipe to Reply & Hover Bar */}
                      <div className="relative flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
                        {/* Hover Quick Emoji Reaction & Reply Bar */}
                        <AnimatePresence>
                          {hoveredMessageId === m.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.9 }}
                              transition={SPRING_SNAPPY}
                              className={`absolute -top-8 z-30 flex items-center gap-1 px-2 py-1 rounded-full liquid-glass-elevated border border-white/20 shadow-2xl backdrop-blur-xl ${
                                isMe ? 'right-0' : 'left-0'
                              }`}
                            >
                              {['❤️', '😂', '🔥', '😮', '👏', '🙏'].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(m.id, emoji);
                                  }}
                                  className="w-5 h-5 flex items-center justify-center text-xs hover:scale-130 active:scale-90 transition-transform"
                                  title={`React ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundEngine.playPop();
                                  setReplyingToMessage(m);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white hover:scale-110 active:scale-90 transition-all ml-0.5 border-l border-white/15 pl-1"
                                title="Reply"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Draggable Liquid Message Bubble for Swipe-to-Reply */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.4}
                          onDragEnd={(_, info) => {
                            if (Math.abs(info.offset.x) > 35) {
                              soundEngine.playPop();
                              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                                navigator.vibrate([20, 30]);
                              }
                              setReplyingToMessage(m);
                            }
                          }}
                          onDoubleClick={(e) => handleBubbleDoubleTap(e, m)}
                          className={`relative px-3.5 py-2.5 rounded-3xl text-xs leading-relaxed shadow-md cursor-pointer select-none transition-shadow ${
                            isMe
                              ? `bg-gradient-to-tr ${currentThemeConfig.bubbleClass} rounded-br-sm shadow-lg`
                              : 'liquid-glass-inner text-white rounded-bl-sm border border-white/10 shadow-md'
                          } ${isLudoMsg ? 'border-amber-400/50' : ''}`}
                        >
                          {/* Floating Reaction Burst at (x, y) */}
                          {messageBurst && messageBurst.msgId === m.id && (
                            <motion.div
                              key={messageBurst.id}
                              initial={{ opacity: 1, scale: 0.4, y: 0 }}
                              animate={{ opacity: 0, scale: 2.2, y: -65 }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{ left: messageBurst.x, top: messageBurst.y }}
                              className="absolute pointer-events-none z-40 text-3xl -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_4px_16px_rgba(244,63,94,0.7)]"
                            >
                              {messageBurst.emoji}
                            </motion.div>
                          )}

                          {isAudioMsg ? (
                            <AudioMessageBubble url={m.mediaUrl || m.content} isMe={isMe} />
                          ) : isImageMsg ? (
                            <div className="space-y-1">
                              <img
                                src={m.mediaUrl || m.content}
                                alt="Shared photo"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxImage(m.mediaUrl || m.content);
                                }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soundEngine.playPop();
                                    setGameActive(true);
                                    setActiveGameType('ludo');
                                  }}
                                  className="mt-2 px-3 py-1 rounded-full liquid-glass-inner text-white font-semibold text-[10px] flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
                                >
                                  <Gamepad2 className="w-3.5 h-3.5" />
                                  <span>Play Ludo Together 🎲</span>
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {/* Reaction Pills attached under message */}
                      {messageReactions[m.id] && Object.keys(messageReactions[m.id]).length > 0 && (
                        <div className={`flex items-center gap-1 mt-1 px-1 flex-wrap ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(messageReactions[m.id]).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReaction(m.id, emoji)}
                              className="px-2 py-0.5 rounded-full liquid-glass-inner text-[11px] font-semibold flex items-center gap-1 border border-white/10 hover:border-white/30 transition-all hover:scale-110 active:scale-95 shadow-sm"
                            >
                              <span>{emoji}</span>
                              <span className="text-[9px] text-white/70">{count}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] text-white/40">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && (
                          <span
                            className="flex items-center text-[10px] leading-none select-none font-mono"
                            title={
                              (m as any).seen || Date.now() - new Date(m.createdAt).getTime() > 120000
                                ? 'Seen'
                                : Date.now() - new Date(m.createdAt).getTime() > 4000
                                ? 'Delivered'
                                : 'Sent'
                            }
                          >
                            {(m as any).seen || Date.now() - new Date(m.createdAt).getTime() > 120000 ? (
                              <span className="text-cyan-400 font-bold tracking-tighter">✓✓</span>
                            ) : Date.now() - new Date(m.createdAt).getTime() > 4000 ? (
                              <span className="text-white/60 tracking-tighter">✓✓</span>
                            ) : (
                              <span className="text-white/40 font-bold">✓</span>
                            )}
                          </span>
                        )}
                      </div>
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
                  className="px-3 py-2 liquid-glass-inner border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar"
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
                  className="p-3 liquid-glass-elevated border-t border-white/10 space-y-3 max-h-60 overflow-y-auto no-scrollbar"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                      <Sticker className="w-3.5 h-3.5 text-cyan-300" /> Animated Stickers
                    </span>
                    <button type="button" onClick={() => setShowStickerPicker(false)} className="text-white/60 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {STICKER_PACKS.map((pack, pIdx) => (
                      <div key={pIdx} className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-white/50">{pack.category}</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {pack.stickers.map((s, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSendGifOrSticker(s.url)}
                              className="group relative rounded-2xl overflow-hidden aspect-video border border-white/10 hover:border-white/30 transition-all hover:scale-105 active:scale-95 shadow-md"
                            >
                              <img src={s.url} alt={s.name} className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-semibold p-0.5 text-center truncate">
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
                  className="p-3 liquid-glass-elevated border-t border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Trending GIFs</span>
                    <button type="button" onClick={() => setShowGifPicker(false)} className="text-white/60 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {QUICK_GIFS.map((gif) => (
                      <button
                        key={gif.name}
                        type="button"
                        onClick={() => handleSendGifOrSticker(gif.url)}
                        className="group relative rounded-2xl overflow-hidden aspect-video border border-white/10 hover:border-white/30 transition-all active:scale-95 shadow-md"
                      >
                        <img src={gif.url} alt={gif.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white font-semibold p-0.5 text-center truncate">
                          {gif.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Voice Recording Bar */}
            {isRecordingAudio ? (
              <div className="p-3 border-t border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-semibold text-rose-200">
                    Recording Audio ({recordingSeconds}s)...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stopVoiceRecording(false)}
                    className="px-3 py-1.5 rounded-full liquid-glass-inner text-xs font-semibold text-white/70 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => stopVoiceRecording(true)}
                    className="px-4 py-1.5 rounded-full liquid-pill-cta text-white text-xs font-semibold shadow-md flex items-center gap-1 active:scale-95 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Send Audio</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Quoted Reply Preview Bar */}
                <AnimatePresence>
                  {replyingToMessage && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={SPRING_SNAPPY}
                      className="px-4 py-2 border-t border-white/10 liquid-glass-inner flex items-center justify-between gap-3 text-xs overflow-hidden"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1 h-7 rounded-full bg-cyan-400 flex-shrink-0" />
                        <Reply className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-semibold text-cyan-300 truncate">
                            Replying to {replyingToMessage.sender ? replyingToMessage.sender.displayName : (replyingToMessage.senderId === currentUser?.id ? 'Yourself' : 'Member')}
                          </p>
                          <p className="text-[11px] text-white/70 truncate max-w-sm">
                            {replyingToMessage.content}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(null)}
                        className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        title="Cancel Reply"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Standard Input Deck */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-white/10 liquid-glass-inner flex items-center gap-2 relative"
                >
                {/* Emoji Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowGifPicker(false);
                    setShowStickerPicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    showEmojiPicker ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {/* Stickers Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setShowStickerPicker(!showStickerPicker);
                    setShowEmojiPicker(false);
                    setShowGifPicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors ${
                    showStickerPicker ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Animated Stickers"
                >
                  <Sticker className="w-4 h-4" />
                </button>

                {/* GIFs Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setShowGifPicker(!showGifPicker);
                    setShowEmojiPicker(false);
                    setShowStickerPicker(false);
                  }}
                  className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                    showGifPicker ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white liquid-glass-inner'
                  }`}
                  title="Search GIFs"
                >
                  GIF
                </button>

                {/* Photo Attachment */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full text-white/60 hover:text-white transition-colors"
                  title="Send Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Voice Note Recording Trigger */}
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="p-2 rounded-full text-white/60 hover:text-rose-300 transition-colors"
                  title="Record Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Main Input Text Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 liquid-glass-inner rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                />

                {/* Send Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={SPRING_SNAPPY}
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-full liquid-pill-cta text-white disabled:opacity-40 shadow-md transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </>
          )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-3xl liquid-glass-elevated flex items-center justify-center text-white shadow-xl">
              <MessageCircle className="w-8 h-8 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">Your Direct Messages</h3>
              <p className="text-xs text-white/50 max-w-xs mt-1">
                Select a creator or group from the list, or start a new group conversation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md liquid-glass-elevated rounded-[32px] p-6 space-y-4 shadow-2xl border border-white/15"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span>Create New Group</span>
                </h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. VIP Gaming Clan, Mumbai Creators"
                  className="w-full liquid-glass-inner rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                  Select Members ({selectedMemberIds.length} selected)
                </label>
                <div className="max-h-52 overflow-y-auto space-y-1.5 no-scrollbar p-1">
                  {allUsers.map((u) => {
                    const isSelected = selectedMemberIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playHapticClick();
                          setSelectedMemberIds((prev) =>
                            isSelected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                          );
                        }}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-white/20 border border-white/30 text-white'
                            : 'liquid-glass-inner text-white/70 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar src={u.avatarUrl} alt={u.displayName} size="xs" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{u.displayName}</p>
                            <p className="text-[10px] text-white/45 truncate">@{u.username}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={creatingGroup || !newGroupName.trim() || selectedMemberIds.length === 0}
                className="w-full py-3 rounded-full liquid-pill-cta text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-40 shadow-xl"
              >
                {creatingGroup ? 'Creating Group...' : 'Create Group'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox for Full-screen Image Preview */}
      <AnimatePresence>
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImage}
              alt="Enlarged photo"
              className="max-w-full max-h-[90vh] rounded-3xl object-contain shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
