import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  Send,
  MoreVertical,
  Music,
  Share2,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Story, UserSummary } from '../../types';
import { soundEngine } from '../../lib/soundEngine';
import { apiRequest } from '../../lib/api';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryId?: string;
  onClose: () => void;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryId,
  onClose,
}) => {
  // Group stories by creator
  const groupedStories: { user: UserSummary; items: Story[] }[] = [];
  stories.forEach((story) => {
    const existing = groupedStories.find((g) => g.user.id === story.userId);
    if (existing) {
      existing.items.push(story);
    } else {
      groupedStories.push({ user: story.user, items: [story] });
    }
  });

  // Find initial creator index and story index
  let initCreatorIdx = 0;
  let initStoryIdx = 0;
  if (initialStoryId) {
    for (let cIdx = 0; cIdx < groupedStories.length; cIdx++) {
      const sIdx = groupedStories[cIdx].items.findIndex((s) => s.id === initialStoryId);
      if (sIdx !== -1) {
        initCreatorIdx = cIdx;
        initStoryIdx = sIdx;
        break;
      }
    }
  }

  const [creatorIndex, setCreatorIndex] = useState(initCreatorIdx);
  const [segmentIndex, setSegmentIndex] = useState(initStoryIdx);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Poll state (Interactive story sticker demo)
  const [pollVoted, setPollVoted] = useState<'A' | 'B' | null>(null);

  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentCreatorGroup = groupedStories[creatorIndex] || groupedStories[0];
  const currentStory = currentCreatorGroup?.items[segmentIndex] || currentCreatorGroup?.items[0];

  // Story Duration: 5 seconds for image, dynamic for video
  const DURATION_MS = 5000;
  const STEP_INTERVAL_MS = 50;

  // Progress Timer
  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    setIsLiked(false);
    setPollVoted(null);

    // Play tactile sound on story step
    soundEngine.playHapticClick();

    // Mark as viewed on backend
    apiRequest(`/api/stories/${currentStory.id}/view`, { method: 'POST' }).catch(() => {});
  }, [creatorIndex, segmentIndex, currentStory?.id]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (STEP_INTERVAL_MS / DURATION_MS) * 100;
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, creatorIndex, segmentIndex, currentCreatorGroup?.items.length]);

  const handleNext = () => {
    if (segmentIndex < currentCreatorGroup.items.length - 1) {
      setSegmentIndex((prev) => prev + 1);
      setProgress(0);
    } else if (creatorIndex < groupedStories.length - 1) {
      // 3D Cube transition sound
      soundEngine.playWhoosh();
      setCreatorIndex((prev) => prev + 1);
      setSegmentIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (segmentIndex > 0) {
      setSegmentIndex((prev) => prev - 1);
      setProgress(0);
    } else if (creatorIndex > 0) {
      soundEngine.playWhoosh();
      setCreatorIndex((prev) => prev - 1);
      const prevCreatorGroup = groupedStories[creatorIndex - 1];
      setSegmentIndex(prevCreatorGroup.items.length - 1);
      setProgress(0);
    }
  };

  // Tap left 30% for prev, right 70% for next
  const handleContentTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  // Hold to pause (PointerDown / PointerUp)
  const handlePointerDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      setIsPaused(true);
    }, 140);
  };

  const handlePointerUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    setIsPaused(false);
  };

  // Floating Emoji Reaction Barrage
  const handleEmojiReaction = (emoji: string) => {
    soundEngine.playPop();
    const newReaction: FloatingReaction = {
      id: `rx_${Date.now()}_${Math.random()}`,
      emoji,
      x: 20 + Math.random() * 60,
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1500);

    // Send reaction to creator chat
    apiRequest('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: currentStory.userId,
        content: `Reacted ${emoji} to your story! 🔥`,
      }),
    }).catch(() => {});
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    soundEngine.playPop();

    apiRequest('/api/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: currentStory.userId,
        content: `Replying to story: "${replyText.trim()}"`,
      }),
    }).catch(() => {});

    setReplyText('');
    handleEmojiReaction('💬');
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center select-none overflow-hidden">
      {/* Background Ambience Shimmer */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-125 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url(${currentStory.mediaUrl})` }}
      />

      {/* Close button top right */}
      <button
        onClick={() => {
          soundEngine.playHapticClick();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition backdrop-blur-md"
        aria-label="Close Story"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main 9:16 Vertical Story Phone Viewport with Drag-Down Dismiss */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120) {
            soundEngine.playHapticClick();
            onClose();
          }
        }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black flex flex-col justify-between"
      >
        {/* Top Multi-Segment Progress Indicators */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {currentCreatorGroup.items.map((item, idx) => {
            const isCompleted = idx < segmentIndex;
            const isActive = idx === segmentIndex;
            return (
              <div
                key={item.id}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{
                    width: isCompleted ? '100%' : isActive ? `${progress}%` : '0%',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Story Header Chrome (Hidden on Hold-to-Pause) */}
        <div
          className={`relative z-30 pt-6 px-4 pb-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-200 ${
            isPaused ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Avatar
              src={currentCreatorGroup.user.avatarUrl}
              alt={currentCreatorGroup.user.displayName}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white leading-none">
                  {currentCreatorGroup.user.username}
                </span>
                <VerifiedBadge
                  isVerified={currentCreatorGroup.user.isVerified}
                  isPro={currentCreatorGroup.user.isPro}
                  proBadge={currentCreatorGroup.user.proBadge}
                />
              </div>
              <span className="text-[10px] text-slate-300 mt-0.5 block">
                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Media Canvas with Pointer Hold & Touch Zones */}
        <div
          onClick={handleContentTap}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer overflow-hidden"
        >
          {currentStory.mediaType === 'video' ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              loop
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story Content"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          )}

          {/* Interactive Music Sticker (If track exists) */}
          <div className="absolute top-20 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-none">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-vyro-primary to-vyro-accent flex items-center justify-center animate-spin">
              <Music className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] font-bold text-white tracking-wide">
              Trending Beats • VYRO Audio
            </span>
          </div>

          {/* Interactive Live Poll Sticker */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-28 left-6 right-6 z-20 bg-black/70 backdrop-blur-lg border border-white/20 p-3.5 rounded-2xl shadow-xl space-y-2.5"
          >
            <p className="text-xs font-extrabold text-white text-center">
              🔥 Are you ready for VYRO 2.0?
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  soundEngine.playPop();
                  setPollVoted('A');
                }}
                className={`py-2 px-3 rounded-xl border transition flex items-center justify-between ${
                  pollVoted === 'A'
                    ? 'bg-vyro-primary border-vyro-accent text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <span>YES! ⚡</span>
                {pollVoted && <span>88%</span>}
              </button>
              <button
                onClick={() => {
                  soundEngine.playPop();
                  setPollVoted('B');
                }}
                className={`py-2 px-3 rounded-xl border transition flex items-center justify-between ${
                  pollVoted === 'B'
                    ? 'bg-vyro-primary border-vyro-accent text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <span>100% 🔥</span>
                {pollVoted && <span>12%</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Particle Reaction Barrage */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          <AnimatePresence>
            {reactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 1, y: 550, scale: 0.5, x: `${r.x}%` }}
                animate={{
                  opacity: [1, 1, 0],
                  y: 100,
                  scale: [0.5, 1.4, 1.8],
                  x: `${r.x + (Math.random() * 20 - 10)}%`,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute text-4xl"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Instagram-Style Interaction Chrome */}
        <div
          className={`relative z-30 p-3 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2 transition-opacity duration-200 ${
            isPaused ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Quick Floating Emojis */}
          <div className="flex items-center justify-around py-1">
            {['❤️', '🔥', '👏', '😂', '😮', '🚀'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiReaction(emoji)}
                className="text-xl hover:scale-125 active:scale-95 transition-transform"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Send message to ${currentCreatorGroup.user.username}...`}
              className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:border-white/50 backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2.5 rounded-full bg-gradient-to-r from-vyro-primary to-vyro-accent text-white disabled:opacity-40 hover:opacity-90 transition shadow-glow-pink"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playPop();
                setIsLiked(!isLiked);
                handleEmojiReaction(isLiked ? '💔' : '❤️');
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
              />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
