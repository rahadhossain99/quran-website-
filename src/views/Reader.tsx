import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../Store';
import { fetchSurahDetails } from '../api';
import { SurahData } from '../types';
import { ChevronLeft, Play, Pause, Bookmark, Search, X, Share2, ArrowUp, Music, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShareModal } from '../components/ShareModal';

export const ReaderView = () => {
  const { 
    currentViewSurah, setCurrentViewSurah, qari, favorites, toggleFavorite, 
    playingSurah, playingAyahIndex, isPlaying, playAyah, togglePlay, autoScrollAyah,
    arabicFontSize, bengaliFontSize, initialTargetAyahIndex, setInitialTargetAyahIndex,
    setArabicFontSize, setBengaliFontSize
  } = useAppStore();
  const [data, setData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [shareAyah, setShareAyah] = useState<{arabic: string, bengali: string, number: number} | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFontSettings, setShowFontSettings] = useState(false);

  // References for scroll to view
  const ayahRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track page scroll to show/hide "Back to Top"
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Convert Bengali numerals to English
  const convertBantoEng = (str: string) => {
    const banglaDigits = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
    return str.replace(/[০-৯]/g, (digit) => banglaDigits[digit as keyof typeof banglaDigits]);
  };

  // 1. Fetch Surah details when Surah or Qari changes
  useEffect(() => {
    if (currentViewSurah) {
      setLoading(true);
      fetchSurahDetails(currentViewSurah, qari).then(res => {
        setData(res);
        setLoading(false);
      }).catch(e => {
        console.error(e);
        setLoading(false);
      });
    }
  }, [currentViewSurah, qari]);

  // 2. Separate logic to handle scrolling and playing the target Ayah index ONCE when data is ready
  useEffect(() => {
    if (data && currentViewSurah === data.number && initialTargetAyahIndex !== null) {
      const idx = initialTargetAyahIndex;
      if (idx >= 0 && idx < data.ayahs.length) {
        // Play the target Ayah
        playAyah(data, idx);
        
        // Use a safe timeout to scroll
        const scrollTimer = setTimeout(() => {
          if (ayahRefs.current[idx]) {
            ayahRefs.current[idx]?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 500);

        // Clear the state so it won't scroll or play again
        setInitialTargetAyahIndex(null);

        return () => clearTimeout(scrollTimer);
      } else {
        setInitialTargetAyahIndex(null);
      }
    }
  }, [data, currentViewSurah, initialTargetAyahIndex, playAyah, setInitialTargetAyahIndex]);

  const handleBack = () => {
    if (window.history.state && window.history.state.surah !== null) {
      window.history.back();
    } else {
      setCurrentViewSurah(null);
    }
  };

  const isCurrentSurahPlaying = playingSurah?.number === data?.number && isPlaying;

  const filteredAyahs = data?.ayahs.filter(ayah => {
    if (!searchQuery.trim()) return true;
    const arabic = ayah.arabicText || '';
    const bengali = ayah.bengaliText || '';
    const english = ayah.text || '';
    return arabic.includes(searchQuery) || 
           bengali.includes(searchQuery) || 
           english.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  useEffect(() => {
    if (isCurrentSurahPlaying && playingAyahIndex >= 0 && ayahRefs.current[playingAyahIndex]) {
      if (autoScrollAyah) {
        ayahRefs.current[playingAyahIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [isCurrentSurahPlaying, playingAyahIndex, autoScrollAyah]);

  const handlePlayWholeSurah = () => {
    if (!data) return;
    if (playingSurah?.number === data.number) {
      togglePlay();
    } else {
      playAyah(data, 0);
    }
  };

  return (
    <div className="pb-32 font-bengali relative bg-[var(--bg-main)] min-h-screen">
      {/* Share Modal */}
      {shareAyah && (
        <ShareModal 
          isOpen={true} 
          onClose={() => setShareAyah(null)}
          arabicText={shareAyah.arabic}
          bengaliText={shareAyah.bengali}
          surahName={data?.englishName || ""}
          ayahNumber={shareAyah.number}
        />
      )}
      
      {/* Sticky Header ... */}
      <div className="bg-[var(--bg-surface)] bg-opacity-90 backdrop-blur-md sticky top-0 z-40 border-b border-[var(--border)] transition-colors">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors active:scale-95 flex-shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-sans text-[var(--text-main)] truncate max-w-[200px] md:max-w-md mx-4">
             {data?.englishName || "লোড হচ্ছে..."}
          </h1>
          <div className="w-10 flex-shrink-0"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {loading || !data ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-14 h-14 border-4 border-[var(--primary-soft)] border-t-[var(--primary)] rounded-full animate-spin mb-4" />
            <p className="text-[var(--primary)] font-bold">আয়াত প্রস্তুত করা হচ্ছে...</p>
          </div>
        ) : (
          <>
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] rounded-[2.5rem] p-8 md:p-10 mb-8 text-center shadow-lg relative overflow-hidden"
            >
               <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSIjMzRDMzU5IiBkPSJNNTAgMEw2MS44IDM4LjJMMTAwIDUwTDYxLjggNjEuOEw1MCAxMDBMMzguMiA2MS44TDAgNTBMMzguMiAzOC4yWiIvPjwvc3ZnPg==')] bg-cover" />
               <div className="flex justify-between items-start mb-6 relative z-10">
                 <span className="bg-black/20 text-white text-[12px] font-bold px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm tracking-wide">
                   {data.revelationType} • {data.numberOfAyahs} আয়াত
                 </span>
                 <button 
                   onClick={() => toggleFavorite(data.number)}
                   className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
                 >
                   <Bookmark className={`w-5 h-5 ${favorites.includes(data.number) ? 'fill-white text-white' : 'text-white'}`} />
                 </button>
               </div>
               
               <h2 className="text-5xl font-bold font-arabic text-[var(--accent)] mb-4 drop-shadow-lg relative z-10 leading-normal" dir="rtl">{data.name}</h2>
               <h3 className="text-3xl font-bold text-white font-sans relative z-10 tracking-tight">{data.englishName}</h3>
               <p className="text-sm font-bold text-[var(--primary-soft)] mb-8 relative z-10">{data.englishNameTranslation}</p>
               
               <button 
                 onClick={handlePlayWholeSurah}
                 className="w-full bg-white text-[var(--primary)] hover:scale-[1.02] active:scale-95 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative z-10 gap-3"
               >
                 {isCurrentSurahPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                 <span>{isCurrentSurahPlaying ? 'তেলাওয়াত পজ করুন' : 'সম্পূর্ণ তেলাওয়াত শুরু করুন'}</span>
               </button>
            </motion.div>

            {data.number !== 9 && data.number !== 1 && (
               <div className="text-center py-6 mb-8 bg-[var(--bg-surface)] shadow-sm relative overflow-hidden rounded-[2rem] border border-[var(--border)]">
                 <p className="text-arabic font-arabic text-[var(--primary)] drop-shadow-sm text-center">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
               </div>
            )}

            {/* Search Bar Segment */}
            <div className="mb-6 sticky top-2 z-30 grid grid-cols-1 md:grid-cols-12 gap-3 pb-2">
               <div className="md:col-span-6 bg-[var(--bg-surface)] p-2 rounded-[1.5rem] shadow-sm border border-[var(--border)] flex items-center w-full">
                  <div className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                    <Search className="w-5 h-5 pointer-events-none" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="আয়াত খুঁজুন (বাংলা বা আরবি)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-[var(--text-main)] placeholder-[var(--text-muted)] w-full py-2"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchQuery('')}
                        className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
               </div>
               <div className="md:col-span-3 bg-[var(--bg-surface)] p-2 rounded-[1.5rem] shadow-sm border border-[var(--border)] flex items-center justify-between px-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] whitespace-nowrap font-bengali">যান:</span>
                  <div className="flex items-center space-x-1.5 flex-1 justify-end">
                     <input
                        type="text"
                        placeholder={`১-${data.numberOfAyahs}`}
                        onChange={(e) => {
                           const raw = e.target.value;
                           const eng = convertBantoEng(raw).replace(/[^0-9]/g, '');
                           if (eng) {
                              const num = parseInt(eng, 10);
                              if (num >= 1 && num <= data.numberOfAyahs) {
                                 const index = num - 1;
                                 if (ayahRefs.current[index]) {
                                    ayahRefs.current[index]?.scrollIntoView({
                                       behavior: 'smooth',
                                       block: 'center',
                                    });
                                 }
                              }
                           }
                        }}
                        className="w-12 bg-[var(--bg-main)] text-center text-xs font-black text-[var(--primary)] py-1.5 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-sans"
                     />
                     <span className="text-xs font-bold text-[var(--text-muted)] font-bengali">নম্বর</span>
                  </div>
               </div>

               {/* Font Scaling Action Toggle Button */}
               <button
                  onClick={() => setShowFontSettings(!showFontSettings)}
                  className={`md:col-span-3 bg-[var(--bg-surface)] p-3 rounded-[1.5rem] shadow-sm border transition-all active:scale-95 flex items-center justify-center space-x-1.5 ${
                     showFontSettings 
                       ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-soft)] bg-opacity-30' 
                       : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)]'
                  }`}
                  title="লেখা বড়-ছোট করুন"
               >
                  <Sliders className="w-4 h-4" />
                  <span className="text-xs font-bold font-bengali">অক্ষরের মাপ</span>
               </button>
            </div>

            {/* Collapsible Font Size Settings panel */}
            <AnimatePresence>
               {showFontSettings && (
                  <motion.div
                     initial={{ height: 0, opacity: 0, y: -10 }}
                     animate={{ height: 'auto', opacity: 1, y: 0 }}
                     exit={{ height: 0, opacity: 0, y: -10 }}
                     transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                     className="overflow-hidden mb-6 z-20 relative"
                  >
                     <div className="bg-[var(--bg-surface)] p-5 md:p-6 rounded-[2rem] border border-[var(--border)] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                        {/* Arabic Font Controller */}
                        <div className="space-y-2.5">
                           <div className="flex justify-between items-center px-1">
                              <span className="text-xs font-extrabold text-[var(--text-main)] font-bengali">আরবি হরফের আকার:</span>
                              <span className="text-xs font-black text-[var(--primary)] font-sans bg-[var(--bg-main)] px-2.5 py-1 rounded-lg border border-[var(--border)]">{arabicFontSize}px</span>
                           </div>
                           <div className="flex items-center space-x-4">
                              <button 
                                 onClick={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))}
                                 className="w-10 h-10 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] font-bold text-lg border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors active:scale-90"
                              >
                                 -
                              </button>
                              <input 
                                 type="range"
                                 min="20"
                                 max="60"
                                 value={arabicFontSize}
                                 onChange={(e) => setArabicFontSize(Number(e.target.value))}
                                 className="flex-1 accent-[var(--primary)] bg-[var(--border)] h-1 rounded-lg appearance-none cursor-pointer"
                              />
                              <button 
                                 onClick={() => setArabicFontSize(Math.min(60, arabicFontSize + 2))}
                                 className="w-10 h-10 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] font-bold text-lg border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors active:scale-90"
                              >
                                 +
                              </button>
                           </div>
                        </div>

                        {/* Bengali Font Controller */}
                        <div className="space-y-2.5">
                           <div className="flex justify-between items-center px-1">
                              <span className="text-xs font-extrabold text-[var(--text-main)] font-bengali">বাংলা তরজমার আকার:</span>
                              <span className="text-xs font-black text-[var(--primary)] font-sans bg-[var(--bg-main)] px-2.5 py-1 rounded-lg border border-[var(--border)]">{bengaliFontSize}px</span>
                           </div>
                           <div className="flex items-center space-x-4">
                              <button 
                                 onClick={() => setBengaliFontSize(Math.max(12, bengaliFontSize - 1))}
                                 className="w-10 h-10 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] font-bold text-lg border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors active:scale-90"
                              >
                                 -
                              </button>
                              <input 
                                 type="range"
                                 min="12"
                                 max="32"
                                 value={bengaliFontSize}
                                 onChange={(e) => setBengaliFontSize(Number(e.target.value))}
                                 className="flex-1 accent-[var(--primary)] bg-[var(--border)] h-1 rounded-lg appearance-none cursor-pointer"
                              />
                              <button 
                                 onClick={() => setBengaliFontSize(Math.min(32, bengaliFontSize + 1))}
                                 className="w-10 h-10 rounded-xl bg-[var(--bg-main)] text-[var(--text-main)] font-bold text-lg border border-[var(--border)] hover:bg-[var(--bg-surface)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors active:scale-90"
                              >
                                 +
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="space-y-6">
              {filteredAyahs.map((ayah) => {
                const index = ayah.numberInSurah - 1;
                const isActive = playingSurah?.number === data.number && playingAyahIndex === index;
                const isMatchHighlight = searchQuery.length > 0;
                
                return (
                  <motion.div 
                    key={ayah.numberInSurah}
                    ref={el => ayahRefs.current[index] = el}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 1) }}
                    className={`rounded-[2rem] p-6 md:p-8 border ${
                      isMatchHighlight
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] shadow-[0_10px_20px_rgba(245,158,11,0.1)]'
                        : isActive 
                          ? 'bg-gradient-to-br from-[var(--bg-surface)] to-[var(--primary-soft)] border-[var(--primary)] shadow-[0_15px_35px_rgba(16,185,129,0.2)] scale-[1.02]' 
                          : 'bg-[var(--bg-surface)] border-[var(--border)] shadow-sm'
                    } relative transition-all duration-500`}
                  >
                    {isActive && (
                       <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-transparent via-[var(--primary)] to-transparent rounded-l-[2rem]" />
                    )}

                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)] opacity-80">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] text-[var(--primary)] text-sm font-bold flex items-center justify-center border border-[var(--border)] shadow-inner flex-shrink-0">
                         {ayah.numberInSurah}
                       </div>
                       
                       <div className="flex items-center space-x-2">
                         <button 
                           onClick={() => setShareAyah({ arabic: ayah.arabicText, bengali: ayah.bengaliText, number: ayah.numberInSurah })}
                           className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--primary)] border border-transparent hover:border-[var(--border)] transition-all"
                           title="আয়াত শেয়ার করুন"
                         >
                           <Share2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => {
                             if (isActive && isPlaying) togglePlay();
                             else playAyah(data, index);
                           }}
                           className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                             isActive 
                               ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110' 
                               : 'bg-[var(--bg-main)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)]'
                           }`}
                         >
                           {isActive && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                         </button>
                       </div>
                    </div>

                    <div className="text-right mb-6 bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border)] w-full overflow-x-auto min-h-max">
                      <p className="font-arabic text-[var(--text-main)] drop-shadow-sm min-h-full" dir="rtl" style={{ fontSize: `${arabicFontSize}px`, lineHeight: '1.8' }}>
                        {ayah.arabicText} <span className="text-[var(--primary)] opacity-70 mx-2 font-sans inline-flex items-center" style={{ fontSize: '0.6em' }}>۝</span>
                      </p>
                    </div>

                    <div className="space-y-4 px-2 w-full min-h-max">
                       <p className="font-bold text-[var(--text-main)] font-bengali min-h-full" style={{ fontSize: `${bengaliFontSize}px`, lineHeight: '1.8' }}>
                         {ayah.bengaliText}
                       </p>
                       <div className="bg-[var(--bg-main)] rounded-xl p-4 border border-[var(--border)] mt-2">
                         <h4 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-2 font-sans opacity-80">উচ্চারণ</h4>
                         <p className="font-semibold text-[var(--text-muted)] font-sans text-sm">{ayah.transliterationText}</p>
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Action control widgets */}
      <AnimatePresence>
        {(showScrollTop || isCurrentSurahPlaying) && (
          <div className="fixed bottom-24 right-5 md:right-8 z-50 flex flex-col space-y-3 items-end pointer-events-none">
            {isCurrentSurahPlaying && (
              <motion.button
                key="playing-ayah-btn"
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                onClick={() => {
                  if (playingAyahIndex >= 0 && ayahRefs.current[playingAyahIndex]) {
                    ayahRefs.current[playingAyahIndex]?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }
                }}
                className="pointer-events-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-1 hover:scale-105 active:scale-95 transition-all font-bengali"
                title="চলছে এমন আয়াতে যান"
              >
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
                </span>
                <Music className="w-3.5 h-3.5 text-white" />
                <span>তিলাওয়াতকৃত আয়াতে যান ({playingAyahIndex + 1})</span>
              </motion.button>
            )}
            
            {showScrollTop && (
              <motion.button
                key="scroll-top-btn"
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 15 }}
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
                className="pointer-events-auto bg-[var(--bg-surface)] hover:bg-[var(--bg-main)] border border-[var(--border)] text-[var(--primary)] p-3.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                title="উপরে যান"
              >
                <ArrowUp className="w-5 h-5 font-bold" />
              </motion.button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

