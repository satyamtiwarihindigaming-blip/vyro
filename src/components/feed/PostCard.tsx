import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, Music, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';

export interface PostCardProps {
  post: Post;
  onOpenComments?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenComments }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleToggleLike();
    } else {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 800);
    }
  };

  return (
    <article className="glass-card rounded-2xl overflow-hidden border border-vyro-border/70 mb-6 transition-all duration-300">
      {/* Post Header */}
      <header className="p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={post.user.avatarUrl}
            alt={post.user.displayName}
            size="sm"
            hasStory
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-100 hover:text-vyro-primary cursor-pointer transition-colors">
                {post.user.username}
              </span>
              {post.user.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-vyro-cyan fill-vyro-cyan/20" />
              )}
            </div>
            {post.musicTrack && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Music className="w-3 h-3 text-vyro-accent animate-pulse" />
                <span className="truncate max-w-[180px]">{post.musicTrack.title}</span>
              </div>
            )}
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1 rounded-lg" aria-label="Post options">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Post Media with Double-tap to Like */}
      <div
        className="relative bg-black/60 aspect-square sm:aspect-[4/3] flex items-center justify-center overflow-hidden cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={post.media[0]?.url}
          alt={post.caption}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
          loading="lazy"
        />

        {/* Animated Pop Heart */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
            <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 text-sm transition-transform active:scale-125 ${
                isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-white'
              }`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500' : ''}`} />
              <span className="font-semibold text-xs">{likesCount.toLocaleString()}</span>
            </button>

            <button
              onClick={() => onOpenComments && onOpenComments(post)}
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              aria-label="View comments"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-xs">{post.commentsCount}</span>
            </button>

            <button
              className="text-slate-300 hover:text-white transition-transform active:scale-110"
              aria-label="Share post"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`transition-colors ${isSaved ? 'text-vyro-primary' : 'text-slate-300 hover:text-white'}`}
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-vyro-primary' : ''}`} />
          </button>
        </div>

        {/* Caption */}
        <div className="text-xs text-slate-200 leading-relaxed">
          <span className="font-bold mr-1.5 text-white">{post.user.username}</span>
          <span>{post.caption}</span>
        </div>

        {/* Comment Link */}
        <button
          onClick={() => onOpenComments && onOpenComments(post)}
          className="text-[11px] text-slate-400 hover:text-vyro-primary font-medium"
        >
          View all {post.commentsCount} comments
        </button>
      </div>
    </article>
  );
};
