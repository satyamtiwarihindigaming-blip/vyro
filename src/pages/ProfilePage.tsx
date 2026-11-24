import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CURRENT_USER, MOCK_USERS, MOCK_POSTS } from '../lib/mockData';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Grid, Film, Bookmark, Settings, CheckCircle2, UserPlus, UserCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  // Find user by username or fallback to current user
  const user = MOCK_USERS.find((u) => u.username === username) || CURRENT_USER;
  const isMe = user.id === CURRENT_USER.id;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Cover Banner & Avatar */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-vyro-border relative">
        <div className="h-44 sm:h-56 w-full bg-slate-900 relative">
          {user.coverUrl ? (
            <img
              src={user.coverUrl}
              alt="Profile cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-vyro-bg via-transparent to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar
              src={user.avatarUrl}
              alt={user.displayName}
              size="xl"
              className="border-4 border-vyro-bg shadow-2xl"
            />
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{user.displayName}</h1>
                {user.isVerified && <CheckCircle2 className="w-5 h-5 text-vyro-cyan" />}
              </div>
              <p className="text-xs text-slate-400">@{user.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-2">
            {isMe ? (
              <Button variant="secondary" size="sm">
                <Settings className="w-4 h-4 mr-1.5" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'gradient'}
                size="sm"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1.5 text-vyro-primary" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    <span>Follow</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Bio & Metrics */}
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-vyro-border/60">
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{user.bio}</p>

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="font-extrabold text-white mr-1.5">{user.postsCount}</span>
              <span className="text-slate-400">Posts</span>
            </div>
            <div>
              <span className="font-extrabold text-white mr-1.5">
                {(user.followersCount + (isFollowing ? 1 : 0)).toLocaleString()}
              </span>
              <span className="text-slate-400">Followers</span>
            </div>
            <div>
              <span className="font-extrabold text-white mr-1.5">{user.followingCount}</span>
              <span className="text-slate-400">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="flex items-center justify-around border-b border-vyro-border">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-vyro-primary text-vyro-primary'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'reels'
              ? 'border-vyro-primary text-vyro-primary'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Reels</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-vyro-primary text-vyro-primary'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved</span>
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOCK_POSTS.map((post) => (
          <div
            key={post.id}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-vyro-card border border-vyro-border cursor-pointer select-none"
          >
            <img
              src={post.media[0]?.url}
              alt={post.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
              <span>❤️ {post.likesCount}</span>
              <span>💬 {post.commentsCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
