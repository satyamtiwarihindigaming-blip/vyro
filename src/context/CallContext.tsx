import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';
import { callSoundEngine } from '../lib/callSounds';
import { UserSummary } from '../types';

interface ServerCall {
  id: string;
  callerId: string;
  receiverId: string;
  callType: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'rejected';
  offer: RTCSessionDescriptionInit;
  answer: RTCSessionDescriptionInit | null;
  callerCandidates: RTCIceCandidateInit[];
  receiverCandidates: RTCIceCandidateInit[];
  caller?: UserSummary | null;
}

interface CallContextType {
  callStatus: 'idle' | 'calling' | 'ringing' | 'connected';
  callType: 'voice' | 'video';
  remotePartner: UserSummary | null;
  isMuted: boolean;
  isCameraOff: boolean;
  callDuration: number;
  callError: string;
  mediaWarning: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (partner: UserSummary, type: 'voice' | 'video') => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  declineOrEndCall: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
  retryMediaAccess: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];

  const turnUrl = import.meta.env.VITE_TURN_SERVER_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: import.meta.env.VITE_TURN_USERNAME || undefined,
      credential: import.meta.env.VITE_TURN_CREDENTIAL || undefined,
    });
  }
  return servers;
}

async function acquireLocalMedia(
  type: 'voice' | 'video'
): Promise<{ stream: MediaStream | null; warning: string; cameraOff: boolean }> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      stream: null,
      warning: 'Browser blocked media devices (requires HTTPS). Joined in listen-only mode.',
      cameraOff: true,
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video',
    });
    return { stream, warning: '', cameraOff: type === 'voice' };
  } catch {
    if (type === 'video') {
      // Fallback: Try audio-only if webcam/camera permission is denied by Windows/device
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        return {
          stream: audioOnly,
          warning: 'Camera blocked by system — Voice audio active. Allow camera in device settings to show video.',
          cameraOff: true,
        };
      } catch {
        return {
          stream: null,
          warning: 'Mic & Camera blocked by OS/Browser settings (Receive-only mode). Allow permissions to speak.',
          cameraOff: true,
        };
      }
    }

    return {
      stream: null,
      warning: 'Microphone blocked by OS/Browser settings (Listen-only mode). Allow microphone to speak.',
      cameraOff: true,
    };
  }
}

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [callType, setCallType] = useState<'voice' | 'video'>('video');
  const [remotePartner, setRemotePartner] = useState<UserSummary | null>(null);
  const [incomingCallData, setIncomingCallData] = useState<ServerCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState('');
  const [mediaWarning, setMediaWarning] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const isCallerRef = useRef<boolean>(false);
  const addedCandidatesCountRef = useRef<number>(0);

  const cleanupMediaAndPeer = useCallback((playEndTone = false) => {
    if (playEndTone) {
      callSoundEngine.playEndedTone();
    } else {
      callSoundEngine.stopAll();
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
    activeCallIdRef.current = null;
    setIncomingCallData(null);
    addedCandidatesCountRef.current = 0;
    setCallStatus('idle');
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setMediaWarning('');
  }, []);

  // Manage audio & vibration cues cleanly based on callStatus
  useEffect(() => {
    if (callStatus === 'calling') {
      callSoundEngine.startOutgoingDialTone();
    } else if (callStatus === 'ringing') {
      callSoundEngine.startIncomingRingtone();
    } else if (callStatus === 'connected') {
      callSoundEngine.playConnectedChime();
    } else {
      callSoundEngine.stopAll();
    }
  }, [callStatus]);

  // Poll incoming calls globally when idle
  useEffect(() => {
    if (!currentUser || callStatus !== 'idle') return;

    const pollIncoming = async () => {
      try {
        const res = await apiRequest<{ call: ServerCall | null }>('/api/calls/incoming');
        if (res.call && res.call.caller) {
          setIncomingCallData(res.call);
          setRemotePartner(res.call.caller);
          setCallType(res.call.callType);
          activeCallIdRef.current = res.call.id;
          isCallerRef.current = false;
          setCallStatus('ringing');
        }
      } catch {
        // Ignore transient poll errors
      }
    };

    const timer = setInterval(pollIncoming, 1000);
    return () => clearInterval(timer);
  }, [currentUser?.id, callStatus]);

  // Poll active call signaling state
  useEffect(() => {
    if (callStatus === 'idle') return;

    const pollCallState = async () => {
      const callId = activeCallIdRef.current;
      if (!callId) return;

      try {
        const res = await apiRequest<{ call: ServerCall }>(`/api/calls/${callId}`);
        const c = res.call;

        if (c.status === 'ended' || c.status === 'rejected') {
          if (c.status === 'rejected') {
            setCallError('Call was declined.');
            setTimeout(() => setCallError(''), 2500);
          }
          cleanupMediaAndPeer(true);
          return;
        }

        const pc = pcRef.current;
        if (!pc) return;

        if (isCallerRef.current && c.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(c.answer));
          setCallStatus('connected');
        }

        const peerCandidates = isCallerRef.current ? c.receiverCandidates : c.callerCandidates;
        if (peerCandidates && peerCandidates.length > addedCandidatesCountRef.current) {
          const newOnes = peerCandidates.slice(addedCandidatesCountRef.current);
          for (const cand of newOnes) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {
              // Ignore stale ICE candidate
            }
          }
          addedCandidatesCountRef.current = peerCandidates.length;
        }
      } catch {
        // Ignore transient poll error
      }
    };

    const timer = setInterval(pollCallState, 1000);
    return () => clearInterval(timer);
  }, [callStatus, cleanupMediaAndPeer]);

  // Connected duration clock
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const t = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, [callStatus]);

  const setupPeerConnection = (
    stream: MediaStream | null,
    type: 'voice' | 'video',
    callIdGetter: () => string | null
  ) => {
    const pc = new RTCPeerConnection({ iceServers: getIceServers() });
    pcRef.current = pc;

    const audioTracks = stream?.getAudioTracks() || [];
    const videoTracks = stream?.getVideoTracks() || [];

    if (audioTracks.length > 0 && stream) {
      audioTracks.forEach((t) => pc.addTrack(t, stream));
    } else {
      pc.addTransceiver('audio', { direction: 'recvonly' });
    }

    if (type === 'video') {
      if (videoTracks.length > 0 && stream) {
        videoTracks.forEach((t) => pc.addTrack(t, stream));
      } else {
        pc.addTransceiver('video', { direction: 'recvonly' });
      }
    }

    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (event) => {
      const incomingTracks = event.streams[0] ? event.streams[0].getTracks() : [event.track];
      incomingTracks.forEach((track) => {
        if (!remote.getTracks().some((t) => t.id === track.id)) {
          remote.addTrack(track);
        }
      });
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    pc.onicecandidate = async (event) => {
      const id = callIdGetter();
      if (event.candidate && id) {
        try {
          await apiRequest(`/api/calls/${id}/ice`, {
            method: 'POST',
            body: JSON.stringify({ candidate: event.candidate.toJSON() }),
          });
        } catch {
          // Ignore ICE error if call closed
        }
      }
    };

    return pc;
  };

  const startCall = async (partner: UserSummary, type: 'voice' | 'video') => {
    if (!currentUser) return;
    callSoundEngine.unlock();
    setCallError('');
    setMediaWarning('');
    setRemotePartner(partner);
    setCallType(type);
    isCallerRef.current = true;
    setCallStatus('calling');

    const { stream, warning, cameraOff } = await acquireLocalMedia(type);
    setLocalStream(stream);
    setMediaWarning(warning);
    setIsCameraOff(cameraOff);

    try {
      const pc = setupPeerConnection(stream, type, () => activeCallIdRef.current);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await apiRequest<{ call: ServerCall }>('/api/calls/initiate', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: partner.id,
          callType: type,
          offer: pc.localDescription,
        }),
      });
      activeCallIdRef.current = res.call.id;
    } catch (err: unknown) {
      setCallError((err as Error).message || 'Could not initiate call.');
      setTimeout(() => setCallError(''), 3000);
      cleanupMediaAndPeer(false);
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCallData) return;
    callSoundEngine.unlock();
    setCallError('');

    const { stream, warning, cameraOff } = await acquireLocalMedia(incomingCallData.callType);
    setLocalStream(stream);
    setMediaWarning(warning);
    setIsCameraOff(cameraOff);

    try {
      const pc = setupPeerConnection(
        stream,
        incomingCallData.callType,
        () => activeCallIdRef.current
      );
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));

      if (incomingCallData.callerCandidates?.length) {
        for (const cand of incomingCallData.callerCandidates) {
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        }
        addedCandidatesCountRef.current = incomingCallData.callerCandidates.length;
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await apiRequest(`/api/calls/${incomingCallData.id}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer: pc.localDescription }),
      });

      setCallStatus('connected');
    } catch (err: unknown) {
      setCallError((err as Error).message || 'Could not answer call.');
      setTimeout(() => setCallError(''), 3000);
      await declineOrEndCall();
    }
  };

  const declineOrEndCall = async () => {
    const id = activeCallIdRef.current;
    cleanupMediaAndPeer(true);
    if (id) {
      await apiRequest(`/api/calls/${id}/end`, { method: 'POST' }).catch(() => {});
    }
  };

  const retryMediaAccess = async () => {
    callSoundEngine.unlock();
    const { stream, warning, cameraOff } = await acquireLocalMedia(callType);
    setMediaWarning(warning);
    setIsCameraOff(cameraOff);
    if (stream && pcRef.current) {
      setLocalStream(stream);
      stream.getTracks().forEach((track) => {
        pcRef.current?.addTrack(track, stream);
      });
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
  };

  const toggleCamera = () => {
    const next = !isCameraOff;
    setIsCameraOff(next);
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !next;
    });
  };

  return (
    <CallContext.Provider
      value={{
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
        startCall,
        acceptIncomingCall,
        declineOrEndCall,
        toggleMute,
        toggleCamera,
        retryMediaAccess,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used inside CallProvider');
  return ctx;
};
