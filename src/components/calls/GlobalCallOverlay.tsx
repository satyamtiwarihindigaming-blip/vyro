import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneIncoming,
  AlertTriangle,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';

export const GlobalCallOverlay: React.FC = () => {
  const {
    callStatus,
    callType,
    remotePartner,
    isMuted,
    isCameraOff,
    callDuration,
    callError,
    mediaWarning,
    localStream,
    remoteStream,
    acceptIncomingCall,
    declineOrEndCall,
    toggleMute,
    toggleCamera,
    retryMediaAccess,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus, isCameraOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream, callStatus]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      {callError && callStatus === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-rose-600/90 text-white text-xs font-bold shadow-2xl"
        >
          {callError}
        </motion.div>
      )}

      {callStatus !== 'idle' && remotePartner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6"
        >
          {/* Dedicated active audio element so Voice & Video call audio ALWAYS plays reliably */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="sr-only" />

          {/* Header */}
          <div className="flex items-center justify-between text-white max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <Avatar src={remotePartner.avatarUrl} alt={remotePartner.displayName} size="sm" hasStory />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">{remotePartner.displayName}</h3>
                  <VerifiedBadge
                    isVerified={remotePartner.isVerified}
                    isPro={remotePartner.isPro}
                    proBadge={remotePartner.proBadge}
                  />
                </div>
                <p className="text-xs text-emerald-400 flex items-center gap-1.5 capitalize">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {callStatus === 'ringing'
                    ? `Incoming ${callType} call...`
                    : callStatus === 'calling'
                    ? `Calling @${remotePartner.username}... (Dial tone & vibrate active)`
                    : `Live WebRTC ${callType} (${formatTime(callDuration)})`}
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-vyro-cyan" />
              <span>P2P Encrypted • STUN</span>
            </span>
          </div>

          {/* Non-blocking System Permission Warning + Retry Button */}
          {mediaWarning && (
            <div className="max-w-2xl mx-auto w-full mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{mediaWarning}</span>
              </div>
              <button
                onClick={retryMediaAccess}
                className="px-3 py-1 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Mic/Cam</span>
              </button>
            </div>
          )}

          {/* Ringing Prompt vs Active Call Stream Tiles */}
          {callStatus === 'ringing' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.09, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="p-2.5 rounded-full bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan shadow-glow-pink"
              >
                <Avatar src={remotePartner.avatarUrl} alt={remotePartner.displayName} size="xl" />
              </motion.div>

              <div>
                <h2 className="text-xl font-extrabold text-white">{remotePartner.displayName}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  @{remotePartner.username} is calling you ({callType} call)...
                </p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <button
                  onClick={declineOrEndCall}
                  className="px-6 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline</span>
                </button>

                <button
                  onClick={acceptIncomingCall}
                  className="px-6 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform animate-pulse"
                >
                  <PhoneIncoming className="w-4 h-4" />
                  <span>Accept Call</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 my-4 max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Remote Stream */}
              <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    callType === 'voice' || !remoteStream?.getVideoTracks().length ? 'hidden' : ''
                  }`}
                />
                {(callType === 'voice' || !remoteStream?.getVideoTracks().length) && (
                  <div className="flex flex-col items-center gap-3">
                    <motion.div
                      animate={
                        callStatus === 'calling'
                          ? { scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Avatar src={remotePartner.avatarUrl} alt={remotePartner.displayName} size="xl" hasStory />
                    </motion.div>
                    <span className="text-xs text-slate-300">
                      {callStatus === 'calling' ? 'Ringing...' : 'Audio Connected'}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg">
                  @{remotePartner.username}
                </span>
              </div>

              {/* Local Stream */}
              <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
                {isCameraOff || callType === 'voice' || !localStream?.getVideoTracks().length ? (
                  <div className="text-center text-xs text-slate-400 space-y-2 px-4">
                    <VideoOff className="w-8 h-8 mx-auto text-rose-400" />
                    <p>
                      {!localStream
                        ? 'Listen-only mode (Mic/Cam blocked by OS)'
                        : callType === 'voice'
                        ? 'Voice Microphone Active'
                        : 'Camera turned off'}
                    </p>
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}
                <span className="absolute bottom-3 left-3 text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg">
                  You (Local)
                </span>
              </div>
            </div>
          )}

          {/* Call Toolbar */}
          {callStatus !== 'ringing' && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                disabled={!localStream?.getAudioTracks().length}
                className={`p-3.5 rounded-full transition-colors disabled:opacity-40 ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleCamera}
                  disabled={!localStream?.getVideoTracks().length}
                  className={`p-3.5 rounded-full transition-colors disabled:opacity-40 ${
                    isCameraOff ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={declineOrEndCall}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg active:scale-90 transition-transform"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
