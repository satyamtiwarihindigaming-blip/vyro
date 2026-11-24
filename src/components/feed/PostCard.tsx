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
} from 'lucide-react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
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
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reported, setReported] = useState(false);

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
            {post.musicTrack && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Music className="w-3 h-3 text-vyro-accent animate-pulse" />
                <span className="truncate max-w-[180px]">{post.musicTrack.title}</span>
              </div>
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
