import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Upload,
  Music,
  Sparkles,
  Check,
  AlertCircle,
  ArrowLeft,
  Crown,
  Type,
  Video,
  Play,
  Pause,
  Disc,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ROYALTY_FREE_TRACKS } from '../lib/musicCatalog';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

type FilterPreset = 'normal' | 'cyber' | 'noir' | 'warm' | 'prism' | 'gold';

const STICKER_PRESETS = ['⚡ VYRO', '🔥 HOT', '✨ PRO', '🎵 VIBES', '💎 1B CLUB'];

export const StudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPost, createStory } = useSocial();
  const { currentUser, isPro } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Camera & Media states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<'photo' | 'reel' | 'story'>(
    searchParams.get('mode') === 'story' ? 'story' : searchParams.get('mode') === 'reel' ? 'reel' : 'photo'
  );
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('normal');
  const [overlayText, setOverlayText] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState(ROYALTY_FREE_TRACKS[0].id);
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  void isMusicPickerOpen; // used via setIsMusicPickerOpen in JSX
  const [previewingMusicId, setPreviewingMusicId] = useState<string | null>(null);

  // Recording State (Hold to record video, tap to click photo)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoldingRef = useRef<boolean>(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: isPro ? 1440 : 1080 },
          height: { ideal: isPro ? 1440 : 1080 },
        },
        audio: true, // Audio included for reel video recording
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch {
      // Fallback: try video-only if microphone blocked
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        setStream(videoOnlyStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoOnlyStream;
        }
      } catch {
        setCameraError('Camera access unavailable or denied. Use gallery upload below to select photos or reel videos.');
      }
    }
  };

  useEffect(() => {
    if (!capturedImage && !capturedVideo) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [facingMode, capturedImage, capturedVideo]);

  const getCanvasFilterCss = (preset: FilterPreset) => {
    switch (preset) {
      case 'cyber':
        return 'contrast(120%) saturate(150%) hue-rotate(15deg)';
      case 'noir':
        return 'grayscale(100%) contrast(130%)';
      case 'warm':
        return 'sepia(35%) saturate(125%)';
      case 'prism':
        return 'saturate(180%) contrast(115%) hue-rotate(45deg)';
      case 'gold':
        return 'sepia(45%) brightness(108%) contrast(115%)';
      default:
        return 'none';
    }
  };

  const renderCanvasWithOverlays = (source: HTMLVideoElement | HTMLImageElement, srcW: number, srcH: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const maxSize = isPro ? 1200 : 900;
    const scale = Math.min(1, maxSize / Math.max(srcW, srcH));
    canvas.width = Math.round(srcW * scale);
    canvas.height = Math.round(srcH * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.filter = getCanvasFilterCss(activeFilter);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Draw Pro Text/Sticker Overlay if provided
    if (overlayText.trim()) {
      const fontSize = Math.max(24, Math.round(canvas.width * 0.055));
      ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      const boxY = canvas.height - fontSize * 2;
      ctx.fillRect(0, boxY - fontSize * 0.85, canvas.width, fontSize * 1.4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(overlayText.trim(), canvas.width / 2, boxY);
    }

    return canvas.toDataURL('image/webp', 0.85);
  };

  // Instant Photo Capture (on Tap)
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const dataUrl = renderCanvasWithOverlays(
      video,
      video.videoWidth || 720,
      video.videoHeight || 720
    );
    if (dataUrl) {
      setCapturedImage(dataUrl);
      setCapturedVideo(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Video Recording on Hold
  const startRecordingVideo = () => {
    if (!stream) return;
    try {
      recordedChunksRef.current = [];

      let mimeType = 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          mimeType = 'video/webm;codecs=vp9,opus';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedVideo(reader.result as string);
          setCapturedImage(null);
          setPublishMode('reel');
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      // 15 seconds max reel recording timer
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopRecordingVideo();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
    }
  };

  const stopRecordingVideo = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsRecording(false);
  };

  // Pointer Down (Hold to Record, Tap to Click Photo)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isHoldingRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      startRecordingVideo();
    }, 320);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (isHoldingRef.current || isRecording) {
      stopRecordingVideo();
    } else {
      // Tap detected (<320ms): Snap Photo!
      handleCapturePhoto();
    }
    isHoldingRef.current = false;
  };

  const handlePointerCancel = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (isRecording) {
      stopRecordingVideo();
    }
    isHoldingRef.current = false;
  };

  // Gallery File Upload (Images & Videos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedVideo(event.target?.result as string);
        setCapturedImage(null);
        setPublishMode('reel');
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const compressed = renderCanvasWithOverlays(img, img.width, img.height);
          setCapturedImage(compressed || (event.target?.result as string));
          setCapturedVideo(null);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setPublishedSuccess(false);
    setErrorMsg('');
    setRecordingSeconds(0);
  };

  const toggleMusicPreview = (trackId: string, url: string) => {
    if (previewingMusicId === trackId) {
      audioPreviewRef.current?.pause();
      setPreviewingMusicId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.play().catch(() => {});
        setPreviewingMusicId(trackId);
      }
    }
  };

  const selectedTrack = ROYALTY_FREE_TRACKS.find((t) => t.id === selectedMusicId) || ROYALTY_FREE_TRACKS[0];

  const handlePublish = async () => {
    if (!currentUser) {
      setErrorMsg('Please sign in first to publish content.');
      return;
    }
    if (!capturedImage && !capturedVideo) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress(35);

    let ok = false;
    if (publishMode === 'story') {
      const mediaUrl = capturedVideo || capturedImage!;
      const mediaType = capturedVideo ? 'video' : 'image';
      ok = await createStory(mediaUrl, mediaType);
    } else {
      const isVideo = Boolean(capturedVideo);
      ok = await createPost({
        caption: caption.trim() || (isVideo ? 'New Reel on VYRO ⚡' : 'Shared via VYRO Studio ⚡'),
        postType: publishMode === 'reel' || isVideo ? 'reel' : 'photo',
        media: [
          {
            id: `med_${Date.now()}`,
            url: (capturedVideo || capturedImage)!,
            type: isVideo ? 'video' : 'image',
            width: 1080,
            height: isVideo ? 1920 : 1080,
          },
        ],
        musicTrack: selectedTrack,
      });
    }

    setUploadProgress(100);
    setIsUploading(false);

    if (ok) {
      setPublishedSuccess(true);
      setTimeout(() => navigate(publishMode === 'reel' || capturedVideo ? '/reels' : '/feed'), 1000);
    } else {
      setErrorMsg('Publish failed. Please make sure you are signed in and media is valid.');
    }
  };

  const availableFilters: { id: FilterPreset; pro?: boolean }[] = [
    { id: 'normal' },
    { id: 'cyber' },
    { id: 'noir' },
    { id: 'warm' },
    { id: 'prism', pro: true },
    { id: 'gold', pro: true },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Hidden audio element for preview */}
      <audio ref={audioPreviewRef} onEnded={() => setPreviewingMusicId(null)} className="hidden" />

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white">VYRO Camera & Reels Studio</h2>
          {isPro && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-vyro-primary to-vyro-accent text-[10px] font-bold text-white flex items-center gap-1">
              <Crown className="w-3 h-3" /> HD PRO
            </span>
          )}
        </div>
        <div className="w-8" />
      </div>

      {/* Mode Selector: Feed Post vs Vertical Reel vs 24h Story */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['photo', 'reel', 'story'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setPublishMode(m)}
            className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              publishMode === m
                ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white shadow-glow-purple'
                : 'bg-vyro-card border border-vyro-border text-slate-400 hover:text-white'
            }`}
          >
            {m === 'photo' ? 'Feed Post' : m === 'reel' ? 'Vertical Reel' : '24h Story'}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-vyro-border space-y-5">
        {publishedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Published Successfully!</p>
              <p className="text-xs text-emerald-400">Redirecting to feed...</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Viewfinder & Preview */}
        <div className={`relative ${publishMode === 'reel' ? 'aspect-[9/16] max-h-[520px]' : 'aspect-square'} rounded-2xl overflow-hidden bg-black border border-vyro-border flex items-center justify-center mx-auto transition-all`}>
          {!capturedImage && !capturedVideo ? (
            <>
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload Photo / Reel Video
                  </Button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ filter: getCanvasFilterCss(activeFilter) }}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Recording Indicator Overlay */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:15</span>
                </div>
              )}

              {/* Music Badge on Viewfinder */}
              {selectedTrack && (
                <button
                  onClick={() => setIsMusicPickerOpen(true)}
                  className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-black/80"
                  style={{ display: isRecording ? 'none' : 'flex' }}
                >
                  <Disc className="w-3.5 h-3.5 text-vyro-accent animate-spin" />
                  <span className="truncate max-w-[140px]">{selectedTrack.title}</span>
                </button>
              )}

              {/* Pro Text Overlay */}
              {overlayText.trim() && (
                <div className="absolute bottom-24 left-0 right-0 bg-black/50 py-2 text-center text-white font-extrabold text-lg pointer-events-none">
                  {overlayText}
                </div>
              )}

              {/* Camera Switch Button */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'))}
                  className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition-transform active:rotate-180"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Capture Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2 px-6">
                <p className="text-[11px] font-bold text-white/90 bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-sm">
                  {isRecording ? 'Release to finish recording' : 'Tap for Photo • Hold for Reel Video'}
                </p>

                <div className="w-full flex items-center justify-around">
                  {/* Upload from Gallery Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80"
                    title="Upload Photo or Video Reel"
                  >
                    <Upload className="w-5 h-5" />
                  </button>

                  {/* Shutter Button with Hold-to-Record progress ring */}
                  <div className="relative flex items-center justify-center">
                    {/* SVG circular progress ring for 15s recording */}
                    <svg className="w-20 h-20 -rotate-90 pointer-events-none absolute" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      {isRecording && (
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#EF4444"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={264}
                          strokeDashoffset={264 - (264 * recordingSeconds) / 15}
                          className="transition-all duration-300"
                        />
                      )}
                    </svg>

                    <button
                      onPointerDown={handlePointerDown}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      className={`relative z-10 p-1 rounded-full border-4 transition-all select-none touch-none ${
                        isRecording ? 'border-red-500 scale-110' : 'border-white active:scale-95'
                      }`}
                      aria-label="Capture photo or hold to record reel"
                    >
                      <div
                        className={`w-14 h-14 rounded-full transition-all ${
                          isRecording
                            ? 'bg-red-500 rounded-xl scale-75'
                            : 'bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan shadow-glow-pink'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Music Button */}
                  <button
                    onClick={() => setIsMusicPickerOpen(true)}
                    className="p-3 rounded-full bg-black/50 text-vyro-accent backdrop-blur-md hover:bg-black/80"
                    title="Add Music"
                  >
                    <Music className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : capturedVideo ? (
            /* Video Preview Player */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                src={capturedVideo}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-vyro-cyan" />
                <span>Reel Video Preview</span>
              </div>
              <button
                onClick={handleRetake}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/90"
              >
                Retake
              </button>
            </div>
          ) : (
            /* Photo Preview */
            <div className="relative w-full h-full">
              <img src={capturedImage!} alt="Captured media" className="w-full h-full object-cover" />
              <button
                onClick={handleRetake}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/90"
              >
                Retake
              </button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Filter Preset Bar (For photos) */}
        {!capturedVideo && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {availableFilters.map((f) => {
              const locked = f.pro && !isPro;
              return (
                <button
                  key={f.id}
                  disabled={locked}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    activeFilter === f.id
                      ? 'bg-vyro-primary text-white shadow-glow-purple'
                      : locked
                      ? 'bg-vyro-card/40 text-slate-600 border border-vyro-border/40 cursor-not-allowed'
                      : 'bg-vyro-card text-slate-400 hover:text-white border border-vyro-border'
                  }`}
                >
                  <span>{f.id}</span>
                  {f.pro && <Crown className="w-3 h-3 text-amber-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Text / Sticker Overlay */}
        <div className="space-y-2 pt-2 border-t border-vyro-border/60">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-vyro-cyan" />
            <span>Text / Sticker Badge Overlay</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Stamp text onto your reel/photo..."
              className="flex-1 min-w-[180px] bg-vyro-card border border-vyro-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            />
            {STICKER_PRESETS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setOverlayText(st)}
                className="px-2.5 py-1.5 rounded-xl bg-vyro-card border border-vyro-border text-xs hover:border-vyro-primary text-slate-300"
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Music Picker Drawer / Section (Instagram / Snapchat style) */}
        <div className="pt-2 border-t border-vyro-border space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-vyro-accent" />
              <span>Attach Trending Song / Audio</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-bold">100% Free & Copyright-Safe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ROYALTY_FREE_TRACKS.map((track) => {
              const isSelected = track.id === selectedMusicId;
              const isPlaying = previewingMusicId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedMusicId(track.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-vyro-primary/20 border-vyro-primary text-white shadow-glow-purple'
                      : 'bg-vyro-card border-vyro-border hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMusicPreview(track.id, track.audioUrl);
                      }}
                      className="w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center text-vyro-accent hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{track.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-vyro-primary flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Caption */}
        {publishMode !== 'story' && (
          <div className="pt-2 border-t border-vyro-border">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Caption & Hashtags
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... #vyro #reels #trending"
              rows={3}
              className="w-full bg-vyro-card border border-vyro-border rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            />
          </div>
        )}

        {isUploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Uploading to VYRO...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-vyro-primary to-vyro-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <Button
          variant="gradient"
          className="w-full py-3"
          disabled={(!capturedImage && !capturedVideo) || isUploading}
          isLoading={isUploading}
          onClick={handlePublish}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span>
            {publishMode === 'story'
              ? 'Publish 24h Story'
              : publishMode === 'reel' || capturedVideo
              ? 'Publish Vertical Reel ⚡'
              : 'Publish to VYRO'}
          </span>
        </Button>
      </div>
    </div>
  );
};
