import React, { useState } from 'react';
import { Search, Film } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const tags = ['all', 'generative', '3d-art', 'beats', 'royalty-free', 'amalfi', 'night-drive'];

  const exploreGrid = [
    {
      id: 'exp_1',
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
      type: 'photo',
      likes: '1.4k',
      tag: '3d-art',
    },
    {
      id: 'exp_2',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      type: 'reel',
      likes: '3.8k',
      tag: 'generative',
    },
    {
      id: 'exp_3',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      type: 'photo',
      likes: '9.2k',
      tag: 'amalfi',
    },
    {
      id: 'exp_4',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      type: 'reel',
      likes: '2.1k',
      tag: 'beats',
    },
    {
      id: 'exp_5',
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      type: 'photo',
      likes: '5.5k',
      tag: 'night-drive',
    },
    {
      id: 'exp_6',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      type: 'photo',
      likes: '4.7k',
      tag: 'royalty-free',
    },
  ];

  const filteredGrid = exploreGrid.filter((item) => {
    if (selectedTag !== 'all' && item.tag !== selectedTag) return false;
    if (searchQuery.trim() && !item.tag.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Search Header */}
      <div className="glass-card rounded-2xl p-4 border border-vyro-border flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, hashtags (#art, #beats), or aesthetics..."
            className="w-full bg-vyro-bg border border-vyro-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-vyro-primary"
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-vyro-primary text-white shadow-glow-purple'
                  : 'bg-vyro-card text-slate-400 hover:text-white border border-vyro-border'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry / Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {filteredGrid.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-vyro-card border border-vyro-border cursor-pointer select-none"
          >
            <img
              src={item.url}
              alt={item.tag}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
              <span>❤️ {item.likes}</span>
              <span className="capitalize">#{item.tag}</span>
            </div>

            {item.type === 'reel' && (
              <span className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px]">
                <Film className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
