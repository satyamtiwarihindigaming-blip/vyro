import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Download,
  Share2,
  Send,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { soundEngine } from '../../lib/soundEngine';
import { useSocial } from '../../context/SocialContext';
import { useNavigate } from 'react-router-dom';

type AspectRatio = '1:1' | '9:16' | '16:9';

interface StylePreset {
  id: string;
  name: string;
  emoji: string;
  promptSuffix: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'photoreal',
    name: '8K Photoreal',
    emoji: '📸',
    promptSuffix:
      ', 8k resolution, cinematic lighting, photorealistic portrait, 85mm lens, shot on IMAX, hyper-detailed skin textures, volumetric atmospheric rim lighting',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    emoji: '🚀',
    promptSuffix:
      ', cyberpunk aesthetic, neon holographic signs, wet asphalt reflections, hyper-violet and magenta lighting, futuristic cybernetic details, synthwave vibe',
  },
  {
    id: 'devnagari',
    name: 'Vedic Mythology',
    emoji: '🕉️',
    promptSuffix:
      ', grand Indian Vedic mythological epic, divine golden aura halo, ornate royal temple architecture, 24k gold filigree jewelry, dramatic celestial clouds, ultra-detailed',
  },
  {
    id: 'anime',
    name: 'Ghibli Anime',
    emoji: '🎨',
    promptSuffix:
      ', Makoto Shinkai and Studio Ghibli art style, breathtaking pastel sunset clouds, emotional cinematic lighting, anime masterpiece, lush vibrant painted scenery',
  },
  {
    id: 'glass3d',
    name: '3D Luxury Glass',
    emoji: '💎',
    promptSuffix:
      ', abstract 3D frosted glassmorphism render, chromatic aberration, floating translucent glass spheres, polished titanium chrome rings, Octane render 8K',
  },
];

