import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useCall } from '../context/CallContext';
import { apiRequest } from '../lib/api';
import { compressImageFile } from '../lib/imageCompressor';
import { formatMetric } from '../lib/musicCatalog';
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
  Camera,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { soundEngine } from '../lib/soundEngine';
import { SPRING_SNAPPY } from '../lib/motion';

const ACCENT_GRADIENTS: Record<ProfileAccent, string> = {
  purple: 'from-indigo-600 via-purple-600 to-rose-600',
  pink: 'from-rose-500 via-pink-600 to-amber-500',
  cyan: 'from-cyan-500 via-blue-600 to-indigo-600',
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

  // DP & Cover Direct Upload from Device
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [compressingAvatar, setCompressingAvatar] = useState(false);
  const [compressingCover, setCompressingCover] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCompressingAvatar(true);
      soundEngine.playPop();
      const compressedDataUrl = await compressImageFile(file, 500, 0.85);
      setEditAvatarUrl(compressedDataUrl);
    } catch (err) {
      console.warn('Avatar compression failed:', err);
    } finally {
      setCompressingAvatar(false);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCompressingCover(true);
      soundEngine.playPop();
      const compressedDataUrl = await compressImageFile(file, 1000, 0.82);
      setEditCoverUrl(compressedDataUrl);
    } catch (err) {
      console.warn('Cover compression failed:', err);
    } finally {
      setCompressingCover(false);
    }
  };

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
      <div className="max-w-4xl mx-auto py-12 px-4 text-center text-xs text-white/50">
        Loading real profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center liquid-glass rounded-[32px] my-8 space-y-3">
        <h2 className="text-lg font-semibold text-white">Profile Not Found</h2>
        <p className="text-xs text-white/60">
          No user exists with handle <span className="text-white font-semibold">@{username}</span>.
        </p>
        <button
          onClick={() => navigate('/feed')}
          className="px-5 py-2 rounded-full liquid-pill-cta text-xs font-semibold"
        >
          Back to Feed
        </button>
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
      <div className="liquid-glass rounded-[32px] overflow-hidden border border-white/10 relative shadow-2xl">
        <div className="h-44 sm:h-56 w-full bg-black/60 relative">
          {profileUser.coverUrl ? (
            <img
              src={profileUser.coverUrl}
              alt="Profile cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${accentClass} opacity-40`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {isMe && (
            <button
              type="button"
              onClick={() => {
                openEditModal();
                setTimeout(() => coverInputRef.current?.click(), 120);
              }}
              className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-full liquid-glass-elevated border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all hover:bg-white/20"
              title="Upload New Cover Photo"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Change Cover</span>
            </button>
          )}
        </div>

        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative group">
              <Avatar
                src={profileUser.avatarUrl}
                alt={profileUser.displayName}
                size="xl"
                hasStory={profileUser.isPro}
                className="border-4 border-black/80 shadow-2xl"
              />
              {isMe && (
                <button
                  type="button"
                  onClick={() => {
                    openEditModal();
                    setTimeout(() => avatarInputRef.current?.click(), 120);
                  }}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-black/85 hover:bg-black text-white border border-white/20 shadow-xl active:scale-90 transition-all group-hover:scale-110"
                  title="Upload New Profile Picture (DP)"
                >
                  <Camera className="w-4 h-4 text-cyan-300" />
                </button>
              )}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {profileUser.displayName}
                </h1>
                <VerifiedBadge
                  isVerified={profileUser.isVerified}
                  isPro={profileUser.isPro}
                  proBadge={profileUser.proBadge}
                  size="md"
                />
                {profileUser.isPrivate && <Lock className="w-4 h-4 text-white/50" />}
              </div>
              <p className="text-xs text-white/50">@{profileUser.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            {isMe ? (
              <button
                onClick={openEditModal}
                className="px-4 py-2 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollowClick}
                  className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    profileUser.isFollowing
                      ? 'liquid-glass-inner text-white'
                      : 'liquid-pill-cta text-white shadow-lg'
                  }`}
                >
                  {profileUser.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 text-cyan-300" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/direct?user=${profileUser.id}`)}
                  className="px-4 py-2 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigate('/');
                      return;
                    }
                    startCall(profileUser, 'voice');
                  }}
                  className="p-2.5 rounded-full liquid-glass-inner hover:bg-white/15 text-white transition-colors"
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
                  className="p-2.5 rounded-full liquid-glass-inner hover:bg-white/15 text-rose-300 transition-colors"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio & Metrics */}
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/10">
          <p className="text-xs text-white/80 max-w-xl leading-relaxed">
            {profileUser.bio || 'No bio added yet.'}
          </p>

          {/* Founder VIP Banner for Root Admin / satyam */}
          {(profileUser.username === 'satyam' || profileUser.username === 'vyro_admin') && (
            <div className="p-3.5 rounded-2xl liquid-glass-inner border border-white/15 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">👑</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-300">
                    {profileUser.username === 'satyam' ? 'Root Founder & Chief Architect' : 'VYRO Pro Security & Admin'}
                  </p>
                  <p className="text-[10px] text-white/60">
                    Global Network Reach: <span className="font-semibold text-amber-300">1,000,000,000+ Reach 🚀</span>
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
                VIP Verified
              </span>
            </div>
          )}

          <div className="flex items-center gap-6 text-xs text-white/70">
            <div>
              <span className="font-semibold text-white mr-1.5">{userPosts.length}</span>
              <span className="text-white/50">Posts</span>
            </div>
            <div>
              <span
                className="font-semibold text-white mr-1.5 cursor-pointer hover:text-cyan-300 transition-colors"
                title={`${profileUser.followersCount.toLocaleString()} Followers`}
              >
                {formatMetric(profileUser.followersCount)}
              </span>
              <span className="text-white/50">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-white mr-1.5">{formatMetric(profileUser.followingCount)}</span>
              <span className="text-white/50">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Creator Analytics Dashboard */}
      {isMe && profileUser.isPro && (
        <div className="liquid-glass rounded-[28px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>PRO Creator Analytics</span>
            </h3>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full liquid-glass-inner text-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" /> All Pro Tools Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl liquid-glass-inner">
              <p className="text-lg font-semibold text-white">{formatMetric(totalLikes)}</p>
              <p className="text-[10px] text-white/50">Total Likes Earned</p>
            </div>
            <div className="p-3.5 rounded-2xl liquid-glass-inner">
              <p className="text-lg font-semibold text-cyan-300">{formatMetric(totalComments)}</p>
              <p className="text-[10px] text-white/50">Total Discussions</p>
            </div>
            <div className="p-3.5 rounded-2xl liquid-glass-inner">
              <p className="text-lg font-semibold text-rose-300">
                {userPosts.length > 0 ? formatMetric(Math.round((totalLikes + totalComments) / userPosts.length)) : '0'}
              </p>
              <p className="text-[10px] text-white/50">Avg. Interactions/Post</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Content Segmented Tabs */}
      <div className="relative flex items-center p-1 rounded-full liquid-glass-inner justify-around max-w-md mx-auto">
        {(
          [
            { id: 'posts', label: `Posts (${userPosts.length})`, icon: Grid },
            { id: 'reels', label: `Reels (${userReels.length})`, icon: Film },
            ...(isMe ? [{ id: 'saved', label: `Saved (${savedPosts.length})`, icon: Bookmark }] : []),
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'posts' | 'reels' | 'saved')}
              className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="profileTabPill"
                  className="absolute inset-0 rounded-full bg-white/20 border border-white/25 shadow-sm"
                  transition={SPRING_SNAPPY}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Posts Grid */}
      {visibleGrid.length === 0 ? (
        <div className="liquid-glass rounded-[28px] p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-white/80">Nothing here yet</p>
          <p className="text-xs text-white/50">
            {activeTab === 'saved'
              ? 'Save posts from the feed to find them here later.'
              : 'Posts published in Studio will show up here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {visibleGrid.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square rounded-[22px] overflow-hidden bg-black/60 liquid-glass select-none"
            >
              {post.media[0]?.type === 'video' ? (
                <video src={post.media[0].url} className="w-full h-full object-cover" />
              ) : (
                <img
                  src={post.media[0]?.url}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-semibold backdrop-blur-xs">
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
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 block mb-1.5">
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full liquid-glass-inner rounded-2xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Avatar (DP) Upload Section */}
          <div className="p-3.5 rounded-2xl liquid-glass-inner space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-300" />
                <span>Profile Picture (DP)</span>
              </label>
              {editAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setEditAvatarUrl('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition"
                >
                  Reset DP
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <Avatar
                  src={editAvatarUrl || profileUser.avatarUrl}
                  alt={editDisplayName || profileUser.displayName}
                  size="lg"
                  className="border-2 border-white/20 shadow-md"
                />
                {compressingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold animate-pulse">...</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={compressingAvatar}
                  className="px-4 py-2 rounded-full liquid-glass-elevated border border-white/20 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white shadow-md flex items-center gap-2 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{compressingAvatar ? 'Optimizing Photo...' : 'Choose Photo from Device'}</span>
                </button>
                <p className="text-[10px] text-white/45">
                  Select any photo from your phone or PC gallery.
                </p>
              </div>
            </div>

            {/* Optional URL Fallback */}
            <div>
              <button
                type="button"
                onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 transition"
              >
                <span>{showAvatarUrlInput ? 'Hide URL input' : 'or enter image URL directly'}</span>
                {showAvatarUrlInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showAvatarUrlInput && (
                <div className="mt-2">
                  <Input
                    placeholder="https://..."
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cover Banner Upload Section */}
          <div className="p-3.5 rounded-2xl liquid-glass-inner space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>Cover Banner Photo</span>
              </label>
              {editCoverUrl && (
                <button
                  type="button"
                  onClick={() => setEditCoverUrl('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition"
                >
                  Reset Cover
                </button>
              )}
            </div>

            {/* Banner Preview */}
            <div className="relative h-20 w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
              {editCoverUrl || profileUser.coverUrl ? (
                <img
                  src={editCoverUrl || profileUser.coverUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${accentClass} opacity-30`} />
              )}
              {compressingCover && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-xs text-white font-bold animate-pulse">Optimizing Cover...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={compressingCover}
                className="px-4 py-2 rounded-full liquid-glass-elevated border border-white/20 hover:bg-white/15 active:scale-95 text-xs font-semibold text-white shadow-md flex items-center gap-2 transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>{compressingCover ? 'Optimizing Cover...' : 'Choose Cover from Device'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCoverUrlInput(!showCoverUrlInput)}
                className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 transition"
              >
                <span>{showCoverUrlInput ? 'Hide URL' : 'or enter URL'}</span>
                {showCoverUrlInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showCoverUrlInput && (
              <Input
                placeholder="https://..."
                value={editCoverUrl}
                onChange={(e) => setEditCoverUrl(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 block">
              Profile Theme Accent
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['purple', 'pink', 'cyan', 'gold'] as ProfileAccent[]).map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setEditAccent(acc)}
                  className={`p-2 rounded-2xl border text-xs font-semibold capitalize transition ${
                    editAccent === acc
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'liquid-glass-inner text-white/60 hover:text-white'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-full liquid-glass-inner text-xs font-semibold text-white/70 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-full liquid-pill-cta text-xs font-semibold text-white shadow-lg disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
