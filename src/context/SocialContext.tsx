import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, Story, User } from '../types';
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
  createStory: (mediaUrl: string, mediaType: 'image' | 'video') => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

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
      setPosts(postsRes.posts || []);
      setStories(storiesRes.stories || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.warn('Error fetching social feed:', err);
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

            return {
              ...post,
              isLiked: res.isLiked,
              likesCount: res.likesCount,
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
        prev.map((u) =>
          u.id === userId
            ? { ...u, isFollowing: res.isFollowing, followersCount: res.followersCount }
            : u
        )
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

  const createStory = async (mediaUrl: string, mediaType: 'image' | 'video'): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await apiRequest<{ story: Story }>('/api/stories', {
        method: 'POST',
        body: JSON.stringify({ mediaUrl, mediaType }),
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