export const AIImageStudio: React.FC = () => {
  const { createPost, createStory } = useSocial();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Magic Polish: Expands prompt with rich cinematic keywords
  const handleMagicPolish = () => {
    soundEngine.playPop();
    const base = prompt.trim() || 'A majestic creator in the neo-metropolis';
    const enhancements = [
      'masterpiece, ultra-detailed, 8k resolution',
      'dramatic cinematic rim light, octane render',
      'award-winning portrait photography, vivid contrast',
    ];
    const pick = enhancements[Math.floor(Math.random() * enhancements.length)];
    setPrompt(`${base}, ${pick}`);
  };

  // Generate Image
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setPublishSuccess(null);
    soundEngine.playTacticalScan();

    // Map aspect ratios to dimensions
    let width = 1024;
    let height = 1024;
    if (aspectRatio === '9:16') {
      width = 768;
      height = 1360;
    } else if (aspectRatio === '16:9') {
      width = 1360;
      height = 768;
    }

    const fullPrompt = `${prompt.trim()}${selectedPreset.promptSuffix}`;
    const seed = Math.floor(Math.random() * 999999);
    const synthesisUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      fullPrompt
    )}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // Preload image in memory
    const img = new Image();
    img.src = synthesisUrl;
    img.onload = () => {
      setGeneratedImageUrl(synthesisUrl);
      setIsGenerating(false);
      soundEngine.playChime();
    };
    img.onerror = () => {
      // Fallback in case of network issue
      setGeneratedImageUrl(synthesisUrl);
      setIsGenerating(false);
      soundEngine.playChime();
    };
  };

  // 1-Click Publish to Feed Post
  const handlePublishToFeed = async () => {
    if (!generatedImageUrl) return;
    setIsPublishing(true);
    soundEngine.playHapticClick();
    try {
      await createPost({
        caption: caption.trim() || `Generated via VYRO AI Studio ✨ #${selectedPreset.name.replace(/\s+/g, '')}`,
        postType: 'photo',
        media: [{ id: `ai_${Date.now()}`, url: generatedImageUrl, type: 'image' }],
      });
      setPublishSuccess('Published to Feed successfully! 🚀');
      soundEngine.playPop();
      setTimeout(() => navigate('/feed'), 1400);
    } catch {
      setPublishSuccess('Feed publishing error.');
    } finally {
      setIsPublishing(false);
    }
  };

  // 1-Click Publish to 24h Story
  const handlePublishToStory = async () => {
    if (!generatedImageUrl) return;
    setIsPublishing(true);
    soundEngine.playHapticClick();
    try {
      await createStory(generatedImageUrl, 'image');
      setPublishSuccess('Published to your 24h Story! ⚡');
      soundEngine.playPop();
      setTimeout(() => navigate('/feed'), 1400);
    } catch {
      setPublishSuccess('Story publishing error.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Download 4K Local Image
  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;
    soundEngine.playPop();
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `VYRO_AI_${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 select-none p-1">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-vyro-accent animate-pulse" />
            Native AI Image Synthesis Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate 8K photoreal & cinematic artwork directly in VYRO • Zero API keys required
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['1:1', '9:16', '16:9'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => {
                soundEngine.playHapticClick();
                setAspectRatio(ratio);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                aspectRatio === ratio
                  ? 'bg-vyro-primary text-white border-vyro-accent shadow-glow-purple'
                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {ratio} {ratio === '1:1' ? 'Feed' : ratio === '9:16' ? 'Story' : 'Cover'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Body: Controls + Live Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Controls Column (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Prompt Box */}
          <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-white uppercase tracking-wider">
                Creative Prompt
              </label>
              <button
                type="button"
                onClick={handleMagicPolish}
                className="text-xs text-vyro-cyan hover:text-white font-bold flex items-center gap-1 transition"
              >
                <Wand2 className="w-3.5 h-3.5" /> Magic Polish
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vision (e.g. 'Cyberpunk cybernetic warrior with glowing neon wings atop a futuristic skyscraper')..."
              rows={3}
              className="w-full bg-black/60 border border-white/15 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vyro-primary resize-none"
            />

            {/* Curated Aesthetic Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Aesthetic Style Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundEngine.playHapticClick();
                        setSelectedPreset(preset);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-vyro-primary to-vyro-accent text-white border-vyro-accent shadow-glow-pink'
                          : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span>{preset.emoji}</span>
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Action Button */}
            <Button
              variant="gradient"
              size="md"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 mt-2 font-black tracking-wider shadow-glow-purple"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Synthesizing 8K Art...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Masterpiece
                </>
              )}
            </Button>
          </div>

          {/* Caption & Publish Options (Visible when image generated) */}
          {generatedImageUrl && (
            <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Post Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write an epic caption for your followers..."
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
              />

              {publishSuccess && (
                <div className="p-2.5 rounded-xl bg-vyro-primary/20 border border-vyro-accent text-xs font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-vyro-cyan" />
                  {publishSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublishToFeed}
                  disabled={isPublishing}
                  className="w-full text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Publish to Feed
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handlePublishToStory}
                  disabled={isPublishing}
                  className="w-full text-xs font-bold shadow-glow-pink"
                >
                  <Flame className="w-3.5 h-3.5 mr-1.5" />
                  Publish to 24h Story
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Live Image Canvas (5 Cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div
            className={`relative w-full rounded-3xl overflow-hidden glass-panel border border-white/15 flex items-center justify-center shadow-2xl bg-black/50 ${
              aspectRatio === '9:16'
                ? 'aspect-[9/16] max-h-[520px]'
                : aspectRatio === '16:9'
                ? 'aspect-video'
                : 'aspect-square'
            }`}
          >
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-vyro-primary/20 border border-vyro-accent flex items-center justify-center animate-spin">
                  <Sparkles className="w-7 h-7 text-vyro-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Rendering Diffusion Canvas</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Applying {selectedPreset.name} shaders...
                  </p>
                </div>
              </div>
            ) : generatedImageUrl ? (
              <>
                <img
                  src={generatedImageUrl}
                  alt="AI Generated Artwork"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleDownloadImage}
                  className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-lg transition"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <ImageIcon className="w-12 h-12 stroke-[1.5] text-slate-600" />
                <p className="text-xs">
                  Your AI masterpiece preview will appear here in ultra 8K clarity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
