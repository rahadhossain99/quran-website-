import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAppStore } from '../Store';
import { SurahInfo, SurahData } from '../types';
import { fetchAllSurahs, fetchSurahDetails } from '../api';
import { 
  X, Play, Pause, Search, Music, Volume2, VolumeX, SkipForward, SkipBack, 
  Sparkles, Heart, Headphones, RefreshCw, Eye, EyeOff, Check, AlertCircle, Settings,
  Share2, CloudRain, Wind, Disc, Bookmark, Sliders, Zap, Sun, Moon, Waves, Feather,
  BookOpen, Compass, Layers, Shield, Sparkle, ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShareModal } from '../components/ShareModal';

type CleanTheme = 'emerald' | 'midnight' | 'royal' | 'ocean';
type AmbientSound = 'off' | 'rain' | 'breeze' | 'peace';

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
  
  // Clean Mode Theme preset
  const [themePreset, setThemePreset] = useState<CleanTheme>('emerald');

  // Card Zoom Scale State (60% to 160%)
  const [cardScale, setCardScale] = useState<number>(1.0);

  // Dual layout modes: true = Focus Mode (hides panels, centers text), false = Full split view
  const [isFocusImmersive, setIsFocusImmersive] = useState(false);

  // Settings Tray Toggle
  const [showSettingsTray, setShowSettingsTray] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  // Playback Speed
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Ambient Peace Soundscape (Web Audio API Synthesizer)
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<GainNode | null>(null);
  const ambientOscsRef = useRef<(OscillatorNode | AudioBufferSourceNode)[]>([]);

  // Share Card Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Mobile responsiveness tab selection: 'playlist' or 'player'
  const [mobileActiveTab, setMobileActiveTab] = useState<'playlist' | 'player'>(
    playingSurah ? 'player' : 'playlist'
  );

  // Stop ambient sound helper
  const stopAmbientSound = () => {
    ambientOscsRef.current.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {
        // Safe catch
      }
    });
    ambientOscsRef.current = [];
  };

  // Web Audio Synthesizer for Ambient Atmosphere
  useEffect(() => {
    if (ambientSound === 'off') {
      stopAmbientSound();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbientSound();

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      gain.connect(ctx.destination);
      ambientNodeRef.current = gain;

      if (ambientSound === 'peace') {
        // Soothing 432Hz Harmonic Sine Wave drone
        const freqs = [108, 216, 432];
        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          const oscGain = ctx.createGain();
          oscGain.gain.setValueAtTime(0.15, ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(gain);
          osc.start();
          ambientOscsRef.current.push(osc);
        });
      } else if (ambientSound === 'rain' || ambientSound === 'breeze') {
        // Soft Pink/White Noise rain simulation
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter for Rain or Breeze
        const filter = ctx.createBiquadFilter();
        filter.type = ambientSound === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(ambientSound === 'rain' ? 800 : 400, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        whiteNoise.start();
        ambientOscsRef.current.push(whiteNoise);
      }
    } catch (err) {
      console.warn('Ambient Audio unavailable', err);
    }

    return () => {
      stopAmbientSound();
    };
  }, [ambientSound]);

  // Adjust volume
  useEffect(() => {
    if (ambientNodeRef.current && audioCtxRef.current) {
      ambientNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

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

  // Filter surahs dynamically
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

  const activeAyahObj = useMemo(() => {
    if (playingSurah && playingAyahIndex >= 0 && playingAyahIndex < playingSurah.ayahs.length) {
      return playingSurah.ayahs[playingAyahIndex];
    }
    return null;
  }, [playingSurah, playingAyahIndex]);

  const progressPercent = useMemo(() => {
    if (!playingSurah || playingAyahIndex < 0) return 0;
    return (playingAyahIndex / Math.max(1, playingSurah.ayahs.length - 1)) * 100;
  }, [playingSurah, playingAyahIndex]);

  // Theme styling & structural configuration helpers
  const getThemeConfig = () => {
    switch(themePreset) {
      case 'midnight':
        return {
          title: 'নাইট ভেলভেট (Modern Minimal)',
          bg: 'bg-zinc-950',
          gradient: 'from-zinc-950 via-slate-950 to-indigo-950/40',
          accent: 'text-indigo-400',
          accentBg: 'bg-gradient-to-tr from-indigo-500 to-violet-500',
          accentBtnText: 'text-white',
          border: 'border-indigo-500/30',
          glow: 'bg-indigo-600',
          icon: Moon,
          layoutStyle: 'minimal-glass', // Layout 1: Minimalist Floating Glass Pod
          cardBg: 'bg-zinc-900/60 border-zinc-800/80 backdrop-blur-xl rounded-3xl',
          textArabic: 'font-arabic text-indigo-300',
        };
      case 'royal':
        return {
          title: 'স্বর্ণালী পাণ্ডুলিপি (Gold Manuscript)',
          bg: 'bg-[#120e08]',
          gradient: 'from-[#1a130a] via-[#120e08] to-[#241a0d]',
          accent: 'text-amber-400',
          accentBg: 'bg-gradient-to-tr from-amber-500 to-yellow-600',
          accentBtnText: 'text-zinc-950 font-black',
          border: 'border-amber-600/40',
          glow: 'bg-amber-600',
          icon: Sun,
          layoutStyle: 'ancient-manuscript', // Layout 2: Ancient Illuminated Quran Manuscript
          cardBg: 'bg-[#18120a]/90 border-amber-600/30 rounded-2xl shadow-2xl',
          textArabic: 'font-arabic text-amber-200',
        };
      case 'ocean':
        return {
          title: 'কসমিক ওশান (Abyssal Sanctuary)',
          bg: 'bg-slate-950',
          gradient: 'from-slate-950 via-teal-950 to-cyan-950/50',
          accent: 'text-cyan-400',
          accentBg: 'bg-gradient-to-tr from-cyan-500 to-teal-400',
          accentBtnText: 'text-slate-950 font-black',
          border: 'border-cyan-500/30',
          glow: 'bg-cyan-500',
          icon: Waves,
          layoutStyle: 'cosmic-ocean', // Layout 3: Deep Wave Pod
          cardBg: 'bg-slate-900/70 border-cyan-500/20 backdrop-blur-2xl rounded-3xl',
          textArabic: 'font-arabic text-cyan-200',
        };
      case 'emerald': default:
        return {
          title: 'রয়্যাল মেহরাব (Royal Mihrab)',
          bg: 'bg-zinc-950',
          gradient: 'from-zinc-950 via-emerald-950/40 to-teal-950/30',
          accent: 'text-emerald-400',
          accentBg: 'bg-gradient-to-tr from-emerald-500 to-teal-400',
          accentBtnText: 'text-zinc-950 font-black',
          border: 'border-emerald-500/40',
          glow: 'bg-emerald-500',
          icon: Compass,
          layoutStyle: 'royal-mihrab', // Layout 4: Islamic Arch Mihrab Frame
          cardBg: 'bg-zinc-900/80 border-emerald-500/30 rounded-3xl backdrop-blur-md',
          textArabic: 'font-arabic text-emerald-300',
        };
    }
  };

  const themeStyle = getThemeConfig();

  return (
    <div className={`fixed inset-0 z-[200] ${themeStyle.bg} text-zinc-100 flex flex-col font-sans overflow-hidden select-none transition-colors duration-500`}>
      
      {/* Background Animated Orbs & Geometric Watermarks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute inset-0 bg-gradient-to-tr ${themeStyle.gradient} opacity-90`} />
        
        {/* Islamic Geometric Lattice Pattern */}
        <div className="absolute inset-0 opacity-[0.03] text-white" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L45 15 L30 30 L15 15 Z M30 30 L45 45 L30 60 L15 45 Z' fill='none' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/svg%3E")` }} />

        <div 
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[130px] ${themeStyle.glow} transform-gpu`}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[150px] bg-teal-500 transform-gpu"
        />
      </div>

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
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-800/40 backdrop-blur-lg bg-zinc-950/80">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-2xl bg-zinc-900 border ${themeStyle.border} ${themeStyle.accent} flex items-center justify-center shadow-md`}>
            <Headphones className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span className="font-sans font-black">ক্লিন মোড</span>
              <span className={`text-[9px] bg-zinc-900 ${themeStyle.accent} font-sans tracking-wide uppercase px-2.5 py-0.5 rounded-lg font-black border ${themeStyle.border} flex items-center gap-1`}>
                <Sparkles className="w-3 h-3" />
                <span>{themeStyle.title.split(' ')[0]}</span>
              </span>
            </h2>
            <p className="text-[9px] text-zinc-400 font-bold font-bengali uppercase tracking-wide">পবিত্র কুরআন তিলাওয়াত ও একাগ্র ধ্যান</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          {/* Card Zoom Scale Controller */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs shadow-inner">
            <button
              onClick={() => setCardScale(prev => Math.max(0.6, parseFloat((prev - 0.1).toFixed(1))))}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-90"
              title="কার্ড ছোট করুন (-)"
            >
              <ZoomOut className="w-3.5 h-3.5 text-zinc-400" />
            </button>
            <span 
              onClick={() => setCardScale(1.0)} 
              className="text-[10px] font-black text-amber-400 font-sans px-1 min-w-[38px] text-center cursor-pointer hover:underline"
              title="পুনরায় স্বাভাবিক (১০০%) সাইজে আনুন"
            >
              {Math.round(cardScale * 100)}%
            </span>
            <button
              onClick={() => setCardScale(prev => Math.min(1.6, parseFloat((prev + 0.1).toFixed(1))))}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-90"
              title="কার্ড বড় করুন (+)"
            >
              <ZoomIn className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Share Card Generator Trigger */}
          {activeAyahObj && playingSurah && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="hidden sm:flex px-3.5 py-2 rounded-xl text-xs font-black font-bengali items-center space-x-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-850 transition-all outline-none"
              title="আয়াত দিয়ে সোশ্যাল মিডিয়া শেয়ার কার্ড তৈরি করুন"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>শেয়ার কার্ড</span>
            </button>
          )}

          {/* Toggle Focus View */}
          <button
            onClick={() => setIsFocusImmersive(!isFocusImmersive)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black font-bengali flex items-center space-x-1.5 transition-all outline-none border ${
              isFocusImmersive
                ? `${themeStyle.accentBg} ${themeStyle.accentBtnText} border-transparent shadow-lg`
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
            }`}
          >
            {isFocusImmersive ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ফোকাস মোড</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ফোকাস মোড</span>
              </>
            )}
          </button>

          {/* Settings Tray Toggle */}
          <button
            onClick={() => setShowSettingsTray(!showSettingsTray)}
            className={`p-2.5 rounded-xl transition-all border outline-none flex items-center justify-center ${
              showSettingsTray
                ? `${themeStyle.accentBg} ${themeStyle.accentBtnText} border-transparent shadow-lg`
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white'
            }`}
            title="তিলাওয়াত ও আমেজ সেটিংস"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Exit Clean Mode */}
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
            <div className="max-w-5xl mx-auto px-5 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs text-zinc-300 font-sans select-none">
              
              {/* Col 1: Qari Reciter Choice */}
              <div className="space-y-2">
                <span className={`text-[10px] font-black ${themeStyle.accent} uppercase tracking-widest block font-sans flex items-center gap-1.5`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>QARI / কারী নির্বাচন</span>
                </span>
                <div className="grid grid-cols-1 gap-1.5 font-sans">
                  {[
                    { id: 'ar.alafasy', name: 'মিশারি আল-আফাসি' },
                    { id: 'ar.abdulbasitmurattal', name: 'আব্দুল বাসেত' },
                    { id: 'ar.mahermuaiqly', name: 'মাহের আল-মুআইকিলী' },
                    { id: 'ar.minshawi', name: 'সিদ্দিক আল-মিনশাবি' }
                  ].map((qOption) => {
                    const isSelected = qari === qOption.id;
                    return (
                      <button
                        key={qOption.id}
                        onClick={() => changeQariInCleanMode(qOption.id)}
                        className={`px-3 py-1.5 text-left rounded-xl border transition-all flex items-center justify-between font-sans ${
                          isSelected
                            ? `bg-zinc-900 ${themeStyle.border} ${themeStyle.accent} font-bold`
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs">{qOption.name}</span>
                        {isSelected && <span className={`w-1.5 h-1.5 ${themeStyle.accentBg} rounded-full animate-pulse`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Col 2: Ambient Atmospheric Peace Sound */}
              <div className="space-y-2">
                <span className={`text-[10px] font-black ${themeStyle.accent} uppercase tracking-widest block font-sans flex items-center gap-1.5`}>
                  <Headphones className="w-3.5 h-3.5" />
                  <span>AMBIENT SOUND / প্রশান্তির শব্দ</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5 font-sans">
                  {[
                    { id: 'off', name: 'বন্ধ', icon: VolumeX },
                    { id: 'rain', name: 'বৃষ্টির শব্দ', icon: CloudRain },
                    { id: 'breeze', name: 'মসজিদ বাতাস', icon: Wind },
                    { id: 'peace', name: '৪৩২Hz ড্রোন', icon: Sparkles }
                  ].map((amb) => {
                    const isSelected = ambientSound === amb.id;
                    const IconComp = amb.icon;
                    return (
                      <button
                        key={amb.id}
                        onClick={() => setAmbientSound(amb.id as AmbientSound)}
                        className={`p-2 text-left rounded-xl border transition-all flex items-center space-x-2 font-sans ${
                          isSelected
                            ? `bg-zinc-900 ${themeStyle.border} ${themeStyle.accent} font-bold`
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{amb.name}</span>
                      </button>
                    );
                  })}
                </div>
                {ambientSound !== 'off' && (
                  <div className="pt-1 flex items-center space-x-2">
                    <span className="text-[10px] text-zinc-400">সাউন্ড ভলিউম:</span>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => setAmbientVolume(Number(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Col 3: Visual Theme Presets */}
              <div className="space-y-2">
                <span className={`text-[10px] font-black ${themeStyle.accent} uppercase tracking-widest block font-sans flex items-center gap-1.5`}>
                  <Layers className="w-3.5 h-3.5" />
                  <span>THEME ARCHITECT / থিম লেআউট</span>
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'emerald', name: 'রয়্যাল মেহরাব (Islamic Arch)', icon: Compass },
                    { id: 'midnight', name: 'নাইট ভেলভেট (Minimal Glass)', icon: Moon },
                    { id: 'royal', name: 'স্বর্ণালী পাণ্ডুলিপি (Gold Page)', icon: Sun },
                    { id: 'ocean', name: 'কসমic ওশান (Deep Wave)', icon: Waves }
                  ].map((t) => {
                    const isSelected = themePreset === t.id;
                    const ThemeIcon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setThemePreset(t.id as CleanTheme)}
                        className={`p-2 rounded-xl border transition-all text-left font-sans flex items-center justify-between ${
                          isSelected
                            ? `bg-zinc-900 ${themeStyle.border} ${themeStyle.accent} font-bold`
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <ThemeIcon className="w-3.5 h-3.5" />
                          <span className="text-xs">{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Col 4: Translation and Font Sizing */}
              <div className="space-y-2">
                <span className={`text-[10px] font-black ${themeStyle.accent} uppercase tracking-widest block font-sans flex items-center gap-1.5`}>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>FONT SIZES / ফন্ট কাস্টমাইজ</span>
                </span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-zinc-400">
                    <span>আরবি ফন্ট:</span>
                    <span className="font-bold text-white font-sans">{arabicFontSize}px</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))}
                      className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-sm text-white"
                    >
                      -
                    </button>
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 ${themeStyle.accentBg} rounded-full`} style={{ width: `${((arabicFontSize - 20) / (48 - 20)) * 100}%` }} />
                    </div>
                    <button
                      onClick={() => setArabicFontSize(Math.min(48, arabicFontSize + 2))}
                      className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-sm text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 font-bengali">
                  <span className="text-xs text-zinc-300">বাংলা অনুবাদ:</span>
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      showTranslation
                        ? `bg-zinc-900 ${themeStyle.border} ${themeStyle.accent}`
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {showTranslation ? 'দৃশ্যমান' : 'লুকানো'}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Tab Switcher */}
      {!isFocusImmersive && (
        <div className="lg:hidden relative z-10 flex px-6 py-2 bg-zinc-950/40 border-b border-zinc-900/60 justify-center">
          <div className="flex bg-zinc-900 border border-zinc-850 p-1 rounded-xl w-full max-w-sm">
            <button
              onClick={() => setMobileActiveTab('playlist')}
              className={`flex-1 py-1.5 text-xs font-black font-bengali rounded-lg transition-all ${
                mobileActiveTab === 'playlist'
                  ? `${themeStyle.accentBg} ${themeStyle.accentBtnText} shadow-sm`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              সূরা তালিকা
            </button>
            <button
              onClick={() => setMobileActiveTab('player')}
              className={`flex-1 py-1.5 text-xs font-black font-bengali rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mobileActiveTab === 'player'
                  ? `${themeStyle.accentBg} ${themeStyle.accentBtnText} shadow-sm`
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>তিলাওয়াত</span>
              {isPlaying && <span className={`w-1.5 h-1.5 ${themeStyle.accentBg} rounded-full animate-pulse`} />}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area Layout with Structural Multi-Theme Variations */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left column: Selected Playing Surah & Sanctuary Player Dashboard */}
        <section 
          className={`flex-1 flex flex-col p-4 sm:p-7 justify-center items-center transition-all duration-300 ${
            mobileActiveTab === 'player' ? 'flex' : 'hidden lg:flex'
          } ${
            isFocusImmersive ? 'max-w-4xl mx-auto' : 'lg:border-r border-zinc-900/60'
          }`}
        >
          <div className="w-full max-w-xl flex flex-col items-center justify-between min-h-[72vh] my-auto">
            
            {/* Top Banner */}
            {isFocusImmersive && playingSurah && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-zinc-900/80 px-4 py-1.5 rounded-full border ${themeStyle.border} text-[11px] font-black font-bengali ${themeStyle.accent} mb-3 flex items-center space-x-1.5`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>আল্লাহর বাণীর প্রতি মনোযোগ দিন • সূরা {playingSurah.name}</span>
              </motion.div>
            )}

            {playingSurah ? (
              <div className="w-full text-center flex flex-col items-center flex-1 justify-center py-2">
                
                {/* Scalable Card Wrapper Container */}
                <div 
                  className="w-full flex justify-center transition-transform duration-200 ease-out origin-center my-auto"
                  style={{ transform: `scale(${cardScale})` }}
                >
                  {/* STRUCTURAL LAYOUT VARIATION 1: Royal Mihrab Arch Frame */}
                  {themeStyle.layoutStyle === 'royal-mihrab' && (
                    <div className="w-full max-w-lg relative bg-gradient-to-b from-emerald-950/40 via-zinc-900/80 to-zinc-950 border-2 border-emerald-500/40 rounded-t-[5rem] rounded-b-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-2 overflow-hidden">
                      {/* Arch Top Header Ornament */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2 text-emerald-400 opacity-60">
                        <Sparkle className="w-4 h-4" />
                        <div className="w-16 h-0.5 bg-emerald-500/40" />
                        <Compass className="w-4 h-4" />
                        <div className="w-16 h-0.5 bg-emerald-500/40" />
                        <Sparkle className="w-4 h-4" />
                      </div>

                      <div className="pt-4 pb-2">
                        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1 font-sans">
                          {playingSurah.englishName}
                        </h2>
                        <p className="text-xs font-bold text-emerald-400 font-bengali">
                          সূরা {playingSurah.name} ({playingSurah.revelationType === 'Meccan' ? 'মাক্কী' : 'মাদানী'})
                        </p>
                      </div>

                      {/* Ayah Verse Box inside Arch */}
                      <div className="mt-2 w-full bg-zinc-950/80 border border-emerald-500/20 rounded-2xl p-5 h-[190px] sm:h-[220px] overflow-y-auto custom-scrollbar relative flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                          {activeAyahObj && (
                            <motion.div
                              key={playingAyahIndex}
                              initial={{ opacity: 0, scale: 0.96 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              className="text-center w-full"
                            >
                              <p 
                                className="font-arabic text-emerald-300 drop-shadow-md mb-3 leading-relaxed font-semibold filter saturate-[1.3]" 
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
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* STRUCTURAL LAYOUT VARIATION 2: Modern Minimal Glass Pod */}
                  {themeStyle.layoutStyle === 'minimal-glass' && (
                    <div className="w-full max-w-lg relative bg-zinc-900/40 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl mb-2">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-xs font-black text-indigo-400 font-sans tracking-widest uppercase">MINIMAL FOCUS</span>
                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20">
                          Ayah {playingAyahIndex + 1} / {playingSurah.ayahs.length}
                        </span>
                      </div>

                      {/* Circular Audio Wave Ring Visualizer */}
                      <div className="relative w-28 h-28 mx-auto rounded-full bg-zinc-950 border border-indigo-500/40 flex items-center justify-center shadow-xl mb-4">
                        <Headphones className={`w-8 h-8 text-indigo-400 ${isPlaying ? 'scale-110' : 'opacity-40'}`} />
                        {isPlaying && (
                          <div className="absolute inset-0 rounded-full border border-indigo-400/50 animate-ping opacity-25" />
                        )}
                      </div>

                      <h2 className="text-xl font-black text-white font-sans">{playingSurah.englishName}</h2>
                      <p className="text-xs text-indigo-300 font-bengali mb-3">সূরা {playingSurah.name}</p>

                      <div className="bg-zinc-950/80 border border-indigo-500/20 rounded-2xl p-5 h-[170px] overflow-y-auto custom-scrollbar flex items-center justify-center">
                        {activeAyahObj && (
                          <div className="text-center">
                            <p className="font-arabic text-indigo-200 leading-relaxed font-semibold mb-2" dir="rtl" style={{ fontSize: `${arabicFontSize}px` }}>
                              {activeAyahObj.arabicText}
                            </p>
                            {showTranslation && (
                              <p className="font-bengali text-zinc-300 text-xs" style={{ fontSize: `${bengaliFontSize}px` }}>
                                {activeAyahObj.bengaliText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STRUCTURAL LAYOUT VARIATION 3: Ancient Gold Illuminated Manuscript */}
                  {themeStyle.layoutStyle === 'ancient-manuscript' && (
                    <div className="w-full max-w-lg relative bg-[#18120a] border-4 border-double border-amber-600/50 rounded-xl p-6 sm:p-8 shadow-2xl mb-2 relative">
                      {/* Ornate Corner Flourish Accents */}
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500" />

                      <div className="border-b border-amber-600/30 pb-3 mb-4 flex items-center justify-between">
                        <Sun className="w-5 h-5 text-amber-500" />
                        <div className="text-center">
                          <span className="text-xs font-black text-amber-400 font-sans tracking-widest uppercase block">HOLY MANUSCRIPT</span>
                          <h2 className="text-lg font-black text-amber-100 font-sans">{playingSurah.englishName}</h2>
                        </div>
                        <Feather className="w-5 h-5 text-amber-500" />
                      </div>

                      <div className="bg-[#100b06] border border-amber-600/30 rounded-lg p-5 h-[180px] overflow-y-auto custom-scrollbar flex items-center justify-center">
                        {activeAyahObj && (
                          <div className="text-center">
                            <p className="font-arabic text-amber-200 leading-relaxed font-semibold mb-2" dir="rtl" style={{ fontSize: `${arabicFontSize}px` }}>
                              {activeAyahObj.arabicText}
                            </p>
                            {showTranslation && (
                              <p className="font-bengali text-amber-100/90 text-xs" style={{ fontSize: `${bengaliFontSize}px` }}>
                                {activeAyahObj.bengaliText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STRUCTURAL LAYOUT VARIATION 4: Cosmic Ocean Wave */}
                  {themeStyle.layoutStyle === 'cosmic-ocean' && (
                    <div className="w-full max-w-lg relative bg-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl mb-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-cyan-400">
                          <Waves className="w-4 h-4 animate-pulse" />
                          <span className="text-xs font-black font-sans uppercase">Abyssal Wave</span>
                        </div>
                        <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-3 py-0.5 rounded-full border border-cyan-500/20">
                          Ayah {playingAyahIndex + 1}
                        </span>
                      </div>

                      <h2 className="text-xl font-black text-white font-sans mb-1">{playingSurah.englishName}</h2>
                      <p className="text-xs text-cyan-300 font-bengali mb-4">সূরা {playingSurah.name}</p>

                      <div className="bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-5 h-[180px] overflow-y-auto custom-scrollbar flex items-center justify-center">
                        {activeAyahObj && (
                          <div className="text-center">
                            <p className="font-arabic text-cyan-200 leading-relaxed font-semibold mb-2" dir="rtl" style={{ fontSize: `${arabicFontSize}px` }}>
                              {activeAyahObj.arabicText}
                            </p>
                            {showTranslation && (
                              <p className="font-bengali text-cyan-100 text-xs" style={{ fontSize: `${bengaliFontSize}px` }}>
                                {activeAyahObj.bengaliText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Jump & Action Row */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="text-[9px] text-zinc-400 font-black font-sans uppercase tracking-[0.2em] bg-zinc-900/60 px-2.5 py-1 rounded-full border border-zinc-800">
                    Ayah {playingAyahIndex + 1} of {playingSurah.ayahs.length}
                  </span>
                  
                  {/* Jump to Ayah */}
                  <div className="flex items-center space-x-1 bg-zinc-900/60 border border-zinc-800 px-2.5 py-0.5 rounded-full text-[9px] text-zinc-400 font-bold font-bengali">
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
                      className={`w-8 bg-transparent text-center font-extrabold ${themeStyle.accent} focus:outline-none border-b border-zinc-700 font-sans text-[10px]`}
                    />
                  </div>

                  <button
                    onClick={() => toggleFavorite(playingSurah.number)}
                    className={`p-1 px-2.5 rounded-full border text-[10px] font-bengali flex items-center space-x-1 transition-all ${
                      favorites.includes(playingSurah.number)
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3 h-3 ${favorites.includes(playingSurah.number) ? 'fill-current' : ''}`} />
                    <span>বুকমার্ক</span>
                  </button>
                </div>

                {/* Clean Player Controls Bar */}
                <div className="w-full max-w-md mt-3">
                  {/* Slider Progress */}
                  <div className="mb-2">
                    <div className="relative flex items-center py-1.5">
                      <div 
                        className={`absolute left-0 h-1 ${themeStyle.accentBg} rounded-full pointer-events-none z-10`} 
                        style={{ width: `${progressPercent}%` }} 
                      />
                      <input
                        type="range"
                        min="0"
                        max={playingSurah.ayahs.length - 1}
                        value={playingAyahIndex}
                        onChange={(e) => seekAyah(Number(e.target.value))}
                        className="w-full h-1 cursor-pointer outline-none bg-zinc-800 rounded-full opacity-80 hover:opacity-100 transition-opacity z-20 relative"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-sans font-bold px-1">
                      <span>সম্পন্ন: {Math.round(progressPercent)}%</span>
                      <span>মোট আয়াত: {playingSurah.ayahs.length}</span>
                    </div>
                  </div>

                  {/* Play Buttons */}
                  <div className="flex items-center justify-center space-x-5 mx-auto mt-1">
                    <button 
                      onClick={prevAyah} 
                      disabled={playingAyahIndex <= 0}
                      className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:text-white text-zinc-400 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button 
                      onClick={togglePlay}
                      className={`w-14 h-14 rounded-2xl ${themeStyle.accentBg} ${themeStyle.accentBtnText} flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl text-center`}
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                    </button>

                    <button 
                      onClick={nextAyah} 
                      disabled={playingAyahIndex >= playingSurah.ayahs.length - 1}
                      className="p-3 rounded-2xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:text-white text-zinc-400 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center flex flex-col items-center justify-center p-8 py-16 my-auto">
                <div className={`w-20 h-20 rounded-3xl bg-zinc-900/50 border ${themeStyle.border} flex items-center justify-center mb-6 ${themeStyle.accent} animate-subtle-pulse`}>
                  <Headphones className="w-9 h-9 stroke-[1.2]" />
                </div>
                <h3 className="text-lg font-black text-white font-bengali">কোন সূরা চালু নেই</h3>
                <p className="text-xs font-semibold text-zinc-400 font-bengali mt-2.5 max-w-xs leading-relaxed">
                  ডানপাশের তালিকা থেকে যেকোনো একটি সূরা নির্বাচন করুন। সম্পূর্ণ বিজ্ঞাপনমুক্ত এবং একাগ্র প্রশান্তির সাথে তিলাওয়াত উপভোগ করুন।
                </p>
                
                {isFocusImmersive && (
                  <button 
                    onClick={() => setIsFocusImmersive(false)}
                    className={`mt-6 px-4.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 ${themeStyle.accent} font-black font-bengali text-xs border border-zinc-800 transition-all shadow-sm`}
                  >
                    সূরা তালিকা দেখান
                  </button>
                )}
              </div>
            )}

            <div className="text-[10px] text-zinc-600 font-sans tracking-widest uppercase opacity-40 font-black pt-2 flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>PURE ISLAMIC SANCTUARY</span>
            </div>

          </div>
        </section>

        {/* Right column: Surahs selector list */}
        {!isFocusImmersive && (
          <section className={`w-full lg:w-[410px] flex-1 lg:flex-none h-full min-h-0 flex flex-col p-5 bg-zinc-950/20 lg:max-h-full overflow-hidden shrink-0 ${
            mobileActiveTab === 'playlist' ? 'flex' : 'hidden lg:flex'
          }`}>
            
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase font-sans flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  <span>SURAH PLAYLIST</span>
                </span>
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
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors font-bengali"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center py-12 text-zinc-500 space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bengali">সূরা লোড হচ্ছে...</span>
                </div>
              ) : filteredSurahs.length === 0 ? (
                <p className="text-center py-8 text-xs text-zinc-500 font-bengali">কোন সূরা পাওয়া যায়নি</p>
              ) : (
                filteredSurahs.map((surah) => {
                  const isCurrentPlaying = playingSurah?.number === surah.number;
                  const isLoadingThis = loadingDetailsId === surah.number;

                  return (
                    <div
                      key={surah.number}
                      onClick={() => handlePlaySurah(surah.number)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isCurrentPlaying
                          ? `bg-zinc-900 ${themeStyle.border} shadow-lg`
                          : 'bg-zinc-900/40 border-zinc-900/80 hover:bg-zinc-900/90 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl font-sans text-xs font-black flex items-center justify-center transition-colors ${
                          isCurrentPlaying
                            ? `${themeStyle.accentBg} ${themeStyle.accentBtnText}`
                            : 'bg-zinc-900 text-zinc-400 group-hover:text-white'
                        }`}>
                          {surah.number}
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold font-sans transition-colors ${
                            isCurrentPlaying ? 'text-white' : 'text-zinc-300 group-hover:text-white'
                          }`}>
                            {surah.englishName}
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-bengali">
                            সূরা {surah.name} • {surah.numberOfAyahs} আয়াত
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isLoadingThis ? (
                          <RefreshCw className={`w-4 h-4 ${themeStyle.accent} animate-spin`} />
                        ) : isCurrentPlaying && isPlaying ? (
                          <div className="flex items-end space-x-0.5 h-3">
                            <div className={`w-0.5 h-3 ${themeStyle.accentBg} animate-bounce`} />
                            <div className={`w-0.5 h-2 ${themeStyle.accentBg} animate-bounce [animation-delay:0.2s]`} />
                            <div className={`w-0.5 h-3.5 ${themeStyle.accentBg} animate-bounce [animation-delay:0.4s]`} />
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:${themeStyle.accent} group-hover:border-transparent transition-all`}>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </section>
        )}

      </main>

      {/* Share Modal Triggered from Clean Mode */}
      {activeAyahObj && playingSurah && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          arabicText={activeAyahObj.arabicText}
          bengaliText={activeAyahObj.bengaliText}
          surahName={`সূরা ${playingSurah.name} (${playingSurah.englishName})`}
          ayahNumber={playingAyahIndex + 1}
        />
      )}

    </div>
  );
};
