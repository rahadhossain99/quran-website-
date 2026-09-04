import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useAppStore } from '../Store';
import { SurahInfo } from '../types';
import { fetchAllSurahs } from '../api';
import { SurahCard } from '../components/SurahCard';
import { getBanglaSurahData } from '../utils/banglaSurahNames';
import { 
  Search, Sparkles, BookOpen, MapPin, Clock, Volume2, VolumeX, 
  TrendingUp, RefreshCw, Heart, Calendar, Bell, BellOff, Play,
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
  const [isVerseAudioPlaying, setIsVerseAudioPlaying] = useState(false);
  const verseAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (verseAudioRef.current) {
        verseAudioRef.current.pause();
        verseAudioRef.current = null;
      }
    };
  }, []);

  const toggleVerseAudio = () => {
    if (!verseAudioRef.current) {
      // Surah 13 (Ar-Rad) Ayah 28 universal audio (1735) by Sheikh Mishary Rashid Alafasy
      verseAudioRef.current = new Audio('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1735.mp3');
      verseAudioRef.current.onended = () => setIsVerseAudioPlaying(false);
      verseAudioRef.current.onerror = () => setIsVerseAudioPlaying(false);
    }

    if (isVerseAudioPlaying) {
      verseAudioRef.current.pause();
      setIsVerseAudioPlaying(false);
    } else {
      verseAudioRef.current.currentTime = 0;
      verseAudioRef.current.play()
        .then(() => setIsVerseAudioPlaying(true))
        .catch(() => setIsVerseAudioPlaying(false));
    }
  };

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

  // Feature Navigation Cards configuration with Solid White Background & Distinct Vibrant Color Schemes
  const featureCards = [
    {
      id: 'clean-mode',
      title: 'ক্লিন মোড ও প্রশান্তির আমেজ',
      subtitle: 'বিজ্ঞাপনমুক্ত ফুলস্ক্রীন তিলাওয়াত, ব্যাকগ্রাউন্ড অডিও ও ফোকাস ধ্যান',
      icon: Headphones,
      topStripe: 'from-emerald-500 via-teal-500 to-emerald-400',
      borderHover: 'hover:border-emerald-500 group-hover:shadow-emerald-500/15',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
      arrowBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      action: () => setIsCleanMode(true),
      badge: 'শান্তি ও ফোকাস'
    },
    {
      id: 'salah-tracker',
      title: 'সালাত ট্র্যাকার ও সময়সূচি',
      subtitle: 'দৈনিক ৫ ওয়াক্ত নামাজ ট্র্যাকিং, জামায়াত ও সঠিক সময়সূচি',
      icon: Clock,
      topStripe: 'from-amber-500 via-orange-500 to-amber-400',
      borderHover: 'hover:border-amber-500 group-hover:shadow-amber-500/15',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
      arrowBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
      tab: 'salah-tracker' as const,
      badge: nextPrayer ? `পরবর্তী: ${nextPrayer.name}` : 'সময়সূচি'
    },
    {
      id: 'progress',
      title: 'তেলাওয়াত ও পড়ার অগ্রগতি',
      subtitle: 'দৈনিক গোল, স্ট্রিক অ্যানালিসিস, বার চার্ট ও খতম ট্র্যাকিং',
      icon: TrendingUp,
      topStripe: 'from-purple-600 via-indigo-600 to-fuchsia-500',
      borderHover: 'hover:border-purple-500 group-hover:shadow-purple-500/15',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      titleHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      arrowBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
      tab: 'progress' as const,
      badge: 'রিপোর্ট ও অ্যানালিটিক্স'
    },
    {
      id: 'tasbih',
      title: 'ডিজিটাল তাসবিহ',
      subtitle: 'লাইভ ডিজিটাল গণনাকারী, কাস্টম জিকির ও শব্দসহ গণনা',
      icon: RefreshCw,
      topStripe: 'from-cyan-500 via-sky-500 to-blue-500',
      borderHover: 'hover:border-cyan-500 group-hover:shadow-cyan-500/15',
      iconBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
      titleHover: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
      arrowBg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
      tab: 'tasbih' as const,
      badge: 'ডিজিটাল জিকির'
    },
    {
      id: 'duas',
      title: 'নিত্যদিনের দো\'আ',
      subtitle: 'কুরআন ও হাদিসের বিশুদ্ধ দো\'আ ও মোনাজাতের সংগ্রহ',
      icon: Sparkles,
      topStripe: 'from-rose-500 via-pink-500 to-rose-400',
      borderHover: 'hover:border-rose-500 group-hover:shadow-rose-500/15',
      iconBg: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
      arrowBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      tab: 'duas' as const,
      badge: 'প্রয়োজনীয় দো\'আ'
    },
    {
      id: 'salah-guide',
      title: 'সালাত শিক্ষা ও গাইড',
      subtitle: 'ধাপে ধাপে ছবি ও চিত্রসহ সঠিক উপায়ে নামাজ শিক্ষার গাইড',
      icon: BookOpen,
      topStripe: 'from-blue-600 via-indigo-600 to-sky-500',
      borderHover: 'hover:border-blue-500 group-hover:shadow-blue-500/15',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-sky-600 text-white shadow-md shadow-blue-600/25',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      arrowBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
      tab: 'salah-guide' as const,
      badge: 'নামাজ গাইড'
    },
    {
      id: 'bookmarks',
      title: 'বুকমার্ক ও প্রিয় সূরা',
      subtitle: 'আপনার সংরক্ষিত গুরুত্বপূর্ণ আয়াত ও প্রিয় সূরাসমূহ',
      icon: Bookmark,
      topStripe: 'from-red-600 via-rose-600 to-amber-500',
      borderHover: 'hover:border-red-500 group-hover:shadow-red-500/15',
      iconBg: 'bg-gradient-to-tr from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25',
      badgeBg: 'bg-red-50 text-red-800 border-red-200/80 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
      titleHover: 'group-hover:text-red-600 dark:group-hover:text-red-400',
      arrowBg: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
      tab: 'bookmarks' as const,
      badge: `${toBengaliNumber(favorites.length)}টি প্রিয়`
    },
    {
      id: 'settings',
      title: 'অ্যাপ সেটিংস ও থিম',
      subtitle: 'কারী নির্বাচন, অডিও কন্ট্রোল, ফন্ট সাইজ ও থিম কালার',
      icon: Settings,
      topStripe: 'from-slate-700 via-zinc-700 to-neutral-600',
      borderHover: 'hover:border-slate-500 group-hover:shadow-slate-500/15',
      iconBg: 'bg-gradient-to-tr from-slate-700 to-zinc-800 text-white shadow-md shadow-slate-700/25',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
      titleHover: 'group-hover:text-slate-700 dark:group-hover:text-slate-300',
      arrowBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      tab: 'settings' as const,
      badge: 'কনফিগারেশন'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto font-bengali">
      
      {/* 1. ELEGANT ISLAMIC SANCTUARY HERO SECTION MATCHING SCREENSHOT EXACTLY */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-[#fdfbf7] dark:bg-slate-900/95 border border-[#ecdccf] dark:border-slate-800 shadow-xs p-5 sm:p-7 md:p-8 relative overflow-hidden"
      >
        {/* Top Badges Row: Bismillah & Live Clock */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="font-arabic text-sm sm:text-base font-bold text-[#8d5b28] dark:text-amber-400 bg-[#f4ece1] dark:bg-slate-800/90 border border-[#e4d6c4] dark:border-slate-700/80 px-4 py-1.5 rounded-full shadow-2xs tracking-wider">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </span>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5c4a37] dark:text-slate-300 bg-[#f4ece1] dark:bg-slate-800/90 border border-[#e4d6c4] dark:border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-2xs font-sans">
            <Clock className="w-3.5 h-3.5 text-[#b04f14] dark:text-amber-400" />
            <span>{currentTime}</span>
          </div>

          {nextPrayer && (
            <button
              onClick={() => setShowPrayerModal(true)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#a6480e] dark:text-amber-400 bg-[#f4ece1] dark:bg-slate-800/90 border border-[#e4d6c4] dark:border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-2xs hover:border-[#a6480e] active:scale-95 transition-all cursor-pointer group"
              title="ঢাকার নামাজের পূর্ণাঙ্গ সময়সূচি দেখুন"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{nextPrayer.name}: {nextPrayer.time}</span>
              {nextPrayer.remaining && (
                <span className="text-[11px] text-[#615344] dark:text-slate-400 font-medium hidden md:inline">({nextPrayer.remaining})</span>
              )}
            </button>
          )}
        </div>

        {/* Greeting & Headline */}
        <div className="mt-5 space-y-2 text-left">
          <p className="text-xs sm:text-sm font-bold text-[#b45309] dark:text-amber-400 tracking-wide">
            আস-সালামু আলাইকুম ওয়া রাহমাতুল্লাহ
          </p>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1e1913] dark:text-white leading-[1.25] tracking-tight">
            কুরআনের নূর ও হিদায়াতে{' '}
            <span className="text-[#a6480e] dark:text-amber-400 underline decoration-wavy decoration-[#e4ad6d] underline-offset-4">
              আলোকিত হোক
            </span>{' '}
            আপনার প্রতিটি মুহূর্ত
          </h1>

          <p className="text-xs sm:text-sm text-[#615344] dark:text-slate-400 font-medium leading-relaxed max-w-2xl pt-1">
            সহজ পাঠযোগ্য বাংলা অনুবাদ, নির্ভরযোগ্য তাফসির, সঠিক নামাজের সময়সূচি ও বিশ্বখ্যাত ২০+ ক্বারীর সুললিত তিলাওয়াত শুনুন একস্থানে।
          </p>
        </div>

        {/* 3 Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-5">
          {/* Button 1: পড়া চালিয়ে যান */}
          <button
            onClick={() => {
              if (lastRead) {
                setCurrentViewSurah(lastRead.surahNumber);
                setInitialTargetAyahIndex(lastRead.ayahIndex);
              } else {
                setCurrentViewSurah(1);
                setInitialTargetAyahIndex(0);
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white bg-[#a6480e] hover:bg-[#8f3e0c] active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-100" />
            <span>{lastRead ? 'পড়া চালিয়ে যান' : 'কুরআন পড়া শুরু করুন'}</span>
          </button>

          {/* Button 2: সালাত সময়সূচি (Direct Navigation to Salah Tracker) */}
          <button
            onClick={() => setActiveTab('salah-tracker')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#2c251c] dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-[#faf6f0] dark:hover:bg-slate-750 border border-[#e2d7c8] dark:border-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#a6480e] dark:text-amber-400" />
            <span>সালাত সময়সূচি</span>
          </button>

          {/* Button 3: পরিসংখ্যান (Direct Navigation to Progress) */}
          <button
            onClick={() => setActiveTab('progress')}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-[#2c251c] dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-[#faf6f0] dark:hover:bg-slate-750 border border-[#e2d7c8] dark:border-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#a6480e] dark:text-amber-400" />
            <span>পরিসংখ্যান</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#ebdccf] dark:bg-slate-800 my-5" />

        {/* 3 Green Checklist Highlights */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-[#4c3f30] dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
            <span>১১৪টি পূর্ণাঙ্গ সূরা</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
            <span>৬২৩৬টি আয়াত ও তাফসির</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950 shrink-0" />
            <span>বিজ্ঞাপনমুক্ত অভিজ্ঞতা</span>
          </div>
        </div>

        {/* Holy Quran Artwork Section with Two Badges and Quran Photo Frame */}
        <div className="mt-6 space-y-3">
          {/* Top Tag Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4ede3] dark:bg-slate-800 text-[11px] sm:text-xs font-extrabold text-[#784f29] dark:text-amber-400 border border-[#e4d7c6] dark:border-slate-700">
              <Bookmark className="w-3.5 h-3.5 text-[#a6480e] dark:text-amber-400" fill="currentColor" />
              <span>পবিত্র কুরআনুল কারীম</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4ede3] dark:bg-slate-800 text-[11px] sm:text-xs font-extrabold text-[#784f29] dark:text-amber-400 border border-[#e4d7c6] dark:border-slate-700">
              <Headphones className="w-3.5 h-3.5 text-[#a6480e] dark:text-amber-400" />
              <span>রেহাল ও তিলাওয়াত</span>
            </span>
          </div>

          {/* Photograph Container */}
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#e6d8c8] dark:border-slate-800 group">
            <img 
              src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80"
              alt="পবিত্র কুরআনুল কারীম"
              referrerPolicy="no-referrer"
              className="w-full h-52 sm:h-64 md:h-72 object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
            />

            {/* Bottom In-Image Floating Card */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl shadow-lg border border-white/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div>
                <p className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white">
                  “নিশ্চয়ই আল্লাহর স্মরণেই অন্তর প্রশান্তি পায়”
                </p>
                <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  — (সূরা আর-রাদ: ২৮)
                </p>
              </div>

              <button
                onClick={toggleVerseAudio}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#a6480e] dark:text-amber-400 hover:text-[#883a09] active:scale-95 transition-all cursor-pointer self-end sm:self-auto px-3 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800"
              >
                {isVerseAudioPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span className="text-rose-600">অডিও থামান</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-[#a6480e] dark:text-amber-400" />
                    <span>অডিও শুনুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
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
          className="group cursor-pointer p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  সর্বশেষ পঠিত
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors mt-0.5">
                {lastRead.surahName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                আয়াত নম্বর {toBengaliNumber(lastRead.ayahIndex + 1)} থেকে পড়া শুরু করুন
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 group-hover:bg-amber-600 group-hover:text-white transition-all flex-shrink-0 border border-amber-200/60 dark:border-amber-800/60">
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
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-sans">
              <Headphones className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>পবিত্র পরিবেশ ও ফোকাস মোড</span>
              <span className="opacity-40">•</span>
              <span className="text-amber-300 font-extrabold">Pure Sanctuary</span>
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
              ক্লিন তিলাওয়াত ও প্রশান্তিময় পরিবেশ
            </h3>
            <p className="text-xs md:text-sm text-emerald-100/90 font-medium leading-relaxed">
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/80 border border-emerald-600/40 text-xs font-bold text-emerald-100 transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
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
      {/* 3. Islamic Services & Feature Exhibition Cards - Solid White Background with Distinct Color Palettes */}
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-2xs">
                <Compass className="w-4 h-4 animate-spin-slow" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-bengali">
                ইসলামিক সেকশন ও সার্ভিসেস
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              প্রয়োজনীয় ফিচারে সরাসরি প্রবেশ করতে নিচের আকর্ষণীয় কার্ডগুলোতে ট্যাপ করুন
            </p>
          </div>
        </div>

        {/* Compact Grid with Solid Pure White Cards, Rich Multi-Colors & Smooth Float Animation */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {featureCards.map((card) => {
            const IconComponent = card.icon;
            const isCleanMode = card.id === 'clean-mode';

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => card.action ? card.action() : card.tab && setActiveTab(card.tab)}
                className={`cursor-pointer rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${card.borderHover} transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-xl relative overflow-hidden min-h-[160px] sm:min-h-[180px] ${
                  isCleanMode ? 'col-span-2 sm:col-span-2 md:col-span-1' : ''
                }`}
              >
                {/* Top Vibrant Color Stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${card.topStripe}`} />

                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 relative z-10">
                  {/* Header: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${card.iconBg} flex items-center justify-center group-hover:scale-105 group-hover:rotate-2 transition-transform shrink-0`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full ${card.badgeBg} font-bengali truncate shadow-2xs`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Body: Title, Subtitle & Action Arrow */}
                  <div className="mt-auto space-y-1.5">
                    <h3 className={`font-black text-sm sm:text-base text-slate-900 dark:text-white ${card.titleHover} flex items-center justify-between gap-1.5 transition-colors leading-snug`}>
                      <span className="truncate">{card.title}</span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${card.arrowBg} group-hover:scale-110 group-hover:translate-x-0.5 transition-all shrink-0`}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {card.subtitle}
                    </p>
                  </div>
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
