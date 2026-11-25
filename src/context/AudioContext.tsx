import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { MusicTrack } from '../types';
import { ROYALTY_FREE_TRACKS } from '../lib/musicCatalog';

interface AudioContextType {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: MusicTrack) => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  seek: (percent: number) => void;
  setVolume: (vol: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(ROYALTY_FREE_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playTrack = (track: MusicTrack) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    const streamUrl =
      track.audioUrl.startsWith('http') &&
      !track.audioUrl.includes('/api/music/proxy') &&
      !track.youtubeVideoId
        ? `/api/music/proxy?url=${encodeURIComponent(track.audioUrl)}`
        : track.audioUrl;

    audioRef.current.src = streamUrl;
    audioRef.current.volume = volume;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Audio play error with proxy, retrying direct:', err);
        if (audioRef.current) {
          audioRef.current.src = track.audioUrl;
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if ((!audioRef.current.src || audioRef.current.src === window.location.href) && currentTrack) {
        const streamUrl =
          currentTrack.audioUrl.startsWith('http') &&
          !currentTrack.audioUrl.includes('/api/music/proxy') &&
          !currentTrack.youtubeVideoId
            ? `/api/music/proxy?url=${encodeURIComponent(currentTrack.audioUrl)}`
            : currentTrack.audioUrl;
        audioRef.current.src = streamUrl;
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

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        playTrack,
        togglePlay,
        pauseTrack,
        seek,
        setVolume,
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
