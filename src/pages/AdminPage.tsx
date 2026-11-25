import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  BadgeCheck,
  Crown,
  Trash2,
  Users,
  FileText,
  Flag,
  CheckCircle,
  Search,
  RefreshCw,
  MessageSquare,
  Send,
  MessageCircle,
  X,
  Eye,
  Terminal,
} from 'lucide-react';
import { FBITacticalTerminal } from '../components/admin/FBITacticalTerminal';
import { AccountActivityHub } from '../components/admin/AccountActivityHub';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { apiRequest } from '../lib/api';
import { User, ReportItem, UserRole } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Button } from '../components/ui/Button';
import { formatMetric } from '../lib/musicCatalog';
import { Link } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  proUsers: number;
  totalPosts: number;
  totalStories: number;
  totalMessages: number;
  openReports: number;
}

interface AdminPostSummary {
  id: string;
  caption: string;
  postType: string;
  authorUsername: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export const AdminPage: React.FC = () => {
  const { currentUser, isAdmin, refreshSession } = useAuth();
  const { refreshSocialData } = useSocial();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [postsList, setPostsList] = useState<AdminPostSummary[]>([]);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [adminViewMode, setAdminViewMode] = useState<'civilian' | 'activity'>('civilian');

  // Admin Broadcast & Direct Messaging State
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [directMessageUser, setDirectMessageUser] = useState<User | null>(null);
  const [directMessageText, setDirectMessageText] = useState('');
  const [sendingDirectMsg, setSendingDirectMsg] = useState(false);

  const loadAdminOverview = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<{
        stats: AdminStats;
        users: User[];
        posts: AdminPostSummary[];
        reports: ReportItem[];
      }>('/api/admin/overview');
      setStats(data.stats);
      setUsersList(data.users);
      setPostsList(data.posts);
      setReportsList(data.reports);
    } catch (err) {
      console.warn('Admin load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, [isAdmin]);

  const showNotice = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 2500);
  };

