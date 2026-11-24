# VYRO — The Creative Social Universe 🚀

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/satyamtiwarihindigaming-blip/vyro)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple)

VYRO is a fluid, modern, multi-device social platform designed to compete with legacy social networks while eliminating algorithmic burnout and feature fragmentation. Built with an original cyberpunk/neon aesthetic, responsive mobile-first UX, real-time messaging, native WebRTC calling, in-browser camera capture, legal royalty-free audio, and casual multiplayer games.

---

## ⚡ Core Features

- 📱 **Universal Responsive PWA:** Flawless experience on Android, iOS, Windows, macOS, and Linux. Installable directly to home screen.
- 🎨 **Lovable-Inspired Aesthetic:** Fluid dark/light glassmorphic UI with vibrant neon accents (`#8B5CF6`, `#EC4899`, `#06B6D4`).
- 🔐 **Real Authentication & Unique Usernames:** Case-insensitive unique handle reservations, secure password hashing, and Row-Level Security (RLS).
- 📸 **Studio Camera & Instant Uploads:** Direct browser camera viewfinder (front/rear flip), client-side WebP compression, canvas filters, and EXIF stripping.
- 🎞️ **Multi-Format Feeds & 9:16 Reels:** Photos, carousels, full-screen vertical reels, and 24-hour disappearing stories.
- 💬 **Instant Real-Time Messaging:** Sub-30ms chat delivery, typing indicators, active presence, and emoji reactions.
- 📞 **WebRTC Voice & Video Calling:** Encrypted peer-to-peer audio/video rooms with Google STUN + Metered TURN NAT traversal.
- 🎵 **100% Legal Music Hub:** Original Creator Audio (UGC) + Creative Commons Zero (CC0) royalty-free soundtrack catalog.
- 🎮 **Multiplayer In-Chat Games:** Play Tic-Tac-Toe, Chess, and Trivia in real-time without leaving your conversation.
- 🤖 **Ethical AI Recommendations:** Engagement-weighted decay model with an instant 1-click chronological feed toggle.

---

## 🛠️ Tech Stack

- **Frontend:** React 18 / 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Database & Auth:** PostgreSQL 16 + Supabase (RLS protected)
- **Real-Time & Calls:** WebSockets, WebRTC (RTCPeerConnection)
- **Storage & CDN:** Supabase Storage / Cloudinary (S3-compatible)
- **Hosting:** Render.com (Web Service / Static Site)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ installed
- Git installed

### 2. Clone and Install
```bash
git clone https://github.com/YOUR_USERNAME/vyro.git
cd vyro
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials (available on the free tier at [supabase.com](https://supabase.com)).

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌐 Deployment to Render.com

1. Push your code to a GitHub repository.
2. Log in to [Render.com](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start` or static publishing of `dist`
5. Add your environment variables in the Render Dashboard.
6. Deploy! Render will automatically provision HTTPS and continuous deployment.

---

## 📄 License
MIT © VYRO Platform.
