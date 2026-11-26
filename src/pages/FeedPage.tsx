import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StoryBar } from '../components/feed/StoryBar';
import { PostCard } from '../components/feed/PostCard';
import { CommentDrawer } from '../components/feed/CommentDrawer';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Sparkles, Clock, Camera, Flame } from 'lucide-react';
import { SPRING_SNAPPY } from '../lib/motion';

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
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-6 space-y-6">
      {/* Feed Category Segmented Glass Pill */}
      <div className="flex items-center justify-between pb-1">
        <div className="relative flex items-center p-1 rounded-full liquid-glass-inner">
          <button
            onClick={() => setActiveTab('foryou')}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'foryou' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            {activeTab === 'foryou' && (
              <motion.div
                layoutId="feedTabPill"
                className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                transition={SPRING_SNAPPY}
              />
            )}
            <Sparkles className="w-3.5 h-3.5 relative z-10 text-amber-300" />
            <span className="relative z-10">For You</span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'following' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            {activeTab === 'following' && (
              <motion.div
                layoutId="feedTabPill"
                className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                transition={SPRING_SNAPPY}
              />
            )}
            <Clock className="w-3.5 h-3.5 relative z-10 text-cyan-300" />
            <span className="relative z-10">Following</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-inner text-[11px] text-white/50">
          <Flame className="w-3 h-3 text-rose-400" />
          <span>Real Creators • Zero Bots</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story Bar Shelf */}
          <div className="liquid-glass rounded-[26px] p-3">
            <StoryBar />
          </div>

          {isLoadingFeed ? (
            <div className="space-y-4">
              <div className="liquid-glass rounded-[28px] h-72 animate-pulse" />
              <div className="liquid-glass rounded-[28px] h-72 animate-pulse" />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenComments={(p) => setSelectedPostForComments(p)}
                  onToggleLike={() => toggleLike(post.id)}
                  onToggleSave={() => toggleSave(post.id)}
                  onNotInterested={() => markNotInterested(post.id)}
                  onDeletePost={() => deletePost(post.id)}
                />
              ))}
            </div>
          ) : (
            <div className="liquid-glass rounded-[32px] p-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl liquid-glass-elevated flex items-center justify-center text-white shadow-lg">
                <Camera className="w-7 h-7 text-white/90" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white tracking-tight">No Posts Yet</h3>
                <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                  VYRO has zero fake bots or filler posts. Capture your first real photo, reel, or announcement in Studio!
                </p>
              </div>
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full liquid-pill-cta text-xs font-semibold shadow-xl"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera Studio</span>
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Sticky Right Sidebar */}
        <div className="hidden lg:block space-y-5">
          {currentUser && (
            <Link
              to={`/${currentUser.username}`}
              className="liquid-glass rounded-[24px] p-4 flex items-center justify-between hover:border-white/20 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={currentUser.avatarUrl} alt={currentUser.displayName} size="md" hasStory={currentUser.isPro} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-200 transition-colors">
                      {currentUser.displayName}
                    </p>
                    <VerifiedBadge
                      isVerified={currentUser.isVerified}
                      isPro={currentUser.isPro}
                      proBadge={currentUser.proBadge}
                    />
                  </div>
                  <p className="text-[11px] text-white/50 truncate">@{currentUser.username}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Real Registered Accounts */}
          <div className="liquid-glass rounded-[28px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                Creators on VYRO
              </h4>
              <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full liquid-glass-inner">
                {users.length} Active
              </span>
            </div>

            {otherUsers.length === 0 ? (
              <p className="text-xs text-white/50">
                Invite friends to join VYRO — real accounts appear here as they register!
              </p>
            ) : (
              <div className="space-y-3">
                {otherUsers.slice(0, 6).map((usr) => (
                  <div key={usr.id} className="flex items-center justify-between text-xs gap-2">
                    <Link to={`/${usr.username}`} className="flex items-center gap-2.5 min-w-0 group">
                      <Avatar src={usr.avatarUrl} alt={usr.displayName} size="xs" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white/90 truncate group-hover:text-cyan-200 transition-colors">
                            {usr.username}
                          </span>
                          <VerifiedBadge
                            isVerified={usr.isVerified}
                            isPro={usr.isPro}
                            proBadge={usr.proBadge}
                          />
                        </div>
                        <p className="text-[10px] text-white/50 truncate max-w-[120px]">{usr.bio}</p>
                      </div>
                    </Link>
                    {currentUser && (
                      <button
                        onClick={() => toggleFollow(usr.id)}
                        className={`px-3 py-1 rounded-full font-semibold text-[11px] transition-all flex-shrink-0 ${
                          usr.isFollowing
                            ? 'liquid-glass-inner text-white/60 hover:text-white'
                            : 'liquid-pill-cta'
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
