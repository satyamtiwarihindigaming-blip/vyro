import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
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

// Main App Shell Layout
const MainLayout: React.FC = () => {
  const location = useLocation();
  const isStudioOrReel = location.pathname === '/create' || location.pathname === '/reels';

  return (
    <div className="flex min-h-screen bg-vyro-bg text-slate-100 selection:bg-vyro-primary selection:text-white">
      {/* Desktop Sticky Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isStudioOrReel && <Navbar />}
        <main className="flex-1 pb-16 md:pb-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Marketing */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/legal/privacy" element={<LegalPage />} />
        <Route path="/legal/terms" element={<LegalPage />} />

        {/* Authenticated Platform Shell */}
        <Route element={<MainLayout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/create" element={<StudioPage />} />
          <Route path="/direct" element={<DirectPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/:username" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