  const handleToggleVerify = async (userId: string) => {
    try {
      const res = await apiRequest<{ user: User }>(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
      });
      showNotice(
        res.user.isVerified
          ? `Blue Tick granted to @${res.user.username}!`
          : `Blue Tick removed from @${res.user.username}.`
      );
      await Promise.all([loadAdminOverview(), refreshSession(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleTogglePro = async (userId: string) => {
    try {
      const res = await apiRequest<{ user: User }>(`/api/admin/users/${userId}/pro`, {
        method: 'POST',
        body: JSON.stringify({ proBadge: 'Pro' }),
      });
      showNotice(
        res.user.isPro
          ? `All Pro features unlocked for @${res.user.username}!`
          : `Pro tier revoked from @${res.user.username}.`
      );
      await Promise.all([loadAdminOverview(), refreshSession(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const res = await apiRequest<{ user: User }>(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      showNotice(`Updated @${res.user.username} role to ${role}.`);
      await loadAdminOverview();
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
      showNotice(`Deleted user @${username}.`);
      await Promise.all([loadAdminOverview(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
      showNotice('Post deleted by Admin.');
      await Promise.all([loadAdminOverview(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await apiRequest(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status: 'resolved' }),
      });
      showNotice('Report marked resolved.');
      await loadAdminOverview();
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setBroadcasting(true);
    try {
      const res = await apiRequest<{ success: boolean; deliveredTo: number }>('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ content: broadcastText.trim() }),
      });
      showNotice(`Official announcement broadcast delivered to ${res.deliveredTo} real users! 📢`);
      setBroadcastText('');
      await loadAdminOverview();
    } catch (err: unknown) {
      showNotice((err as Error).message || 'Broadcast failed.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMessageUser || !directMessageText.trim()) return;

    setSendingDirectMsg(true);
    try {
      await apiRequest('/api/admin/message', {
        method: 'POST',
        body: JSON.stringify({
          targetUserId: directMessageUser.id,
          content: directMessageText.trim(),
        }),
      });
      showNotice(`Admin Direct Notice sent to @${directMessageUser.username}! ⚡`);
      setDirectMessageText('');
      setDirectMessageUser(null);
      await loadAdminOverview();
    } catch (err: unknown) {
      showNotice((err as Error).message || 'Direct message failed.');
    } finally {
      setSendingDirectMsg(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <div className="glass-panel rounded-3xl p-8 border border-rose-500/30 space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-slate-400">
            This control center is strictly restricted to platform administrators.
          </p>
          <Link to="/feed">
            <Button variant="primary" size="sm">
              Return to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Developer-Tier Account Activity Hub
  if (adminViewMode === 'activity') {
    return (
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAdminViewMode('civilian')}
            className="px-4 py-2 rounded-xl bg-vyro-primary text-white font-bold text-xs transition shadow-glow-purple"
          >
            ← Back to Admin Control Center
          </button>
        </div>
        <AccountActivityHub
          usersList={usersList}
          reportsList={reportsList}
          currentUser={currentUser}
        />
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      !searchQuery.trim() ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Admin Mode Switcher */}
      <div className="flex items-center justify-between p-3 glass-card rounded-2xl border border-vyro-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">VYRO Admin Central</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminViewMode('civilian')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              adminViewMode === 'civilian'
                ? 'bg-vyro-primary text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Management Overview
          </button>
          <button
            onClick={() => setAdminViewMode('activity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              adminViewMode === 'activity'
                ? 'bg-vyro-primary text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Account Activity & Telemetry
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>VYRO Admin Control Center</span>
            <VerifiedBadge
              isVerified={currentUser?.isVerified}
              isPro={currentUser?.isPro}
              proBadge={currentUser?.proBadge}
              size="md"
            />
          </h1>
          <p className="text-xs text-slate-400">
            Manage real users, grant Blue Ticks, unlock Pro Features, and moderate content.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadAdminOverview}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Platform Statistics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-2xl p-4 border border-vyro-border">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-vyro-cyan" /> Real Users
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.totalUsers}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-vyro-border">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-sky-400" /> Blue Ticks
            </p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">{stats.verifiedUsers}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-vyro-border">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Pro Members
            </p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.proUsers}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-vyro-border">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-vyro-accent" /> Posts / Reports
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {stats.totalPosts} <span className="text-xs text-rose-400">/ {stats.openReports}</span>
            </p>
          </div>
        </div>
      )}

      {/* Platform Broadcast & Admin Messenger */}
      <div className="glass-panel rounded-2xl p-5 border border-vyro-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-vyro-primary" />
            <h2 className="text-sm font-bold text-white">Platform Broadcast & Direct Messenger</h2>
          </div>
          <span className="text-[11px] text-slate-400">Deliver notifications & alerts to users</span>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-3">
          <div className="relative">
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Write an official platform announcement to broadcast to all registered users..."
              rows={2}
              className="w-full bg-vyro-bg border border-vyro-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vyro-primary resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              Delivers directly into every user's chat thread with official Admin badge.
            </p>
            <Button
              variant="gradient"
              size="sm"
              type="submit"
              disabled={!broadcastText.trim() || broadcasting}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>{broadcasting ? 'Broadcasting...' : 'Broadcast to All Users'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Users Management Table */}
      <div className="glass-panel rounded-2xl p-5 border border-vyro-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Real Accounts & Verification Controls</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter users..."
              className="w-full bg-vyro-bg border border-vyro-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-vyro-primary"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-4">Loading platform records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vyro-border text-slate-400">
                  <th className="py-2.5 pr-4">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Blue Tick</th>
                  <th className="py-2.5 px-3">Pro Features</th>
                  <th className="py-2.5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vyro-border/50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <Link to={`/${u.username}`} className="flex items-center gap-2.5">
                        <Avatar src={u.avatarUrl} alt={u.displayName} size="xs" />
                        <div>
                          <div className="flex items-center gap-1 font-bold text-white">
                            <span>@{u.username}</span>
                            <VerifiedBadge
                              isVerified={u.isVerified}
                              isPro={u.isPro}
                              proBadge={u.proBadge}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                          <p className="text-[10px] text-amber-400 font-bold">
                            {formatMetric(u.followersCount || 0)} followers
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-vyro-card border border-vyro-border rounded-lg px-2 py-1 text-[11px] text-slate-200"
                      >
                        <option value="user">user</option>
                        <option value="creator">creator</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleVerify(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                          u.isVerified
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                            : 'bg-vyro-card text-slate-400 border border-vyro-border hover:text-white'
                        }`}
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>{u.isVerified ? 'Verified' : 'Grant Blue Tick'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleTogglePro(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                          u.isPro
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-vyro-card text-slate-400 border border-vyro-border hover:text-white'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{u.isPro ? 'PRO Active' : 'Unlock Pro'}</span>
                      </button>
                    </td>

                    <td className="py-3 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Message */}
                        <button
                          onClick={() => {
                            setDirectMessageUser(u);
                            setDirectMessageText('');
                          }}
                          className="p-1.5 rounded-lg text-vyro-cyan hover:bg-vyro-cyan/15 transition-colors"
                          title={`Message @${u.username}`}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* 1B Follower Boost for Admin Accounts */}
                        {u.role === 'admin' && (
                          <button
                            onClick={async () => {
                              try {
                                await apiRequest(`/api/admin/users/${u.id}/followers`, {
                                  method: 'POST',
                                  body: JSON.stringify({ followersCount: 1000000000 }),
                                });
                                showNotice(`1 Billion followers set for @${u.username}! 👑`);
                                await loadAdminOverview();
                              } catch (err: unknown) {
                                showNotice((err as Error).message);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/40 hover:bg-amber-500/40"
                            title="Set 1 Billion Followers"
                          >
                            1B👑
                          </button>
                        )}
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Content & Reports Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-vyro-border space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Moderation Reports ({reportsList.length})</span>
          </h3>
          {reportsList.length === 0 ? (
            <p className="text-xs text-slate-500">No reports submitted.</p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {reportsList.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-vyro-bg border border-vyro-border flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-white">
                      {r.targetType}: {r.targetId}
                    </p>
                    <p className="text-[11px] text-slate-400">{r.reason}</p>
                    <span className="text-[10px] uppercase font-bold text-amber-400">{r.status}</span>
                  </div>
                  {r.status === 'open' && (
                    <button
                      onClick={() => handleResolveReport(r.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-bold"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-vyro-border space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-vyro-primary" />
            <span>Recent Posts Moderation ({postsList.length})</span>
          </h3>
          {postsList.length === 0 ? (
            <p className="text-xs text-slate-500">No posts published yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {postsList.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-vyro-bg border border-vyro-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white">@{p.authorUsername}</p>
                    <p className="text-[11px] text-slate-400 truncate">{p.caption || '(Media post)'}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(p.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 flex-shrink-0"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Direct Message Modal */}
      {directMessageUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel border border-vyro-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar src={directMessageUser.avatarUrl} alt={directMessageUser.displayName} size="xs" />
                <div>
                  <h3 className="font-bold text-sm text-white">Message @{directMessageUser.username}</h3>
                  <p className="text-[10px] text-slate-400">Delivered with official VIP Admin badge</p>
                </div>
              </div>
              <button
                onClick={() => setDirectMessageUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notice / Message Content</label>
                <textarea
                  value={directMessageText}
                  onChange={(e) => setDirectMessageText(e.target.value)}
                  placeholder="Type official admin notice or message..."
                  rows={3}
                  required
                  className="w-full bg-vyro-bg border border-vyro-border rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vyro-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" type="button" onClick={() => setDirectMessageUser(null)}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  type="submit"
                  disabled={!directMessageText.trim() || sendingDirectMsg}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  {sendingDirectMsg ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
