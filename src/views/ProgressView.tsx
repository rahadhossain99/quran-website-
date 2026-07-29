import React, { useState } from 'react';
import { useAppStore, SurahProgressDetail } from '../Store';
import { getBanglaSurahData, BANGLA_SURAH_MAP } from '../utils/banglaSurahNames';
import { 
  TrendingUp, 
  Flame, 
  Calendar, 
  Heart, 
  BookOpen, 
  Headphones, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Zap, 
  Award,
  BarChart3,
  Trash2,
  AlertTriangle,
  X,
  Layers,
  Activity,
  RotateCcw,
  PieChart,
  Target,
  Trophy,
  Filter,
  ArrowUpRight,
  Sparkle,
  Bookmark,
  Disc,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Total Ayahs in Al-Quran
const TOTAL_QURAN_AYAHS = 6236;

// Exact Ayah count map for all 114 Surahs of Al-Quran
const SURAH_TOTAL_AYAHS_MAP: Record<number, number> = {
  1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
  11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
  21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
  31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
  41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
  51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
  61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
  71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
  81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
  91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
  101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
  111: 5, 112: 4, 113: 5, 114: 6
};

export const ProgressView = () => {
  const { 
    weeklyProgress, 
    favorites, 
    lastRead, 
    setCurrentViewSurah, 
    resetProgress,
    surahProgressMap,
    resetSurahProgressOnly
  } = useAppStore();

  const [expandedSurah, setExpandedSurah] = useState<number | null>(null); // Clean default: no surah forced open
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6); // Default today (last element of 7 days)
  const [tableFilter, setTableFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  
  // Full App Reset Modal
  const [showFullResetModal, setShowFullResetModal] = useState<boolean>(false);
  const [fullResetConfirmed, setFullResetConfirmed] = useState<boolean>(false);

  // Surah Progress Only Reset Modal
  const [showSurahResetModal, setShowSurahResetModal] = useState<boolean>(false);
  const [surahResetConfirmed, setSurahResetConfirmed] = useState<boolean>(false);

  // Convert English numbers to Bengali digits
  const toBnNumber = (num: number | string) => {
    const symbols = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return num.toString().split('').map(c => symbols[c as keyof typeof symbols] || c).join('');
  };

  // Convert Gregorian date to Bengali format
  const formatBnDate = (dateStr?: string) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const day = toBnNumber(d.getDate());
    const year = toBnNumber(d.getFullYear());
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const month = months[d.getMonth()];
    return `${day} ${month}, ${year}`;
  };

  const getDayOfWeekNameBn = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    return dayNames[d.getDay()];
  };

  // Compute overall statistics
  const totalAyahsRead = weeklyProgress.reduce((acc, curr) => acc + (curr.ayahs || 0), 0);
  const totalSecondsListened = weeklyProgress.reduce((acc, curr) => acc + (curr.seconds || 0), 0);
  const totalMinutesListened = Math.floor(totalSecondsListened / 60);

  // Active days count
  const activeDaysCount = weeklyProgress.filter(p => (p.seconds || 0) > 0 || (p.ayahs || 0) > 0).length;
  
  // App usage date calculation
  const firstUseDate = weeklyProgress.length > 0 ? weeklyProgress[0].date : new Date().toISOString().split('T')[0];
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Daily goal calculation (15 minutes target)
  const todayProgress = weeklyProgress.find(p => p.date === todayDateStr) || { seconds: 0, ayahs: 0, minutes: 0 };
  const targetSeconds = 15 * 60;
  const todayGoalPercentage = Math.min(100, Math.round(((todayProgress.seconds || 0) / targetSeconds) * 100));

  // Selected Day data for "দৈনিক বিবরণী"
  const selectedDayData = weeklyProgress[selectedDayIdx] || {
    date: todayDateStr,
    seconds: 0,
    minutes: 0,
    ayahs: 0,
    surahs: []
  };

  // Favorite Surah name display
  const topFavoriteSurahNumber = favorites.length > 0 ? favorites[0] : (lastRead ? lastRead.surahNumber : 1);
  const topFavSurahData = getBanglaSurahData(topFavoriteSurahNumber);

  // Dynamic Surah Progress List from Store (Automatically populated when any surah is played or opened)
  const trackedSurahList = (Object.values(surahProgressMap || {}) as SurahProgressDetail[]).map(item => {
    const totalAyahs = SURAH_TOTAL_AYAHS_MAP[item.surahNumber] || 100;
    const readAyahs = Math.min(totalAyahs, item.readAyahs || 0);
    const listenedMins = Math.floor((item.listenedSeconds || 0) / 60);
    const listenedSecs = (item.listenedSeconds || 0) % 60;
    const percentage = Math.min(100, Math.round((readAyahs / totalAyahs) * 100));
    const isCompleted = percentage >= 100;
    return {
      ...item,
      totalAyahs,
      readAyahs,
      listenedMins,
      listenedSecs,
      percentage,
      isCompleted
    };
  }).sort((a, b) => new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime());

  // Filtered Surahs based on tableFilter
  const filteredSurahList = trackedSurahList.filter(item => {
    if (tableFilter === 'completed') return item.isCompleted;
    if (tableFilter === 'in_progress') return !item.isCompleted;
    return true;
  });

  // Calculate Khatam Completion Ratio across all 6,236 Ayahs
  const sumOfAllReadAyahs = trackedSurahList.reduce((acc, curr) => acc + curr.readAyahs, 0);
  const quranCompletionPercent = Math.min(100, Number(((sumOfAllReadAyahs / TOTAL_QURAN_AYAHS) * 100).toFixed(2)));

  // Execute full reset
  const handleConfirmFullReset = () => {
    resetProgress('RESTART');
    setShowFullResetModal(false);
    setFullResetConfirmed(false);
  };

  // Execute surah progress reset only
  const handleConfirmSurahReset = () => {
    resetSurahProgressOnly();
    setShowSurahResetModal(false);
    setSurahResetConfirmed(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full select-none relative" id="progress-screen">
      
      {/* Background Geometric Islamic Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z M 20 5 L 35 20 L 20 35 L 5 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="20" cy="20" r="3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-grid)" />
        </svg>
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* 1. Top Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 w-max px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20 mb-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
            <span>লাইভ অ্যানালিটিক্স ও রিপোর্ট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight font-bengali flex items-center gap-2">
            <span>কুরআন তিলাওয়াত অগ্রগতি ও পারফর্ম্যান্স</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            যেকোনো সূরা প্লে করা বা পড়া মাত্র স্বয়ংক্রিয়ভাবে লাইভ ডেটা হিস্ট্রি আপডেট হবে
          </p>
        </div>

        {/* Action Buttons: Full Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFullResetModal(true)}
            className="text-[11px] font-bold text-[var(--text-muted)] hover:text-rose-500 bg-[var(--bg-surface)] hover:bg-rose-50 dark:hover:bg-rose-950/40 px-4 py-2.5 rounded-2xl border border-[var(--border)] hover:border-rose-500/40 transition-all font-bengali flex items-center space-x-2 cursor-pointer shadow-xs active:scale-95 group"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500 group-hover:-rotate-90 transition-transform" />
            <span>নতুন করে শুরু (রিসেট)</span>
          </button>
        </div>
      </div>

      {/* 2. Khatam & Streak Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Streak & Consistency Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-6 rounded-[2.5rem] bg-gradient-to-r from-emerald-600/15 via-teal-500/20 to-emerald-950/15 border-2 border-emerald-500/30 shadow-lg relative overflow-hidden backdrop-blur-md flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-bl-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30 relative group">
                <Flame className="w-8 h-8 fill-white animate-bounce" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-300 font-sans">
                    ধারাবাহিক স্ট্রিক
                  </p>
                  <span className="text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bengali">
                    একটিভ ট্র্যাকার
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mt-0.5 font-bengali">
                  {activeDaysCount > 0 ? `${toBnNumber(activeDaysCount)} দিন একাদিক্রমে অব্যাহত!` : 'আজকের তেলাওয়াত শুরু করুন!'}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-bengali">
                  প্রতিদিন হোম বা সার্চ থেকে যেকোনো সূরা চালু করলেই স্ট্রিক যুক্ত হয়।
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-surface)]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[var(--border)] text-center shrink-0 w-full sm:w-auto">
              <p className="text-[10px] font-bold text-[var(--text-muted)] font-bengali">সাপ্তাহিক টার্গেট</p>
              <p className="text-sm font-black text-[var(--primary)] mt-0.5 font-bengali">
                {toBnNumber(activeDaysCount)}/৭ দিন অর্জিত
              </p>
            </div>
          </div>

          {/* Weekly Mini Streak Dots */}
          <div className="grid grid-cols-7 gap-2 pt-4 border-t border-emerald-500/20 relative z-10">
            {weeklyProgress.map((dayItem, idx) => {
              const hasAct = (dayItem.seconds || 0) > 0 || (dayItem.ayahs || 0) > 0;
              return (
                <div key={dayItem.date} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    hasAct 
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30' 
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]'
                  }`}>
                    {hasAct ? <CheckCircle2 className="w-4 h-4" /> : toBnNumber(idx + 1)}
                  </div>
                  <span className="text-[9px] font-bold text-[var(--text-muted)] font-bengali mt-1">
                    {getDayOfWeekNameBn(dayItem.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Total Quran Khatam Progress Ring Card */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden flex flex-col justify-between items-center text-center"
        >
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[var(--text-main)] font-bengali flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>খতম অগ্রগতি</span>
            </span>
            <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary-soft)] px-2.5 py-0.5 rounded-full font-bengali">
              ৬,২৩৬ আয়াত
            </span>
          </div>

          {/* SVG Circular Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[var(--border)]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[var(--primary)] transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * quranCompletionPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-5 h-5 text-[var(--primary)] mb-0.5" />
              <span className="text-base font-black font-bengali text-[var(--text-main)]">
                {toBnNumber(quranCompletionPercent)}%
              </span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] font-bengali">
                কুরআন সম্পূর্ণ
              </span>
            </div>
          </div>

          <p className="text-[11px] font-bold text-[var(--text-muted)] font-bengali">
            মোট {toBnNumber(sumOfAllReadAyahs)} টি আয়াত পঠিত হয়েছে
          </p>
        </motion.div>

      </div>

      {/* 3. 4 Key Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Favorite Surah Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-4 rounded-3xl bg-gradient-to-br from-rose-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-rose-500/20 shadow-xs flex flex-col justify-between min-h-[130px] relative overflow-hidden group cursor-pointer"
          onClick={() => setCurrentViewSurah(topFavoriteSurahNumber)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full font-bengali">
              পছন্দ
            </span>
          </div>
          <div>
            <h4 className="font-extrabold text-base text-[var(--text-main)] truncate font-bengali leading-tight group-hover:text-rose-500 transition-colors">
              {topFavSurahData ? topFavSurahData.banglaName : 'সূরা আল-ফাতেহা'}
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 font-bengali">
              প্রিয় সূরা ({toBnNumber(favorites.length)}টি সংরক্ষিত)
            </p>
          </div>
        </motion.div>

        {/* Read Ayahs Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-amber-500/20 shadow-xs flex flex-col justify-between min-h-[130px] relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bengali">
              মোট আয়াত
            </span>
          </div>
          <div>
            <h4 className="font-black text-xl text-[var(--text-main)] font-bengali leading-tight">
              {toBnNumber(totalAyahsRead)} টি
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 font-bengali">
              পঠিত আয়াত সংখ্যা
            </p>
          </div>
        </motion.div>

        {/* Listen Time Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-emerald-500/20 shadow-xs flex flex-col justify-between min-h-[130px] relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="flex items-end space-x-0.5 h-3">
              <div className="w-0.5 bg-emerald-500 h-full animate-bounce" />
              <div className="w-0.5 bg-emerald-500 h-2/3 animate-bounce [animation-delay:0.2s]" />
              <div className="w-0.5 bg-emerald-500 h-4/5 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
          <div>
            <h4 className="font-black text-xl text-[var(--text-main)] font-bengali leading-tight">
              {totalMinutesListened > 0 ? `${toBnNumber(totalMinutesListened)} মিনিট` : `${toBnNumber(totalSecondsListened)} সেকেন্ড`}
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 font-bengali">
              সর্বমোট শ্রবণ সময়
            </p>
          </div>
        </motion.div>

        {/* Tracked Surahs Count Card */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-indigo-500/20 shadow-xs flex flex-col justify-between min-h-[130px] relative overflow-hidden group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Disc className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bengali">
              অটো যুক্ত
            </span>
          </div>
          <div>
            <h4 className="font-black text-xl text-[var(--text-main)] font-bengali leading-tight">
              {toBnNumber(trackedSurahList.length)} টি
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 font-bengali">
              সক্রিয় ট্র্যাকিং সূরা
            </p>
          </div>
        </motion.div>

      </div>

      {/* 4. Interactive Weekly Bar Chart Analysis */}
      <div className="mb-8 p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <BarChart3 className="w-5 h-5" />
              <h3 className="font-black text-base text-[var(--text-main)] font-bengali">
                সাপ্তাহিক তিলাওয়াত ও অডিও ট্র্যাকিং গ্রাফ
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-bengali">
              নিচের বারগুলোতে ক্লিক করে যে কোনো দিনের বিস্তারিত পঠিত আয়াত ও সময় দেখুন
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-[var(--text-muted)] font-bengali bg-[var(--bg-main)] px-3 py-1.5 rounded-2xl border border-[var(--border)] w-max">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>লাইভ ডেটা গ্রাফ</span>
          </div>
        </div>

        {/* 7-Day Interactive Bar Chart */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="grid grid-cols-7 gap-2 items-end h-48 pb-2 px-1">
            {weeklyProgress.map((dayItem, idx) => {
              const isSelected = selectedDayIdx === idx;
              const secs = dayItem.seconds || 0;
              const ayahs = dayItem.ayahs || 0;
              const hasActivity = secs > 0 || ayahs > 0;
              
              const heightPercent = hasActivity ? Math.min(100, Math.max(22, (secs / 300) * 100)) : 10;

              return (
                <div key={dayItem.date} className="flex flex-col items-center h-full justify-end group">
                  <button
                    onClick={() => setSelectedDayIdx(idx)}
                    className="w-full flex flex-col items-center cursor-pointer transition-all focus:outline-none"
                  >
                    <div className="w-full max-w-[42px] bg-[var(--bg-main)]/80 rounded-2xl p-1.5 h-36 flex flex-col justify-end items-center relative overflow-hidden border border-[var(--border)] group-hover:border-[var(--primary)]/60 transition-all">
                      
                      {/* Active Fill Bar */}
                      <motion.div 
                        initial={{ height: '0%' }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.7, delay: idx * 0.06 }}
                        className={`w-full rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/30' 
                            : hasActivity 
                              ? 'bg-[var(--primary)] opacity-75 group-hover:opacity-100' 
                              : 'bg-[var(--border)] opacity-30'
                        }`}
                      />

                      {hasActivity && (
                        <div className={`absolute top-2 w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-ping' : 'bg-[var(--primary)]'}`} />
                      )}
                    </div>

                    <span className={`text-xs font-bold mt-2 font-bengali transition-all ${
                      isSelected ? 'text-[var(--primary)] font-black scale-110' : 'text-[var(--text-muted)]'
                    }`}>
                      {getDayOfWeekNameBn(dayItem.date)}
                    </span>

                    <span className="text-[9px] font-bold text-[var(--text-muted)] font-bengali">
                      {secs > 0 ? `${toBnNumber(secs)} সে` : '০মি'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Selected Day Detail Banner ("দৈনিক বিবরণী") */}
      <motion.div 
        key={selectedDayIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base text-[var(--text-main)] font-bengali">
              দৈনিক বিস্তারিত রিপোর্ট
            </h3>
          </div>
          <span className="text-xs font-black text-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1 rounded-full border border-[var(--primary)]/20 font-bengali">
            {formatBnDate(selectedDayData.date)} ({getDayOfWeekNameBn(selectedDayData.date)})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-[var(--bg-main)]/60 p-4 rounded-2xl border border-[var(--border)] flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-black text-[var(--text-main)] font-bengali leading-tight">
                {selectedDayData.seconds > 0 ? `${toBnNumber(selectedDayData.seconds)} সেকেন্ড` : '০ সেকেন্ড'}
              </p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] font-bengali">মোট শ্রবণ সময়</p>
            </div>
          </div>

          <div className="bg-[var(--bg-main)]/60 p-4 rounded-2xl border border-[var(--border)] flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-black text-[var(--text-main)] font-bengali leading-tight">
                {toBnNumber(selectedDayData.ayahs)} টি আয়াত
              </p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] font-bengali">পঠিত আয়াত</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15 text-center">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 italic font-bengali leading-relaxed">
            “হে মুমিনগণ! প্রতিদিন অন্তত এক আয়াত পড়ে বা শুনে দিনের কাজ শুরু করুন।”
          </p>
        </div>
      </motion.div>

      {/* 6. Dynamic Surah Progress Table Section (Auto-populated from actual audio playback or reading) */}
      <div className="mb-10" id="surah-progress-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-main)] font-bengali flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
              <span>সূরাভিত্তিক অটো ট্র্যাকিং ও বিস্তারিত টেবিল</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-bengali">
              হোমপেজ বা সার্চ থেকে যে কোনো সূরা চালানা বা ওপেন করার সাথে সাথে এখানে অটোমেটিক যুক্ত হয়ে আপডেট হতে থাকবে।
            </p>
          </div>

          {/* Filter Tabs & Reset Button */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Filter Tabs */}
            <div className="bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border)] flex items-center space-x-1 font-bengali text-xs">
              <button
                onClick={() => setTableFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  tableFilter === 'all' 
                    ? 'bg-[var(--primary)] text-white shadow-xs' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                সকল ({toBnNumber(trackedSurahList.length)})
              </button>
              <button
                onClick={() => setTableFilter('in_progress')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  tableFilter === 'in_progress' 
                    ? 'bg-[var(--primary)] text-white shadow-xs' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                চলমান
              </button>
              <button
                onClick={() => setTableFilter('completed')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  tableFilter === 'completed' 
                    ? 'bg-[var(--primary)] text-white shadow-xs' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                সম্পূর্ণ
              </button>
            </div>

            {/* Dedicated Surah Reset Button */}
            <button
              onClick={() => setShowSurahResetModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold font-bengali flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer group"
              title="শুধু সূরাগুলোর ট্র্যাকিং তালিকা রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform" />
              <span>সূরা রিসেট</span>
            </button>
          </div>
        </div>

        {/* Dynamic List / Table Rendering */}
        {filteredSurahList.length === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl p-8 text-center font-bengali shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Compass className="w-7 h-7 animate-pulse" />
            </div>
            <h3 className="font-extrabold text-base text-[var(--text-main)] mb-1">
              এখনো কোনো সূরা এখানে জমা হয়নি
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mb-4 leading-relaxed">
              আপনাকে আলাদা করে কোনো সূরা যোগ করতে হবে না। আপনি হোমপেজ বা অনুসন্ধান থেকে যে কোনো সূরা পড়া বা অডিও প্লে শুরু করলেই তা স্বয়ংক্রিয়ভাবে এখানে যুক্ত হয়ে লাইভ অগ্রগতি দেখাবে।
            </p>
            <button
              onClick={() => setCurrentViewSurah(1)}
              className="px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-white font-bold text-xs shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>সূরা আল-ফাতেহা দিয়ে শুরু করুন</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSurahList.map((item) => {
              const bSurah = getBanglaSurahData(item.surahNumber);
              const isExpanded = expandedSurah === item.surahNumber;

              return (
                <div 
                  key={item.surahNumber}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-3xl overflow-hidden transition-all shadow-2xs hover:border-[var(--primary)]/40"
                >
                  {/* Row Main Bar */}
                  <div 
                    onClick={() => setExpandedSurah(isExpanded ? null : item.surahNumber)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-black text-xs font-sans shrink-0 border border-[var(--primary)]/20">
                        {item.surahNumber}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-black text-base text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors font-bengali">
                            {bSurah ? bSurah.banglaName : `সূরা #${item.surahNumber}`}
                          </h3>
                          {item.isCompleted ? (
                            <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bengali flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bengali">
                              চলমান
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-[var(--text-muted)] font-bengali mt-0.5">
                          {bSurah ? bSurah.banglaPronunciation : ''} • <span className="opacity-80">{bSurah ? bSurah.banglaMeaning : ''}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-[var(--primary)] font-bengali">
                          {toBnNumber(item.readAyahs)}/{toBnNumber(item.totalAyahs)} আয়াত
                        </p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] font-bengali">
                          {toBnNumber(item.percentage)}% সম্পন্ন
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-[var(--bg-main)] h-1.5">
                    <div 
                      className="bg-gradient-to-r from-[var(--primary)] to-emerald-400 h-full transition-all duration-700" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  {/* Accordion Details Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 sm:p-5 bg-[var(--bg-main)]/40 border-t border-[var(--border)] font-bengali space-y-4"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border)]">
                            <p className="text-[10px] font-bold text-[var(--text-muted)]">পঠিত আয়াত সংখ্যা</p>
                            <p className="text-sm font-black text-[var(--text-main)] mt-0.5">
                              {toBnNumber(item.readAyahs)} টি
                            </p>
                          </div>

                          <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border)]">
                            <p className="text-[10px] font-bold text-[var(--text-muted)]">মোট শ্রবণ সময়</p>
                            <p className="text-sm font-black text-[var(--primary)] mt-0.5">
                              {item.listenedMins > 0 ? `${toBnNumber(item.listenedMins)} মিনিট` : `${toBnNumber(item.listenedSecs)} সেকেন্ড`}
                            </p>
                          </div>

                          <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-[var(--border)] col-span-2 sm:col-span-1">
                            <p className="text-[10px] font-bold text-[var(--text-muted)]">সর্বশেষ আয়াত অবস্থান</p>
                            <p className="text-sm font-black text-[var(--text-main)] mt-0.5">
                              আয়াত নম্বর {toBnNumber(item.readAyahs > 0 ? item.readAyahs : 1)}
                            </p>
                          </div>
                        </div>

                        {/* Open Surah Button */}
                        <button
                          onClick={() => setCurrentViewSurah(item.surahNumber)}
                          className="w-full bg-[var(--primary)] text-white hover:opacity-95 font-black text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>এই সূরা তেলাওয়াত বা শুনুন</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Full App Reset Confirmation Modal */}
      <AnimatePresence>
        {showFullResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] border-2 border-rose-500/30 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden font-bengali"
            >
              <button
                onClick={() => {
                  setShowFullResetModal(false);
                  setFullResetConfirmed(false);
                }}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--bg-main)] text-[var(--text-muted)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20 shadow-lg shadow-rose-500/10">
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                </div>

                <h3 className="text-xl font-black text-[var(--text-main)] mb-2">
                  সম্পূর্ণ অগ্রগতি রিসেট নিশ্চিতকরণ
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                  আপনি কি নিশ্চিত যে আপনার সমস্ত আল-কুরআন তেলাওয়াত হিস্ট্রি, সূরা ট্র্যাকিং, স্ট্রিক, পড়ার সময় ও রিসেন্ট লগ মুছে ফেলে নতুন করে শুরু করতে চান?
                </p>

                {/* Double Safety Checkbox */}
                <label className="flex items-center space-x-2.5 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/20 w-full mb-6 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={fullResetConfirmed}
                    onChange={(e) => setFullResetConfirmed(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500 cursor-pointer accent-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                    আমি সমস্ত হিস্ট্রি ডিলিট নিশ্চিত করছি
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowFullResetModal(false);
                      setFullResetConfirmed(false);
                    }}
                    className="py-3 px-4 rounded-2xl border border-[var(--border)] text-[var(--text-main)] font-extrabold text-xs hover:bg-[var(--bg-main)] transition-all cursor-pointer"
                  >
                    বাতিল করুন
                  </button>

                  <button
                    disabled={!fullResetConfirmed}
                    onClick={handleConfirmFullReset}
                    className={`py-3 px-4 rounded-2xl font-black text-xs text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                      fullResetConfirmed 
                        ? 'bg-rose-500 hover:bg-rose-600 active:scale-95 cursor-pointer shadow-rose-500/20' 
                        : 'bg-rose-300 dark:bg-rose-950/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>হ্যাঁ, রিস্টার্ট করুন</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Surah Progress Only Reset Confirmation Modal */}
      <AnimatePresence>
        {showSurahResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-surface)] border-2 border-rose-500/30 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden font-bengali"
            >
              <button
                onClick={() => {
                  setShowSurahResetModal(false);
                  setSurahResetConfirmed(false);
                }}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--bg-main)] text-[var(--text-muted)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                  <RotateCcw className="w-8 h-8 animate-spin" />
                </div>

                <h3 className="text-xl font-black text-[var(--text-main)] mb-2">
                  সূরা ট্র্যাকিং তালিকা রিসেট
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                  আপনি কি শুধু সূরা ট্র্যাকিং তালিকা ডিলিট করতে চান? নতুন সূরা শোনা বা পড়ার সাথে সাথে আবার নতুন করে তালিকা তৈরি হবে।
                </p>

                <label className="flex items-center space-x-2.5 bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20 w-full mb-6 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={surahResetConfirmed}
                    onChange={(e) => setSurahResetConfirmed(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    হ্যাঁ, সূরা তালিকা খালি করুন
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowSurahResetModal(false);
                      setSurahResetConfirmed(false);
                    }}
                    className="py-3 px-4 rounded-2xl border border-[var(--border)] text-[var(--text-main)] font-extrabold text-xs hover:bg-[var(--bg-main)] transition-all cursor-pointer"
                  >
                    বাতিল করুন
                  </button>

                  <button
                    disabled={!surahResetConfirmed}
                    onClick={handleConfirmSurahReset}
                    className={`py-3 px-4 rounded-2xl font-black text-xs text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                      surahResetConfirmed 
                        ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 cursor-pointer shadow-amber-500/20' 
                        : 'bg-amber-300 dark:bg-amber-950/50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>তালিকা রিসেট করুন</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
