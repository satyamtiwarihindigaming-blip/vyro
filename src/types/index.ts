export type UserRole = 'user' | 'creator' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  isPrivate: boolean;
  isVerified: boolean;
  themePreference: 'dark' | 'light' | 'cyberpunk';
  followersCount: number;
  followingCount: number;
  postsCount: number;
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

export interface Post {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>;
  caption: string;
  postType: PostType;
  media: MediaItem[];
  musicTrack?: MusicTrack;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
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
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  content: string;
  mediaUrl?: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'game' | 'shared_post';
  replyToId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatarUrl?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  caller: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  receiverId: string;
  callType: 'voice' | 'video';
  status: 'idle' | 'calling' | 'connected' | 'ended';
  startedAt?: string;
}

export interface GameSession {
  id: string;
  gameType: 'tic_tac_toe' | 'chess' | 'trivia';
  player1: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  player2: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  currentTurn: string;
  state: Record<string, unknown>;
  status: 'waiting' | 'active' | 'completed' | 'draw';
  winnerId?: string;
}
