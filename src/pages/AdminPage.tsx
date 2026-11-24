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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { apiRequest } from '../lib/api';
import { User, ReportItem, UserRole } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { Button } from '../components/ui/Button';
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

  const filteredUsers = usersList.filter(
    (u) =>
      !searchQuery.trim() ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
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
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
    </div>
  );
};
