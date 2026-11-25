import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Pause,
} from 'lucide-react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useAudio } from '../../context/AudioContext';
import { apiRequest } from '../../lib/api';
import { formatMetric } from '../../lib/musicCatalog';

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
    <article className="glass-card rounded-2xl overflow-hidden border border-vyro-border/70 mb-6 transition-all duration-300 relative">
      {/* Post Header */}
      <header className="p-3.5 flex items-center justify-between">
        <Link to={`/${post.user.username}`} className="flex items-center gap-3 group">
          <Avatar
            src={post.user.avatarUrl}
            alt={post.user.displayName}
            size="sm"
            hasStory={post.user.isPro}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-100 group-hover:text-vyro-primary transition-colors">
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
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-[11px] text-pink-300 font-semibold transition mt-0.5"
                title="Click to play music"
              >
                {isThisTrackPlaying ? (
                  <Pause className="w-3 h-3 text-pink-400 shrink-0" />
                ) : (
                  <Play className="w-3 h-3 text-pink-400 ml-0.5 shrink-0" />
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
            className="text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-48 rounded-xl glass-panel border border-vyro-border p-1.5 shadow-2xl space-y-1">
              <button
                onClick={() => {
                  if (onNotInterested) onNotInterested();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
                <span>Not Interested</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Creator Link'}</span>
              </button>
              {currentUser && (
                <button
                  onClick={handleReport}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-colors"
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
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Post Media */}
      {mediaItem && (
        <div
          className="relative bg-black/60 aspect-square sm:aspect-[4/3] flex items-center justify-center overflow-hidden cursor-pointer select-none"
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

          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
            </div>
          )}
        </div>
      )}

      {/* YouTube or Spotify Interactive Embed Player */}
      {showExternalEmbed && post.musicTrack && (
        <div className="w-full bg-black/95 p-3 border-y border-vyro-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-white">
              <Music className="w-3.5 h-3.5 text-vyro-accent" />
              <span>Playing: {post.musicTrack.title}</span>
            </span>
            <button
              onClick={() => setShowExternalEmbed(false)}
              className="text-slate-400 hover:text-white px-1.5"
            >
              ✕
            </button>
          </div>
          {post.musicTrack.youtubeVideoId ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${post.musicTrack.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                title={post.musicTrack.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : post.musicTrack.spotifyTrackId ? (
            <div className="w-full rounded-xl overflow-hidden shadow-2xl bg-black">
              <iframe
                src={`https://open.spotify.com/embed/track/${post.musicTrack.spotifyTrackId}?utm_source=generator&theme=0`}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Action Bar */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-transform active:scale-125 ${
                post.isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-white'
              }`}
              aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500' : ''}`} />
              <span className="font-semibold text-xs" title={`${post.likesCount.toLocaleString()} likes`}>
                {formatMetric(post.likesCount)}
              </span>
            </button>

            <button
              onClick={() => onOpenComments && onOpenComments(post)}
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              aria-label="View comments"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-xs" title={`${post.commentsCount.toLocaleString()} comments`}>
                {formatMetric(post.commentsCount)}
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="text-slate-300 hover:text-white transition-transform active:scale-110"
              aria-label="Share post"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => onToggleSave && onToggleSave()}
            className={`transition-colors ${post.isSaved ? 'text-vyro-primary' : 'text-slate-300 hover:text-white'}`}
            aria-label={post.isSaved ? 'Unsave post' : 'Save post'}
          >
            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-vyro-primary' : ''}`} />
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="text-xs text-slate-200 leading-relaxed">
            <Link to={`/${post.user.username}`} className="font-bold mr-1.5 text-white hover:underline">
              {post.user.username}
            </Link>
            <span>{post.caption}</span>
          </div>
        )}

        {/* Comment Link */}
        <button
          onClick={() => onOpenComments && onOpenComments(post)}
          className="text-[11px] text-slate-400 hover:text-vyro-primary font-medium"
        >
          {post.commentsCount > 0 ? `View all ${post.commentsCount} comments` : 'Be the first to comment'}
        </button>
      </div>
    </article>
  );
};
