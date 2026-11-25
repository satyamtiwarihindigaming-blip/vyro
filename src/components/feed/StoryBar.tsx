import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Story } from '../../types';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StoryViewerModal } from '../story/StoryViewerModal';
import { soundEngine } from '../../lib/soundEngine';

export const StoryBar: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories } = useSocial();
  const navigate = useNavigate();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Group stories by user so only one avatar bubble per creator appears
  const uniqueCreatorsWithStories: { story: Story; count: number }[] = [];
  stories.forEach((story) => {
    const existing = uniqueCreatorsWithStories.find((item) => item.story.userId === story.userId);
    if (existing) {
      existing.count += 1;
    } else {
      uniqueCreatorsWithStories.push({ story, count: 1 });
    }
  });

  return (
    <>
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 px-1 select-none">
        {/* Create Your Story Bubble */}
        <div
          onClick={() => {
            soundEngine.playHapticClick();
            navigate('/create?mode=story');
          }}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          title="Post to your 24h Story"
        >
          <div className="relative">
            <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 group-hover:from-vyro-primary group-hover:to-vyro-accent transition duration-300">
              <Avatar
                src={currentUser?.avatarUrl}
                alt={currentUser?.displayName || 'Your Story'}
                size="md"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 p-1 bg-gradient-to-r from-vyro-primary via-vyro-accent to-vyro-cyan rounded-full text-white shadow-glow-pink group-hover:scale-110 transition-transform">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] text-slate-300 font-semibold group-hover:text-white transition">
            Your Story
          </span>
        </div>

        {uniqueCreatorsWithStories.length === 0 ? (
          <div className="text-[11px] text-slate-500 pl-2">
            No active 24h stories yet — tap Your Story to post the first!
          </div>
        ) : (
          uniqueCreatorsWithStories.map(({ story, count }) => {
            const isVip =
              story.user.username === 'satyam' ||
              story.user.username === 'vyro_admin' ||
              story.user.isPro;

            return (
              <button
                key={story.id}
                onClick={() => {
                  soundEngine.playHapticClick();
                  setActiveStory(story);
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
              >
                {/* Conic Gradient Animated Ring */}
                <div
                  className={`relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-105 ${
                    isVip
                      ? 'animate-conic-vip shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                      : story.hasViewed
                      ? 'bg-slate-700/80'
                      : 'bg-gradient-to-tr from-vyro-primary via-vyro-accent to-vyro-cyan animate-[spin_8s_linear_infinite]'
                  }`}
                >
                  <div className="p-[2px] bg-vyro-bg rounded-full">
                    <Avatar
                      src={story.user.avatarUrl}
                      alt={story.user.displayName}
                      size="md"
                    />
                  </div>

                  {count > 1 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-black/90 border border-white/30 text-[9px] font-black text-white rounded-full">
                      {count}
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-300 font-medium max-w-[72px] truncate group-hover:text-white transition">
                  {story.user.username}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Full-Screen Instagram-Exact 1:1 Story Viewer Modal */}
      {activeStory && (
        <StoryViewerModal
          stories={stories}
          initialStoryId={activeStory.id}
          onClose={() => setActiveStory(null)}
        />
      )}
    </>
  );
};
