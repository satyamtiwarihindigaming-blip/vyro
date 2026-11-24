import React, { useState, useEffect } from 'react';
import { Post, CommentItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { apiRequest } from '../../lib/api';
import { formatMetric } from '../../lib/musicCatalog';
import { X, Send } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md h-full glass-panel border-l border-vyro-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-vyro-border flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100">
            Comments ({formatMetric(Math.max(post.commentsCount, comments.length))})
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isLoading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs font-semibold text-slate-300">No comments yet</p>
              <p className="text-[11px] text-slate-500">Be the first real user to share a thought!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 text-xs">
                <Avatar src={c.user.avatarUrl} alt={c.user.displayName} size="xs" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{c.user.username}</span>
                    <VerifiedBadge
                      isVerified={c.user.isVerified}
                      isPro={c.user.isPro}
                      proBadge={c.user.proBadge}
                    />
                    <span className="text-[10px] text-slate-500 ml-1">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-vyro-border flex items-center gap-2 bg-vyro-bg">
          {currentUser ? (
            <>
              <Avatar src={currentUser.avatarUrl} alt={currentUser.displayName} size="xs" />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a real comment..."
                className="flex-1 bg-vyro-card border border-vyro-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 rounded-xl bg-vyro-primary text-white disabled:opacity-40 hover:bg-vyro-primaryHover transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center w-full py-1">
              Sign in to write comments.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
