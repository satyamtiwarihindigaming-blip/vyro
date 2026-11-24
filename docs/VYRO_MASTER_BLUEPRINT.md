# VYRO — Master System Architecture & Product Blueprint

> **Platform Vision:** A high-performance, design-first, mobile-optimized progressive web platform merging visual content creation, real-time messaging, WebRTC calling, creator audio, and multiplayer social games.

---

## 1. Executive Summary & Brand Identity

### 1.1 Brand Essence: What is VYRO?
VYRO is an original, fluid social media ecosystem engineered to eliminate algorithmic exhaustion and feature fragmentation. Where existing platforms force users to choose between passive video consumption (TikTok), aesthetic curation (Pinterest), private community spaces (Discord), ephemeral stories (Snapchat), and creator posts (Instagram), VYRO unifies these modalities within a unified, modern web architecture.

### 1.2 Design Philosophy & Aesthetics
* **Visual Language:** Cyber-organic minimalism with glassmorphism, fluid micro-interactions, vivid neon-violet and electric-cyan accents against deep obsidian dark mode (`#0B0E14`) and pearl-luxe light mode (`#F8FAFC`).
* **Ergonomics:** 100% thumb-reachable navigation for mobile screens, floating dynamic action bars, zero layout shifts (CLS < 0.05), and sub-100ms UI response times.
* **Original Identity:** Custom geometric "V-Orb" glyph with pulsing soundwave gradients, distinct from any existing social brand.

---

## 2. Competitor Analysis & Market Differentiation

| Feature / Metric | Instagram | TikTok | Snapchat | Discord | Pinterest | **VYRO** |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Media** | Photos / Reels | Short Video | Ephemeral Snaps | Text / Voice Channels | Image Boards | **Multi-format: Photos, Reels, Stories, Audio Drops, Boards** |
| **PWA / Web Support** | Crippled Web UI | Basic Web Player | Very Limited Web | Electron Desktop + Web | Web First | **First-class PWA (Mobile, Desktop, Tablet, Installable)** |
| **Real-time Voice/Video Calls** | Basic 1-on-1 | None | 1-on-1 / Groups | High Quality Rooms | None | **Native WebRTC (P2P + Mesh Calls in DMs & Groups)** |
| **Multiplayer In-Chat Games** | None | None | Deprecated Snap Games | Discord Activities | None | **Built-in Turn-Based & Realtime Games (Chess, Trivia, etc.)** |
| **Music Integration** | Licensed (Heavy Ads) | Licensed (Aggressive DMCA) | Snippets | Bot Streaming | None | **Original Creator Audio + Royalty-Free / CC0 Legal Library** |
| **Algorithm Transparency** | Black-box / Ad Heavy | Hyper-addictive Blackbox | Ephemeral Priority | Server chronological | Intent search | **Transparent Heuristic + Chronological Toggle + Full Privacy** |
| **Data Privacy & Ads** | High Tracking / Ad load | Extreme Data Harvesting | Ad heavy | Nitro Subscription | Heavy Shopping Ads | **Privacy-by-Design, Zero Spyware, RLS Enforced** |

---

## 3. Technology Stack Selection

### 3.1 Stack Breakdown & Justification
* **Frontend:** **React 19 / Next.js 15 (App Router) + TypeScript + Tailwind CSS**
  * *Why:* Universal responsive rendering, atomic component reusability, optimal bundle splitting, instant PWA manifest integration, and native TypeScript safety.
* **UI Components:** **Radix UI Primitives + Custom Tailwind & Framer Motion**
  * *Why:* Fully accessible (WAI-ARIA compliant), zero unnecessary design dependencies, total styling freedom without generic boilerplate.
* **Database & Auth:** **PostgreSQL 16 + Supabase (or Node.js + Prisma / Drizzle + Postgres)**
  * *Why:* Industrial-strength relational data integrity, Row Level Security (RLS) guaranteeing tenant isolation, built-in real-time change data capture (CDC), and robust auth with bcrypt/argon2 hashing.
* **Real-time Messaging:** **WebSockets (Supabase Realtime Channels or Socket.io)**
  * *Why:* Sub-30ms message delivery, typing indicators, active presence tracking, read receipts without database polling.
