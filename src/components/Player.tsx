import { useAppStore } from '../Store';
import { motion, AnimatePresence, PanInfo, useMotionValue } from 'motion/react';
import { Play, Pause, ChevronUp, ChevronDown, Repeat, SkipForward, SkipBack, Share2, List, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ShareModal } from './ShareModal';

export const Player = () => {
  const { playingSurah, playingAyahIndex, isPlaying, togglePlay, stopPlayback, nextAyah, prevAyah, seekAyah, audioProgress, currentViewSurah, setCurrentViewSurah, repeatMode, setRepeatMode, arabicFontSize, bengaliFontSize } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDraggingBubble, setIsDraggingBubble] = useState(false);
  const [isOverDismiss, setIsOverDismiss] = useState(false);
  const [showDismissZone, setShowDismissZone] = useState(false);

  // Persistent bubble position
  const bubbleX = useMotionValue(0);
  const bubbleY = useMotionValue(0);
  const bubbleRotate = useMotionValue(0);
  const bubbleScale = useMotionValue(1);

  // Initial position for the bubble (bottom right)
  useEffect(() => {
    // Set a good initial position on mount if it's 0
    if (bubbleX.get() === 0 && bubbleY.get() === 0) {
      bubbleX.set(window.innerWidth - 100);
      bubbleY.set(window.innerHeight - 150);
    }
  }, [bubbleX, bubbleY]);

  // Hardware mobile back button for Expanded Player
  useEffect(() => {
    if (expanded) {
      window.history.pushState({ modal: 'player' }, '');
      const handlePopState = () => {
        setExpanded(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [expanded]);

  if (!playingSurah || playingAyahIndex === -1) return null;

  const currentAyah = playingSurah.ayahs[playingAyahIndex];

  const handleShare = async () => {
    setShowShare(true);
  };

  const toggleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('ayah');
    else if (repeatMode === 'ayah') setRepeatMode('surah');
    else setRepeatMode('none');
  };

  const handleCloseExpanded = () => {
    window.history.back();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    // Organic rotation based on velocity
    bubbleRotate.set(info.velocity.x * 0.08);
    bubbleScale.set(1.1); // Slightly larger while dragging

    // Only show dismiss zone if dragged to the bottom half
    if (info.point.y > window.innerHeight * 0.6) {
      setShowDismissZone(true);
    } else {
      setShowDismissZone(false);
    }

    if (info.point.y > window.innerHeight - 150) {
      setIsOverDismiss(true);
    } else {
      setIsOverDismiss(false);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDraggingBubble(false);
    setIsOverDismiss(false);
    setShowDismissZone(false);
    bubbleRotate.set(0); 
    bubbleScale.set(1);
    
    // If dragged near the bottom of the screen
    if (info.point.y > window.innerHeight - 150) {
      setIsHidden(false);
      stopPlayback();
      // Reset position
      bubbleX.set(window.innerWidth - 100);
      bubbleY.set(window.innerHeight - 150);
    }
  };

  if (isHidden) return (
    <>
      <motion.div 
        drag
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={{ 
          left: 10, 
          right: window.innerWidth - 70, 
          top: 10, 
          bottom: window.innerHeight - 70 
        }}
        style={{ x: bubbleX, y: bubbleY, rotate: bubbleRotate, scale: bubbleScale, position: 'fixed', left: 0, top: 0 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isDraggingBubble ? (isOverDismiss ? 0.7 : 1.1) : 1, 
          opacity: 1 
        }}
        onDragStart={() => setIsDraggingBubble(true)}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="z-[100] cursor-grab active:cursor-grabbing"
      >
          <button 
            onClick={() => setIsHidden(false)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/20 active:scale-95 transition-transform touch-none"
            title="প্লেয়ার ফিরে আনুন"
          >
            <motion.div 
              animate={{ 
                rotate: isDraggingBubble ? 0 : [0, -10, 10, 0] 
              }} 
              transition={{ repeat: Infinity, duration: 4 }}
            >
              {isPlaying ? (
                 <div className="flex items-center space-x-1">
                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-white rounded-full" />
                    <motion.div animate={{ height: [5, 10, 5] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-white rounded-full" />
                 </div>
              ) : <Play className="w-8 h-8 fill-current ml-1" />}
            </motion.div>
          </button>
      </motion.div>

      <AnimatePresence>
        {showDismissZone && (
          <motion.div
            initial={{ y: 150, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 150, opacity: 0, scale: 0.5 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center pointer-events-none"
          >
            <motion.div 
              animate={{ 
                scale: isOverDismiss ? 1.5 : 1,
                backgroundColor: isOverDismiss ? 'rgb(239, 68, 68)' : 'rgba(31, 41, 55, 0.4)'
              }}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl backdrop-blur-xl border-4 border-white/20"
            >
              <X className={`w-10 h-10 transition-colors ${isOverDismiss ? 'text-white' : 'text-white/40'}`} />
            </motion.div>
            <motion.span 
              animate={{ opacity: isOverDismiss ? 1 : 0.6 }}
              className={`text-[10px] mt-4 font-black px-4 py-2 rounded-xl backdrop-blur-md transition-all uppercase tracking-[0.2em] ${isOverDismiss ? 'bg-red-500 text-white shadow-xl' : 'bg-black/50 text-white/50'}`}>
              {isOverDismiss ? 'ছেড়ে দিন মুছতে' : 'বন্ধ করতে নিচে আনুন'}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {!expanded && (
          <motion.div
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
               if (Math.abs(info.offset.x) > 100) {
                 setIsHidden(true);
               }
            }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
            className={`fixed ${currentViewSurah === null ? 'bottom-24' : 'bottom-6'} left-4 right-4 md:left-auto md:right-auto md:w-full md:max-w-xl md:left-1/2 md:-translate-x-1/2 z-50`}
            onClick={() => setExpanded(true)}
          >
            {/* Mini Player */}
            <div className="glass-panel rounded-3xl p-3 flex items-center border border-[var(--border)] shadow-2xl cursor-grab active:cursor-grabbing overflow-hidden group">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[var(--primary)] opacity-40 group-hover:w-2 transition-all" />
              
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white overflow-hidden shadow-inner flex-shrink-0">
                {isPlaying ? (
                  <div className="flex items-end justify-center space-x-1 h-5">
                    <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 bg-white rounded-full"></motion.div>
                    <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-0.5 bg-white rounded-full"></motion.div>
                    <motion.div animate={{ height: [6, 14, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-white rounded-full"></motion.div>
                  </div>
                ) : (
                  <span className="font-bold text-sm">{currentAyah.numberInSurah}</span>
                )}
              </div>
              <div className="flex-1 px-4 truncate">
                <div className="flex items-center space-x-2 truncate">
                  <h4 className="font-bold text-sm font-sans text-[var(--text-main)] truncate">{playingSurah.englishName}</h4>
                  <span className="w-1 h-1 bg-[var(--text-muted)] rounded-full opacity-30" />
                  <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-tight">Ayah {currentAyah.numberInSurah}</p>
                </div>
                <div className="mt-1 h-1 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-[var(--primary)]" 
                     style={{ width: `${audioProgress * 100}%` }}
                    />
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="w-10 h-10 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center border border-[var(--primary)] border-opacity-10 shadow-sm active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:translate-x-1 transition-transform">
                  <ChevronUp className="w-6 h-6 rotate-90 opacity-20" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[var(--bg-surface)] flex flex-col md:max-w-2xl md:mx-auto md:border-x md:border-[var(--border)] md:shadow-2xl"
          >
            <div className="pt-10 pb-4 px-6 flex items-center justify-between border-b border-[var(--border)] border-opacity-50">
              <button onClick={handleCloseExpanded} className="w-10 h-10 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border)] transition-all active:scale-95">
                <ChevronDown className="w-6 h-6 text-[var(--text-main)]" />
              </button>
              <div className="text-center">
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">Now Playing</span>
                <h3 className="text-lg font-bold font-sans tracking-tight">{playingSurah.englishName}</h3>
              </div>
              <button onClick={handleShare} className="w-10 h-10 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border)] transition-all active:scale-95">
                <Share2 className="w-5 h-5 text-[var(--text-main)]" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start px-6 py-8 overflow-y-auto custom-scrollbar relative">
               <div className="absolute w-64 h-64 bg-[var(--primary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
               <div className="bg-[var(--bg-main)] p-8 md:p-12 rounded-3xl w-full text-center relative shadow-sm border border-[var(--border)] border-opacity-50 mb-8 min-h-max flex-shrink-0">
                 <p className="text-arabic text-[var(--text-main)] drop-shadow-sm font-arabic min-h-full" dir="rtl" style={{ fontSize: `${arabicFontSize}px`, lineHeight: '1.8' }}>
                   {currentAyah.arabicText} <span className="text-[var(--primary)] mx-2" style={{ fontSize: '0.6em' }}>۝</span>
                 </p>
               </div>
               <p className="text-translation text-[var(--text-muted)] font-bold text-center font-bengali px-2 leading-relaxed min-h-max flex-shrink-0" style={{ fontSize: `${bengaliFontSize}px`, lineHeight: '1.7' }}>
                 {currentAyah.bengaliText}
               </p>
            </div>

            <div className="px-6 pb-12 pt-6 bg-gradient-to-t from-[var(--bg-surface)] to-transparent relative z-20">
              {/* Ayah seek slider container */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] mb-3">
                  <span>আয়াত <span className="text-[var(--primary)]">{currentAyah.numberInSurah}</span></span>
                  <span>মোট {playingSurah.ayahs.length}</span>
                </div>
                
                {/* Advanced slider range input replacing the generic non-interactive bar */}
                <div className="relative flex items-center">
                   <div 
                     className="absolute left-0 h-[6px] bg-[var(--primary)] rounded-full pointer-events-none z-0" 
                     style={{ width: `${(playingAyahIndex / Math.max(1, playingSurah.ayahs.length - 1)) * 100}%` }} 
                   />
                   <input
                     type="range"
                     min="0"
                     max={playingSurah.ayahs.length - 1}
                     value={playingAyahIndex}
                     onChange={(e) => seekAyah(Number(e.target.value))}
                     className="absolute w-full z-10"
                   />
                   <div className="w-full h-[6px] bg-[var(--border)] rounded-full -z-10" />
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <button onClick={toggleRepeat} className={`transition-colors p-3 relative ${repeatMode !== 'none' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--primary)]'}`}>
                  <Repeat className="w-6 h-6" />
                  {repeatMode === 'ayah' && <span className="absolute top-2 right-2 text-[8px] font-bold bg-[var(--bg-main)] px-0.5 rounded">1</span>}
                </button>

                <button onClick={prevAyah} className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--bg-main)] hover:text-[var(--primary)] transition-colors active:scale-90">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>

                <button onClick={nextAyah} className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--bg-main)] hover:text-[var(--primary)] transition-colors active:scale-90">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                <button 
                  onClick={() => {
                    setExpanded(false);
                    setCurrentViewSurah(playingSurah.number);
                  }}
                  className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-3"
                >
                  <List className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        arabicText={currentAyah.arabicText} 
        bengaliText={currentAyah.bengaliText} 
        surahName={playingSurah.englishName} 
        ayahNumber={currentAyah.numberInSurah} 
      />
    </>
  );
};
