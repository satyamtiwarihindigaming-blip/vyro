import React, { useState } from 'react';
import {
  Users,
  Activity,
  MapPin,
  Mail,
  Shield,
  Search,
  CheckCircle,
  Clock,
  Radio,
  FileText,
  Eye,
  Zap,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { User, ReportItem } from '../../types';
import { formatMetric } from '../../lib/musicCatalog';
import { soundEngine } from '../../lib/soundEngine';

interface AccountActivityHubProps {
  usersList: User[];
  reportsList: ReportItem[];
  currentUser: User | null;
}

export const AccountActivityHub: React.FC<AccountActivityHubProps> = ({
  usersList,
  reportsList,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'creator' | 'user'>('all');
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (roleFilter === 'all') return true;
    if (roleFilter === 'admin') return u.role === 'admin';
    if (roleFilter === 'creator') return u.role === 'creator' || u.isPro || u.isVerified;
    if (roleFilter === 'user') return u.role === 'user' && !u.isPro && !u.isVerified;
    return true;
  });

  return (
    <div className="w-full space-y-5 select-none font-sans">
      {/* GitHub/Vercel/Tremor Inspired Minimalist Analytics Header */}
      <div className="glass-panel border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              RESTRICTED AUDIT ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              CLEARANCE: {currentUser?.role === 'admin' ? 'ROOT ADMIN' : 'VIP CREATOR'}
            </span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Account Activity & Telemetry Hub</span>
            <span className="text-xs font-mono font-normal text-slate-500">
              ({usersList.length} Accounts Monitored)
            </span>
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['all', 'admin', 'creator', 'user'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                soundEngine.playHapticClick();
                setRoleFilter(r);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition border ${
                roleFilter === r
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-zinc-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Accounts' : r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row (GitHub Insights Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel border border-white/10 rounded-xl p-3.5 bg-zinc-950/60">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Total Identities
          </span>
          <span className="text-xl font-black text-white mt-1 block">
            {usersList.length.toLocaleString()}
          </span>
        </div>
        <div className="glass-panel border border-white/10 rounded-xl p-3.5 bg-zinc-950/60">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Verified / Pro Reach
          </span>
          <span className="text-xl font-black text-cyan-400 mt-1 block">
            {usersList.filter((u) => u.isVerified || u.isPro).length}
          </span>
        </div>
        <div className="glass-panel border border-white/10 rounded-xl p-3.5 bg-zinc-950/60">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Avg Creator Reach
          </span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">1B+ Focus</span>
        </div>
        <div className="glass-panel border border-white/10 rounded-xl p-3.5 bg-zinc-950/60">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Pending Reports
          </span>
          <span className="text-xl font-black text-amber-400 mt-1 block">
            {reportsList.filter((r) => r.status === 'open').length}
          </span>
        </div>
      </div>

      {/* High-Density Developer Data Table */}
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden bg-zinc-950/90 shadow-2xl">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by handle, display name, or secure email..."
              className="w-full bg-zinc-900 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Showing {filteredUsers.length} matches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/90 border-b border-white/10 text-[10px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Account Identifier</th>
                <th className="py-2.5 px-4">Secure Email</th>
                <th className="py-2.5 px-4">Role Clearance</th>
                <th className="py-2.5 px-4">Reach & Followers</th>
                <th className="py-2.5 px-4">Posts</th>
                <th className="py-2.5 px-4">Geo Position Node</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const isFounder = u.username === 'satyam' || u.username === 'vyro_admin';
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => {
                      soundEngine.playPop();
                      setInspectedUser(u);
                    }}
                  >
                    <td className="py-2.5 px-4 flex items-center gap-2.5">
                      <img
                        src={u.avatarUrl}
                        alt={u.username}
                        className="w-7 h-7 rounded-lg border border-white/10 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1 font-bold text-white group-hover:text-cyan-400 transition">
                          <span>@{u.username}</span>
                          {u.isVerified && <span className="text-cyan-400">✓</span>}
                          {u.isPro && <span className="text-amber-400">⚡</span>}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                          {u.displayName}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-slate-300">
                      <span className="text-[11px] truncate max-w-[150px] block">
                        {u.email || 'REDACTED'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : u.role === 'creator' || u.isPro
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-zinc-800 text-slate-400'
                        }`}
                      >
                        {isFounder ? 'ROOT_FOUNDER' : u.role}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-bold text-slate-200">
                      {formatMetric(u.followersCount)}
                    </td>

                    <td className="py-2.5 px-4 text-slate-400">
                      {formatMetric(u.postsCount)}
                    </td>

                    <td className="py-2.5 px-4">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                        {u.lastLocation || 'Mumbai Node'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playHapticClick();
                          setInspectedUser(u);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-[10px] font-bold transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Deep-Inspection Drawer / Modal */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel border border-white/20 rounded-3xl p-6 space-y-4 shadow-2xl bg-zinc-950 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={inspectedUser.avatarUrl}
                  alt={inspectedUser.username}
                  className="w-12 h-12 rounded-2xl border border-white/20 object-cover"
                />
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>@{inspectedUser.username}</span>
                    {inspectedUser.isVerified && <span className="text-cyan-400">✓</span>}
                    {inspectedUser.isPro && <span className="text-amber-400">⚡</span>}
                  </h3>
                  <p className="text-[11px] text-slate-400">{inspectedUser.displayName}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Account Details Matrix */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">Identifier ID</span>
                <span className="text-slate-200 truncate block">{inspectedUser.id}</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">Secure Email</span>
                <span className="text-cyan-400 truncate block">{inspectedUser.email || 'N/A'}</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">Role Clearance</span>
                <span className="text-emerald-400 font-bold uppercase">{inspectedUser.role}</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-[9px] uppercase text-slate-500 block">Follower Reach</span>
                <span className="text-white font-bold">{formatMetric(inspectedUser.followersCount)}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 text-xs text-slate-300">
              <span className="text-[9px] uppercase text-slate-500 block mb-1">
                Audit Timeline & Activity
              </span>
              <p className="text-[11px]">
                Account registered on {new Date(inspectedUser.createdAt).toLocaleDateString()}. Active session confirmed with 0 security breaches or violations.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-slate-200 transition"
              >
                Close Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
