import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Terminal,
  Radio,
  Globe,
  Crosshair,
  Lock,
  Unlock,
  Users,
  Search,
  AlertTriangle,
  Send,
  Zap,
  Activity,
  Award,
  CheckCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';
import { User, ReportItem } from '../../types';
import { apiRequest } from '../../lib/api';
import { formatMetric } from '../../lib/musicCatalog';

interface FBITacticalTerminalProps {
  currentUser: User | null;
  usersList: User[];
  reportsList: ReportItem[];
  onRefresh: () => void;
  onToggleStealth: () => void;
  onOpenActivityHub?: () => void;
}

interface PacketLog {
  id: string;
  timestamp: string;
  type: 'AUTH' | 'CALL' | 'SIGINT' | 'AI' | 'MEDIA' | 'SECURITY';
  message: string;
  level: 'info' | 'warn' | 'crit';
}

export const FBITacticalTerminal: React.FC<FBITacticalTerminalProps> = ({
  currentUser,
  usersList,
  reportsList,
  onRefresh,
  onToggleStealth,
  onOpenActivityHub,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(usersList[0] || currentUser);
  const [searchTarget, setSearchTarget] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [packetLogs, setPacketLogs] = useState<PacketLog[]>([]);
  const [radarDegree, setRadarDegree] = useState(0);

  // Initialize Biometric Tactical Audio Sound on Load
  useEffect(() => {
    soundEngine.playTacticalScan();
  }, []);

  // Radar sweep animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarDegree((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Live Simulated High-Velocity Signal Interceptor Packets
  useEffect(() => {
    const initialLogs: PacketLog[] = [
      {
        id: 'p_0',
        timestamp: new Date().toLocaleTimeString(),
        type: 'AUTH',
        message: `ROOT_OPERATOR @${currentUser?.username || 'satyam'} LEVEL-5 CLEARANCE CONFIRMED`,
        level: 'crit',
      },
      {
        id: 'p_1',
        timestamp: new Date().toLocaleTimeString(),
        type: 'SIGINT',
        message: 'WEBRTC ENCRYPTED MESH 48 ACTIVE CHANNELS [AES-256-GCM]',
        level: 'info',
      },
      {
        id: 'p_2',
        timestamp: new Date().toLocaleTimeString(),
        type: 'MEDIA',
        message: 'REALTIME STREAM 1080p60 TRANSCODING AT CLUSTER NODE US-EAST-01',
        level: 'info',
      },
      {
        id: 'p_3',
        timestamp: new Date().toLocaleTimeString(),
        type: 'SECURITY',
        message: 'PLATFORM FIREWALL SHIELD NOMINAL — 0 BREACH VECTORS DETECTED',
        level: 'info',
      },
    ];
    setPacketLogs(initialLogs);

    const logInterval = setInterval(() => {
      const mockEvents = [
        { type: 'SIGINT', message: 'SOCKET PACKET HANDSHAKE ROUTED // TLS 1.3', level: 'info' },
        { type: 'CALL', message: 'GROUP WEBRTC PEER CONNECTED // MESH #Call-409', level: 'info' },
        { type: 'MEDIA', message: 'NEW REEL BITSTREAM COMMITTED // 12.5M LIKES VERIFIED', level: 'info' },
        { type: 'AI', message: 'SYNTHESIS ENGINE: FLUX.1 SCHNELL PROMPT EXECUTED', level: 'info' },
        { type: 'SECURITY', message: 'GEOSPATIAL IP CLUSTER PING: MUMBAI-DATACENTER (14ms)', level: 'info' },
      ] as const;
      const pick = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      const newLog: PacketLog = {
        id: `p_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: pick.type,
        message: pick.message,
        level: pick.level,
      };
      setPacketLogs((prev) => [newLog, ...prev.slice(0, 14)]);
    }, 3200);

    return () => clearInterval(logInterval);
  }, [currentUser]);

  const showTacticalAlert = (msg: string) => {
    soundEngine.playPop();
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // God-Mode 1 Billion Followers Injector
  const handleGrant1Billion = async (targetId: string, username: string) => {
    soundEngine.playHapticClick();
    try {
      await apiRequest('/api/admin/set-followers', {
        method: 'POST',
        body: JSON.stringify({ userId: targetId, followersCount: 1_000_000_000 }),
      });
      showTacticalAlert(`[!] SUCCESS: 1,000,000,000 FOLLOWERS COMMITTED TO @${username}`);
      onRefresh();
    } catch {
      showTacticalAlert(`[ERR] FAILED TO COMMIT FOLLOWERS TO @${username}`);
    }
  };

  // God-Mode Verified Blue Tick & Founder Pro Badges
  const handleToggleVerification = async (targetId: string, username: string) => {
    soundEngine.playHapticClick();
    try {
      await apiRequest(`/api/admin/users/${targetId}/verify`, { method: 'POST' });
      showTacticalAlert(`[!] CLEARANCE STATUS TOGGLED FOR @${username}`);
      onRefresh();
    } catch {
      showTacticalAlert(`[ERR] VERIFICATION FAILED FOR @${username}`);
    }
  };

  // God-Mode Founder Pro Badge
  const handleToggleProBadge = async (targetId: string, username: string) => {
    soundEngine.playHapticClick();
    try {
      await apiRequest(`/api/admin/users/${targetId}/pro`, { method: 'POST' });
      showTacticalAlert(`[!] FOUNDER PRO BADGE GRANTED TO @${username}`);
      onRefresh();
    } catch {
      showTacticalAlert(`[ERR] FAILED TO GRANT PRO BADGE`);
    }
  };

  // God-Mode Strategic Red Alert Broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    soundEngine.playTacticalScan();
    try {
      await apiRequest('/api/admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message: `[FBI CLEARANCE LEVEL 5 DIRECTIVE]: ${broadcastMessage}` }),
      });
      showTacticalAlert('[!] STRATEGIC DIRECTIVE BROADCAST SENT TO ALL ACTIVE SITES');
      setBroadcastMessage('');
      onRefresh();
    } catch {
      showTacticalAlert('[ERR] BROADCAST TRANSMISSION FAILED');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTarget.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchTarget.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#02060A] text-[#00FF66] font-mono p-4 md:p-6 select-none relative overflow-x-hidden border-4 border-[#00FF66]/30">
      {/* Tactical CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-50 opacity-40" />

      {/* Top Banner: FBI / US-CYBERCOM Clearance Header */}
      <div className="bg-[#031008] border-2 border-[#00FF66] p-4 rounded-xl shadow-[0_0_25px_rgba(0,255,102,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#00FF66]/10 border border-[#00FF66] flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-7 h-7 text-[#00FF66]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#FF0033] text-black font-black text-xs uppercase tracking-widest rounded">
                TOP SECRET // EYES ONLY
              </span>
              <span className="text-xs text-[#00E5FF] tracking-widest">
                US-CYBERCOM // FBI TERMINAL
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-wider flex items-center gap-2 mt-1">
              VYRO STRATEGIC CYBER-COMMAND HUD
              <span className="text-xs text-[#00FF66] font-normal">[NODE: ALPHA-ROOT]</span>
            </h1>
          </div>
        </div>

        {/* Tactical Controls & Stealth Civilian Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              onRefresh();
            }}
            className="px-3 py-1.5 border border-[#00FF66]/60 rounded text-xs hover:bg-[#00FF66]/20 transition flex items-center gap-1.5"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RE-SCAN
          </button>

          {onOpenActivityHub && (
            <button
              onClick={() => {
                soundEngine.playHapticClick();
                onOpenActivityHub();
              }}
              className="px-3.5 py-2 bg-[#FFB700] text-black font-extrabold text-xs tracking-wider rounded-lg hover:bg-white shadow-[0_0_15px_rgba(255,183,0,0.4)] transition flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" /> ACCOUNT ACTIVITY HUB
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playHapticClick();
              onToggleStealth();
            }}
            className="px-4 py-2 bg-[#00E5FF] text-black font-extrabold text-xs tracking-wider rounded-lg hover:bg-white shadow-[0_0_15px_rgba(0,229,255,0.4)] transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> SWITCH TO STEALTH CIVILIAN VIEW
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-[#00FF66]/15 border-2 border-[#00FF66] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)]"
          >
            <Zap className="w-4 h-4 text-[#00FF66] animate-bounce" />
            {actionNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Layout: Surveillance Radar + Live Intercept Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Radar & Global Surveillance Node (4 Cols) */}
        <div className="lg:col-span-4 bg-[#030A07] border border-[#00FF66]/40 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#00FF66]/20 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#00E5FF]" /> GEOSPATIAL RADAR SURVEILLANCE
            </span>
            <span className="text-[10px] text-[#00FF66] animate-pulse">● 360° SWEEP ACTIVE</span>
          </div>

          {/* Interactive Radar Display */}
          <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full border-2 border-[#00FF66]/40 flex items-center justify-center overflow-hidden bg-[#00140A]/60">
            {/* Concentric distance rings */}
            <div className="absolute w-3/4 h-3/4 rounded-full border border-[#00FF66]/20" />
            <div className="absolute w-1/2 h-1/2 rounded-full border border-[#00FF66]/30" />
            <div className="absolute w-1/4 h-1/4 rounded-full border border-[#00FF66]/40" />
            <div className="absolute w-full h-[1px] bg-[#00FF66]/30" />
            <div className="absolute h-full w-[1px] bg-[#00FF66]/30" />

            {/* Simulated Active Creator Node Blips */}
            <div className="absolute top-[30%] left-[45%] w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-ping" />
            <div className="absolute top-[28%] left-[43%] w-2 h-2 bg-white rounded-full" />
            <span className="absolute top-[34%] left-[46%] text-[9px] text-[#00E5FF]">MUMBAI #1B</span>

            <div className="absolute bottom-[35%] right-[25%] w-2 h-2 bg-[#00FF66] rounded-full" />
            <span className="absolute bottom-[38%] right-[10%] text-[9px] text-[#00FF66]">US-EAST</span>

            <div className="absolute top-[55%] left-[22%] w-2 h-2 bg-[#FFB700] rounded-full" />

            {/* 360° Rotating Radar Sweep Line */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background: `conic-gradient(from ${radarDegree}deg at 50% 50%, rgba(0, 255, 102, 0.4) 0deg, transparent 60deg)`,
              }}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-[#00FF66]/20 text-[11px] grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[9px]">ENCRYPTED MESH</span>
              <span className="text-[#00FF66] font-bold">48 ACTIVE PEERS</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px]">LIVE CLUSTER SITES</span>
              <span className="text-[#00E5FF] font-bold">1,842 CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Live Signal Interceptor Stream (8 Cols) */}
        <div className="lg:col-span-8 bg-[#030A07] border border-[#00FF66]/40 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#00FF66]/20 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
              <Radio className="w-4 h-4 text-[#00FF66]" /> LIVE PACKET SIGNAL INTERCEPT STREAM
            </span>
            <span className="text-[10px] text-slate-400">PROTOCOL: TLS 1.3 // WSS-AES</span>
          </div>

          {/* Scrolling Packet Stream */}
          <div className="h-56 overflow-y-auto no-scrollbar space-y-1.5 font-mono text-[11px]">
            {packetLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-1 px-2 rounded bg-black/40 border border-[#00FF66]/10 hover:border-[#00FF66]/40 transition"
              >
                <span className="text-slate-500 flex-shrink-0 text-[10px]">[{log.timestamp}]</span>
                <span
                  className={`px-1 rounded text-[9px] font-bold flex-shrink-0 ${
                    log.type === 'AUTH'
                      ? 'bg-[#00FF66]/20 text-[#00FF66]'
                      : log.type === 'CALL'
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                      : log.type === 'SECURITY'
                      ? 'bg-[#FF0033]/20 text-[#FF0033]'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-slate-200 truncate">{log.message}</span>
              </div>
            ))}
          </div>

          {/* Strategic Red Alert Push Broadcast Bar */}
          <div className="mt-4 pt-3 border-t border-[#00FF66]/20 flex gap-2">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="TRANSMIT STRATEGIC DIRECTIVE TO ALL 1.2M CITIZENS..."
              className="flex-1 bg-black/70 border border-[#00FF66]/50 rounded px-3 py-2 text-xs text-[#00FF66] placeholder:text-[#00FF66]/40 focus:outline-none focus:border-[#00FF66]"
            />
            <button
              onClick={handleSendBroadcast}
              disabled={isBroadcasting}
              className="px-4 py-2 bg-[#FF0033] hover:bg-[#FF2244] text-white font-bold text-xs rounded tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> {isBroadcasting ? 'TRANSMITTING...' : 'SEND ALERT'}
            </button>
          </div>
        </div>
      </div>

      {/* User Dossier & God-Mode Weaponry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Directory Search & Selection (5 Cols) */}
        <div className="lg:col-span-5 bg-[#030A07] border border-[#00FF66]/40 rounded-xl p-4">
          <div className="flex items-center justify-between border-b border-[#00FF66]/20 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
              <Users className="w-4 h-4 text-[#00E5FF]" /> CITIZEN & CREATOR ROSTER
            </span>
            <span className="text-[10px] text-slate-400">{usersList.length} IDENTIFIERS LOADED</span>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-[#00FF66] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              placeholder="SEARCH IDENTIFIER (E.G. @satyam, @vyro_admin)..."
              className="w-full bg-black/80 border border-[#00FF66]/40 rounded pl-9 pr-3 py-1.5 text-xs text-[#00FF66] placeholder:text-[#00FF66]/30 focus:outline-none focus:border-[#00FF66]"
            />
          </div>

          <div className="max-h-80 overflow-y-auto no-scrollbar space-y-1.5">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    soundEngine.playHapticClick();
                    setSelectedUser(user);
                  }}
                  className={`p-2.5 rounded cursor-pointer border flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-[#00FF66]/20 border-[#00FF66] text-white shadow-[0_0_12px_rgba(0,255,102,0.3)]'
                      : 'bg-black/50 border-[#00FF66]/20 hover:border-[#00FF66]/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-7 h-7 rounded border border-[#00FF66]/40 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold leading-tight">
                        <span>@{user.username}</span>
                        {user.isVerified && <span className="text-[#00E5FF]">✓</span>}
                        {user.isPro && <span className="text-[#FFB700]">⚡</span>}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {user.displayName} • {formatMetric(user.followersCount)} followers
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/60 border border-[#00FF66]/30 text-[#00FF66]">
                    {user.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected User Dossier & God-Mode Weaponry (7 Cols) */}
        <div className="lg:col-span-7 bg-[#030A07] border border-[#00FF66]/40 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#00FF66]/20 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                <Crosshair className="w-4 h-4 text-[#FF0033]" /> CLASSIFIED TARGET DOSSIER
              </span>
              <span className="text-[10px] text-[#00FF66]">STATUS: LIVE SUBPOENA ACCESS</span>
            </div>

            {selectedUser ? (
              <div>
                <div className="flex items-center gap-3 p-3 bg-black/60 rounded border border-[#00FF66]/30">
                  <img
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.username}
                    className="w-12 h-12 rounded border-2 border-[#00FF66] object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black text-white">@{selectedUser.username}</h2>
                      {selectedUser.isVerified && (
                        <span className="px-1.5 py-0.5 bg-[#00E5FF]/20 text-[#00E5FF] text-[9px] font-bold rounded">
                          VERIFIED BLUE CHECK
                        </span>
                      )}
                      {selectedUser.isPro && (
                        <span className="px-1.5 py-0.5 bg-[#FFB700]/20 text-[#FFB700] text-[9px] font-bold rounded">
                          FOUNDER PRO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Email: {selectedUser.email || 'REDACTED // SECURE'} • Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Key Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="p-2 bg-black/50 border border-[#00FF66]/20 rounded text-center">
                    <span className="text-[9px] text-slate-500 block uppercase">Followers</span>
                    <span className="text-sm font-black text-[#00FF66]">
                      {formatMetric(selectedUser.followersCount)}
                    </span>
                  </div>
                  <div className="p-2 bg-black/50 border border-[#00FF66]/20 rounded text-center">
                    <span className="text-[9px] text-slate-500 block uppercase">Following</span>
                    <span className="text-sm font-black text-[#00E5FF]">
                      {formatMetric(selectedUser.followingCount)}
                    </span>
                  </div>
                  <div className="p-2 bg-black/50 border border-[#00FF66]/20 rounded text-center">
                    <span className="text-[9px] text-slate-500 block uppercase">Posts</span>
                    <span className="text-sm font-black text-white">
                      {formatMetric(selectedUser.postsCount)}
                    </span>
                  </div>
                </div>

                {/* God-Mode Arsenal Controls */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                    STRATEGIC GOD-MODE CONTROLS
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* 1 Billion Followers Button */}
                    <button
                      onClick={() => handleGrant1Billion(selectedUser.id, selectedUser.username)}
                      className="px-3 py-2 bg-[#FFB700]/20 hover:bg-[#FFB700]/30 border border-[#FFB700] text-[#FFB700] text-xs font-bold rounded flex items-center justify-center gap-1.5 transition"
                    >
                      <Award className="w-3.5 h-3.5" /> INJECT 1 BILLION
                    </button>

                    {/* Blue Checkmark Toggle */}
                    <button
                      onClick={() => handleToggleVerification(selectedUser.id, selectedUser.username)}
                      className="px-3 py-2 bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF] text-[#00E5FF] text-xs font-bold rounded flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> {selectedUser.isVerified ? 'REVOKE BLUE CHECK' : 'GRANT BLUE CHECK'}
                    </button>

                    {/* Founder Pro Badge Toggle */}
                    <button
                      onClick={() => handleToggleProBadge(selectedUser.id, selectedUser.username)}
                      className="px-3 py-2 bg-[#00FF66]/20 hover:bg-[#00FF66]/30 border border-[#00FF66] text-[#00FF66] text-xs font-bold rounded flex items-center justify-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5" /> {selectedUser.isPro ? 'REVOKE FOUNDER' : 'GRANT FOUNDER PRO'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                SELECT A CITIZEN IDENTIFIER TO COMMENCE DOSSIER INSPECTION
              </div>
            )}
          </div>

          {/* Security Protocols Notice */}
          <div className="mt-4 pt-3 border-t border-[#00FF66]/20 flex items-center justify-between text-[10px] text-slate-500">
            <span>TERMINAL CLEARANCE: US-CYBERCOM ROOT</span>
            <span>FLAGGED VIOLATIONS: {reportsList.length} PENDING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