* **Real-time Voice & Video:** **WebRTC with Google STUN + Metered.ca TURN**
  * *Why:* Direct peer-to-peer encrypted media streams for minimal latency and zero media server costs on free tier.
* **Media Storage & CDN:** **Supabase Storage / Cloudinary (Free Tier)**
  * *Why:* Direct browser-to-bucket uploads with signed tokens, automated WebP/WebM format optimization, and global CDN caching.

---

## 4. Complete Database Design (PostgreSQL Schema)

### 4.1 Tables
1. **`users`**: id (UUID), username (CITEXT UNIQUE), email (CITEXT UNIQUE), password_hash, display_name, avatar_url, cover_url, bio, is_private, is_verified, theme_preference, created_at, updated_at.
2. **`follows`**: follower_id, following_id, status ('pending', 'accepted'), created_at.
3. **`posts`**: id, user_id, caption, post_type ('photo', 'video', 'reel', 'carousel'), music_id, location, likes_count, comments_count, shares_count, visibility ('public', 'followers', 'private'), created_at, updated_at.
4. **`media_items`**: id, post_id, media_url, thumbnail_url, media_type, width, height, duration_seconds, sort_order.
5. **`stories`**: id, user_id, media_url, media_type, caption, music_id, duration_seconds, created_at, expires_at (NOW() + 24 hours).
6. **`story_views`**: story_id, viewer_id, viewed_at.
7. **`conversations` & `conversation_participants`**: conversation id, type, name, last_read_at, roles.
8. **`messages`**: id, conversation_id, sender_id, content, media_url, message_type, reply_to_id, metadata, created_at.
9. **`calls`**: id, caller_id, conversation_id, call_type, status, started_at, ended_at.
10. **`music_tracks`**: id, title, artist_name, audio_url, cover_url, duration_seconds, license_type, is_original_audio, original_user_id.
11. **`game_sessions`**: id, conversation_id, game_type, player1_id, player2_id, current_turn, game_state (JSONB), status, winner_id.
12. **`notifications`**: id, recipient_id, actor_id, type, entity_id, is_read, created_at.
13. **`reports` & `blocks`**: reporting & safety mechanism.

---

## 5. Complete Page & Route Specifications
* `/`: Landing / Discover (Hero, live feed preview, PWA prompt)
* `/auth/login` & `/auth/signup`: Secure authentication & unique username validator
* `/feed`: Unified feed with "For You" & "Following" tabs
* `/reels`: 9:16 vertical full-height video reel player
* `/explore`: Visual search, hashtag trends, creator discovery
* `/create`: Studio camera capture, filter tray, sound picker, upload
* `/stories/[username]`: Immersive story progression viewer
* `/direct`: Inbox & conversation switcher
* `/direct/[id]`: Chat room with typing indicators, games, and call triggers
* `/call/[id]`: Native WebRTC voice & video room
* `/music`: Royalty-free soundtrack catalog & creator original audios
* `/games`: Casual multiplayer lobby (Tic-Tac-Toe, Chess, Trivia)
* `/[username]`: Customizable creator profile & grid/reels tabs
* `/settings`: Profile, privacy, security, theme, account deletion
* `/legal/privacy` & `/legal/terms`: Comprehensive legal and community policies

---

## 6. Architecture Highlights
* **In-Browser Camera:** Native HTML5 `MediaDevices.getUserMedia()` with front/back camera switching, canvas snapshot capture, client-side WebP compression, and EXIF stripping.
* **WebRTC Calling:** P2P media streams via Google STUN + Metered TURN fallback. Zero background activation.
* **Music Licensing:** 100% legal architecture prioritizing Original Creator Audio (UGC) and verified Creative Commons Zero (CC0) / Public Domain library.
* **AI Algorithm:** Transparent decay-weighted engagement formula:
  $$\text{Score} = \frac{(L \times 1) + (C \times 2) + (S \times 3) + (V \times 0.5) - (N \times 5)}{(\text{Hours} + 2)^{1.4}}$$
  With a guaranteed 1-click chronological toggle and no manipulative tracking.
* **Deployment:** Zero-downtime static/PWA frontend + Node.js backend configured for Render.com (`render.yaml`), backed by Supabase PostgreSQL and persistent object storage.
* **Cost Strategy:** Designed to operate at **$0.00/month** on free tiers during early validation, scaling cleanly to **$32 - $57/month** at 10,000+ active users.
