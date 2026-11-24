import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StoryBar } from '../components/feed/StoryBar';
import { PostCard } from '../components/feed/PostCard';
import { CommentDrawer } from '../components/feed/CommentDrawer';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Sparkles, Clock, Camera } from 'lucide-react';

export const FeedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const {
    users,
    isLoadingFeed,
    getFilteredFeed,
    toggleLike,
    toggleSave,
    toggleFollow,
    deletePost,
    markNotInterested,
  } = useSocial();
  const { currentUser } = useAuth();

  const posts = getFilteredFeed(activeTab);
  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6">
      {/* Feed Category Tabs */}
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
          Real Profiles Only • Zero Bots
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-2.5 mb-6 border border-vyro-border/60">
            <StoryBar />
          </div>

          {isLoadingFeed ? (
            <div className="space-y-4">
              <div className="glass-card rounded-2xl h-64 animate-pulse border border-vyro-border" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenComments={(p) => setSelectedPostForComments(p)}
                onToggleLike={() => toggleLike(post.id)}
                onToggleSave={() => toggleSave(post.id)}
                onNotInterested={() => markNotInterested(post.id)}
                onDeletePost={() => deletePost(post.id)}
              />
            ))
          ) : (
            <div className="glass-panel rounded-2xl p-10 text-center border border-vyro-border space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-vyro-primary to-vyro-accent flex items-center justify-center text-white shadow-glow-purple">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Posts Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  VYRO has zero fake bots or filler posts. Capture your first real photo, reel, or announcement in Studio!
                </p>
              </div>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan text-white text-xs font-bold shadow-glow-pink"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera Studio</span>
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Sticky Right Sidebar */}
        <div className="hidden lg:block space-y-6">
          {currentUser && (
            <Link
              to={`/${currentUser.username}`}
              className="glass-card rounded-2xl p-4 border border-vyro-border/70 flex items-center justify-between hover:border-vyro-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={currentUser.avatarUrl} alt={currentUser.displayName} size="md" hasStory={currentUser.isPro} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <VerifiedBadge
                      isVerified={currentUser.isVerified}
                      isPro={currentUser.isPro}
                      proBadge={currentUser.proBadge}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">@{currentUser.username}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Real Registered Accounts */}
          <div className="glass-card rounded-2xl p-4 border border-vyro-border/70">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Real Users on VYRO
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold">
                {users.length} Active
              </span>
            </div>

            {otherUsers.length === 0 ? (
              <p className="text-xs text-slate-500">
                Invite friends to join VYRO — real accounts appear here as they register!
              </p>
            ) : (
              <div className="space-y-3.5">
                {otherUsers.slice(0, 6).map((usr) => (
                  <div key={usr.id} className="flex items-center justify-between text-xs gap-2">
                    <Link to={`/${usr.username}`} className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={usr.avatarUrl} alt={usr.displayName} size="xs" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-200 truncate">{usr.username}</span>
                          <VerifiedBadge
                            isVerified={usr.isVerified}
                            isPro={usr.isPro}
                            proBadge={usr.proBadge}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{usr.bio}</p>
                      </div>
                    </Link>
                    {currentUser && (
                      <button
                        onClick={() => toggleFollow(usr.id)}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex-shrink-0 ${
                          usr.isFollowing
                            ? 'bg-vyro-card border border-vyro-border text-slate-300'
                            : 'bg-vyro-primary/20 hover:bg-vyro-primary text-vyro-primary hover:text-white'
                        }`}
                      >
                        {usr.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CommentDrawer
        post={selectedPostForComments}
        onClose={() => setSelectedPostForComments(null)}
      />
    </div>
  );
};
