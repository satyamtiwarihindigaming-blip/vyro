import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { MusicTrack } from '../types';
import { ROYALTY_FREE_TRACKS } from '../lib/musicCatalog';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioContextType {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  currentTime: number;
  duration: number;
  volume: number;
  queue: MusicTrack[];
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playTrack: (track: MusicTrack, newQueue?: MusicTrack[]) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  seek: (percent: number) => void;
  setVolume: (vol: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setQueue: (tracks: MusicTrack[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueueState] = useState<MusicTrack[]>(ROYALTY_FREE_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(ROYALTY_FREE_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Helper to resolve stream URL with fallback
  const getStreamUrl = (track: MusicTrack): string => {
    if (track.audioUrl.startsWith('http') && !track.audioUrl.includes('/api/music/proxy') && !track.youtubeVideoId) {
      return `/api/music/proxy?url=${encodeURIComponent(track.audioUrl)}`;
    }
    return track.audioUrl;
  };

  // Smooth Volume Crossfade Transition ("drop down effect jo gana change hota ha to pata nahi lagta")
  const smoothSwitchTrack = useCallback((track: MusicTrack) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Clear any pending fade
    if (fadeIntervalRef.current) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    setCurrentTrack(track);
    const targetUrl = getStreamUrl(track);

    if (audio.paused || audio.ended) {
      audio.src = targetUrl;
      audio.volume = volume;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
      return;
    }

    // Step 1: Quick 120ms fade-out
    let currentVol = audio.volume;
    const fadeOutStep = currentVol / 6;

    fadeIntervalRef.current = window.setInterval(() => {
      currentVol = Math.max(0, currentVol - fadeOutStep);
      audio.volume = currentVol;

      if (currentVol <= 0.05) {
        window.clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;

        // Step 2: Swap audio track at zero volume
        audio.src = targetUrl;
        audio.currentTime = 0;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            // Step 3: Smooth 150ms fade-in
            let inVol = 0.05;
            const fadeInStep = (volume - inVol) / 6;
            fadeIntervalRef.current = window.setInterval(() => {
              inVol = Math.min(volume, inVol + fadeInStep);
              audio.volume = inVol;
              if (inVol >= volume - 0.02) {
                audio.volume = volume;
                window.clearInterval(fadeIntervalRef.current!);
                fadeIntervalRef.current = null;
              }
            }, 25);
          })
          .catch((err) => {
            console.warn('Audio swap play error, retrying direct:', err);
            audio.src = track.audioUrl;
            audio.volume = volume;
            audio
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          });
      }
    }, 20);
  }, [volume]);

  // Play Next Song (Handles Shuffle, Repeat All, Normal Queue)
  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);

    if (isShuffle && queue.length > 1) {
      let nextIndex = Math.floor(Math.random() * queue.length);
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      smoothSwitchTrack(queue[nextIndex]);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      smoothSwitchTrack(queue[nextIndex]);
    } else if (repeatMode === 'all') {
      smoothSwitchTrack(queue[0]); // Loop playlist from start
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [currentTrack, queue, repeatMode, isShuffle, smoothSwitchTrack]);

  // Play Previous Song
  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      smoothSwitchTrack(queue[currentIndex - 1]);
    } else {
      smoothSwitchTrack(queue[queue.length - 1]);
    }
  }, [currentTrack, queue, smoothSwitchTrack]);

  // Initialize Native Audio Element with Event Handlers
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    return () => {
      if (fadeIntervalRef.current) window.clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Set onended listener dynamically to always capture latest playNext & repeatMode
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.onended = () => {
      playNext();
    };
  }, [playNext]);

  const playTrack = (track: MusicTrack, newQueue?: MusicTrack[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueueState(newQueue);
    }
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    smoothSwitchTrack(track);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if ((!audioRef.current.src || audioRef.current.src === window.location.href) && currentTrack) {
        audioRef.current.src = getStreamUrl(currentTrack);
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Audio play error:', err));
    }
  };

  const pauseTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const seek = (percent: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const time = (percent / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(percent);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const setQueue = (tracks: MusicTrack[]) => {
    setQueueState(tracks);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        queue,
        repeatMode,
        isShuffle,
        playTrack,
        playNext,
        playPrev,
        togglePlay,
        pauseTrack,
        seek,
        setVolume,
        toggleRepeat,
        toggleShuffle,
        setQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
