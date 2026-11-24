import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-vyro-border space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-vyro-border">
          {isPrivacy ? (
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          ) : (
            <FileText className="w-7 h-7 text-vyro-primary" />
          )}
          <div>
            <h1 className="text-xl font-bold text-white">
              {isPrivacy ? 'VYRO Privacy Policy' : 'VYRO Terms of Service & Guidelines'}
            </h1>
            <p className="text-xs text-slate-400">Effective Date: November 2026 • Version 1.0</p>
          </div>
        </div>

        {isPrivacy ? (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">1. Our Core Commitment to Privacy</h3>
            <p>
              VYRO is engineered on the principle of data minimization and zero behavioral spyware. We do not sell your personal data, interaction history, or direct messaging logs to advertising networks or external data brokers.
            </p>

            <h3 className="text-sm font-bold text-white">2. Data We Collect and Why</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>Account Credentials:</strong> Username, email, and cryptographically hashed passwords for authentication.</li>
              <li><strong>Content You Publish:</strong> Photos, reels, stories, captions, and audio attachments stored securely on cloud CDN storage.</li>
              <li><strong>Realtime Signaling:</strong> Ephemeral WebRTC session descriptions (SDP offers/answers) used strictly to establish direct peer-to-peer audio and video calls.</li>
            </ul>

            <h3 className="text-sm font-bold text-white">3. Camera & Microphone Access</h3>
            <p>
              VYRO will never access your camera or microphone without an explicit prompt and user interaction. WebRTC media streams are encrypted peer-to-peer (DTLS-SRTP).
            </p>

            <h3 className="text-sm font-bold text-white">4. Account Deletion & Right to be Forgotten</h3>
            <p>
              You have the right to request the permanent deletion of your account at any time through Settings &gt; Danger Zone. All associated database records and cloud media assets are completely purged within 24 hours.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-sm font-bold text-white">1. Community Standards</h3>
            <p>
              VYRO is a creative platform built on mutual respect. We prohibit harassment, hate speech, illegal distribution of non-consensual imagery, and manipulative bot behavior.
            </p>

            <h3 className="text-sm font-bold text-white">2. Copyright and Audio Licensing</h3>
            <p>
              Users may only upload original creator audio or music licensed under Creative Commons Zero (CC0) or royalty-free public domain licenses. Uploading commercial music without written mechanical and synchronization rights is strictly prohibited.
            </p>

            <h3 className="text-sm font-bold text-white">3. Content Moderation & Reporting</h3>
            <p>
              Posts flagged by community members undergo review. Content that violates safety guidelines is quarantined or permanently removed, and repeat offenders face account termination.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
