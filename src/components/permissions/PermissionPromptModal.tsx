import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Bell, ShieldCheck, Check, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { callSoundEngine } from '../../lib/callSounds';
import { Button } from '../ui/Button';

const SESSION_DISMISSED_KEY = 'vyro_perm_prompt_dismissed';
const VERIFIED_STORAGE_KEY = 'vyro_media_verified';

export function openPermissionPrompt() {
  window.dispatchEvent(new CustomEvent('vyro:open-permissions'));
}

export const PermissionPromptModal: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mediaStatus, setMediaStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    const handleManualOpen = () => {
      setMediaStatus('idle');
      setErrorDetail('');
      setIsOpen(true);
    };
    window.addEventListener('vyro:open-permissions', handleManualOpen);
    return () => window.removeEventListener('vyro:open-permissions', handleManualOpen);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setIsOpen(false);
      return;
    }

    const alreadyVerified = localStorage.getItem(VERIFIED_STORAGE_KEY) === 'true';
    const dismissedThisTab = sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true';
    if (alreadyVerified || dismissedThisTab) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentUser?.id]);

  const handleRequestAll = async () => {
    setMediaStatus('requesting');
    setErrorDetail('');
    callSoundEngine.unlock();
    callSoundEngine.vibrate(70);

    // 1. Trigger native browser Notification Allow prompt if available
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

    // 2. Trigger native browser Camera & Microphone Allow popup, then release tracks immediately
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API unavailable (requires HTTPS).');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((track) => track.stop());
      setMediaStatus('granted');
      localStorage.setItem(VERIFIED_STORAGE_KEY, 'true');
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
      callSoundEngine.playConnectedChime();
      setTimeout(() => setIsOpen(false), 1100);
    } catch (err: unknown) {
      // Fallback: try Audio-only if camera missing or blocked
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioStream.getTracks().forEach((track) => track.stop());
        setMediaStatus('granted');
        localStorage.setItem(VERIFIED_STORAGE_KEY, 'true');
        sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
        setErrorDetail('Microphone allowed! (Camera not detected or blocked by system).');
        callSoundEngine.playConnectedChime();
        setTimeout(() => setIsOpen(false), 1400);
      } catch (err: unknown) {
        setMediaStatus('denied');
        const errStr = String(err).toLowerCase();
        if (errStr.includes('system') || (err as Error)?.name === 'NotAllowedError') {
          setErrorDetail(
            'OS Privacy is currently blocking Chrome camera/mic access. To enable: Open Windows Settings → Privacy & Security → Camera & Microphone → Turn ON "Let desktop apps access your camera/mic". Or continue freely in Receive-Only mode!'
          );
        } else {
          const msg = (err as Error).message || 'Permission denied by browser or system.';
          setErrorDetail(
            `${msg}. Open Browser Site Settings (padlock/tune icon in address bar) -> Allow Camera & Microphone.`
          );
        }
      }
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
            className="w-full max-w-md liquid-glass-elevated rounded-[30px] p-6 shadow-2xl space-y-5 relative"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close permission popup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-[0_0_24px_rgba(6,182,212,0.4)] border border-white/20">
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
              <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
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
