import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { SocialProvider } from './context/SocialContext';
import { AudioProvider } from './context/AudioContext';
import { CallProvider } from './context/CallContext';
import { FloatingAudioPlayer } from './components/music/FloatingAudioPlayer';
import { GlobalCallOverlay } from './components/calls/GlobalCallOverlay';
import { PermissionPromptModal } from './components/permissions/PermissionPromptModal';
import { AppBootSplash } from './components/common/AppBootSplash';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeSelectorModal } from './components/theme/ThemeSelectorModal';

import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FeedPage } from './pages/FeedPage';
import { ReelsPage } from './pages/ReelsPage';
import { ExplorePage } from './pages/ExplorePage';
import { StudioPage } from './pages/StudioPage';
import { DirectPage } from './pages/DirectPage';
import { MusicPage } from './pages/MusicPage';
import { GamesPage } from './pages/GamesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { PAGE_TRANSITION } from './lib/motion';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isStudioOrReel = location.pathname === '/create' || location.pathname === '/reels';

  return (
    <div className="relative flex min-h-screen text-slate-100 selection:bg-white/20 selection:text-white">
      {/* Living Silk Mesh Canvas (Apple visionOS Spatial Background) */}
      <div className="living-silk-mesh" aria-hidden="true">
        <div className="silk-orb-indigo" />
        <div className="silk-orb-violet" />
        <div className="silk-orb-rose" />
        <div className="silk-orb-cyan" />
      </div>
      <div className="silk-grain-overlay" aria-hidden="true" />

      {/* Floating Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:pl-[17rem] lg:pl-[19rem]">
        {!isStudioOrReel && <Navbar />}
        <motion.main
          key={location.pathname}
          initial={PAGE_TRANSITION.initial}
          animate={PAGE_TRANSITION.animate}
          exit={PAGE_TRANSITION.exit}
          transition={PAGE_TRANSITION.transition}
          className={`flex-1 pb-36 sm:pb-32 md:pb-16 overflow-x-hidden ${
            !isStudioOrReel ? 'pt-24 sm:pt-28 px-3 sm:px-6' : ''
          }`}
        >
          <Outlet />
        </motion.main>
      </div>

      {/* Global Overlays & Docks */}
      <FloatingAudioPlayer />
      <GlobalCallOverlay />
      <PermissionPromptModal />
      <MobileNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <SocialProvider>
                <AudioProvider>
                  <CallProvider>
                    <AppBootSplash />
                    <ThemeSelectorModal />
                    <BrowserRouter>
                      <Routes>
                        {/* Public Authentication & Legal */}
                        <Route path="/" element={<LandingPage defaultMode="login" />} />
                        <Route path="/login" element={<LandingPage defaultMode="login" />} />
                        <Route path="/signup" element={<LandingPage defaultMode="signup" />} />
                        <Route path="/legal/privacy" element={<LegalPage />} />
                        <Route path="/legal/terms" element={<LegalPage />} />

                        {/* Spatial App Shell */}
                        <Route element={<MainLayout />}>
                          <Route path="/feed" element={<FeedPage />} />
                          <Route path="/reels" element={<ReelsPage />} />
                          <Route path="/explore" element={<ExplorePage />} />
                          <Route path="/create" element={<StudioPage />} />
                          <Route path="/direct" element={<DirectPage />} />
                          <Route path="/music" element={<MusicPage />} />
                          <Route path="/games" element={<GamesPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/:username" element={<ProfilePage />} />
                        </Route>
                      </Routes>
                    </BrowserRouter>
                  </CallProvider>
                </AudioProvider>
              </SocialProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
};

export default App;
