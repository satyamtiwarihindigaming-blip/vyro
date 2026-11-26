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
      });
      showNotice(
        res.user.isPro
          ? `PRO Tier granted to @${res.user.username}!`
          : `PRO Tier removed from @${res.user.username}.`
      );
      await Promise.all([loadAdminOverview(), refreshSession(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole }),
      });
      showNotice(`Role updated to ${newRole}`);
      await Promise.all([loadAdminOverview(), refreshSession()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
      showNotice('Post deleted successfully.');
      await Promise.all([loadAdminOverview(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete_content') => {
    try {
      await apiRequest(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      showNotice(`Report marked as ${action}`);
      await Promise.all([loadAdminOverview(), refreshSocialData()]);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setBroadcasting(true);
    try {
      await apiRequest('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message: broadcastText.trim() }),
      });
      setBroadcastText('');
      showNotice('System-wide notification broadcasted successfully!');
    } catch (err: unknown) {
      showNotice((err as Error).message);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSendDirectAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMessageUser || !directMessageText.trim()) return;
    setSendingDirectMsg(true);
    try {
      await apiRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: directMessageUser.id,
          content: `🛡️ [Official Admin Dispatch]: ${directMessageText.trim()}`,
        }),
      });
      showNotice(`Direct message delivered to @${directMessageUser.username}`);
      setDirectMessageText('');
      setDirectMessageUser(null);
    } catch (err: unknown) {
      showNotice((err as Error).message);
    } finally {
      setSendingDirectMsg(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="liquid-glass rounded-[32px] p-8 space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-semibold text-white">Access Denied</h2>
          <p className="text-xs text-white/60">
            This operational dashboard is restricted to VYRO platform administrators.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Platform Command Center</span>
          </h2>
          <p className="text-xs text-white/60">
            Platform telemetry, user verification, moderation queue, and signal monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminViewMode((prev) => (prev === 'civilian' ? 'activity' : 'civilian'))}
            className="px-4 py-2 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-4 h-4 text-amber-300" />
            <span>{adminViewMode === 'civilian' ? 'Tactical Radar' : 'Civilian Overview'}</span>
          </button>
          <button
            onClick={loadAdminOverview}
            className="p-2 rounded-full liquid-glass-inner hover:bg-white/15 text-white/70 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Render FBI Tactical Radar Terminal when in activity view */}
      {adminViewMode === 'activity' ? (
        <FBITacticalTerminal
          currentUser={currentUser}
          usersList={usersList}
          reportsList={reportsList}
          onRefresh={loadAdminOverview}
          onToggleStealth={() => showNotice('Stealth mode toggled')}
        />
      ) : (
        <>
          {/* Telemetry Stat Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="liquid-glass rounded-[24px] p-4.5 space-y-1">
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-300" /> Total Users
                </p>
                <p className="text-2xl font-semibold text-white tracking-tight">{stats.totalUsers}</p>
                <p className="text-[10px] text-cyan-200 font-medium">{stats.verifiedUsers} Verified</p>
              </div>

              <div className="liquid-glass rounded-[24px] p-4.5 space-y-1">
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-rose-400" /> Total Posts
                </p>
                <p className="text-2xl font-semibold text-white tracking-tight">{stats.totalPosts}</p>
                <p className="text-[10px] text-rose-200 font-medium">{stats.totalStories} Active 24h Stories</p>
              </div>

              <div className="liquid-glass rounded-[24px] p-4.5 space-y-1">
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-300" /> PRO Members
                </p>
                <p className="text-2xl font-semibold text-white tracking-tight">{stats.proUsers}</p>
                <p className="text-[10px] text-amber-200 font-medium">All Pro Tools Active</p>
              </div>

              <div className="liquid-glass rounded-[24px] p-4.5 space-y-1">
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-red-400" /> Open Reports
                </p>
                <p className="text-2xl font-semibold text-white tracking-tight">{stats.openReports}</p>
                <p className="text-[10px] text-red-200 font-medium">{reportsList.length} In Queue</p>
              </div>
            </div>
          )}

          {/* Broadcast Announcement Bar */}
          <form onSubmit={handleBroadcast} className="liquid-glass rounded-[28px] p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-300" />
              <span>Broadcast System-Wide Notice</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Send a global announcement toast to all active users..."
                className="flex-1 liquid-glass-inner rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={broadcasting || !broadcastText.trim()}
                className="px-5 py-2.5 rounded-full liquid-pill-cta text-white text-xs font-semibold transition disabled:opacity-40 shadow-lg"
              >
                {broadcasting ? 'Sending...' : 'Broadcast'}
              </button>
            </div>
          </form>

          {/* User Management Table */}
          <div className="liquid-glass rounded-[28px] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-300" />
                <span>User Directory & Credentials ({filteredUsers.length})</span>
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name, username..."
                  className="w-full liquid-glass-inner rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Followers</th>
                    <th className="py-2.5 px-3">Badges</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3">
                        <Link to={`/${usr.username}`} className="flex items-center gap-2.5 group">
                          <Avatar src={usr.avatarUrl} alt={usr.displayName} size="xs" />
                          <div className="min-w-0">
                            <p className="font-semibold text-white group-hover:text-cyan-200 transition-colors truncate">
                              {usr.displayName}
                            </p>
                            <p className="text-[10px] text-white/50 truncate">@{usr.username}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={usr.role}
                          onChange={(e) => handleChangeRole(usr.id, e.target.value as UserRole)}
                          className="liquid-glass-inner rounded-full px-2.5 py-1 text-[11px] font-semibold text-white focus:outline-none"
                        >
                          <option value="creator" className="bg-slate-900">Creator</option>
                          <option value="moderator" className="bg-slate-900">Moderator</option>
                          <option value="admin" className="bg-slate-900">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {formatMetric(usr.followersCount)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleVerify(usr.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                              usr.isVerified
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40'
                                : 'liquid-glass-inner text-white/50 hover:text-white'
                            }`}
                          >
                            Blue Tick
                          </button>
                          <button
                            onClick={() => handleTogglePro(usr.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                              usr.isPro
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                                : 'liquid-glass-inner text-white/50 hover:text-white'
                            }`}
                          >
                            PRO
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setDirectMessageUser(usr)}
                          className="px-3 py-1 rounded-full liquid-glass-inner hover:bg-white/15 text-white/80 hover:text-white text-[11px] font-semibold transition-colors"
                        >
                          DM Dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Admin Direct Message Modal */}
      {directMessageUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md liquid-glass-elevated rounded-[32px] p-6 space-y-4 shadow-2xl border border-white/15">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white">
                Dispatch to @{directMessageUser.username}
              </h3>
              <button onClick={() => setDirectMessageUser(null)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={directMessageText}
              onChange={(e) => setDirectMessageText(e.target.value)}
              placeholder="Enter message text..."
              rows={3}
              className="w-full liquid-glass-inner rounded-2xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDirectMessageUser(null)}
                className="px-4 py-2 rounded-full liquid-glass-inner text-xs font-semibold text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendDirectAdminMessage}
                disabled={sendingDirectMsg || !directMessageText.trim()}
                className="px-6 py-2 rounded-full liquid-pill-cta text-xs font-semibold text-white shadow-lg disabled:opacity-40"
              >
                {sendingDirectMsg ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
