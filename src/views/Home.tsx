import React, { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '../Store';
import { SurahInfo } from '../types';
import { fetchAllSurahs } from '../api';
import { SurahCard } from '../components/SurahCard';
import { getBanglaSurahData } from '../utils/banglaSurahNames';
import { 
  Search, Sparkles, BookOpen, MapPin, Clock, Volume2, VolumeX, 
  TrendingUp, RefreshCw, Heart, Calendar, Bell, BellOff, 
  ArrowRight, Compass, Bookmark, Settings, CheckCircle2, ChevronRight,
  Sun, Moon, Shield, Sparkle, Headphones, CloudRain, Wind, Disc, Zap, Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PrayerTimesModal } from '../components/PrayerTimesModal';
import { ProgressModal } from '../components/ProgressModal';

const INSPIRATIONAL_AYAHS = [
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ۝",
    bengali: "নিশ্চয়ই কষ্টের সাথেই স্বস্তি রয়েছে। অবশ্যই কষ্টের সাথেই স্বস্তি রয়েছে।",
    source: "সূরা আশ-শারহ (৯৪: ৫-৬)",
    surahNumber: 94,
    ayahIndex: 4
  },
  {
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۝",
    bengali: "হে আমাদের পালনকর্তা! সরল পথ প্রদর্শনের পর তুমি আমাদের অন্তরসমূহকে সত্যচ্যূত করো না এবং তোমার নিকট থেকে আমাদেরকে অনুগ্রহ দান করো।",
    source: "সূরা আল ইমরান (৩: ৮)",
    surahNumber: 3,
    ayahIndex: 7
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ ۝",
    bengali: "নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।",
    source: "সূরা আল-বাকারাহ (২: ১৫৩)",
    surahNumber: 2,
    ayahIndex: 152
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ۝",
    bengali: "জেনে রাখুন, আল্লাহর স্মরণেই কেবল হৃদয় শান্তি পায়।",
    source: "সূরা আর-রাদ (১৩: ২৮)",
    surahNumber: 13,
    ayahIndex: 27
  },
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۝",
    bengali: "আর আমার বান্দারা যখন আপনার কাছে আমার ব্যাপারে জিজ্ঞেস করে, আমি তো অবশ্যই নিকটবর্তী। আহ্বানকারী যখনই আমাকে ডাকে, আমি তার ডাকে সাড়া দিই।",
    source: "সূরা আল-বাকারাহ (২: ১৮৬)",
    surahNumber: 2,
    ayahIndex: 185
  }
];

const toBengaliNumber = (num: number) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bnDigits[Number(d)] || d).join('');
};

