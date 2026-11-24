import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useCall } from '../context/CallContext';
import { apiRequest } from '../lib/api';
import { compressImageFile } from '../lib/imageCompressor';
import { User, ProfileAccent } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import {
  Grid,
  Film,
  Bookmark,
  Settings,
  UserPlus,
  UserCheck,
  BarChart3,
  MessageCircle,
  Lock,
  Crown,
  Phone,
  Video,
  Upload,
} from 'lucide-react';

const ACCENT_GRADIENTS: Record<ProfileAccent, string> = {
  purple: 'from-vyro-primary via-purple-600 to-indigo-600',
  pink: 'from-vyro-accent via-rose-500 to-amber-500',
  cyan: 'from-vyro-cyan via-sky-500 to-blue-600',
  gold: 'from-amber-400 via-orange-500 to-rose-500',
};

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentUser, updateProfile } = useAuth();
  const { posts, toggleFollow } = useSocial();
  const { startCall } = useCall();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');

  // Edit Profile Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editAccent, setEditAccent] = useState<ProfileAccent>('purple');
  const [saving, setSaving] = useState(false);

  const loadUser = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await apiRequest<{ user: User }>(`/api/users/${encodeURIComponent(username)}`);
      setProfileUser(res.user);
    } catch {
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [username, currentUser?.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-xs text-slate-400">
        Loading real profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center glass-panel rounded-3xl border border-vyro-border my-8 space-y-3">
        <h2 className="text-lg font-bold text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-400">
          No user exists with handle <span className="text-white font-bold">@{username}</span>.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/feed')}>
          Back to Feed
        </Button>
      </div>
    );
  }

  const isMe = currentUser?.id === profileUser.id;
  const userPosts = posts.filter((p) => p.userId === profileUser.id);
  const userReels = userPosts.filter((p) => p.postType === 'reel' || p.postType === 'video');
  const savedPosts = isMe ? posts.filter((p) => p.isSaved) : [];

  const totalLikes = userPosts.reduce((sum, p) => sum + p.likesCount, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + p.commentsCount, 0);
  const accentClass = ACCENT_GRADIENTS[profileUser.profileAccent || 'purple'];

  const openEditModal = () => {
    setEditDisplayName(profileUser.displayName);
    setEditBio(profileUser.bio || '');
    setEditAvatarUrl(profileUser.avatarUrl || '');
    setEditCoverUrl(profileUser.coverUrl || '');
    setEditAccent(profileUser.profileAccent || 'purple');
    setEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      displayName: editDisplayName,
      bio: editBio,
      avatarUrl: editAvatarUrl,
      coverUrl: editCoverUrl,
      profileAccent: editAccent,
    });
    setSaving(false);
    if (res.success) {
      setEditOpen(false);
      loadUser();
    }
  };

  const handleFollowClick = async () => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    await toggleFollow(profileUser.id);
    loadUser();
  };

  const visibleGrid =
    activeTab === 'posts' ? userPosts : activeTab === 'reels' ? userReels : savedPosts;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Cover Banner & Profile Header */}
      <div
        className={`glass-panel rounded-3xl overflow-hidden border relative ${
          profileUser.isPro ? 'border-vyro-primary/50 shadow-glow-purple/20' : 'border-vyro-border'
        }`}
      >
        <div className="h-44 sm:h-56 w-full bg-slate-900 relative">
          {profileUser.coverUrl ? (
            <img
              src={profileUser.coverUrl}
              alt="Profile cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${accentClass} opacity-60`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-vyro-bg via-transparent to-transparent" />
        </div>

        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar
              src={profileUser.avatarUrl}
              alt={profileUser.displayName}
              size="xl"
              hasStory={profileUser.isPro}
              className="border-4 border-vyro-bg shadow-2xl"
            />
            <div className="mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {profileUser.displayName}
                </h1>
                <VerifiedBadge
                  isVerified={profileUser.isVerified}
                  isPro={profileUser.isPro}
                  proBadge={profileUser.proBadge}
                  size="md"
                />
                {profileUser.isPrivate && <Lock className="w-4 h-4 text-slate-400" />}
              </div>
              <p className="text-xs text-slate-400">@{profileUser.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {isMe ? (
              <Button variant="secondary" size="sm" onClick={openEditModal}>
                <Settings className="w-4 h-4 mr-1.5" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <>
                <Button
                  variant={profileUser.isFollowing ? 'secondary' : 'gradient'}
                  size="sm"
                  onClick={handleFollowClick}
                >
                  {profileUser.isFollowing ? (
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/direct?user=${profileUser.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  <span>Message</span>
                </Button>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigate('/');
                      return;
                    }
                    startCall(profileUser, 'voice');
                  }}
                  className="p-2 rounded-xl bg-vyro-primary/20 text-vyro-primary hover:bg-vyro-primary hover:text-white transition-colors"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigate('/');
                      return;
                    }
                    startCall(profileUser, 'video');
                  }}
                  className="p-2 rounded-xl bg-vyro-cyan/20 text-vyro-cyan hover:bg-vyro-cyan hover:text-white transition-colors"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio & Metrics */}
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-vyro-border/60">
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {profileUser.bio || 'No bio added yet.'}
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="font-extrabold text-white mr-1.5">{userPosts.length}</span>
              <span className="text-slate-400">Posts</span>
            </div>
            <div>
              <span className="font-extrabold text-white mr-1.5">{profileUser.followersCount}</span>
              <span className="text-slate-400">Followers</span>
            </div>
            <div>
              <span className="font-extrabold text-white mr-1.5">{profileUser.followingCount}</span>
              <span className="text-slate-400">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Creator Analytics Dashboard (Unlocked when isPro is true) */}
      {isMe && profileUser.isPro && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-vyro-primary/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-vyro-primary flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>PRO Creator Analytics (Live Metrics)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vyro-primary/20 text-vyro-primary flex items-center gap-1">
              <Crown className="w-3 h-3" /> All Pro Tools Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-vyro-bg border border-vyro-border">
              <p className="text-lg font-extrabold text-white">{totalLikes}</p>
              <p className="text-[10px] text-slate-400">Total Likes Earned</p>
            </div>
            <div className="p-3 rounded-xl bg-vyro-bg border border-vyro-border">
              <p className="text-lg font-extrabold text-vyro-cyan">{totalComments}</p>
              <p className="text-[10px] text-slate-400">Total Discussions</p>
            </div>
            <div className="p-3 rounded-xl bg-vyro-bg border border-vyro-border">
              <p className="text-lg font-extrabold text-vyro-accent">
                {userPosts.length > 0 ? Math.round((totalLikes + totalComments) / userPosts.length) : 0}
              </p>
              <p className="text-[10px] text-slate-400">Avg. Interactions/Post</p>
            </div>
          </div>
        </div>
      )}

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
          <span>Posts ({userPosts.length})</span>
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
          <span>Reels ({userReels.length})</span>
        </button>

        {isMe && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-vyro-primary text-vyro-primary'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {visibleGrid.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-vyro-border space-y-2">
          <p className="text-sm font-bold text-slate-200">Nothing here yet</p>
          <p className="text-xs text-slate-500">
            {activeTab === 'saved'
              ? 'Save posts from the feed to find them here later.'
              : 'Posts published in Studio will show up here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleGrid.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-vyro-card border border-vyro-border select-none"
            >
              {post.media[0]?.type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={post.media[0]?.url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                <span>❤️ {post.likesCount}</span>
                <span>💬 {post.commentsCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Display Name"
            value={editDisplayName}
            onChange={(e) => setEditDisplayName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              className="w-full bg-vyro-card border border-vyro-border rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-vyro-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Profile Photo
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-2 rounded-xl bg-vyro-card border border-vyro-border hover:border-vyro-primary text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-vyro-primary" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setEditAvatarUrl(await compressImageFile(f, 400, 0.85));
                  }}
                />
              </label>
              {editAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setEditAvatarUrl('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cover Banner
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-2 rounded-xl bg-vyro-card border border-vyro-border hover:border-vyro-primary text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-vyro-cyan" />
                <span>Upload Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setEditCoverUrl(await compressImageFile(f, 1200, 0.82));
                  }}
                />
              </label>
              {editCoverUrl && (
                <button
                  type="button"
                  onClick={() => setEditCoverUrl('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove Cover
                </button>
              )}
            </div>
          </div>

          {profileUser.isPro && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-vyro-primary mb-2 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> PRO Profile Accent Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['purple', 'pink', 'cyan', 'gold'] as ProfileAccent[]).map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => setEditAccent(acc)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                      editAccent === acc
                        ? 'border-white bg-white/10 text-white'
                        : 'border-vyro-border bg-vyro-card text-slate-400'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" variant="gradient" className="w-full" isLoading={saving}>
            Save Profile Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
};
