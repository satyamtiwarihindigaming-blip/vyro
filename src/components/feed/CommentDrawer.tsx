import React, { useState } from 'react';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { X, Send, Heart } from 'lucide-react';

export interface CommentDrawerProps {
  post: Post | null;
  onClose: () => void;
}

interface CommentItem {
  id: string;
  username: string;
  avatarUrl: string;
  text: string;
  likes: number;
  timeAgo: string;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({ post, onClose }) => {
  const { currentUser } = useAuth();
  const { addComment } = useSocial();
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      username: 'cyber_aura',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      text: 'The color grading on this is unmatched 🔥',
      likes: 12,
      timeAgo: '1h',
    },
    {
      id: 'c2',
      username: 'neon_zen',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      text: 'Syncs perfectly with the beat! Love it.',
      likes: 5,
      timeAgo: '34m',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    addComment(post.id, newComment.trim());

    const item: CommentItem = {
      id: `c_${Date.now()}`,
      username: currentUser.username,
      avatarUrl: currentUser.avatarUrl,
      text: newComment.trim(),
      likes: 0,
      timeAgo: 'Just now',
    };

    setComments([item, ...comments]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md h-full glass-panel border-l border-vyro-border flex flex-col animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-vyro-border flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100">Comments ({comments.length})</h3>
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
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3 text-xs">
              <Avatar src={c.avatarUrl} alt={c.username} size="xs" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{c.username}</span>
                  <span className="text-[10px] text-slate-500">{c.timeAgo}</span>
                </div>
                <p className="text-slate-300 mt-0.5">{c.text}</p>
              </div>
              <button className="text-slate-500 hover:text-rose-500 flex flex-col items-center">
                <Heart className="w-3.5 h-3.5" />
                {c.likes > 0 && <span className="text-[10px]">{c.likes}</span>}
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-vyro-border flex items-center gap-2 bg-vyro-bg">
          <Avatar
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser?.displayName || 'You'}
            size="xs"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-vyro-card border border-vyro-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="p-2 rounded-xl bg-vyro-primary text-white disabled:opacity-40 hover:bg-vyro-primaryHover transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
