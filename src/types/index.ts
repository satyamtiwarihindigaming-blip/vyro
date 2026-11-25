export type UserRole = 'user' | 'creator' | 'admin';

export type ProfileAccent = 'purple' | 'pink' | 'cyan' | 'gold';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  role: UserRole;
  isPrivate: boolean;
  isVerified: boolean;
  isPro: boolean;
  proBadge?: string;
  themePreference: 'dark' | 'light' | 'cyberpunk';
  profileAccent?: ProfileAccent;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  lastActiveAt?: string;
  lastLocation?: string;
  createdAt: string;
}

export type PostType = 'photo' | 'video' | 'reel' | 'carousel';

export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number;
}

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isVerified: boolean;
  isPro: boolean;
  proBadge?: string;
  role?: UserRole;
}

export interface Post {
  id: string;
  userId: string;
  user: UserSummary;
  caption: string;
  postType: PostType;
  media: MediaItem[];
  location?: string;
  musicTrack?: MusicTrack;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  user: UserSummary;
}

export interface Story {
  id: string;
  userId: string;
  user: UserSummary;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  location?: string;
  musicTrack?: MusicTrack;
  hasViewed?: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  duration: number;
  licenseType: string;
  isOriginalAudio: boolean;
  creatorId?: string;
  youtubeVideoId?: string;
  spotifyTrackId?: string;
  genre?: string;
  mood?: string;
  plays?: number | string;
  trendingRank?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  groupId?: string;
  senderId: string;
  receiverId?: string;
  sender?: UserSummary;
  content: string;
  mediaUrl?: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'game' | 'shared_post';
  replyToId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DirectConversation {
  id: string;
  type: 'direct';
  partner: User;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface GroupConversation {
  id: string;
  type: 'group';
  groupId: string;
  name: string;
  avatarUrl?: string;
  creatorId: string;
  members: UserSummary[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export type AnyConversation = DirectConversation | GroupConversation;

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}
