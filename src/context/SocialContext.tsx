import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, Story, User, MusicTrack } from '../types';
import { apiRequest } from '../lib/api';
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
  users: User[];
  isLoadingFeed: boolean;
  refreshSocialData: () => Promise<void>;
  createPost: (newPostData: Partial<Post>) => Promise<boolean>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
  incrementCommentCount: (postId: string) => void;
  markNotInterested: (postId: string) => void;
  getFilteredFeed: (tab: 'foryou' | 'following') => Post[];
  resetAlgorithm: () => void;
  createStory: (
    mediaUrl: string,
    mediaType: 'image' | 'video',
    location?: string,
    musicTrack?: MusicTrack
  ) => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Rich starter fallback creator content for fresh app loads (Guarantees non-empty feed without touching server DB)
const STARTER_FALLBACK_POSTS: Post[] = [
  {
    id: 'starter_post_satyam_1',
    userId: 'usr_satyam_founder',
    author: {
      id: 'usr_satyam_founder',
      username: 'satyam',
      displayName: 'Satyam Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isVerified: true,
      isPro: true,
      proBadge: 'Founder & CEO',
    },
    caption: 'VYRO Spatial Glass Engine is live ⚡ 60fps spring physics and zero latency. Welcome to the future of social. #vyro #future #apple #spatial',
    type: 'photo',
    media: [
      {
        id: 'm_satyam_1',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080',
        type: 'image',
      },
    ],
    likesCount: 18450,
    commentsCount: 412,
    isLiked: false,
    isSaved: false,
    location: 'VYRO Lab, Mumbai',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'starter_post_admin_1',
    userId: 'usr_vyro_admin',
    author: {
      id: 'usr_vyro_admin',
      username: 'vyro_admin',
      displayName: 'VYRO Official',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isVerified: true,
      isPro: true,
      proBadge: 'Official',
    },
    caption: 'Top trending tracks now synced across Reels & Studio 🎧 Drop your sound recommendations below! #trending #music #reels #spatial',
    type: 'reel',
    media: [
      {
        id: 'm_admin_1',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1080',
        type: 'image',
      },
    ],
    likesCount: 34100,
    commentsCount: 890,
    isLiked: false,
    isSaved: false,
    musicTrack: {
      id: 'trk_warn_1',
      title: 'WARNING 🔥',
      artist: 'Addi Kalyan',
      artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300',
      duration: 184,
      genre: 'Haryanvi Hype',
    },
    location: 'SoundStage Studio',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'starter_post_parag_1',
    userId: 'usr_parag_admin',
    author: {
      id: 'usr_parag_admin',
      username: 'parag_113',
      displayName: 'Parag Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isVerified: true,
      isPro: true,
      proBadge: 'Moderator',
    },
    caption: 'Midnight neon vibes in the city 🌃 Captured on iPhone 16 Pro Max with Spatial HDR. #neon #nightvibes #photography',
    type: 'photo',
    media: [
      {
        id: 'm_parag_1',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1080',
        type: 'image',
      },
    ],
    likesCount: 12600,
    commentsCount: 238,
    isLiked: false,
    isSaved: false,
    location: 'Cyber City Hub',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const STARTER_FALLBACK_STORIES: Story[] = [
  {
    id: 'starter_story_satyam',
    userId: 'usr_satyam_founder',
    user: {
      id: 'usr_satyam_founder',
      username: 'satyam',
      displayName: 'Satyam Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isVerified: true,
      isPro: true,
      proBadge: 'Founder & CEO',
    },
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080',
    mediaType: 'image',
    location: 'VYRO Lab',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
  },
  {
    id: 'starter_story_admin',
    userId: 'usr_vyro_admin',
    user: {
      id: 'usr_vyro_admin',
      username: 'vyro_admin',
      displayName: 'VYRO Official',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isVerified: true,
      isPro: true,
      proBadge: 'Official',
    },
    mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1080',
    mediaType: 'image',
    location: 'Main Stage',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 23).toISOString(),
  },
];

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences);

  const refreshSocialData = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const [postsRes, storiesRes, usersRes] = await Promise.all([
        apiRequest<{ posts: Post[] }>('/api/posts'),
        apiRequest<{ stories: Story[] }>('/api/stories'),
        apiRequest<{ users: User[] }>('/api/users'),
      ]);
      const fetchedPosts = postsRes.posts || [];
      const fetchedStories = storiesRes.stories || [];

      // Fall back to rich starter creator posts/stories so fresh app is never empty
      setPosts(fetchedPosts.length > 0 ? fetchedPosts : STARTER_FALLBACK_POSTS);
      setStories(fetchedStories.length > 0 ? fetchedStories : STARTER_FALLBACK_STORIES);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.warn('Error fetching social feed:', err);
      setPosts(STARTER_FALLBACK_POSTS);
      setStories(STARTER_FALLBACK_STORIES);
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    refreshSocialData();
  }, [currentUser?.id, refreshSocialData]);

  const toggleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiRequest<{ isLiked: boolean; likesCount: number }>(
        `/api/posts/${postId}/like`,
        { method: 'POST' }
      );

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const tags = post.caption.toLowerCase().match(/#[a-z0-9_]+/g) || [];
            const newPrefs = { ...preferences };
            tags.forEach((t) => {
              const raw = t.replace('#', '');
              newPrefs.preferredTags[raw] = (newPrefs.preferredTags[raw] || 0) + (res.isLiked ? 1 : -1);
            });
            setPreferences(newPrefs);
            savePreferences(newPrefs);

            // Maintain cumulative baseline count (never reset to 0 or 1)
            const updatedLikes = res.isLiked
              ? Math.max(post.likesCount + 1, res.likesCount)
              : Math.max(0, post.likesCount - 1);

            return {
              ...post,
              isLiked: res.isLiked,
              likesCount: updatedLikes,
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.warn('Toggle like failed:', err);
    }
  };

  const toggleSave = async (postId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiRequest<{ isSaved: boolean }>(`/api/posts/${postId}/save`, {
        method: 'POST',
      });
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, isSaved: res.isSaved } : post))
      );
    } catch (err) {
      console.warn('Toggle save failed:', err);
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUser) return;
    try {
      const res = await apiRequest<{ isFollowing: boolean; followersCount: number }>(
        `/api/users/${userId}/follow`,
        { method: 'POST' }
      );
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const updatedFollowers = res.isFollowing
              ? Math.max(u.followersCount + 1, res.followersCount)
              : Math.max(0, u.followersCount - 1);
            return {
              ...u,
              isFollowing: res.isFollowing,
              followersCount: updatedFollowers,
            };
          }
          return u;
        })
      );
    } catch (err) {
      console.warn('Follow toggle failed:', err);
    }
  };

  const incrementCommentCount = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post
      )
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

  const createPost = async (newPostData: Partial<Post>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await apiRequest<{ post: Post }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(newPostData),
      });
      setPosts((prev) => [res.post, ...prev]);
      return true;
    } catch (err) {
      console.error('Create post error:', err);
      return false;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.warn('Delete post failed:', err);
    }
  };

  const createStory = async (
    mediaUrl: string,
    mediaType: 'image' | 'video',
    location?: string,
    musicTrack?: MusicTrack
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await apiRequest<{ story: Story }>('/api/stories', {
        method: 'POST',
        body: JSON.stringify({ mediaUrl, mediaType, location, musicTrack }),
      });
      setStories((prev) => [res.story, ...prev]);
      return true;
    } catch (err) {
      console.error('Create story error:', err);
      return false;
    }
  };

  const getFilteredFeed = (tab: 'foryou' | 'following') => {
    if (tab === 'following') {
      const followedIds = new Set(users.filter((u) => u.isFollowing).map((u) => u.id));
      if (currentUser) followedIds.add(currentUser.id);
      const followingPosts = posts.filter((p) => followedIds.has(p.userId));
      return rankFeedPosts(followingPosts, 'following', preferences);
    }
    return rankFeedPosts(posts, 'foryou', preferences);
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
        users,
        isLoadingFeed,
        refreshSocialData,
        createPost,
        deletePost,
        toggleLike,
        toggleSave,
        toggleFollow,
        incrementCommentCount,
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
