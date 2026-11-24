import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import { AudioProvider } from './context/AudioContext';
import { CallProvider } from './context/CallContext';
import { FloatingAudioPlayer } from './components/music/FloatingAudioPlayer';
import { GlobalCallOverlay } from './components/calls/GlobalCallOverlay';
import { PermissionPromptModal } from './components/permissions/PermissionPromptModal';

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

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isStudioOrReel = location.pathname === '/create' || location.pathname === '/reels';

  return (
    <div className="flex min-h-screen bg-vyro-bg text-slate-100 selection:bg-vyro-primary selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {!isStudioOrReel && <Navbar />}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 pb-20 md:pb-8 overflow-x-hidden"
        >
          <Outlet />
        </motion.main>
      </div>

      <FloatingAudioPlayer />
      <GlobalCallOverlay />
      <PermissionPromptModal />
      <MobileNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocialProvider>
        <AudioProvider>
          <CallProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Instagram-style Login / Signup & Legal */}
                <Route path="/" element={<LandingPage defaultMode="login" />} />
                <Route path="/login" element={<LandingPage defaultMode="login" />} />
                <Route path="/signup" element={<LandingPage defaultMode="signup" />} />
                <Route path="/legal/privacy" element={<LegalPage />} />
                <Route path="/legal/terms" element={<LegalPage />} />

                {/* Platform Shell */}
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
    </AuthProvider>
  );
};

export default App;
