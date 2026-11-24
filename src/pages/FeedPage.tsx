import React, { useState } from 'react';
import { StoryBar } from '../components/feed/StoryBar';
import { PostCard } from '../components/feed/PostCard';
import { CommentDrawer } from '../components/feed/CommentDrawer';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../lib/mockData';
import { Post } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export const FeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const { getFilteredFeed, toggleLike, toggleSave, markNotInterested } = useSocial();
  const { currentUser } = useAuth();

  const posts = getFilteredFeed(activeTab);

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6">
      {/* Feed Category Tabs (For You vs Following) */}
      <div className="flex items-center justify-between mb-4 border-b border-vyro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('foryou')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'foryou'
                ? 'bg-vyro-primary/20 text-vyro-primary border border-vyro-primary/40 shadow-glow-purple/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>For You (Curated AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'following'
                ? 'bg-vyro-primary/20 text-vyro-primary border border-vyro-primary/40 shadow-glow-purple/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Following (Chronological)</span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-[11px] text-slate-500">
          Strict Privacy • Zero Spyware
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2">
          {/* Stories Bar */}
          <div className="glass-card rounded-2xl p-2.5 mb-6 border border-vyro-border/60">
            <StoryBar />
          </div>

          {/* Posts Stream */}
          <div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenComments={(p) => setSelectedPostForComments(p)}
                  onToggleLike={() => toggleLike(post.id)}
                  onToggleSave={() => toggleSave(post.id)}
                  onNotInterested={() => markNotInterested(post.id)}
                />
              ))
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center border border-vyro-border space-y-2">
                <Sparkles className="w-8 h-8 text-vyro-primary mx-auto" />
                <h3 className="text-sm font-bold text-white">Your Feed is Ready</h3>
                <p className="text-xs text-slate-400">
                  Follow more creators or publish a post in the studio to populate your stream.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sticky Right Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Current Profile Card */}
          {currentUser && (
            <div className="glass-card rounded-2xl p-4 border border-vyro-border/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={currentUser.avatarUrl} alt={currentUser.displayName} size="md" />
                <div>
                  <p className="text-xs font-bold text-white">{currentUser.displayName}</p>
                  <p className="text-[11px] text-slate-400">@{currentUser.username}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Active
              </span>
            </div>
          )}

          {/* Suggested Creators */}
          <div className="glass-card rounded-2xl p-4 border border-vyro-border/70">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Creators to Follow
              </h4>
              <span className="text-[10px] text-vyro-primary font-bold">Verified</span>
            </div>

            <div className="space-y-3.5">
              {MOCK_USERS.slice(1).map((usr) => (
                <div key={usr.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={usr.avatarUrl} alt={usr.displayName} size="xs" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-200">{usr.username}</span>
                        {usr.isVerified && <CheckCircle2 className="w-3 h-3 text-vyro-cyan" />}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{usr.bio}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-vyro-primary/20 hover:bg-vyro-primary text-vyro-primary hover:text-white font-bold text-[11px] transition-all">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Drawer Modal */}
      <CommentDrawer
        post={selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};
