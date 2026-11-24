import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, Story } from '../types';
import { MOCK_POSTS, MOCK_STORIES } from '../lib/mockData';
import { useAuth } from './AuthContext';
import {
  getStoredPreferences,
  savePreferences,
  UserPreferences,
  rankFeedPosts,
  resetPreferences,
} from '../lib/recommendation';

interface SocialContextType {
  posts: Post[];
  stories: Story[];
  createPost: (newPostData: Partial<Post>) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  markNotInterested: (postId: string) => void;
  getFilteredFeed: (tab: 'foryou' | 'following') => Post[];
  resetAlgorithm: () => void;
  createStory: (mediaUrl: string, mediaType: 'image' | 'video') => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const POSTS_KEY = 'vyro_posts_state';
const STORIES_KEY = 'vyro_stories_state';

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(POSTS_KEY);
    return saved ? JSON.parse(saved) : MOCK_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem(STORIES_KEY);
    return saved ? JSON.parse(saved) : MOCK_STORIES;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences);

  useEffect(() => {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  }, [stories]);

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasLiked = post.isLiked;
          const updatedLikes = wasLiked ? post.likesCount - 1 : post.likesCount + 1;

          // AI Tag preference update: If liked, boost tags!
          const tags = post.caption.toLowerCase().match(/#[a-z0-9_]+/g) || [];
          const newPrefs = { ...preferences };
          tags.forEach((t) => {
            const raw = t.replace('#', '');
            newPrefs.preferredTags[raw] = (newPrefs.preferredTags[raw] || 0) + (wasLiked ? -1 : 1);
          });
          setPreferences(newPrefs);
          savePreferences(newPrefs);

          return {
            ...post,
            isLiked: !wasLiked,
            likesCount: Math.max(0, updatedLikes),
          };
        }
        return post;
      })
    );
  };

  const toggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, isSaved: !post.isSaved } : post))
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
          };
        }
        return post;
      })
    );
  };

  const markNotInterested = (postId: string) => {
    const updated = {
      ...preferences,
      notInterestedPostIds: [...preferences.notInterestedPostIds, postId],
    };
    setPreferences(updated);
    savePreferences(updated);
  };

  const createPost = (newPostData: Partial<Post>) => {
    if (!currentUser) return;
    const post: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified,
      },
      caption: newPostData.caption || '',
      postType: newPostData.postType || 'photo',
      media: newPostData.media || [],
      musicTrack: newPostData.musicTrack,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [post, ...prev]);
  };

  const createStory = (mediaUrl: string, mediaType: 'image' | 'video') => {
    if (!currentUser) return;
    const story: Story = {
      id: `st_${Date.now()}`,
      userId: currentUser.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        isVerified: currentUser.isVerified,
      },
      mediaUrl,
      mediaType,
      duration: 5,
      hasViewed: false,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    setStories((prev) => [story, ...prev]);
  };

  const getFilteredFeed = (tab: 'foryou' | 'following') => {
    return rankFeedPosts(posts, tab, preferences);
  };

  const resetAlgorithm = () => {
    resetPreferences();
    setPreferences({ preferredTags: {}, notInterestedPostIds: [] });
  };

  return (
    <SocialContext.Provider
      value={{
        posts,
        stories,
        createPost,
        toggleLike,
        toggleSave,
        addComment,
        markNotInterested,
        getFilteredFeed,
        resetAlgorithm,
        createStory,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
