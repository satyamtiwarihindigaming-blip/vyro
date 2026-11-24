import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { Story } from '../../types';
import { Plus, X, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StoryBar: React.FC = () => {
  const { currentUser } = useAuth();
  const { stories } = useSocial();
  const navigate = useNavigate();
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
        {/* Create Your Story Bubble */}
        <div
          onClick={() => navigate('/create?mode=story')}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
        >
          <div className="relative">
            <Avatar
              src={currentUser?.avatarUrl}
              alt={currentUser?.displayName || 'Your Story'}
              size="md"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-vyro-primary to-vyro-accent rounded-full text-white shadow-glow-pink">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] text-slate-300 font-medium group-hover:text-white">
            Add Story
          </span>
        </div>

        {stories.length === 0 ? (
          <div className="text-[11px] text-slate-500 pl-2">
            No active 24h stories yet — tap Add Story to post one!
          </div>
        ) : (
          stories.map((story) => (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
            >
              <Avatar
                src={story.user.avatarUrl}
                alt={story.user.displayName}
                size="md"
                hasStory
                isViewed={story.hasViewed}
              />
              <span className="text-[11px] text-slate-300 font-medium max-w-[70px] truncate group-hover:text-white">
                {story.user.username}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Full-Screen Immersive Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[85vh] rounded-3xl overflow-hidden glass-panel border border-vyro-border flex flex-col justify-between">
            <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
              <div className="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-[progress_5s_linear_forwards]" />
              </div>
            </div>

            <div className="relative z-20 p-4 pt-6 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex items-center gap-2.5">
                <Avatar src={activeStory.user.avatarUrl} alt={activeStory.user.displayName} size="xs" />
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white leading-none">{activeStory.user.username}</p>
                    <VerifiedBadge
                      isVerified={activeStory.user.isVerified}
                      isPro={activeStory.user.isPro}
                      proBadge={activeStory.user.proBadge}
                    />
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    {new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
                  aria-label="Toggle mute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
                  aria-label="Close story"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeStory.mediaType === 'video' ? (
              <video
                src={activeStory.mediaUrl}
                autoPlay
                playsInline
                muted={isMuted}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeStory.mediaUrl}
                alt="Story media"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 to-transparent text-center">
              <button
                onClick={() => {
                  setActiveStory(null);
                  navigate('/direct');
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-vyro-primary rounded-full hover:bg-vyro-primaryHover"
              >
                Message @{activeStory.user.username}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
