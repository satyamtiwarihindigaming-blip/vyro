import { Post } from '../types';

export interface UserPreferences {
  preferredTags: Record<string, number>; // Tag -> weight score
  notInterestedPostIds: string[];
}

const PREF_STORAGE_KEY = 'vyro_ai_preferences';

export const getStoredPreferences = (): UserPreferences => {
  const data = localStorage.getItem(PREF_STORAGE_KEY);
  return data
    ? JSON.parse(data)
    : { preferredTags: {}, notInterestedPostIds: [] };
};

export const savePreferences = (prefs: UserPreferences) => {
  localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
};

export const resetPreferences = () => {
  localStorage.removeItem(PREF_STORAGE_KEY);
};

// Calculate decay-weighted engagement score
export const calculateRecommendationScore = (
  post: Post,
  prefs: UserPreferences
): number => {
  // If user marked "Not Interested", drastically demote
  if (prefs.notInterestedPostIds.includes(post.id)) {
    return -9999;
  }

  const L = post.likesCount;
  const C = post.commentsCount;
  const S = post.sharesCount;
  const V = post.postType === 'reel' ? 1.0 : 0.5; // Video completion factor
  const N = 0; // Negative feedback weight

  const rawEngagement = L * 1.0 + C * 2.0 + S * 3.0 + V * 5.0 - N * 5.0;

  // Age in hours
  const postDate = new Date(post.createdAt).getTime();
  const now = Date.now();
  const ageInHours = Math.max(0.1, (now - postDate) / (1000 * 60 * 60));

  // Time decay denominator
  const decay = Math.pow(ageInHours + 2, 1.4);
  let baseScore = rawEngagement / decay;

  // Personalization boost from user tag preferences
  const captionWords = post.caption.toLowerCase().split(/\s+/);
  captionWords.forEach((word) => {
    if (word.startsWith('#')) {
      const tag = word.replace('#', '');
      const boost = prefs.preferredTags[tag] || 0;
      baseScore += boost * 2.5;
    }
  });

  return baseScore;
};

// Rank feed posts using AI hybrid model or pure chronological
export const rankFeedPosts = (
  posts: Post[],
  mode: 'foryou' | 'following',
  prefs: UserPreferences = getStoredPreferences()
): Post[] => {
  if (mode === 'following') {
    // Pure chronological order
    return [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // AI-curated "For You" ranking
  return [...posts]
    .filter((p) => !prefs.notInterestedPostIds.includes(p.id))
    .sort((a, b) => {
      const scoreA = calculateRecommendationScore(a, prefs);
      const scoreB = calculateRecommendationScore(b, prefs);
      return scoreB - scoreA;
    });
};
