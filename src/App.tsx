import React, { useState } from 'react';
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
import { ProgressView } from './views/ProgressView';
import { HadithView } from './views/HadithView';
import { ZakatView } from './views/ZakatView';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Menu, X } from 'lucide-react';
import { PWAInstallBanner } from './components/PWAInstallBanner';

const AppContent = () => {
  const { currentViewSurah, activeTab, isCleanMode, globalZoom, setCurrentViewSurah, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen } = useAppStore();

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
      className="min-h-screen bg-[var(--bg-main)] flex justify-center text-[var(--text-main)] w-full transition-colors duration-300 relative"
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row min-h-screen relative mx-auto">
        {/* Sidebar on Desktop */}
        <Sidebar />

        {/* Mobile Slide-Over Drawer with Quran Icon Header trigger */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
              />
              {/* Slide Drawer */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 left-0 w-[290px] bg-[var(--bg-surface)] z-50 md:hidden shadow-2xl flex flex-col"
              >
                <Sidebar isMobileDrawer={true} onCloseMobile={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Container */}
        <div className="flex-1 min-w-0 bg-[var(--bg-main)] min-h-screen relative shadow-2xl flex flex-col md:border-r md:border-[var(--border)] transition-all duration-300 w-full">
          {/* Mobile Header with Quran Icon to slide open menu bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--border)] sticky top-0 z-20 shadow-2xs min-h-[64px]">
            <div 
              onClick={() => {
                if (currentViewSurah !== null) setCurrentViewSurah(null);
                setActiveTab('home');
              }}
              className="flex items-center space-x-2.5 cursor-pointer group"
              title="হোম পেজে ফিরে যান"
            >
              <div className="w-10 h-10 aspect-square rounded-2xl bg-amber-500/10 border border-amber-500/25 p-1 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="আল-কুরআন" 
                  width="40" 
                  height="40" 
                  fetchPriority="high" 
                  decoding="async" 
                  className="w-full h-full object-contain aspect-square" 
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-[var(--text-main)] font-bengali tracking-tight block leading-tight">আল-কুরআনুল কারীম</span>
                <span className="text-[11px] text-[var(--text-muted)] font-semibold block leading-none font-bengali mt-0.5">নূর ও হেদায়েতের চিরন্তন আলো</span>
              </div>
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-[var(--text-main)] border border-[var(--border)] text-xs font-bold flex items-center gap-1.5 font-bengali shadow-2xs hover:bg-[var(--bg-main)] active:scale-95 transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[var(--text-muted)]" />
              <span>মেনুবার</span>
            </button>
          </div>

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
                  {activeTab === 'hadith' && <HadithView />}
                  {activeTab === 'zakat' && <ZakatView />}
                  {activeTab === 'duas' && <DuasView />}
                  {activeTab === 'bookmarks' && <BookmarksView />}
                  {activeTab === 'settings' && <SettingsView />}
                  {activeTab === 'tasbih' && <TasbihView />}
                  {activeTab === 'salah-tracker' && <SalahTrackerView />}
                  {activeTab === 'salah-guide' && <SalahGuideView />}
                  {activeTab === 'progress' && <ProgressView />}
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

