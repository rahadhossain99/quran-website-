import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../Store';
import { SurahInfo, SurahData } from '../types';
import { fetchAllSurahs, fetchSurahDetails } from '../api';
import { 
  X, Play, Pause, Search, Music, Volume2, SkipForward, SkipBack, 
  Sparkles, Heart, Headphones, RefreshCw, Eye, EyeOff, Check, AlertCircle, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CleanModeView = () => {
  const { 
    setIsCleanMode, playingSurah, playingAyahIndex, isPlaying, 
    togglePlay, playAyah, nextAyah, prevAyah, seekAyah, qari, setQari,
    arabicFontSize, setArabicFontSize, bengaliFontSize, setBengaliFontSize,
    favorites, toggleFavorite
  } = useAppStore();

  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDetailsId, setLoadingDetailsId] = useState<number | null>(null);
  
  // Dual layout modes: true = Focus Mode (hides panels, centers text), false = Full split view
  const [isFocusImmersive, setIsFocusImmersive] = useState(false);

  // Settings Tray Toggle
  const [showSettingsTray, setShowSettingsTray] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  // Mobile responsiveness tab selection: 'playlist' or 'player'
  const [mobileActiveTab, setMobileActiveTab] = useState<'playlist' | 'player'>(
    playingSurah ? 'player' : 'playlist'
  );

  // Auto-reloading surah when Qari transitions in active play
  const changeQariInCleanMode = async (newQari: string) => {
    setQari(newQari);
    if (playingSurah) {
      try {
        setLoadingDetailsId(playingSurah.number);
        const details = await fetchSurahDetails(playingSurah.number, newQari);
        playAyah(details, playingAyahIndex);
      } catch (err) {
        console.error('Failed to reload surah for new Qari', err);
      } finally {
        setLoadingDetailsId(null);
      }
    }
  };

  // Read all surahs on load
  useEffect(() => {
    fetchAllSurahs()
      .then((data) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch surahs inside clean mode', err);
        setLoading(false);
      });
  }, []);

  // Filter surahs dynamically (memoized to prevent lags on parent triggers)
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.toLowerCase();
    return surahs.filter((s) => {
      const eName = s.englishName?.toLowerCase() || '';
      const bName = s.name || '';
      const transName = s.englishNameTranslation?.toLowerCase() || '';
      return (
        eName.includes(q) ||
        bName.includes(q) ||
        transName.includes(q) ||
        s.number.toString() === q
      );
    });
  }, [surahs, searchQuery]);

  // Load and play selected surah
  const handlePlaySurah = async (surahNum: number) => {
    if (loadingDetailsId === surahNum) return;
    try {
      setLoadingDetailsId(surahNum);
      const details = await fetchSurahDetails(surahNum, qari);
      playAyah(details, 0);
      setMobileActiveTab('player');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const activeAyahObj = useMemo(() => {
    if (playingSurah && playingAyahIndex >= 0 && playingAyahIndex < playingSurah.ayahs.length) {
      return playingSurah.ayahs[playingAyahIndex];
    }
    return null;
  }, [playingSurah, playingAyahIndex]);

  // Autoscroll function for long text or translations
  const progressPercent = useMemo(() => {
    if (!playingSurah || playingAyahIndex < 0) return 0;
    return (playingAyahIndex / Math.max(1, playingSurah.ayahs.length - 1)) * 100;
  }, [playingSurah, playingAyahIndex]);

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Optimized background: Standard CSS gradients + hardware accelerated glowing orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-emerald-950/20 opacity-90" />
        <div 
          className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[130px] bg-emerald-500 transform-gpu"
          style={{ willChange: 'transform' }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full opacity-15 blur-[150px] bg-teal-500 transform-gpu"
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* Inject custom high performance pure-CSS animations inside style tags to prevent Framer Motion recalculation lag */}
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes cssWaveBounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .animate-subtle-pulse {
          animation: subtlePulse 4s ease-in-out infinite;
        }
        .css-wave-bar {
          transform-origin: bottom;
          will-change: transform;
          animation: cssWaveBounce 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4.5 border-b border-zinc-800/40 backdrop-blur-lg bg-zinc-950/70">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span className="font-sans font-black">ক্লিন মোড</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-sans tracking-wide uppercase px-2 py-0.5 rounded-lg font-black border border-emerald-500/20">
                Pure Focus
              </span>
            </h1>
            <p className="text-[9px] text-zinc-400 font-bold font-bengali uppercase tracking-wide">তিলাওয়াত শোনার একাগ্র প্ল্যাটফর্ম</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2.5">
          {/* Toggle Immersive Focus view */}
          <button
            onClick={() => setIsFocusImmersive(!isFocusImmersive)}
            className={`px-4 py-2 rounded-xl text-xs font-black font-bengali flex items-center space-x-1.5 transition-all outline-none border ${
              isFocusImmersive
                ? 'bg-emerald-500 text-black border-transparent shadow-[0_4px_20px_rgba(16,185,129,0.25)]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            {isFocusImmersive ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>ফোকাস মোড সক্রিয়</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>ফোকাস মোড</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsTray(!showSettingsTray)}
            className={`p-2.5 rounded-xl transition-all border outline-none flex items-center justify-center ${
              showSettingsTray
                ? 'bg-emerald-500 text-black border-transparent shadow-[0_4px_20px_rgba(16,185,129,0.2)]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
            }`}
            title="তিলাওয়াত ও ডিজাইন সেটিংস"
          >
            <Settings className={`w-4 h-4 ${isPlaying && showSettingsTray ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
          </button>

          {/* Quick Exit */}
          <button
            onClick={() => setIsCleanMode(false)}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all outline-none flex items-center justify-center"
            title="বের হোন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Animated Dropdown Settings Tray */}
      <AnimatePresence>
        {showSettingsTray && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative z-20 w-full overflow-hidden bg-zinc-950/95 border-b border-zinc-800/60 backdrop-blur-md"
          >
            <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-300 font-sans select-none">
              {/* Col 1: Qari Reciter Choice */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block font-sans">SELECT QARI / কারী নির্বাচন</span>
                <div className="grid grid-cols-1 gap-1.5 font-sans">
                  {[
                    { id: 'ar.alafasy', name: 'মিশারি আল-আফাসি (আদর্শ)' },
                    { id: 'ar.abdulbasitmurattal', name: 'আব্দুল বাসেত (মনোমুগ্ধকর)' },
                    { id: 'ar.mahermuaiqly', name: 'মাহের আল-মুআইকিলী (মক্কা)' },
                    { id: 'ar.minshawi', name: 'সিদ্দিক আল-মিনশাবি (শান্ত)' }
                  ].map((qOption) => {
                    const isSelected = qari === qOption.id;
                    return (
                      <button
                        key={qOption.id}
                        onClick={() => changeQariInCleanMode(qOption.id)}
                        className={`px-3 py-2 text-left rounded-xl border transition-all flex items-center justify-between font-sans ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
                        }`}
                      >
                        <span>{qOption.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Col 2: Font Zoom controllers */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block font-sans">FONT SIZE ADJUST / লেখা বড়-ছোট</span>
                
                {/* Arabic Size */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>আরби সাইজ (Arabic Sizing):</span>
                    <span className="font-bold text-white font-sans">{arabicFontSize}px</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))}
                      className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-805 flex items-center justify-center font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all text-white"
                    >
                      -
                    </button>
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full" style={{ width: `${((arabicFontSize - 20) / (48 - 20)) * 100}%` }} />
                    </div>
                    <button
                      onClick={() => setArabicFontSize(Math.min(48, arabicFontSize + 2))}
                      className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-805 flex items-center justify-center font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bengali Translation Size */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>অনুবাদ সাইজ (Translation Sizing):</span>
                    <span className="font-bold text-white font-sans">{bengaliFontSize}px</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBengaliFontSize(Math.max(12, bengaliFontSize - 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-805 flex items-center justify-center font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all text-white"
                    >
                      -
                    </button>
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full" style={{ width: `${((bengaliFontSize - 12) / (24 - 12)) * 100}%` }} />
                    </div>
                    <button
                      onClick={() => setBengaliFontSize(Math.min(24, bengaliFontSize + 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-805 flex items-center justify-center font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Col 3: Visual Translation toggler & quick tips */}
              <div className="space-y-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block font-sans mb-2">TRANSLATION OPTION / অনুবাদ সেটিং</span>
                  <div 
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between font-sans ${
                      showTranslation
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-450 hover:bg-zinc-850'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">বাংলা অনুবাদ প্রদর্শন</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">হিফয করার সময় বন্ধ রাখতে পারেন</p>
                    </div>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      showTranslation ? 'bg-emerald-500 border-transparent text-black' : 'border-zinc-700'
                    }`}>
                      {showTranslation && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-900/60 text-[10px] text-zinc-405 leading-relaxed font-bengali font-semibold">
                  💡 <b className="text-white">পরামর্শ:</b> একাগ্রতা বাড়ানোর জন্য <b className="text-emerald-400">ফোকাস মোড</b> বোতামটি চাপুন এবং শুধুমাত্র তিলাওয়াতেই মনোযোগ স্থাপন করুন।
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Switcher - only visible below lg screen when not in focus immersive mode */}
      {!isFocusImmersive && (
        <div className="lg:hidden relative z-10 flex px-6 py-2.5 bg-zinc-950/40 border-b border-zinc-900/60 justify-center">
          <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-xl w-full max-w-sm">
            <button
              onClick={() => setMobileActiveTab('playlist')}
              className={`flex-1 py-1.5 text-xs font-black font-bengali rounded-lg transition-all ${
                mobileActiveTab === 'playlist'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              সূরা তালিকা
            </button>
            <button
              onClick={() => setMobileActiveTab('player')}
              className={`flex-1 py-1.5 text-xs font-black font-bengali rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mobileActiveTab === 'player'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>তিলাওয়াত</span>
              {isPlaying && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area Layout with custom transition */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left column: Selected Playing Surah & Minimalist Player Dashboard */}
        <section 
          className={`flex-1 flex flex-col p-6 lg:p-8 justify-center items-center transition-all duration-500 ease-out ${
            mobileActiveTab === 'player' ? 'flex' : 'hidden lg:flex'
          } ${
            isFocusImmersive ? 'max-w-4xl mx-auto' : 'lg:border-r border-zinc-900/60'
          }`}
        >
          <div className="w-full max-w-lg flex flex-col items-center justify-between min-h-[75vh] my-auto">
            
            {/* Top Info Banner if focus mode */}
            {isFocusImmersive && playingSurah && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/5 px-4.5 py-1.5 rounded-full border border-emerald-500/10 text-[11px] font-black font-bengali text-emerald-400 mb-4"
              >
                আল্লাহর বাণীর প্রতি মনোযোগ দিন • সূরা {playingSurah.name} তিলাওয়াত চলছে
              </motion.div>
            )}

            {playingSurah ? (
              <div className="w-full text-center flex flex-col items-center flex-1 justify-center py-4">
                
                {/* Visual Audio Wave Ring with pure accelerated CSS transforms, zero React rendering overhead! */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-zinc-950/80 border border-zinc-850 flex items-center justify-center shadow-2xl overflow-hidden group mb-6 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full pointer-events-none" />
                  
                  {/* Outer delicate ring */}
                  <div className={`absolute inset-1 rounded-full border-2 border-dashed border-emerald-500/15 ${isPlaying ? 'animate-[spin_40s_linear_infinite]' : ''}`} />
                  
                  {/* Glowing core with Headphones */}
                  <div className="w-28 h-28 md:w-34 md:h-34 rounded-full bg-zinc-950 border border-zinc-850 flex flex-col items-center justify-center shadow-inner relative z-10">
                    <Headphones className={`w-8 h-8 text-emerald-400 transition-all ${isPlaying ? 'scale-110' : 'opacity-40'}`} />
                    <span className="text-[8px] text-zinc-500 font-black tracking-widest uppercase font-sans mt-2">SURAH NO</span>
                    <span className="text-lg md:text-xl font-black text-white font-sans">{playingSurah.number}</span>
                  </div>

                  {/* High performance hardware-accelerated CSS loading bars */}
                  {isPlaying && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end space-x-1 h-7 z-10 w-max pointer-events-none">
                      {[1.1, 0.7, 1.4, 0.9, 0.5, 1.2, 0.8, 1.5, 0.6].map((rate, i) => (
                        <div 
                          key={i}
                          className="w-1 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full css-wave-bar"
                          style={{
                            height: '100%',
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: `${rate}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Playing Surah Header details */}
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none mb-1 font-sans">
                  {playingSurah.englishName}
                </h2>
                <p className="text-xs font-bold text-emerald-400 font-bengali">
                  সূরা {playingSurah.name} ({playingSurah.revelationType === 'Meccan' ? 'মাক্কী' : 'মাদানী'})
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="text-[9px] text-zinc-500 font-black font-sans uppercase tracking-[0.2em] bg-zinc-900/40 px-2.5 py-1 rounded-full border border-zinc-850/80">
                    Ayah {playingAyahIndex + 1} of {playingSurah.ayahs.length}
                  </span>
                  
                  <div className="flex items-center space-x-1 bg-zinc-900/60 border border-zinc-850/80 px-2.5 py-0.5 rounded-full shadow-inner select-none text-[9px] text-zinc-400 font-bold font-bengali">
                    <span>যান:</span>
                    <input
                      type="text"
                      placeholder={`${playingAyahIndex + 1}`}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const eng = raw.replace(/[০-৯]/g, (digit) => {
                          const banglaDigits = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
                          return banglaDigits[digit as keyof typeof banglaDigits];
                        }).replace(/[^0-9]/g, '');
                        if (eng) {
                          const num = parseInt(eng, 10);
                          if (num >= 1 && num <= playingSurah.ayahs.length) {
                            seekAyah(num - 1);
                          }
                        }
                      }}
                      className="w-8 bg-transparent text-center font-extrabold text-emerald-400 focus:outline-none border-b border-emerald-500/20 font-sans text-[10px]"
                    />
                  </div>
                </div>

                {/* Subtitle / Bengali Audio Translation box (Minimalist & elegant, scrollable for long Ayahs) */}
                <div className="mt-5 w-full max-w-md bg-zinc-900/25 border border-zinc-900 rounded-[2rem] p-5 md:p-6 h-[220px] md:h-[280px] overflow-y-auto custom-scrollbar backdrop-blur-sm relative flex flex-col items-center">
                  <div className="sticky top-0 left-0 self-start w-8 h-8 rounded-full bg-zinc-900/55 border border-zinc-800/25 flex items-center justify-center text-[10px] text-emerald-500 font-sans backdrop-blur-sm shrink-0 mb-3 z-10 shadow-sm">
                     {playingAyahIndex + 1}
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {activeAyahObj ? (
                      <motion.div
                        key={playingAyahIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="text-center w-full"
                      >
                         <p 
                           className="font-arabic text-emerald-300 drop-shadow-sm mb-4 leading-relaxed font-semibold filter saturate-[1.2]" 
                           dir="rtl"
                           style={{ fontSize: `${arabicFontSize}px` }}
                         >
                           {activeAyahObj.arabicText}
                         </p>
                         {showTranslation && (
                           <p 
                             className="font-semibold font-bengali text-zinc-200 leading-relaxed max-w-sm mx-auto"
                             style={{ fontSize: `${bengaliFontSize}px` }}
                           >
                             {activeAyahObj.bengaliText}
                           </p>
                         )}
                      </motion.div>
                    ) : (
                      <p className="text-xs font-bold text-zinc-500 font-bengali">কুরআন নির্বাচন করুন...</p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Clean player controls */}
                <div className="w-full max-w-md mt-6">
                  {/* Slider Progress */}
                  <div className="mb-4">
                    <div className="relative flex items-center py-2">
                      <div 
                        className="absolute left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full pointer-events-none z-10" 
                        style={{ width: `${progressPercent}%` }} 
                      />
                      <input
                        type="range"
                        min="0"
                        max={playingSurah.ayahs.length - 1}
                        value={playingAyahIndex}
                        onChange={(e) => seekAyah(Number(e.target.value))}
                        className="w-full h-1 cursor-pointer outline-none bg-zinc-800 rounded-full accent-emerald-500 opacity-80 hover:opacity-100 transition-opacity z-20 relative"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-sans font-bold px-1 mt-1">
                      <span>সম্পন্ন: {Math.round(progressPercent)}%</span>
                      <span>মোট আয়াত: {playingSurah.ayahs.length}</span>
                    </div>
                  </div>

                  {/* Play Buttons */}
                  <div className="flex items-center justify-center space-x-6 mx-auto mt-2">
                    <button 
                      onClick={prevAyah} 
                      disabled={playingAyahIndex <= 0}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:text-white text-zinc-400 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button 
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/20 text-center"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>

                    <button 
                      onClick={nextAyah} 
                      disabled={playingAyahIndex >= playingSurah.ayahs.length - 1}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:text-white text-zinc-400 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center p-8 py-16 my-auto">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-500 animate-subtle-pulse">
                  <Headphones className="w-9 h-9 stroke-[1.2] text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-white font-bengali">কোন সূরা চালু নেই</h3>
                <p className="text-xs font-semibold text-zinc-400 font-bengali mt-2.5 max-w-xs leading-relaxed">
                  ডানপাশের তালিকা থেকে যেকোনো একটি সূরা নির্বাচন করুন। সম্পূর্ণ বিজ্ঞাপনমুক্ত এবং একাগ্র প্রশান্তির সাথে তিলাওয়াত উপভোগ করুন।
                </p>
                
                {isFocusImmersive && (
                  <button 
                    onClick={() => setIsFocusImmersive(false)}
                    className="mt-6 px-4.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-emerald-400 font-black font-bengali text-xs border border-zinc-800 transition-all shadow-sm"
                  >
                    সুরা তালিকা দেখান
                  </button>
                )}
              </div>
            )}

            <div className="text-[10px] text-zinc-650 font-sans tracking-widest uppercase opacity-40 font-black pt-4">
              AL-QURAN LISTEN PLATFORM
            </div>

          </div>
        </section>

        {/* Right column: Surahs selector list with high speed clean lists (Hidable) */}
        {!isFocusImmersive && (
          <section className={`w-full lg:w-[410px] flex-1 lg:flex-none h-full min-h-0 flex flex-col p-5 bg-zinc-950/20 lg:max-h-full overflow-hidden shrink-0 ${
            mobileActiveTab === 'playlist' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            {/* Header section of the Surah list panel */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase font-sans">SELECT PLAYLIST</span>
                <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-md font-sans border border-zinc-800">{filteredSurahs.length} SURAHS</span>
              </div>
              
              {/* Internal search filter */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="ইংরেজি/বাংলা নাম বা নম্বর লিখুন..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/70 border border-zinc-850/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-emerald-500/60 focus:outline-none transition-all placeholder-zinc-500 font-bengali"
                />
              </div>
            </div>

            {/* List container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-4">
              {loading ? (
                <div className="py-20 text-center text-zinc-500 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-xs font-bold font-bengali">কুরআনের সূরা তালিকা লোড হচ্ছে...</p>
                </div>
              ) : filteredSurahs.length > 0 ? (
                filteredSurahs.map((surah) => {
                  const isActive = playingSurah?.number === surah.number;
                  const isItemLoading = loadingDetailsId === surah.number;
                  const isFav = favorites.includes(surah.number);
                  
                  return (
                    <div
                      key={surah.number}
                      className={`flex items-center justify-between p-3 bg-zinc-900/30 border rounded-xl transition-all ${
                        isActive 
                          ? 'border-emerald-500/25 bg-emerald-950/15 shadow-[0_4px_15px_rgba(16,185,129,0.04)]' 
                          : 'border-zinc-900 hover:border-zinc-800/60 hover:bg-zinc-900/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        {/* Number badge */}
                        <span className="w-7.5 h-7.5 rounded-xl bg-zinc-900/60 text-zinc-400 border border-zinc-850 font-bold font-sans text-xs flex items-center justify-center flex-shrink-0">
                          {surah.number}
                        </span>
                        
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-extrabold text-white font-sans truncate">{surah.englishName}</h4>
                          <p className="text-[10px] text-zinc-400 font-bold font-bengali truncate mt-0.5">
                            সূরা {surah.name} • {surah.englishNameTranslation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {/* Toggle Quick Favorite button */}
                        <button 
                          onClick={() => toggleFavorite(surah.number)}
                          className={`p-2 rounded-xl transition-all border outline-none ${
                            isFav 
                              ? 'bg-rose-500/15 border-rose-500/20 text-rose-500' 
                              : 'bg-zinc-900/60 border-zinc-850 text-zinc-500 hover:text-rose-400 hover:bg-zinc-850'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        {/* Play Action button */}
                        <button
                          onClick={() => handlePlaySurah(surah.number)}
                          disabled={isItemLoading}
                          className={`px-3.5 py-2 text-[10px] font-black font-bengali rounded-xl flex items-center justify-center transition-all outline-none ${
                            isActive 
                              ? isPlaying 
                                ? 'bg-emerald-500 text-black font-black' 
                                : 'bg-zinc-850 text-emerald-400 font-extrabold hover:bg-zinc-800'
                              : 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-300 hover:text-white'
                          }`}
                        >
                          {isItemLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                          ) : isActive && isPlaying ? (
                            <div className="flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-ping" />
                              <span>চলছে</span>
                            </div>
                          ) : (
                            'শুনুন'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-zinc-500 flex flex-col items-center justify-center">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-zinc-650" />
                  <p className="text-xs font-bold font-bengali">কোন সূরা পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </section>
        )}

      </main>
    </div>
  );
};
