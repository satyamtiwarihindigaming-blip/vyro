import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { GifItem, searchGifs } from '../../lib/gifService';
import { soundEngine } from '../../lib/soundEngine';

interface StoryGifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gif: GifItem) => void;
}

export const StoryGifPickerModal: React.FC<StoryGifPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectGif,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchInitialGifs = async () => {
      setLoading(true);
      const results = await searchGifs(searchTerm || 'reaction trending');
      setGifs(results);
      setLoading(false);
    };

    const timer = setTimeout(fetchInitialGifs, 250);
    return () => clearTimeout(timer);
  }, [isOpen, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel border border-vyro-border rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>✨ Search GIPHY Animated Stickers & GIFs</span>
          </h3>
          <button
            onClick={() => {
              soundEngine.playHapticClick();
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search anime, reactions, memes, trending..."
            className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
            autoFocus
          />
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
          {loading ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-vyro-primary mb-2" />
              <span className="text-xs">Fetching high-energy GIFs...</span>
            </div>
          ) : gifs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-500">
              No GIFs found for "{searchTerm}". Try a different keyword!
            </div>
          ) : (
            gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  soundEngine.playPop();
                  onSelectGif(gif);
                  onClose();
                }}
                className="relative rounded-xl overflow-hidden aspect-video bg-black/40 border border-white/10 hover:border-vyro-primary hover:scale-[1.02] transition-transform group"
              >
                <img
                  src={gif.previewUrl || gif.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
