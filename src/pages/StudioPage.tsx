import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Upload, Music, Sparkles, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MOCK_MUSIC_TRACKS } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';

export const StudioPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'cyber' | 'noir' | 'warm'>('normal');
  const [caption, setCaption] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState(MOCK_MUSIC_TRACKS[0].id);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or blocked. You can upload an image from your device.');
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

  // Flip camera between front and back
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture still photo from video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply live filter on canvas
    if (activeFilter === 'cyber') {
      ctx.filter = 'contrast(120%) saturate(140%) hue-rotate(15deg)';
    } else if (activeFilter === 'noir') {
      ctx.filter = 'grayscale(100%) contrast(130%)';
    } else if (activeFilter === 'warm') {
      ctx.filter = 'sepia(30%) saturate(120%)';
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/webp', 0.88);
    setCapturedImage(dataUrl);

    // Stop camera stream to preserve battery
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setPublishedSuccess(false);
  };

  // Publish post with progress bar
  const handlePublish = () => {
    if (!capturedImage) return;
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setPublishedSuccess(true);
          setTimeout(() => navigate('/feed'), 1400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

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
        <h2 className="text-base font-bold text-white">VYRO Studio & Camera</h2>
        <div className="w-8" />
      </div>

      <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-vyro-border space-y-6">
        {publishedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
            <Check className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Published to VYRO Feed!</p>
              <p className="text-xs text-emerald-400">Your post is live with synchronized audio.</p>
            </div>
          </div>
        )}

        {/* Viewfinder or Captured Preview */}
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
                  className={`w-full h-full object-cover ${
                    activeFilter === 'cyber'
                      ? 'contrast-125 saturate-150'
                      : activeFilter === 'noir'
                      ? 'grayscale contrast-125'
                      : activeFilter === 'warm'
                      ? 'sepia-[.3]'
                      : ''
                  }`}
                />
              )}

              {/* Viewfinder Overlays */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={handleFlipCamera}
                  className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition-transform active:rotate-180"
                  title="Switch Camera (Front/Rear)"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Shutter Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-around px-8">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80"
                  title="Upload from Device"
                >
                  <Upload className="w-5 h-5" />
                </button>

                {/* Shutter Button */}
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
              <img
                src={capturedImage}
                alt="Captured media"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRetake}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/80"
              >
                Retake
              </button>
            </div>
          )}
        </div>

        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Hidden File Input for Gallery Fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Live Filter Preset Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(['normal', 'cyber', 'noir', 'warm'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeFilter === filter
                  ? 'bg-vyro-primary text-white shadow-glow-purple'
                  : 'bg-vyro-card text-slate-400 hover:text-white border border-vyro-border'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Caption & Music Sync */}
        <div className="space-y-4 pt-2 border-t border-vyro-border">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What are you expressing? #tags, ideas, mood..."
              rows={3}
              className="w-full bg-vyro-card border border-vyro-border rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-vyro-accent" />
              <span>Sync Royalty-Free Sound / Original Audio</span>
            </label>
            <select
              value={selectedMusicId}
              onChange={(e) => setSelectedMusicId(e.target.value)}
              className="w-full bg-vyro-card border border-vyro-border rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-vyro-primary"
            >
              {MOCK_MUSIC_TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — @{t.artist} ({t.licenseType})
                </option>
              ))}
            </select>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Optimizing & Uploading...</span>
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

          {/* Publish Action Button */}
          <Button
            variant="gradient"
            className="w-full py-3"
            disabled={!capturedImage || isUploading}
            isLoading={isUploading}
            onClick={handlePublish}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Publish to VYRO</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
