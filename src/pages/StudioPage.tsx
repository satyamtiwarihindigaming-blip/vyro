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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ROYALTY_FREE_TRACKS } from '../lib/musicCatalog';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

type FilterPreset = 'normal' | 'cyber' | 'noir' | 'warm' | 'prism' | 'gold';

const STICKER_PRESETS = ['⚡ VYRO', '🔥 HOT', '✨ PRO', '🎵 VIBES', '💎'];

export const StudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createPost, createStory } = useSocial();
  const { currentUser, isPro } = useAuth();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [publishMode, setPublishMode] = useState<'photo' | 'reel' | 'story'>(
    searchParams.get('mode') === 'story' ? 'story' : 'photo'
  );
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('normal');
  const [overlayText, setOverlayText] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState(ROYALTY_FREE_TRACKS[0].id);
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
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch {
      setCameraError('Camera access unavailable or denied. Use gallery upload below.');
    }
  };

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, capturedImage]);

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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const compressed = renderCanvasWithOverlays(img, img.width, img.height);
        setCapturedImage(compressed || (event.target?.result as string));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setPublishedSuccess(false);
    setErrorMsg('');
  };

  const handlePublish = async () => {
    if (!currentUser) {
      setErrorMsg('Please sign in first to publish content.');
      return;
    }
    if (!capturedImage) return;

    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress(35);

    const chosenTrack = ROYALTY_FREE_TRACKS.find((t) => t.id === selectedMusicId);

    let ok = false;
    if (publishMode === 'story') {
      ok = await createStory(capturedImage, 'image');
    } else {
      ok = await createPost({
        caption: caption.trim() || 'Shared via VYRO Studio ⚡',
        postType: publishMode === 'reel' ? 'reel' : 'photo',
        media: [
          {
            id: `med_${Date.now()}`,
            url: capturedImage,
            type: 'image',
            width: 1080,
            height: 1080,
          },
        ],
        musicTrack: chosenTrack,
      });
    }

    setUploadProgress(100);
    setIsUploading(false);

    if (ok) {
      setPublishedSuccess(true);
      setTimeout(() => navigate(publishMode === 'reel' ? '/reels' : '/feed'), 1000);
    } else {
      setErrorMsg('Publish failed. Please make sure you are signed in and image size is valid.');
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
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white">VYRO Studio & Camera</h2>
          {isPro && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-vyro-primary to-vyro-accent text-[10px] font-bold text-white flex items-center gap-1">
              <Crown className="w-3 h-3" /> HD PRO
            </span>
          )}
        </div>
        <div className="w-8" />
      </div>

      {/* Mode Selector: Post vs Reel vs 24h Story */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['photo', 'reel', 'story'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setPublishMode(m)}
            className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              publishMode === m
                ? 'bg-vyro-primary text-white shadow-glow-purple'
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

        {/* Viewfinder */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-vyro-border flex items-center justify-center">
          {!capturedImage ? (
            <>
              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Select from Gallery
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

              {overlayText.trim() && (
                <div className="absolute bottom-24 left-0 right-0 bg-black/50 py-2 text-center text-white font-extrabold text-lg pointer-events-none">
                  {overlayText}
                </div>
              )}

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => setFacingMode((p) => (p === 'user' ? 'environment' : 'user'))}
                  className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition-transform active:rotate-180"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-around px-8">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80"
                  title="Upload from Device"
                >
                  <Upload className="w-5 h-5" />
                </button>

                <button
                  onClick={handleCapturePhoto}
                  className="p-1 rounded-full border-4 border-white active:scale-90 transition-transform"
                  aria-label="Capture Photo"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan shadow-glow-pink" />
                </button>

                <div className="w-11" />
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <img src={capturedImage} alt="Captured media" className="w-full h-full object-cover" />
              <button
                onClick={handleRetake}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80"
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
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Filter Preset Bar */}
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

        {/* Pro Text & Sticker Overlay */}
        <div className="space-y-2 pt-2 border-t border-vyro-border/60">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-vyro-cyan" />
            <span>Text / Sticker Overlay (Rendered on Photo)</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={overlayText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOverlayText(e.target.value)}
              placeholder="Optional text stamped onto image..."
              className="flex-1 min-w-[180px] bg-vyro-card border border-vyro-border rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            />
            {isPro &&
              STICKER_PRESETS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOverlayText(st)}
                  className="px-2.5 py-1.5 rounded-xl bg-vyro-card border border-vyro-border text-xs hover:border-vyro-primary"
                >
                  {st}
                </button>
              ))}
          </div>
        </div>

        {publishMode !== 'story' && (
          <div className="space-y-4 pt-2 border-t border-vyro-border">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value)}
                placeholder="Write a caption... #hashtags"
                rows={3}
                className="w-full bg-vyro-card border border-vyro-border rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-vyro-accent" />
                <span>Sync Royalty-Free Audio</span>
              </label>
              <select
                value={selectedMusicId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMusicId(e.target.value)}
                className="w-full bg-vyro-card border border-vyro-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-vyro-primary"
              >
                {ROYALTY_FREE_TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} — {t.artist} ({t.licenseType})
                  </option>
                ))}
              </select>
            </div>
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
          disabled={!capturedImage || isUploading}
          isLoading={isUploading}
          onClick={handlePublish}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span>
            {publishMode === 'story'
              ? 'Publish 24h Story'
              : publishMode === 'reel'
              ? 'Publish Reel'
              : 'Publish to VYRO'}
          </span>
        </Button>
      </div>
    </div>
  );
};
