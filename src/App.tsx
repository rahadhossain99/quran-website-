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
      className="min-h-screen bg-[var(--bg-main)] flex justify-center text-[var(--text-main)] w-full transition-all duration-300"
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row min-h-screen relative">
        {/* Sidebar on Desktop (hidden on mobile) */}
        <Sidebar />

        {/* Content Container (adapted to work beside sidebar or take full mobile width) */}
        <div className="flex-1 max-w-3xl bg-[var(--bg-main)] min-h-screen relative shadow-2xl flex flex-col md:border-r md:border-[var(--border)] transition-all duration-300 md:ml-0 mx-auto w-full">
          <div className="flex-1 overflow-x-hidden pb-32 md:pb-6">
            {currentViewSurah === null ? (
              <>
                {activeTab === 'home' && <HomeView />}
                {activeTab === 'duas' && <DuasView />}
                {activeTab === 'bookmarks' && <BookmarksView />}
                {activeTab === 'settings' && <SettingsView />}
                {activeTab === 'tasbih' && <TasbihView />}
                {activeTab === 'salah-tracker' && <SalahTrackerView />}
                {activeTab === 'salah-guide' && <SalahGuideView />}
              </>
            ) : (
              <ReaderView />
            )}
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
