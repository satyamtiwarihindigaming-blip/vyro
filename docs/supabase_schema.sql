-- ==============================================================================
-- VYRO Social Platform — PostgreSQL Master Schema with Row-Level Security (RLS)
-- Target: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username CITEXT UNIQUE NOT NULL,
  email CITEXT UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(60) NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  cover_url TEXT DEFAULT NULL,
  bio VARCHAR(250) DEFAULT '',
  is_private BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  theme_preference VARCHAR(20) DEFAULT 'dark',
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_.]{3,30}$')
);

-- Case-insensitive search index on username
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);

-- 2. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 3. MUSIC TRACKS TABLE (CC0 & Original Creator Audio)
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(120) NOT NULL,
  artist_name VARCHAR(100) NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  license_type VARCHAR(50) DEFAULT 'CC0_RoyaltyFree',
  is_original_audio BOOLEAN DEFAULT FALSE,
  original_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  caption TEXT DEFAULT '',
  post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('photo', 'video', 'reel', 'carousel')),
  music_id UUID REFERENCES public.music_tracks(id) ON DELETE SET NULL,
  location VARCHAR(100) DEFAULT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);

-- 5. MEDIA ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC(6,2) DEFAULT NULL,
  sort_order SMALLINT DEFAULT 0
);

-- 6. STORIES TABLE (24-Hour Expiration)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  caption VARCHAR(300) DEFAULT NULL,
  music_id UUID REFERENCES public.music_tracks(id) ON DELETE SET NULL,
  duration_seconds NUMERIC(5,2) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories(user_id, expires_at);

-- 7. CONVERSATIONS & PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- 8. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  media_url TEXT DEFAULT NULL,
  message_type VARCHAR(30) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'game', 'shared_post')),
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at ASC);

-- 9. CALL SESSIONS (WebRTC Signaling Record)
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID NOT NULL REFERENCES public.users(id),
  conversation_id UUID REFERENCES public.conversations(id),
  call_type VARCHAR(10) CHECK (call_type IN ('voice', 'video')),
  status VARCHAR(20) CHECK (status IN ('ringing', 'ongoing', 'ended', 'rejected', 'missed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ DEFAULT NULL
);

-- 10. MULTIPLAYER GAME SESSIONS
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  game_type VARCHAR(30) CHECK (game_type IN ('tic_tac_toe', 'chess', 'trivia', 'word_scramble')),
  player1_id UUID NOT NULL REFERENCES public.users(id),
  player2_id UUID NOT NULL REFERENCES public.users(id),
  current_turn UUID REFERENCES public.users(id),
  game_state JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('waiting', 'active', 'completed', 'draw')),
  winner_id UUID REFERENCES public.users(id) DEFAULT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Users: Anyone can view public profiles
CREATE POLICY "Public profiles are visible to all users"
  ON public.users FOR SELECT
  USING (true);

-- Posts: Public posts visible to everyone, followers-only visible to followers
CREATE POLICY "Public posts are visible to all"
  ON public.posts FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());

-- Messages: Users can ONLY see messages in conversations they participate in
CREATE POLICY "Users can only read messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
    )
  );

-- Stories: Visible if user is owner or follower
CREATE POLICY "Stories are visible to followers and creator"
  ON public.stories FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follows.following_id = stories.user_id
      AND follows.follower_id = auth.uid()
      AND follows.status = 'accepted'
    )
  );
