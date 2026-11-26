import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music,
  MoreHorizontal,
  EyeOff,
  Link as LinkIcon,
  Check,
  Flag,
  Trash2,
  MapPin,
  Play,
} from 'lucide-react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';
import { apiRequest } from '../../lib/api';
import { formatMetric } from '../../lib/musicCatalog';
import { SPRING_SNAPPY, SPRING_SMOOTH } from '../../lib/motion';

export interface PostCardProps {
  post: Post;
  onOpenComments?: (post: Post) => void;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  onNotInterested?: () => void;
  onDeletePost?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onToggleLike,
  onToggleSave,
  onNotInterested,
  onDeletePost,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { currentTrack, isPlaying, playTrack } = useAudio();
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showExternalEmbed, setShowExternalEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reported, setReported] = useState(false);

  const isThisTrackPlaying = Boolean(
    post.musicTrack && isPlaying && currentTrack?.id === post.musicTrack.id
  );

  const canDelete = currentUser && (currentUser.id === post.userId || isAdmin);

  const handleLike = () => {
    if (onToggleLike) onToggleLike();
    if (!post.isLiked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${post.user.username}`);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowMenu(false);
    }, 1000);
  };

  const handleReport = async () => {
    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'post',
          targetId: post.id,
          reason: 'Reported by user from feed',
        }),
      });
      setReported(true);
      setTimeout(() => setShowMenu(false), 1200);
    } catch {
      setShowMenu(false);
    }
  };

  const mediaItem = post.media[0];

  return (
    <article className="liquid-glass rounded-[28px] overflow-hidden mb-6 relative">
      {/* Post Header */}
      <header className="p-4 flex items-center justify-between">
        <Link to={`/${post.user.username}`} className="flex items-center gap-3 group">
          <Avatar
            src={post.user.avatarUrl}
            alt={post.user.displayName}
            size="sm"
            hasStory={post.user.isPro}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white/95 group-hover:text-cyan-200 transition-colors">
                {post.user.username}
              </span>
              <VerifiedBadge
                isVerified={post.user.isVerified}
                isPro={post.user.isPro}
                proBadge={post.user.proBadge}
              />
            </div>
            {post.location && (
              <div className="flex items-center gap-1 text-[11px] text-rose-300 font-medium">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate max-w-[200px]">{post.location}</span>
              </div>
            )}
            {post.musicTrack && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (post.musicTrack?.youtubeVideoId || post.musicTrack?.spotifyTrackId) {
                    setShowExternalEmbed(!showExternalEmbed);
                  } else if (post.musicTrack) {
                    playTrack(post.musicTrack);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition mt-1 ${
                  isThisTrackPlaying
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                    : 'liquid-glass-inner text-white/70 hover:text-white'
                }`}
                title="Click to play studio master audio"
              >
                {/* Rotating Vinyl Disc or Equalizer */}
                <div className="relative w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border border-rose-400 bg-slate-900 flex items-center justify-center ${
                      isThisTrackPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-rose-400" />
                  </div>
                </div>

                {isThisTrackPlaying ? (
                  <div className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-2 bg-rose-400 rounded-full animate-pulse" />
                    <span className="w-0.5 h-3 bg-rose-400 rounded-full animate-bounce" />
                    <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Play className="w-2.5 h-2.5 text-rose-400 ml-0.5 shrink-0" />
                )}

                <span className="truncate max-w-[130px]">{post.musicTrack.title}</span>
                {post.musicTrack.youtubeVideoId && (
                  <span className="text-[9px] bg-rose-600 text-white px-1 rounded font-bold">YT</span>
                )}
                {post.musicTrack.spotifyTrackId && (
                  <span className="text-[9px] bg-emerald-600 text-white px-1 rounded font-bold">Spotify</span>
                )}
              </button>
            )}
          </div>
        </Link>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={SPRING_SNAPPY}
                className="absolute right-0 top-10 z-30 w-48 rounded-2xl liquid-glass-elevated p-1.5 shadow-2xl space-y-1"
              >
                <button
                  onClick={() => {
                    if (onNotInterested) onNotInterested();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Not Interested</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Creator Link'}</span>
                </button>
                {currentUser && (
                  <button
                    onClick={handleReport}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    <span>{reported ? 'Reported!' : 'Report Post'}</span>
                  </button>
                )}
                {canDelete && onDeletePost && (
                  <button
                    onClick={() => {
                      onDeletePost();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Post Media Framing */}
      {mediaItem && (
        <div
          className="mx-3 rounded-[22px] overflow-hidden bg-black/60 aspect-square sm:aspect-[4/3] flex items-center justify-center relative cursor-pointer select-none"
          onDoubleClick={handleLike}
        >
          {mediaItem.type === 'video' ? (
            <video
              src={mediaItem.url}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={mediaItem.url}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
              loading="lazy"
            />
          )}

          <AnimatePresence>
            {showHeartPop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={SPRING_SNAPPY}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div className="relative flex items-center justify-center">
                  <Heart className="w-24 h-24 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_30px_rgba(244,63,94,0.9)]" />
                  <span className="absolute -top-3 -right-3 text-amber-300 text-xl animate-ping">✨</span>
                  <span className="absolute -bottom-2 -left-2 text-pink-300 text-base animate-ping">✨</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* YouTube or Spotify Interactive Embed Player */}
      {showExternalEmbed && post.musicTrack && (
        <div className="w-full liquid-glass-inner p-3 my-2 space-y-2 border-y border-white/10">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span className="font-semibold flex items-center gap-1.5 text-white">
              <Music className="w-3.5 h-3.5 text-rose-400" />
              <span>Playing: {post.musicTrack.title}</span>
            </span>
            <button
              onClick={() => setShowExternalEmbed(false)}
              className="text-white/60 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          {post.musicTrack.youtubeVideoId ? (
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${post.musicTrack.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                title={post.musicTrack.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : post.musicTrack.spotifyTrackId ? (
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://open.spotify.com/embed/track/${post.musicTrack.spotifyTrackId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl"
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Action Bar */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_SNAPPY}
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm p-1.5 rounded-full transition-colors ${
                post.isLiked ? 'text-rose-500' : 'text-white/70 hover:text-white'
              }`}
              aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500' : ''}`} />
              <span className="font-semibold text-xs" title={`${post.likesCount.toLocaleString()} likes`}>
                {formatMetric(post.likesCount)}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_SNAPPY}
              onClick={() => onOpenComments && onOpenComments(post)}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white p-1.5 rounded-full transition-colors"
              aria-label="View comments"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-xs" title={`${post.commentsCount.toLocaleString()} comments`}>
                {formatMetric(post.commentsCount)}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING_SNAPPY}
              onClick={handleCopyLink}
              className="text-white/70 hover:text-white p-1.5 rounded-full transition-colors"
              aria-label="Share post"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={SPRING_SNAPPY}
            onClick={() => onToggleSave && onToggleSave()}
            className={`p-1.5 rounded-full transition-colors ${
              post.isSaved ? 'text-amber-400' : 'text-white/70 hover:text-white'
            }`}
            aria-label={post.isSaved ? 'Unsave post' : 'Save post'}
          >
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-amber-400' : ''}`} />
          </motion.button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-xs text-white/85 leading-relaxed">
            <Link to={`/${post.user.username}`} className="font-semibold mr-1.5 text-white hover:underline">
              {post.user.username}
            </Link>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comment Link */}
        <button
          onClick={() => onOpenComments && onOpenComments(post)}
          className="text-[11px] text-white/50 hover:text-cyan-300 font-medium transition-colors"
        >
          {post.commentsCount > 0 ? `View all ${post.commentsCount} comments` : 'Be the first to comment'}
        </button>
      </div>
    </article>
  );
};