export const HomeView = () => {
  const { 
    favorites, lastRead, setCurrentViewSurah, setInitialTargetAyahIndex,
    location, nextPrayer, playAzan, isAzanPlaying, prayerTimes,
    setIsCleanMode, notificationsEnabled, setNotificationsEnabled,
    setActiveTab, playingSurah, isPlaying
  } = useAppStore();

  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | 'Meccan' | 'Medinan' | 'fav'>('all');
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Daily random Ayah
  const dailyAyah = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return INSPIRATIONAL_AYAHS[dayOfYear % INSPIRATIONAL_AYAHS.length];
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      const data = await fetchAllSurahs();
      setSurahs(data);
      setLoading(false);
    };
    loadSurahs();
  }, []);

  const filteredSurahs = useMemo(() => {
    return surahs.filter(s => {
      const bSurah = getBanglaSurahData(s.number);
      const searchLower = search.toLowerCase().trim();
      
      const matchesSearch = 
        !searchLower ||
        s.name.toLowerCase().includes(searchLower) ||
        s.englishName.toLowerCase().includes(searchLower) ||
        s.englishNameTranslation.toLowerCase().includes(searchLower) ||
        s.number.toString() === searchLower ||
        toBengaliNumber(s.number).includes(searchLower) ||
        bSurah.banglaName.toLowerCase().includes(searchLower) ||
        bSurah.banglaMeaning.toLowerCase().includes(searchLower) ||
        bSurah.banglaPronunciation.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (revelationFilter === 'Meccan') {
        return s.revelationType === 'Meccan' || s.revelationType === 'মাক্কী';
      }
      if (revelationFilter === 'Medinan') {
        return s.revelationType === 'Enlightened' || s.revelationType === 'Medinan' || s.revelationType === 'মাদানী';
      }
      if (revelationFilter === 'fav') {
        return favorites.includes(s.number);
      }

      return true;
    });
  }, [surahs, search, revelationFilter, favorites]);

  // Feature Navigation Cards configuration
  const featureCards = [
    {
      id: 'clean-mode',
      title: 'ক্লিন মোড ও প্রশান্তির আমেজ',
      subtitle: 'বিজ্ঞাপনমুক্ত ফুলস্ক্রীন তিলাওয়াত, ব্যাকগ্রাউন্ড অডিও ও ফোকাস ধ্যান',
      icon: Headphones,
      color: 'from-emerald-600/10 via-teal-600/15 to-emerald-900/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:border-emerald-500',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20',
      action: () => setIsCleanMode(true),
      badge: 'শান্তি ও ফোকাস'
    },
    {
      id: 'salah-tracker',
      title: 'সালাত ট্র্যাকার ও সময়সূচি',
      subtitle: 'দৈনিক ৫ ওয়াক্ত নামাজ ট্র্যাকিং, জামায়াত ও সঠিক সময়সূচি',
      icon: Clock,
      color: 'from-teal-50/80 to-emerald-50/80 border-teal-200/80 text-teal-800 hover:border-teal-400',
      iconBg: 'bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20',
      tab: 'salah-tracker' as const,
      badge: nextPrayer ? `পরবর্তী: ${nextPrayer.name}` : 'সময়সূচি'
    },
    {
      id: 'tasbih',
      title: 'ডিজিটাল তাসবিহ',
      subtitle: 'লাইভ ডিজিটাল গণনাকারী, কাস্টম জিকির ও শব্দসহ গণনা',
      icon: RefreshCw,
      color: 'from-sky-50/80 to-blue-50/80 border-sky-200/80 text-sky-800 hover:border-sky-400',
      iconBg: 'bg-gradient-to-tr from-sky-500 to-blue-500 text-white shadow-md shadow-sky-500/20',
      tab: 'tasbih' as const,
      badge: 'ডিজিটাল জিকির'
    },
    {
      id: 'duas',
      title: 'নিত্যদিনের দো\'আ',
      subtitle: 'কুরআন ও হাদিসের বিশুদ্ধ দো\'আ ও মোনাজাতের সংগ্রহ',
      icon: Sparkles,
      color: 'from-amber-50/80 to-orange-50/80 border-amber-200/80 text-amber-800 hover:border-amber-400',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20',
      tab: 'duas' as const,
      badge: 'প্রয়োজনীয় দো\'আ'
    },
    {
      id: 'salah-guide',
      title: 'সালাত শিক্ষা ও গাইড',
      subtitle: 'ধাপে ধাপে ছবি ও চিত্রসহ সঠিক উপায়ে নামাজ শিক্ষার গাইড',
      icon: BookOpen,
      color: 'from-indigo-50/80 to-purple-50/80 border-indigo-200/80 text-indigo-800 hover:border-indigo-400',
      iconBg: 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20',
      tab: 'salah-guide' as const,
      badge: 'নামাজ গাইড'
    },
    {
      id: 'bookmarks',
      title: 'বুকমার্ক ও প্রিয় সূরা',
      subtitle: 'আপনার সংরক্ষিত গুরুত্বপূর্ণ আয়াত ও প্রিয় সূরাসমূহ',
      icon: Bookmark,
      color: 'from-rose-50/80 to-pink-50/80 border-rose-200/80 text-rose-800 hover:border-rose-400',
      iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20',
      tab: 'bookmarks' as const,
      badge: `${toBengaliNumber(favorites.length)}টি প্রিয়`
    },
    {
      id: 'settings',
      title: 'অ্যাপ সেটিংস ও থিম',
      subtitle: 'কারী নির্বাচন, অডিও কন্ট্রোল, ফন্ট সাইজ ও থিম কালার',
      icon: Settings,
      color: 'from-slate-100/80 to-zinc-100/80 border-slate-200/80 text-slate-800 hover:border-slate-400',
      iconBg: 'bg-gradient-to-tr from-slate-600 to-zinc-700 text-white shadow-md shadow-slate-500/20',
      tab: 'settings' as const,
      badge: 'কনফিগারেশন'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto font-bengali">
      
      {/* 1. Light Modern Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bg-surface)] via-[var(--primary-soft)] to-[var(--bg-surface)] p-6 md:p-8 border border-[var(--border)] shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[var(--accent)] opacity-[0.04] rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[var(--primary)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[var(--border)] w-fit shadow-2xs">
              <Sparkle className="w-3.5 h-3.5 fill-[var(--primary)] text-[var(--primary)]" />
              <span>পবিত্র কুরআনুল কারীম</span>
              <span className="opacity-40">•</span>
              <span>{currentTime}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight leading-snug">
              আস-সালামু আলাইকুম, <br className="hidden sm:block"/>
              <span className="text-[var(--primary)]">কুরআনের আলোয় রঙিন হোক জীবন</span>
            </h1>

            <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium leading-relaxed">
              সহজ পাঠযোগ্য বাংলা অনুবাদ, তাফসির ও বিশ্বখ্যাত কারীদের তিলাওয়াত শুনুন একস্থানে।
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowPrayerModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-2xs transition-all active:scale-95"
              >
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                <span>আজকের সালাতের সময়সূচি</span>
              </button>

              <button
                onClick={() => setShowProgressModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-main)] bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-2xs transition-all active:scale-95"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>তিলাওয়াত পরিসংখ্যান</span>
              </button>
            </div>
          </div>

          {/* Next Prayer Compact Widget */}
          {nextPrayer && (
            <div className="flex-shrink-0 bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm min-w-[240px] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] border-b border-[var(--border)]/60 pb-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                  {location?.city || 'ঢাকা'}, {location?.country || 'বাংলাদেশ'}
                </span>
                <span className="bg-[var(--primary-soft)] text-[var(--primary)] px-2 py-0.5 rounded-md font-semibold text-[10px]">
                  ওয়াক্ত
                </span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[var(--text-muted)]">পরবর্তী সালাত</p>
                <div className="flex items-baseline justify-between mt-0.5">
                  <h3 className="text-lg font-black text-[var(--primary)]">{nextPrayer.name}</h3>
                  <p className="text-sm font-extrabold text-[var(--text-main)] font-sans">{nextPrayer.time}</p>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
                  বাকি আছে: <span className="font-bold text-[var(--accent)]">{nextPrayer.remaining}</span>
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={playAzan}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isAzanPlaying 
                      ? 'bg-rose-500 text-white shadow-md animate-pulse' 
                      : 'bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white'
                  }`}
                >
                  {isAzanPlaying ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>আজান বন্ধ করুন</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>আজানের সুর শুনুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. Last Read Quick Resume Card (if exists) */}
      {lastRead && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setCurrentViewSurah(lastRead.surahNumber);
            setInitialTargetAyahIndex(lastRead.ayahIndex);
          }}
          className="group cursor-pointer p-4 md:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100/60 px-2 py-0.5 rounded-md">
                  সর্বশেষ পঠিত
                </span>
              </div>
              <h4 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors mt-0.5">
                {lastRead.surahName}
              </h4>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                আয়াত নম্বর {toBengaliNumber(lastRead.ayahIndex + 1)} থেকে পড়া শুরু করুন
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all flex-shrink-0">
            <span>পড়া শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 3. Featured Clean Mode & Sanctuary Mood Card Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-950 p-6 md:p-7 border border-emerald-500/30 text-white shadow-xl group"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-sans">
              <Headphones className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>পবিত্র পরিবেশ ও ফোকাস মোড</span>
              <span className="opacity-40">•</span>
              <span className="text-amber-300 font-extrabold">Pure Sanctuary</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
              ক্লিন তিলাওয়াত ও প্রশান্তিময় পরিবেশ
            </h3>
            <p className="text-xs md:text-sm text-emerald-100/80 font-medium leading-relaxed">
              বিজ্ঞাপন ও মনোযোগ বিভ্রান্তিমুক্ত তিলাওয়াত। আপনার পছন্দমতো ব্যাকগ্রাউন্ড প্রশান্তিময় শব্দ ও থিম বেছে নিন:
            </p>

            {/* Quick Mood Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: 'শান্ত পরিবেশ', icon: Sparkles },
                { label: 'বৃষ্টির শব্দ', icon: CloudRain },
                { label: 'রয়্যাল গোল্ডেন', icon: Sun },
                { label: 'নাইট ভেলভেট', icon: Moon },
                { label: 'অসীম সাগর', icon: Waves }
              ].map((mood, idx) => (
                <button
                  key={idx}
                  onClick={() => setIsCleanMode(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 border border-white/15 hover:border-emerald-400 text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
                >
                  <mood.icon className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsCleanMode(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-emerald-500/25 shrink-0"
          >
            <Headphones className="w-5 h-5 fill-current" />
            <span>ক্লিন মোডে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </motion.div>

      {/* 4. Feature Quick Navigation Hub (ইসলামিক সেকশন ও সার্ভিসেস গ্রিড) */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <h2 className="text-xl font-black text-[var(--text-main)] font-bengali">
                ইসলামিক সেকশন ও সার্ভিসেস
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
              প্রয়োজনীয় ফিচারে সরাসরি প্রবেশ করতে নিচের সুন্দর কার্ডগুলোতে ট্যাপ করুন
            </p>
          </div>
        </div>

        {/* Symmetrical & Compact Box Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {featureCards.map((card, idx) => {
            const IconComponent = card.icon;
            const isCleanMode = card.id === 'clean-mode';

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => card.action ? card.action() : card.tab && setActiveTab(card.tab)}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${card.color} border transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-xl relative overflow-hidden backdrop-blur-md min-h-[150px] sm:min-h-[170px] ${
                  isCleanMode ? 'col-span-2 sm:col-span-2 md:col-span-1 border-emerald-500/60 shadow-emerald-500/15' : ''
                }`}
              >
                {/* Islamic Star Lattice Watermark Background Texture */}
                <div className="absolute -bottom-8 -right-8 w-28 h-28 text-emerald-950/10 dark:text-white/10 pointer-events-none group-hover:scale-125 group-hover:rotate-45 transition-transform duration-700 ease-out flex items-center justify-center">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full opacity-40">
                    <polygon points="50,0 65,35 100,50 65,65 50,100 35,65 0,50 35,35" />
                    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </div>

                {/* Subtle Glass Glow Highlight */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 dark:bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />

                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between gap-2 relative z-10 mb-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0`}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full bg-white/95 dark:bg-zinc-800/95 text-gray-800 dark:text-gray-100 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs font-bengali truncate">
                    {card.badge}
                  </span>
                </div>

                {/* Body: Title & Subtitle */}
                <div className="relative z-10 mt-auto space-y-1">
                  <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-[var(--primary)] flex items-center justify-between gap-1 transition-colors leading-snug">
                    <span>{card.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[var(--primary)] shrink-0" />
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. Daily Inspiration Card (একনজরে প্রতিদিনের বাণীর কার্ড) */}
      {dailyAyah && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 md:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-2xs space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[var(--primary)]">
              <Sparkles className="w-4 h-4" />
              <span>দৈনিক আল-কুরআনের বাণী</span>
            </div>
            <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-main)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
              {dailyAyah.source}
            </span>
          </div>

          <div className="text-right py-1">
            <p className="text-xl md:text-2xl font-arabic text-[var(--text-main)] leading-loose">
              {dailyAyah.arabic}
            </p>
          </div>

          <div className="bg-[var(--bg-main)] p-3.5 rounded-2xl border border-[var(--border)]/60 flex items-start justify-between gap-4">
            <p className="text-xs md:text-sm text-[var(--text-main)] font-semibold leading-relaxed">
              "{dailyAyah.bengali}"
            </p>
            <button
              onClick={() => {
                setCurrentViewSurah(dailyAyah.surahNumber);
                setInitialTargetAyahIndex(dailyAyah.ayahIndex);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all flex-shrink-0 shadow-2xs"
            >
              পড়ুন
            </button>
          </div>
        </motion.div>
      )}

      {/* 5. Clean Surah Index Header & Filters */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[var(--text-main)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--primary)]" />
              <span>সকল সূরার তালিকা</span>
              <span className="text-xs font-extrabold text-[var(--primary)] bg-[var(--primary-soft)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
                {toBengaliNumber(filteredSurahs.length)}টি
              </span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border)] w-fit shadow-2xs">
            <button
              onClick={() => setRevelationFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                revelationFilter === 'all' 
                  ? 'bg-[var(--primary)] text-white shadow-2xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              সকল
            </button>
            <button
              onClick={() => setRevelationFilter('Meccan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                revelationFilter === 'Meccan' 
                  ? 'bg-[var(--primary)] text-white shadow-2xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              মাক্কী
            </button>
            <button
              onClick={() => setRevelationFilter('Medinan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                revelationFilter === 'Medinan' 
                  ? 'bg-[var(--primary)] text-white shadow-2xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              মাদানী
            </button>
            <button
              onClick={() => setRevelationFilter('fav')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                revelationFilter === 'fav' 
                  ? 'bg-amber-500 text-white shadow-2xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              প্রিয় ({toBengaliNumber(favorites.length)})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="সূরার নাম, অর্থ, উচ্চারণ বা নম্বর দিয়ে খুঁজুন... (যেমন: ইয়াসীন, বাকারাহ, ১)"
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] focus:border-[var(--primary)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 shadow-2xs transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-main)] px-2 py-1 rounded-md"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Surah Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] animate-pulse p-4" />
            ))}
          </div>
        ) : filteredSurahs.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)] space-y-3">
            <Search className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[var(--text-main)]">কোনো সূরার সন্ধান পাওয়া যায়নি</h3>
            <p className="text-xs text-[var(--text-muted)]">অনুগ্রহ করে ভিন্ন কোনো শব্দ দিয়ে অনুসন্ধান করুন</p>
            <button 
              onClick={() => { setSearch(''); setRevelationFilter('all'); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--primary)] bg-[var(--primary-soft)] hover:bg-[var(--primary)] hover:text-white transition-all"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {filteredSurahs.map((surah, index) => (
              <SurahCard
                key={surah.number}
                surah={surah}
                isFavorite={favorites.includes(surah.number)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showPrayerModal && <PrayerTimesModal onClose={() => setShowPrayerModal(false)} />}
      {showProgressModal && <ProgressModal onClose={() => setShowProgressModal(false)} />}

    </div>
  );
};
