import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Moon,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Crown,
  LogOut,
  Camera,
} from 'lucide-react';
import { VerifiedBadge } from '../components/ui/VerifiedBadge';
import { openPermissionPrompt } from '../components/permissions/PermissionPromptModal';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNavigate } from 'react-router-dom';
import { soundEngine } from '../lib/soundEngine';
import { SPRING_SNAPPY } from '../lib/motion';

export const SettingsPage: React.FC = () => {
  const { currentUser, isPro, updateProfile, deleteAccount, logout } = useAuth();
  const { resetAlgorithm } = useSocial();
  const navigate = useNavigate();

  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'cyberpunk'>(
    currentUser?.themePreference || 'dark'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [algorithmResetDone, setAlgorithmResetDone] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setErrorMsg('');
    if (!currentUser) {
      setErrorMsg('Sign in to save account settings.');
      return;
    }
    const res = await updateProfile({ isPrivate, themePreference: theme });
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      setErrorMsg(res.error || 'Failed to save settings.');
    }
  };

  const handleResetAlgorithm = () => {
    resetAlgorithm();
    setAlgorithmResetDone(true);
    setTimeout(() => setAlgorithmResetDone(false), 2500);
  };

  const handleDelete = async () => {
    const ok = await deleteAccount();
    if (ok) {
      navigate('/');
    } else {
      setErrorMsg('Could not delete account (active sole admin cannot be deleted).');
      setDeleteWarning(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Settings & Privacy</h2>
          <p className="text-xs text-white/60">
            Manage your profile, Pro features, recommendation controls, and security.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
          {errorMsg}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved to server successfully.</span>
        </div>
      )}

      {algorithmResetDone && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>AI recommendation profile reset!</span>
        </div>
      )}

      {/* Account Status & Pro Tier */}
      {currentUser && (
        <div className="liquid-glass rounded-[28px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Account Tier & Verification</span>
            </h3>
            <VerifiedBadge
              isVerified={currentUser.isVerified}
              isPro={currentUser.isPro}
              proBadge={currentUser.proBadge}
            />
          </div>

          <div className="p-3.5 rounded-2xl liquid-glass-inner flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Current Tier: {isPro ? 'VYRO PRO' : 'Standard Creator'}</p>
              <p className="text-[10px] text-white/50">
                {isPro
                  ? 'All Pro features unlocked (HD upload, 8K AI generation, custom badges)'
                  : 'Upgrade to PRO to unlock HD uploads and analytics'}
              </p>
            </div>
            {isPro ? (
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-semibold">
                ACTIVE
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Privacy & Account Visibility */}
      <div className="liquid-glass rounded-[28px] p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-300" />
          <span>Privacy & Security</span>
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass-inner">
          <div>
            <p className="text-xs font-semibold text-white">Private Account</p>
            <p className="text-[10px] text-white/50">Only approved followers can see your posts and reels</p>
          </div>
          {/* iOS Toggle Switch with Spring Layout Physics */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playHapticClick();
              setIsPrivate(!isPrivate);
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 flex items-center ${
              isPrivate ? 'bg-cyan-500 justify-end' : 'bg-white/20 justify-start'
            }`}
          >
            <motion.div
              layout
              transition={SPRING_SNAPPY}
              className="w-5 h-5 rounded-full bg-white shadow-md"
            />
          </button>
        </div>

        {/* Media Permissions Prompt Test */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass-inner">
          <div>
            <p className="text-xs font-semibold text-white">Camera & Microphone Access</p>
            <p className="text-[10px] text-white/50">Manage permissions for Studio and WebRTC FaceTime calls</p>
          </div>
          <button
            type="button"
            onClick={() => openPermissionPrompt('camera', () => {})}
            className="px-3.5 py-1.5 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white transition-colors"
          >
            Verify
          </button>
        </div>
      </div>

      {/* Algorithm Reset & Recommendation Controls */}
      <div className="liquid-glass rounded-[28px] p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Recommendation Controls</span>
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass-inner">
          <div>
            <p className="text-xs font-semibold text-white">Reset For You Algorithm</p>
            <p className="text-[10px] text-white/50">Clear all recommendation interaction history</p>
          </div>
          <button
            type="button"
            onClick={handleResetAlgorithm}
            className="px-3.5 py-1.5 rounded-full liquid-glass-inner hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-full liquid-pill-cta text-xs font-semibold text-white shadow-xl"
      >
        Save Settings
      </button>

      {/* Danger Zone */}
      {currentUser && (
        <div className="liquid-glass rounded-[28px] p-5 border border-rose-500/20 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Danger Zone</span>
          </h3>

          <div className="p-3.5 rounded-2xl liquid-glass-inner flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Delete Account</p>
              <p className="text-[10px] text-white/50">Permanently delete your profile and all published media</p>
            </div>
            <button
              onClick={() => setDeleteWarning(true)}
              className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          </div>

          {deleteWarning && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Are you completely sure? This action cannot be undone.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Yes, permanently delete
                </button>
                <button
                  onClick={() => setDeleteWarning(false)}
                  className="px-4 py-2 rounded-full liquid-glass-inner text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
