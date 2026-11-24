import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  Send,
  Smile,
  Image,
  Gamepad2,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  CheckCircle2,
  X,
} from 'lucide-react';
import { MOCK_CONVERSATIONS, CURRENT_USER } from '../lib/mockData';
import { Avatar } from '../components/ui/Avatar';
import { Conversation, Message } from '../types';
import { MiniChess } from '../components/games/MiniChess';

export const DirectPage: React.FC = () => {
  const [activeConv, setActiveConv] = useState<Conversation>(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      conversationId: 'conv_1',
      senderId: MOCK_CONVERSATIONS[0].participants[1].id,
      content: 'Hey Nova! Loved that new procedural shader drop.',
      messageType: 'text',
      isRead: true,
      createdAt: '2026-11-24T21:00:00Z',
    },
    {
      id: 'm2',
      conversationId: 'conv_1',
      senderId: CURRENT_USER.id,
      content: 'Thanks Aura! Working on syncing it with your Tokyo Rain track.',
      messageType: 'text',
      isRead: true,
      createdAt: '2026-11-24T21:02:00Z',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // WebRTC Call State
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Mini-Game inside chat State
  const [gameActive, setGameActive] = useState(false);
  const [activeGameType, setActiveGameType] = useState<'tictactoe' | 'chess'>('tictactoe');
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle call timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (callActive) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: activeConv.id,
      senderId: CURRENT_USER.id,
      content: inputText.trim(),
      messageType: 'text',
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate instant friend reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_reply_${Date.now()}`,
          conversationId: activeConv.id,
          senderId: activeConv.participants[1].id,
          content: 'Sounds awesome! Ready for a call or a quick chess match whenever you are 🙌',
          messageType: 'text',
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 1500);
  };

  // Tic Tac Toe Move
  const handleCellClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;
    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
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

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const partner = activeConv.participants[1] || activeConv.participants[0];

  return (
    <div className="h-[calc(100vh-4.5rem)] max-w-6xl mx-auto flex rounded-2xl overflow-hidden glass-panel border border-vyro-border my-2">
      {/* Conversations List (Left Pane) */}
      <div className="w-80 border-r border-vyro-border/70 flex flex-col bg-vyro-card/50">
        <div className="p-4 border-b border-vyro-border flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Direct Messages</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vyro-primary/20 text-vyro-primary">
            Online (4)
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-vyro-border/40">
          {MOCK_CONVERSATIONS.map((c) => {
            const other = c.participants[1];
            const isSelected = c.id === activeConv.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConv(c)}
                className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                  isSelected ? 'bg-vyro-primary/15' : 'hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Avatar src={other.avatarUrl} alt={other.displayName} size="sm" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-vyro-bg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{other.displayName}</span>
                    <span className="text-[10px] text-slate-500">21:05</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {c.lastMessage?.content}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Conversation Chat Window (Right Pane) */}
      <div className="flex-1 flex flex-col bg-vyro-bg relative">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-vyro-border flex items-center justify-between bg-vyro-card/40">
          <div className="flex items-center gap-3">
            <Avatar src={partner.avatarUrl} alt={partner.displayName} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{partner.displayName}</span>
                {partner.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-vyro-cyan" />}
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active now
              </span>
            </div>
          </div>

          {/* Action triggers for Voice Call, Video Call, and Multiplayer Game */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGameActive(!gameActive)}
              className="p-2 rounded-xl text-slate-300 hover:text-vyro-accent hover:bg-white/5 transition-colors"
              title="Launch In-Chat Mini Game"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCallType('voice');
                setCallActive(true);
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-vyro-primary hover:bg-white/5 transition-colors"
              title="Start Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCallType('video');
                setCallActive(true);
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-vyro-cyan hover:bg-white/5 transition-colors"
              title="Start Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Multiplayer Game Drawer (Tic-Tac-Toe & Chess) */}
        {gameActive && (
          <div className="p-4 bg-vyro-card/90 border-b border-vyro-border flex flex-col items-center animate-slideDown">
            <div className="flex items-center justify-between w-full max-w-sm mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveGameType('tictactoe')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeGameType === 'tictactoe'
                      ? 'bg-vyro-primary text-white'
                      : 'bg-vyro-bg text-slate-400 hover:text-white'
                  }`}
                >
                  Tic-Tac-Toe
                </button>
                <button
                  onClick={() => setActiveGameType('chess')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeGameType === 'chess'
                      ? 'bg-vyro-primary text-white'
                      : 'bg-vyro-bg text-slate-400 hover:text-white'
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
          {messages.map((m) => {
            const isMe = m.senderId === CURRENT_USER.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
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
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[10px]">{partner.displayName} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-vyro-border bg-vyro-card/30 flex items-center gap-2">
          <button type="button" className="p-2 text-slate-400 hover:text-white rounded-xl">
            <Smile className="w-4 h-4" />
          </button>
          <button type="button" className="p-2 text-slate-400 hover:text-white rounded-xl">
            <Image className="w-4 h-4" />
          </button>
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

        {/* Native WebRTC Call Active Modal Overlay */}
        {callActive && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6">
            {/* Call Header */}
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-sm">{partner.displayName}</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 capitalize">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Encrypted WebRTC P2P {callType} Call ({formatCallTime(callDuration)})
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                STUN: Google STUN active
              </span>
            </div>

            {/* Video Canvas Tiles */}
            <div className="flex-1 my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-center">
              {/* Remote Peer Video */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                <img
                  src={partner.avatarUrl}
                  alt={partner.displayName}
                  className="w-24 h-24 rounded-full object-cover shadow-glow-pink"
                />
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded-lg">
                  {partner.username}
                </span>
              </div>

              {/* Local Peer Video */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-800 border border-white/10 flex items-center justify-center">
                {isCameraOff ? (
                  <div className="text-center text-xs text-slate-400">
                    <VideoOff className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                    <span>Your camera is turned off</span>
                  </div>
                ) : (
                  <img
                    src={CURRENT_USER.avatarUrl}
                    alt={CURRENT_USER.displayName}
                    className="w-24 h-24 rounded-full object-cover shadow-glow-purple"
                  />
                )}
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded-lg">
                  You (Local)
                </span>
              </div>
            </div>

            {/* Call Control Toolbar */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Mute/Unmute Mic"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3.5 rounded-full ${
                  isCameraOff ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Toggle Video"
              >
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCallActive(false)}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg active:scale-90 transition-transform"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
