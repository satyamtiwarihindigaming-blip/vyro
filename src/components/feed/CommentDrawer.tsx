import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, CommentItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { apiRequest } from '../../lib/api';
import { formatMetric } from '../../lib/musicCatalog';
import { X, Send } from 'lucide-react';
import { SPRING_SHEET } from '../../lib/motion';

export interface CommentDrawerProps {
  post: Post | null;
  onClose: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({ post, onClose }) => {
  const { currentUser } = useAuth();
  const { incrementCommentCount } = useSocial();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!post) return;
    setIsLoading(true);
    apiRequest<{ comments: CommentItem[] }>(`/api/posts/${post.id}/comments`)
      .then((res) => setComments(res.comments || []))
      .catch(() => setComments([]))
      .finally(() => setIsLoading(false));
  }, [post?.id]);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const res = await apiRequest<{ comment: CommentItem }>(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: newComment.trim() }),
      });
      setComments((prev) => [res.comment, ...prev]);
      incrementCommentCount(post.id);
      setNewComment('');
    } catch (err) {
      console.warn('Comment failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={SPRING_SHEET}
        className="w-full max-w-md h-full liquid-glass-elevated border-l border-white/15 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white tracking-tight">
            Comments ({formatMetric(Math.max(post.commentsCount, comments.length))})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 no-scrollbar">
          {isLoading ? (
            <p className="text-xs text-white/50 text-center py-6">Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs font-semibold text-white/80">No comments yet</p>
              <p className="text-[11px] text-white/50">Be the first real user to share a thought!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="liquid-glass-inner rounded-2xl p-3 flex items-start gap-3 text-xs">
                <Avatar src={c.user.avatarUrl} alt={c.user.displayName} size="xs" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">{c.user.username}</span>
                    <VerifiedBadge
                      isVerified={c.user.isVerified}
                      isPro={c.user.isPro}
                      proBadge={c.user.proBadge}
                    />
                    <span className="text-[10px] text-white/40 ml-1">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white/80 mt-1 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/40">
          {currentUser ? (
            <>
              <Avatar src={currentUser.avatarUrl} alt={currentUser.displayName} size="xs" />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a real comment..."
                className="flex-1 liquid-glass-inner rounded-2xl px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2.5 rounded-2xl liquid-pill-cta text-white disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          ) : (
            <p className="text-xs text-white/50 text-center w-full py-1">Please sign in to comment</p>
          )}
        </form>
      </motion.div>
    </div>
  );
};
