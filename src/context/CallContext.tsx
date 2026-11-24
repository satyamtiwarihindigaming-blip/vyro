import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../lib/api';
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
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (partner: UserSummary, type: 'voice' | 'video') => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  declineOrEndCall: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const isCallerRef = useRef<boolean>(false);
  const addedCandidatesCountRef = useRef<number>(0);

  const cleanupMediaAndPeer = useCallback(() => {
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
  }, []);

  // Poll incoming calls globally when idle and logged in
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
        // Ignore transient network poll errors
      }
    };

    const timer = setInterval(pollIncoming, 2000);
    return () => clearInterval(timer);
  }, [currentUser?.id, callStatus]);

  // Poll active call signaling state (SDP answer, ICE candidates, end/reject)
  useEffect(() => {
    if (callStatus !== 'calling' && callStatus !== 'connected' && callStatus !== 'ringing') return;

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
          cleanupMediaAndPeer();
          return;
        }

        const pc = pcRef.current;
        if (!pc) return;

        // If caller and remote answer arrived, setRemoteDescription
        if (isCallerRef.current && c.answer && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(c.answer));
          setCallStatus('connected');
        }

        // Apply any new ICE candidates from the other peer
        const peerCandidates = isCallerRef.current ? c.receiverCandidates : c.callerCandidates;
        if (peerCandidates && peerCandidates.length > addedCandidatesCountRef.current) {
          const newOnes = peerCandidates.slice(addedCandidatesCountRef.current);
          for (const cand of newOnes) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch {
              // Ignore late candidate errors
            }
          }
          addedCandidatesCountRef.current = peerCandidates.length;
        }
      } catch {
        // Ignore transient poll errors
      }
    };

    const timer = setInterval(pollCallState, 1200);
    return () => clearInterval(timer);
  }, [callStatus, cleanupMediaAndPeer]);

  // Connected duration clock
  useEffect(() => {
    if (callStatus !== 'connected') return;
    const t = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, [callStatus]);

  const setupPeerConnection = (stream: MediaStream, callIdGetter: () => string | null) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        remote.addTrack(track);
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
          // Ignore ICE post error if call ended
        }
      }
    };

    return pc;
  };

  const startCall = async (partner: UserSummary, type: 'voice' | 'video') => {
    if (!currentUser) return;
    setCallError('');
    setRemotePartner(partner);
    setCallType(type);
    setIsCameraOff(type === 'voice');
    isCallerRef.current = true;
    setCallStatus('calling');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      setLocalStream(stream);

      const pc = setupPeerConnection(stream, () => activeCallIdRef.current);
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
      setCallError((err as Error).message || 'Could not access camera/microphone.');
      cleanupMediaAndPeer();
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCallData) return;
    setCallError('');
    setIsCameraOff(incomingCallData.callType === 'voice');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: incomingCallData.callType === 'video',
      });
      setLocalStream(stream);

      const pc = setupPeerConnection(stream, () => activeCallIdRef.current);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));

      // Apply caller candidates already present
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
      setCallError((err as Error).message || 'Camera/microphone access denied.');
      await declineOrEndCall();
    }
  };

  const declineOrEndCall = async () => {
    const id = activeCallIdRef.current;
    if (id) {
      await apiRequest(`/api/calls/${id}/end`, { method: 'POST' }).catch(() => {});
    }
    cleanupMediaAndPeer();
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
        localStream,
        remoteStream,
        startCall,
        acceptIncomingCall,
        declineOrEndCall,
        toggleMute,
        toggleCamera,
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
