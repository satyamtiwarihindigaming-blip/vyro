import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Bell, ShieldCheck, Check, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { callSoundEngine } from '../../lib/callSounds';
import { Button } from '../ui/Button';

const DISMISSED_KEY = 'vyro_perm_prompt_dismissed';

export const PermissionPromptModal: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mediaStatus, setMediaStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setIsOpen(false);
      return;
    }

    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (dismissed === 'true') return;

    const checkPermissions = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });

          if (micPerm.state === 'granted' && camPerm.state === 'granted') {
            return; // Already allowed, no popup needed
          }
        }
      } catch {
        // Safari/Firefox may not support camera/microphone in permissions.query
      }

      // Show clean permission prompt popup shortly after entering app
      setIsOpen(true);
    };

    const timer = setTimeout(checkPermissions, 700);
    return () => clearTimeout(timer);
  }, [currentUser?.id]);

  const handleRequestAll = async () => {
    setMediaStatus('requesting');
    setErrorDetail('');
    callSoundEngine.unlock();

    // 1. Trigger native browser Notification permission popup if available
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const res = await Notification.requestPermission();
        setNotifStatus(res === 'granted' ? 'granted' : 'denied');
      } else if ('Notification' in window && Notification.permission === 'granted') {
        setNotifStatus('granted');
      }
    } catch {
      // Ignore notification prompt error
    }

    // 2. Trigger native browser Camera & Microphone Allow popup, then stop tracks immediately
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API unavailable (requires HTTPS).');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      // Release hardware immediately so camera/mic never remain active in background
      stream.getTracks().forEach((track) => track.stop());
      setMediaStatus('granted');
      sessionStorage.setItem(DISMISSED_KEY, 'true');
      setTimeout(() => setIsOpen(false), 1100);
    } catch (err: unknown) {
      // Fallback: try Audio-only if camera hardware missing
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioStream.getTracks().forEach((track) => track.stop());
        setMediaStatus('granted');
        setErrorDetail('Microphone allowed (No camera detected or camera blocked).');
        sessionStorage.setItem(DISMISSED_KEY, 'true');
        setTimeout(() => setIsOpen(false), 1400);
      } catch {
        setMediaStatus('denied');
        const msg = (err as Error).message || 'Permission denied by browser or system.';
        setErrorDetail(
          `${msg}. Check Chrome address-bar Lock/Settings icon and Windows Privacy -> Camera & Microphone.`
        );
      }
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
            className="w-full max-w-md glass-panel rounded-3xl p-6 border border-vyro-primary/40 shadow-2xl space-y-5 relative"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close permission popup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan flex items-center justify-center text-white shadow-glow-pink">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Allow Camera, Mic & Call Alerts
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grant browser permission once so VYRO Voice Calls, Video Calls, Studio Camera, and Incoming Ringtones work instantly.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-vyro-card/80 border border-vyro-border flex items-center gap-3">
                <Camera className="w-4 h-4 text-vyro-cyan flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-slate-200">Camera & Microphone</p>
                  <p className="text-[11px] text-slate-400">
                    Only turns on when you start/accept a call or open Studio.
                  </p>
                </div>
                {mediaStatus === 'granted' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>

              <div className="p-3 rounded-xl bg-vyro-card/80 border border-vyro-border flex items-center gap-3">
                <Bell className="w-4 h-4 text-vyro-accent flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-slate-200">Call Ringtones & Notifications</p>
                  <p className="text-[11px] text-slate-400">
                    Plays ringtone audio and device vibration on calls.
                  </p>
                </div>
                {notifStatus === 'granted' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            {errorDetail && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{errorDetail}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="gradient"
                className="w-full py-2.5 font-bold"
                isLoading={mediaStatus === 'requesting'}
                onClick={handleRequestAll}
              >
                <Mic className="w-4 h-4 mr-2" />
                <span>
                  {mediaStatus === 'granted'
                    ? 'Permissions Granted!'
                    : mediaStatus === 'denied'
                    ? 'Retry Browser Allow Popup'
                    : 'Allow Camera, Mic & Sound'}
                </span>
              </Button>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-white py-1.5"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
