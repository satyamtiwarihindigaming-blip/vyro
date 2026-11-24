import React, { useState } from 'react';
import { Shield, Bell, Moon, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'cyberpunk'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings & Privacy</h2>
        <p className="text-xs text-slate-400">Manage your profile, theme, and security settings.</p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Privacy Settings */}
      <div className="glass-card rounded-2xl p-5 border border-vyro-border space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-vyro-primary" />
          <span>Account Privacy</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Private Account</p>
            <p className="text-[11px] text-slate-400">
              Only approved followers can see your posts, stories, and reels.
            </p>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isPrivate ? 'bg-vyro-primary justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="glass-card rounded-2xl p-5 border border-vyro-border space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Moon className="w-4 h-4 text-vyro-accent" />
          <span>Appearance & Themes</span>
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {(['dark', 'light', 'cyberpunk'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                theme === t
                  ? 'border-vyro-primary bg-vyro-primary/20 text-vyro-primary shadow-glow-purple/20'
                  : 'border-vyro-border bg-vyro-card text-slate-400 hover:text-white'
              }`}
            >
              {t} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-5 border border-vyro-border space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Bell className="w-4 h-4 text-vyro-cyan" />
          <span>Push Notifications</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Activity Alerts</p>
            <p className="text-[11px] text-slate-400">
              Receive alerts for calls, mentions, and in-chat game invitations.
            </p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              notificationsEnabled ? 'bg-vyro-primary justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-2xl p-5 border border-rose-500/30 bg-rose-500/5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-slate-400">
          Permanently delete your VYRO account and purge all media, messages, and followers. This action is irreversible.
        </p>

        {deleteWarning ? (
          <div className="p-3 bg-rose-500/20 rounded-xl space-y-2">
            <p className="text-xs font-bold text-rose-300">Are you absolutely sure?</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteWarning(false)}>
                Cancel
              </Button>
              <button className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDeleteWarning(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        )}
      </div>

      <Button variant="gradient" className="w-full" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
};
