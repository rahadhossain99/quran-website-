import React from 'react';
import { AppProvider, useAppStore } from './Store';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { HomeView } from './views/Home';
import { BookmarksView } from './views/Bookmarks';
import { SettingsView } from './views/Settings';
import { ReaderView } from './views/Reader';
import { TasbihView } from './views/Tasbih';
import { DuasView } from './views/Duas';
import { CleanModeView } from './views/CleanMode';
import { SalahTrackerView } from './views/SalahTracker';
import { SalahGuideView } from './views/SalahGuide';
import { motion, AnimatePresence } from 'motion/react';

const AppContent = () => {
  const { currentViewSurah, activeTab, isCleanMode, globalZoom } = useAppStore();

  const zoomStyle = {
    zoom: `${globalZoom}%`
  } as React.CSSProperties;

  if (isCleanMode) {
    return (
      <div style={zoomStyle} className="w-full h-full">
        <CleanModeView />
      </div>
    );
  }

  return (
    <div 
      style={zoomStyle}
      className="min-h-screen bg-[var(--bg-main)] flex justify-center text-[var(--text-main)] w-full transition-colors duration-300"
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row min-h-screen relative">
        {/* Sidebar on Desktop (hidden on mobile) */}
        <Sidebar />

        {/* Content Container (adapted for responsive desktop & mobile) */}
        <div className="flex-1 max-w-4xl lg:max-w-5xl bg-[var(--bg-main)] min-h-screen relative shadow-2xl flex flex-col md:border-r md:border-[var(--border)] transition-all duration-300 w-full mx-auto">
          <div className="flex-1 overflow-x-hidden pb-32 md:pb-6">
            <AnimatePresence mode="wait">
              {currentViewSurah === null ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full h-full"
                >
                  {activeTab === 'home' && <HomeView />}
                  {activeTab === 'duas' && <DuasView />}
                  {activeTab === 'bookmarks' && <BookmarksView />}
                  {activeTab === 'settings' && <SettingsView />}
                  {activeTab === 'tasbih' && <TasbihView />}
                  {activeTab === 'salah-tracker' && <SalahTrackerView />}
                  {activeTab === 'salah-guide' && <SalahGuideView />}
                </motion.div>
              ) : (
                <motion.div
                  key={`reader-${currentViewSurah}`}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full h-full"
                >
                  <ReaderView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {currentViewSurah === null && <Navigation />}
          <Player />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

