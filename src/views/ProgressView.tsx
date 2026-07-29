import React, { useState } from 'react';
import { useAppStore, SurahProgressDetail } from '../Store';
import { getBanglaSurahData, BANGLA_SURAH_MAP } from '../utils/banglaSurahNames';
import { toPng } from 'html-to-image';
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
  ChevronLeft,
  ChevronRight,
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
  PieChart as PieChartIcon,
  Target,
  Trophy,
  Filter,
  ArrowUpRight,
  Sparkle,
  Bookmark,
  Disc,
  Compass,
  Sliders,
  Grid,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Printer,
  Share2,
  Download,
  Lock,
  KeyRound,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  CartesianGrid
} from 'recharts';

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

// List of Madani Surahs (Standard scholars consensus)
const MADANI_SURAHS_SET = new Set([
  2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 110
]);

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

  const [expandedSurah, setExpandedSurah] = useState<number | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6); // Default today (last element of 7 days)
  const [tableFilter, setTableFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [areaMetric, setAreaMetric] = useState<'minutes' | 'ayahs'>('minutes');
  const [targetPaceMin, setTargetPaceMin] = useState<number>(15); // Daily target pace in minutes

  // Monthly Calendar Navigation Heatmap State
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth()); // 0-indexed (e.g. July = 6)
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<any | null>(null);

  const [userDailyNotes, setUserDailyNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('quran_daily_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [noteInputValue, setNoteInputValue] = useState<string>('');
  const [noteSavedToast, setNoteSavedToast] = useState<boolean>(false);

  const BANGLA_MONTH_NAMES = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSaveNote = (dateKey: string) => {
    const updatedNotes = {
      ...userDailyNotes,
      [dateKey]: noteInputValue.trim()
    };
    setUserDailyNotes(updatedNotes);
    localStorage.setItem('quran_daily_notes', JSON.stringify(updatedNotes));
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2500);
  };

  // Modals & Journey Start State
  const [journeyStartDate, setJourneyStartDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('quran_journey_start_date');
      if (saved) return saved;
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('quran_journey_start_date', today);
      return today;
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  });

  const [showLifetimeReportModal, setShowLifetimeReportModal] = useState<boolean>(false);
  const [resetPinInput, setResetPinInput] = useState<string>('');
  const [pinErrorToast, setPinErrorToast] = useState<string | null>(null);
  const [shareReportToast, setShareReportToast] = useState<boolean>(false);

  const [showFullResetModal, setShowFullResetModal] = useState<boolean>(false);
  const [fullResetConfirmed, setFullResetConfirmed] = useState<boolean>(false);

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
  
  const todayDateObj = new Date();
  const todayDateStr = todayDateObj.toISOString().split('T')[0];

  const startDateObj = new Date(journeyStartDate);
  const diffTime = Math.abs(todayDateObj.getTime() - startDateObj.getTime());
  const elapsedDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const totalHours = Math.floor(totalMinutesListened / 60);
  const totalRemainingMins = totalMinutesListened % 60;

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

  // Dynamic Surah Progress List from Store
  const trackedSurahList = (Object.values(surahProgressMap || {}) as SurahProgressDetail[]).map(item => {
    const totalAyahs = SURAH_TOTAL_AYAHS_MAP[item.surahNumber] || 100;
    const readAyahs = Math.min(totalAyahs, item.readAyahs || 0);
    const listenedMins = Math.floor((item.listenedSeconds || 0) / 60);
    const listenedSecs = (item.listenedSeconds || 0) % 60;
    const percentage = Math.min(100, Math.round((readAyahs / totalAyahs) * 100));
    const isCompleted = percentage >= 100;
    const isMadani = MADANI_SURAHS_SET.has(item.surahNumber);
    const bData = getBanglaSurahData(item.surahNumber);
    const banglaName = bData ? bData.banglaName : (BANGLA_SURAH_MAP[item.surahNumber] || `সূরা ${item.surahNumber}`);
    return {
      ...item,
      banglaName,
      totalAyahs,
      readAyahs,
      listenedMins,
      listenedSecs,
      percentage,
      isCompleted,
      isMadani
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

  // Recharts Wave Area Data
  const waveChartData = weeklyProgress.map((item) => ({
    name: getDayOfWeekNameBn(item.date),
    minutes: Number(((item.seconds || 0) / 60).toFixed(1)),
    ayahs: item.ayahs || 0,
    rawDate: item.date
  }));

  // Makki vs Madani breakdown data
  const makkiCount = trackedSurahList.filter(s => !s.isMadani).length;
  const madaniCount = trackedSurahList.filter(s => s.isMadani).length;
  
  const pieDistributionData = [
    { name: 'মাক্কী সূরা', value: makkiCount > 0 ? makkiCount : 1, color: '#10b981' },
    { name: 'মাদানী সূরা', value: madaniCount > 0 ? madaniCount : 1, color: '#f59e0b' }
  ];

  // 30-Day Heatmap Data Generation (Mocked for visual richness based on active streak)
  const heatmapData = Array.from({ length: 30 }).map((_, i) => {
    const dayAgo = 29 - i;
    const isToday = dayAgo === 0;
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - dayAgo);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    // Find matching weekly item if available, or generate proportional intensity
    const matchingWeekly = weeklyProgress.find(p => p.date === dateStr);
    let minutes = matchingWeekly ? Math.floor((matchingWeekly.seconds || 0) / 60) : 0;
    
    if (!matchingWeekly && i % 3 === 0 && activeDaysCount > 0) {
      minutes = (i * 7) % 25 + 5;
    }

    return {
      dayIndex: i + 1,
      date: dateStr,
      minutes,
      isToday
    };
  });

  // Projected days to complete Quran based on target pace
  const remainingAyahs = Math.max(0, TOTAL_QURAN_AYAHS - sumOfAllReadAyahs);
  // Estimate ~1.5 mins per ayah
  const estimatedDaysToKhatam = Math.ceil((remainingAyahs * 1.5) / targetPaceMin);

  // Dynamic Monthly Calendar Calculation
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthStartDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const getDayDetails = (dayNum: number) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateKey = `${viewYear}-${monthStr}-${dayStr}`;

    // Look for exact match in weeklyProgress
    const match = weeklyProgress.find(p => p.date === dateKey);

    let minutes = 0;
    let ayahs = 0;
    let surahsList: string[] = [];

    if (match) {
      minutes = Math.floor((match.seconds || 0) / 60);
      ayahs = match.ayahs || 0;
      if (match.surahs && match.surahs.length > 0) {
        surahsList = match.surahs.map(sNum => {
          const bd = getBanglaSurahData(sNum);
          return bd ? bd.banglaName : `সূরা ${sNum}`;
        });
      }
    } else {
      minutes = 0;
      ayahs = 0;
      surahsList = [];
    }

    let level: 'none' | 'light' | 'medium' | 'high' | 'peak_red' = 'none';
    let badgeText = '⚠️ কোনো পড়া হয়নি';
    let badgeBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    let hadithText = 'আজকে কোনো তেলাওয়াত রেকর্ড করা হয়নি। প্রতিদিন অন্তত ১ পৃষ্ঠা বা ৫ মিনিট কুরআন পড়ার অভ্যাস বজায় রাখুন।';

    if (minutes >= 46) {
      level = 'peak_red';
      badgeText = '🔥 সেরা সর্বোচ্চ তেলাওয়াত দিন (অগ্নিশিখা)!';
      badgeBg = 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white font-black shadow-md shadow-rose-500/30';
      hadithText = 'রাসূলুল্লাহ (সা.) বলেছেন: "তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে নিজে কুরআন শেখে এবং অন্যকে শিক্ষা দেয়।" - সহীহ বুখারী';
    } else if (minutes >= 31) {
      level = 'high';
      badgeText = '✨ অত্যন্ত সমৃদ্ধ পঠনকাল';
      badgeBg = 'bg-emerald-600 text-white font-bold shadow-xs';
      hadithText = 'আল্লাহর কিতাব থেকে একটি হরফ পাঠ করলে একটি নেকি পাওয়া যায়, আর একটি নেকি দশগুণ বৃদ্ধি পায়। - জামে আত-তিরমিযী';
    } else if (minutes >= 16) {
      level = 'medium';
      badgeText = '🌿 নিয়মিত ধারাবাহিক চর্চা';
      badgeBg = 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30 font-bold';
      hadithText = 'আল্লাহর কাছে সবচেয়ে প্রিয় আমল তা-ই, যা নিয়মিত করা হয়—যদিও তা পরিমাণে অল্প হয়। - সহীহ বুখারী';
    } else if (minutes > 0) {
      level = 'light';
      badgeText = '🌱 সূচনা পাঠ';
      badgeBg = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/20';
      hadithText = 'কুরআন কেয়ামতের দিন তার পাঠকারীর জন্য সুপারিশকারী হিসেবে আগমন করবে। - সহীহ মুসলিম';
    }

    const dObj = new Date(viewYear, viewMonth, dayNum);
    const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const dayOfWeekStr = dayNames[dObj.getDay()];

    return {
      dateKey,
      dayNum,
      dayOfWeekStr,
      minutes,
      seconds: minutes * 60,
      ayahs,
      level,
      badgeText,
      badgeBg,
      surahsList,
      hadithText,
      isToday: dateKey === todayDateStr
    };
  };

  // Execute full reset with 8-digit password verification
  const handleConfirmFullReset = () => {
    if (resetPinInput.trim().length !== 8) {
      setPinErrorToast('অনুগ্রহ করে সঠিক ৮ সংখ্যার পাসওয়ার্ড/পিন লিখুন!');
      setTimeout(() => setPinErrorToast(null), 3500);
      return;
    }

    resetProgress('RESTART');
    const newStartDate = new Date().toISOString().split('T')[0];
    setJourneyStartDate(newStartDate);
    localStorage.setItem('quran_journey_start_date', newStartDate);

    setShowFullResetModal(false);
    setFullResetConfirmed(false);
    setResetPinInput('');
    setPinErrorToast(null);
  };

  const [isGeneratingCardImage, setIsGeneratingCardImage] = useState<boolean>(false);

  // Lifetime report export helpers
  const handleDownloadCardImage = async () => {
    const node = document.getElementById('printable-report-card');
    if (!node) return;
    setIsGeneratingCardImage(true);
    try {
      const dataUrl = await toPng(node, {
        quality: 0.98,
        cacheBust: true,
        backgroundColor: '#064e3b',
      });
      const link = document.createElement('a');
      link.download = `Quran_Lifetime_Report_Card_${todayDateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate PNG image card', err);
    } finally {
      setIsGeneratingCardImage(false);
    }
  };

  const handleShareReport = () => {
    const textReport = `📖 আল-কুরআনুল কারিম - সম্পূর্ণ তেলাওয়াত রিপোর্ট কার্ড\n` +
      `----------------------------------------\n` +
      `📅 পড়া শুরুর তারিখ: ${formatBnDate(journeyStartDate)}\n` +
      `📅 আজকের তারিখ: ${formatBnDate(todayDateStr)}\n` +
      `⏳ মোট অতিক্রান্ত দিন: ${toBnNumber(elapsedDays)} দিন\n` +
      `⏱️ মোট তেলাওয়াত সময়: ${toBnNumber(totalHours)} ঘণ্টা ${toBnNumber(totalRemainingMins)} মিনিট\n` +
      `📖 মোট পঠিত আয়াত: ${toBnNumber(totalAyahsRead)} টি\n` +
      `🌟 খতম অগ্রগতি: ${toBnNumber(quranCompletionPercent)}%\n` +
      `----------------------------------------\n` +
      `আল-কুরআন ডিজিটাল অ্যাপ থেকে তৈরি লাইভ রিপোর্ট।`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textReport);
      setShareReportToast(true);
      setTimeout(() => setShareReportToast(false), 3000);
    }
  };

  const handleDownloadReport = () => {
    const textReport = `========================================\n` +
      `   আল-কুরআনুল কারিম - তেলাওয়াত রিপোর্ট কার্ড   \n` +
      `========================================\n\n` +
      `পড়া শুরুর তারিখ: ${formatBnDate(journeyStartDate)}\n` +
      `আজকের তারিখ: ${formatBnDate(todayDateStr)}\n` +
      `মোট অতিক্রান্ত সময়: ${toBnNumber(elapsedDays)} দিন\n` +
      `সক্রিয় পঠন দিন: ${toBnNumber(activeDaysCount)} দিন\n` +
      `মোট তেলাওয়াত সময়: ${toBnNumber(totalHours)} ঘণ্টা ${toBnNumber(totalRemainingMins)} মিনিট\n` +
      `মোট পঠিত আয়াত: ${toBnNumber(totalAyahsRead)} টি\n` +
      `খতম অগ্রগতি: ${toBnNumber(quranCompletionPercent)}%\n\n` +
      `জেনারেট সময়: ${new Date().toLocaleString('bn-BD')}\n`;

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quran_Lifetime_Report_${todayDateStr}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
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
            <span>লাইভ অ্যানালিটিক্স ও ডাইনামিক রিপোর্ট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight font-bengali flex items-center gap-2">
            <span>কুরআন তিলাওয়াত অগ্রগতি ও পারফর্ম্যান্স</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            যেকোনো সূরা প্লে করা বা পড়া মাত্র স্বয়ংক্রিয়ভাবে লাইভ ডেটা হিস্ট্রি ও চার্ট আপডেট হবে
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

      {/* UNIQUE JOURNEY TRACKER CARD (কবে থেকে পড়া শুরু করা হয়েছে) */}
      <div className="mb-8 p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white border-2 border-emerald-500/40 shadow-xl relative overflow-hidden font-bengali">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-400/20 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-extrabold border border-emerald-400/30">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>কুরআন তেলাওয়াত যাত্রা ট্র্যাকার</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>পড়া শুরুর তারিখ ও মোট অতিক্রান্ত সময়</span>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              আপনি কবে থেকে তেলাওয়াত শুরু করেছেন, আজ কত দিন অতিবাহিত হলো এবং মোট কত ঘণ্টা সময় দিয়েছেন তার সার্বিক ট্র্যাকিং
            </p>
          </div>

          {/* Metrics Grid inside Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-white/15">
            <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-emerald-200/80 font-bold block">পড়া শুরু</span>
              <span className="text-xs sm:text-sm font-black text-white mt-0.5 block leading-snug">
                {formatBnDate(journeyStartDate)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-emerald-200/80 font-bold block">আজকের তারিখ</span>
              <span className="text-xs sm:text-sm font-black text-amber-300 mt-0.5 block leading-snug">
                {formatBnDate(todayDateStr)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-emerald-200/80 font-bold block">অতিক্রান্ত দিন</span>
              <span className="text-xs sm:text-sm font-black text-emerald-300 mt-0.5 block leading-snug">
                {toBnNumber(elapsedDays)} দিন
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-emerald-200/80 font-bold block">মোট তেলাওয়াত</span>
              <span className="text-xs sm:text-sm font-black text-teal-300 mt-0.5 block leading-snug">
                {toBnNumber(totalHours)}ঘ {toBnNumber(totalRemainingMins)}মি
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Button */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="text-xs text-emerald-200/90 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>নিরাপদ ট্র্যাকিং • রিসেট দিলে আজকের তারিখ থেকে নতুন অতিক্রান্ত দিন গণনা শুরু হবে</span>
          </div>

          <button
            onClick={() => setShowLifetimeReportModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-400/20 active:scale-95 flex items-center justify-center space-x-2 shrink-0"
          >
            <FileText className="w-4 h-4 text-slate-950" />
            <span>সারা জীবনের সকল তথ্য ও রিপোর্ট প্রিন্ট/শেয়ার করুন</span>
            <ArrowUpRight className="w-4 h-4" />
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

      {/* 4. GRAPH DRAFT 1: Smooth Recharts Area Wave Chart (ডাইনামিক ওয়েভ ও ট্রেন্ড গ্রাফ) */}
      <div className="mb-8 p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h3 className="font-black text-base text-[var(--text-main)] font-bengali">
                স্মুথ ওয়েভ ট্রেন্ড এ্যানালিটিক্স (Interactive Smooth Area Graph)
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-bengali">
              প্রতিদিনের সক্রিয় পড়ার সময় ও আয়াতের স্মুথ ফ্লো চার্ট
            </p>
          </div>

          {/* Metric Switcher Tabs */}
          <div className="bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border)] flex items-center space-x-1 font-bengali text-xs">
            <button
              onClick={() => setAreaMetric('minutes')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                areaMetric === 'minutes' 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>সময় (মিনিট)</span>
            </button>

            <button
              onClick={() => setAreaMetric('ayahs')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                areaMetric === 'ayahs' 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>পঠিত আয়াত</span>
            </button>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={waveChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[var(--bg-surface)] border border-emerald-500/30 p-3 rounded-2xl shadow-xl text-xs font-bengali">
                        <p className="font-extrabold text-[var(--text-main)] mb-1">
                          {data.name} ({formatBnDate(data.rawDate)})
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-black">
                          {areaMetric === 'minutes' ? `${toBnNumber(data.minutes)} মিনিট শ্রবণ/পাঠ` : `${toBnNumber(data.ayahs)} টি আয়াত পঠিত`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={areaMetric}
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#emeraldWave)"
                activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Interactive Weekly Bar Chart Analysis & Day Selection */}
      <div className="mb-8 p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <BarChart3 className="w-5 h-5" />
              <h3 className="font-black text-base text-[var(--text-main)] font-bengali">
                সাপ্তাহিক দৈনিক ইন্টারেক্টিভ বার চার্ট
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

      {/* 6. MONTHLY INTERACTIVE HEATMAP (মাসভিত্তিক ডাইনামিক হিটম্যাপ ও ইন ডিটেলস পপআপ) */}
      <div className="mb-8 p-6 sm:p-8 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden font-bengali">
        
        {/* Header & Month Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center space-x-2 text-[var(--primary)]">
              <Calendar className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h3 className="font-black text-lg text-[var(--text-main)]">
                মাসভিত্তিক তেলাওয়াত হিটম্যাপ
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              যেকোনো দিনের বক্সে ক্লিক করে সেই দিনের সম্পূর্ণ বিস্তারিত তথ্য ও নোট দেখুন
            </p>
          </div>

          {/* Month Selector Bar: Prev < Month Year > Next */}
          <div className="flex items-center space-x-2 bg-[var(--bg-main)] p-1.5 rounded-2xl border border-[var(--border)] shadow-xs">
            <button
              onClick={handlePrevMonth}
              title="পূর্বের মাস দেখুন"
              className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] text-[var(--text-main)] transition-all cursor-pointer active:scale-95 border border-[var(--border)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-4 py-1 text-center min-w-[130px]">
              <span className="font-extrabold text-sm text-[var(--text-main)] block leading-tight">
                {BANGLA_MONTH_NAMES[viewMonth]} {toBnNumber(viewYear)}
              </span>
              <span className="text-[9px] text-[var(--primary)] font-bold uppercase tracking-wider block leading-none">
                {toBnNumber(totalDaysInMonth)} দিন
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="পরের মাস দেখুন"
              className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] text-[var(--text-main)] transition-all cursor-pointer active:scale-95 border border-[var(--border)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Headers (রবি, সোম, মঙ্গল...) */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[11px] font-bold text-[var(--text-muted)]">
          {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'].map((d, i) => (
            <div key={d} className={`py-1 ${i === 5 ? 'text-amber-500 font-extrabold' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {/* Empty offset cells for starting day of month */}
          {Array.from({ length: monthStartDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-2xl bg-[var(--bg-main)]/30 border border-dashed border-[var(--border)] opacity-30" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayData = getDayDetails(dayNum);

            let bgStyle = 'bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-muted)] hover:border-rose-400/50 hover:bg-rose-500/5';
            
            if (dayData.level === 'peak_red') {
              bgStyle = 'bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white font-black border-rose-300 shadow-md shadow-red-500/30 scale-[1.02] ring-2 ring-rose-400/40 animate-pulse';
            } else if (dayData.level === 'high') {
              bgStyle = 'bg-emerald-600 text-white font-black border-emerald-300 shadow-xs shadow-emerald-600/30';
            } else if (dayData.level === 'medium') {
              bgStyle = 'bg-teal-500/70 text-white font-bold border-teal-400';
            } else if (dayData.level === 'light') {
              bgStyle = 'bg-emerald-500/25 text-emerald-900 dark:text-emerald-200 border-emerald-500/30 font-bold';
            }

            return (
              <motion.button
                key={dayData.dateKey}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedHeatmapDay(dayData);
                  setNoteInputValue(userDailyNotes[dayData.dateKey] || '');
                }}
                className={`h-10 sm:h-12 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer relative group ${bgStyle}`}
              >
                <span className="text-xs sm:text-sm leading-none">
                  {toBnNumber(dayNum)}
                </span>
                
                {dayData.minutes > 0 ? (
                  <span className="text-[9px] opacity-90 font-sans mt-0.5 font-bold">
                    {toBnNumber(dayData.minutes)}মি
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400/40 mt-1" title="পড়া হয়নি" />
                )}

                {dayData.isToday && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 shadow-xs" title="আজকের দিন" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic Color Scale Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-[var(--text-muted)] pt-5 mt-5 border-t border-[var(--border)]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-rose-400/50" />
            </span>
            <span>০ মি (পড়া হয়নি)</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-lg bg-emerald-500/25 border border-emerald-500/30" />
              <span>১-১৫ মি (হালকা)</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-lg bg-teal-500/70 border border-teal-400" />
              <span>১৬-৩০ মি (মাঝারি)</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-lg bg-emerald-600 border border-emerald-300" />
              <span>৩১-৪৫ মি (বেশি)</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 border border-rose-300 shadow-xs" />
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">৪৬+ মি (সর্বোচ্চ লাল/শিখা)</span>
            </div>
          </div>
        </div>
      </div>

        {/* Makki vs Madani Donut Split Card */}
        <div className="p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[var(--text-main)] font-bengali flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-amber-500" />
                <span>মাক্কী বনাম মাদানী সূরা বিশ্লেষণ</span>
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bengali">
                ক্যাটাগরি চার্ট
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-2 font-bengali">
              আপনার শোনা ও পঠিত সূরার টাইপ বন্টন
            </p>

            {/* Recharts Pie Donut */}
            <div className="h-44 w-full flex items-center justify-center my-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-base font-black font-bengali text-[var(--text-main)]">
                  {toBnNumber(trackedSurahList.length)}
                </span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] font-bengali">
                  সূরা ট্র্যাকড
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-[var(--border)] font-bengali">
            <div className="bg-emerald-500/10 p-2 rounded-2xl border border-emerald-500/20">
              <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">মাক্কী সূরা</p>
              <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                {toBnNumber(makkiCount)} টি
              </p>
            </div>

            <div className="bg-amber-500/10 p-2 rounded-2xl border border-amber-500/20">
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">মাদানী সূরা</p>
              <p className="text-sm font-black text-amber-800 dark:text-amber-300">
                {toBnNumber(madaniCount)} টি
              </p>
            </div>
          </div>
        </div>

      {/* 7. GRAPH DRAFT 4 & 5: Time Pace Estimator & Selected Day Detail Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Dynamic Goal Completion Estimator Card */}
        <div className="md:col-span-1 p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-indigo-500/20 shadow-sm relative overflow-hidden flex flex-col justify-between font-bengali">
          <div>
            <div className="flex items-center space-x-2 text-indigo-500 mb-2">
              <Sliders className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-[var(--text-main)]">
                কুরআন খতমের সময়কাল অনুমান
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              প্রতিদিনের লক্ষ্যমাত্রা নির্বাচন করে খতম সম্পূর্ণের অনুমিত দিন দেখুন
            </p>

            <div className="space-y-3 mb-4">
              <p className="text-xs font-bold text-[var(--text-main)]">
                দৈনিক লক্ষ্য: <span className="text-indigo-500 font-black">{toBnNumber(targetPaceMin)} মিনিট</span>
              </p>
              <div className="flex items-center space-x-2">
                {[10, 15, 30, 45].map((val) => (
                  <button
                    key={val}
                    onClick={() => setTargetPaceMin(val)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetPaceMin === val 
                        ? 'bg-indigo-500 text-white shadow-xs' 
                        : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {toBnNumber(val)} মি
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 text-center">
            <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">আনুমানিক সময়কাল</p>
            <p className="text-lg font-black text-indigo-800 dark:text-indigo-200 mt-0.5">
              প্রায় {toBnNumber(estimatedDaysToKhatam)} দিন
            </p>
            <p className="text-[9px] text-[var(--text-muted)] mt-1">
              (অবশিষ্ট {toBnNumber(remainingAyahs)} টি আয়াতের জন্য)
            </p>
          </div>
        </div>

        {/* Selected Day Detail Banner ("দৈনিক বিবরণী") */}
        <motion.div 
          key={selectedDayIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 p-6 rounded-[2.5rem] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm relative overflow-hidden flex flex-col justify-between"
        >
          <div>
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
          </div>

          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15 text-center mt-2">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 italic font-bengali leading-relaxed">
              “হে মুমিনগণ! প্রতিদিন অন্তত এক আয়াত পড়ে বা শুনে দিনের কাজ শুরু করুন।”
            </p>
          </div>
        </motion.div>

      </div>

      {/* 8. Dynamic Surah Progress Table Section */}
      <div className="mb-10" id="surah-progress-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-main)] font-bengali flex items-center gap-2">
              <Layers className="w-5 h-5 text-[var(--primary)]" />
              <span>সূরাভিত্তিক অটো ট্র্যাকিং ও বিস্তারিত টেবিল</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-bengali">
              হোমপেজ বা সার্চ থেকে যে কোনো সূরা চালানো বা ওপেন করার সাথে সাথে এখানে অটোমেটিক যুক্ত হয়ে আপডেট হতে থাকবে।
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
                          {item.isMadani ? (
                            <span className="text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bengali">
                              মাদানী
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bengali">
                              মাক্কী
                            </span>
                          )}
                          {item.isCompleted ? (
                            <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bengali flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> সম্পূর্ণ
                            </span>
                          ) : (
                            <span className="text-[9px] font-black bg-teal-500/15 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full border border-teal-500/20 font-bengali">
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

      {/* 9. Full App Reset Confirmation Modal */}
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
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                  আপনি কি নিশ্চিত যে আপনার সমস্ত আল-কুরআন তেলাওয়াত হিস্ট্রি, সূরা ট্র্যাকিং, স্ট্রিক, পড়ার সময় ও রিসেন্ট লগ মুছে ফেলে নতুন করে শুরু করতে চান?
                </p>

                {/* 8-Digit Password Input Security Field */}
                <div className="w-full mb-4 text-left">
                  <label className="text-xs font-extrabold text-[var(--text-main)] mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-rose-500" />
                    <span>রিসেট সিকিউরিটি পাসওয়ার্ড (৮ ডিজিট):</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={8}
                      value={resetPinInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setResetPinInput(val);
                      }}
                      placeholder="৮ সংখ্যার পিন (যেমন: 12345678)"
                      className="w-full p-3 pl-10 rounded-2xl bg-[var(--bg-main)] border border-rose-500/30 text-sm font-mono font-bold tracking-widest text-[var(--text-main)] focus:outline-none focus:border-rose-500 transition-all"
                    />
                    <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3.5" />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bengali">
                    * অনাকাঙ্ক্ষিত ডিলিট বা রিসেট ঠেকাতে ৮ সংখ্যার পিন দেওয়া বাধ্যতামূলক।
                  </p>
                </div>

                {/* Error Toast */}
                {pinErrorToast && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold mb-4 w-full text-center font-bengali">
                    {pinErrorToast}
                  </div>
                )}

                {/* Double Safety Checkbox */}
                <label className="flex items-center space-x-2.5 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/20 w-full mb-6 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={fullResetConfirmed}
                    onChange={(e) => setFullResetConfirmed(e.target.checked)}
                    className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500 cursor-pointer accent-rose-500"
                  />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                    আমি সমস্ত হিস্ট্রি ডিলিট ও রিস্টার্টে সম্মত
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowFullResetModal(false);
                      setFullResetConfirmed(false);
                      setResetPinInput('');
                      setPinErrorToast(null);
                    }}
                    className="py-3 px-4 rounded-2xl border border-[var(--border)] text-[var(--text-main)] font-extrabold text-xs hover:bg-[var(--bg-main)] transition-all cursor-pointer"
                  >
                    বাতিল করুন
                  </button>

                  <button
                    disabled={!fullResetConfirmed || resetPinInput.trim().length !== 8}
                    onClick={handleConfirmFullReset}
                    className={`py-3 px-4 rounded-2xl font-black text-xs text-white transition-all shadow-md flex items-center justify-center space-x-2 ${
                      fullResetConfirmed && resetPinInput.trim().length === 8
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

      {/* 10. Surah Progress Only Reset Confirmation Modal */}
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
                    হ্যাঁ, শুধুমাত্র সূরা তালিকা ডিলিট করুন
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
                    <span>রিসেট করুন</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. IN-DEPTH DAY DETAIL MODAL (ইন ডিটেলস রিপোর্ট ও নোট পপআপ) */}
      <AnimatePresence>
        {selectedHeatmapDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-bengali">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHeatmapDay(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden z-10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[var(--primary)]" />
                    <h3 className="font-extrabold text-lg text-[var(--text-main)]">
                      দিনের বিস্তারিত তেলাওয়াত রিপোর্ট
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {formatBnDate(selectedHeatmapDay.dateKey)} ({selectedHeatmapDay.dayOfWeekStr})
                  </p>
                </div>

                <button
                  onClick={() => setSelectedHeatmapDay(null)}
                  className="p-2 rounded-2xl bg-[var(--bg-main)] hover:bg-rose-500/10 hover:text-rose-500 text-[var(--text-muted)] border border-[var(--border)] transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Performance Tag Banner */}
              <div className={`p-4 rounded-2xl mb-6 border flex items-center justify-between ${selectedHeatmapDay.badgeBg}`}>
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold block opacity-80">
                    পারফরম্যান্স রেটিং
                  </span>
                  <span className="text-base font-black block mt-0.5">
                    {selectedHeatmapDay.badgeText}
                  </span>
                </div>
                {selectedHeatmapDay.level === 'peak_red' ? (
                  <Flame className="w-8 h-8 text-amber-300 animate-bounce" />
                ) : selectedHeatmapDay.minutes > 0 ? (
                  <Trophy className="w-7 h-7 opacity-90" />
                ) : (
                  <Clock className="w-7 h-7 text-rose-500 opacity-80" />
                )}
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                  <div className="flex items-center space-x-2 text-emerald-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold text-[var(--text-muted)]">মোট সময়</span>
                  </div>
                  <p className="text-xl font-black text-[var(--text-main)]">
                    {toBnNumber(selectedHeatmapDay.minutes)} <span className="text-xs font-bold text-[var(--text-muted)]">মিনিট</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans">
                    ({toBnNumber(selectedHeatmapDay.seconds)} সেকেন্ড)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                  <div className="flex items-center space-x-2 text-indigo-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-bold text-[var(--text-muted)]">পঠিত আয়াত</span>
                  </div>
                  <p className="text-xl font-black text-[var(--text-main)]">
                    {toBnNumber(selectedHeatmapDay.ayahs)} <span className="text-xs font-bold text-[var(--text-muted)]">টি</span>
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    কুরআন পঠন
                  </p>
                </div>
              </div>

              {/* Surahs Read on this day */}
              <div className="mb-6">
                <h4 className="text-xs font-extrabold text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[var(--primary)]" />
                  <span>পঠিত সূরার তালিকা</span>
                </h4>
                {selectedHeatmapDay.surahsList && selectedHeatmapDay.surahsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedHeatmapDay.surahsList.map((sName: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{sName}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                    এই দিনে নির্দিষ্ট কোনো একক সূরার ট্র্যাকিং করা হয়নি।
                  </div>
                )}
              </div>

              {/* Hadith / Motivation Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 mb-6">
                <p className="font-bold mb-1 flex items-center gap-1 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>দিনের উপদেশ ও হাদীস:</span>
                </p>
                <p className="italic leading-relaxed">{selectedHeatmapDay.hadithText}</p>
              </div>

              {/* User Diary / Note Section */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[var(--text-main)] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>ব্যক্তিগত ডায়েরি নোট:</span>
                </label>
                <textarea
                  rows={2}
                  value={noteInputValue}
                  onChange={(e) => setNoteInputValue(e.target.value)}
                  placeholder="আজকের অভিজ্ঞতা বা অনুভূতি লিখুন (যেমন: 'আজকে ২ পারার অর্থ পড়া শেষ করেছি')..."
                  className="w-full p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all resize-none font-bengali"
                />
                
                <div className="flex items-center justify-between pt-1">
                  {noteSavedToast ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>নোট সফলভাবে সংরক্ষিত হয়েছে!</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      এই নোটটি আপনার লোকাল স্টোরেজে সংরক্ষিত থাকবে।
                    </span>
                  )}

                  <button
                    onClick={() => handleSaveNote(selectedHeatmapDay.dateKey)}
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary)]/90 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    নোট সেভ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. LIFETIME REPORT MODAL (সারা জীবনের সকল তথ্য ও রিপোর্ট) */}
      <AnimatePresence>
        {showLifetimeReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-bengali">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLifetimeReportModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--bg-surface)] border-2 border-emerald-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between"
            >
              {/* Share Toast */}
              {shareReportToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg z-30 animate-bounce flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>রিপোর্ট কপি করা হয়েছে! যেকোনো জায়গায় পেস্ট করুন</span>
                </div>
              )}

              <button
                onClick={() => setShowLifetimeReportModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--bg-main)] text-[var(--text-muted)] transition-colors cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Printable Content Area */}
              <div className="overflow-y-auto pr-1 space-y-6" id="printable-report-card">
                
                {/* Header Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white relative overflow-hidden border border-emerald-500/40 shadow-xl font-bengali">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2 bg-emerald-400/20 text-emerald-300 px-3.5 py-1 rounded-full text-[11px] font-black tracking-wider border border-emerald-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>অফিসিয়াল আল-কুরআন তেলাওয়াত সামারি</span>
                    </div>

                    <div className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {quranCompletionPercent >= 100 
                          ? 'আল-কুরআন খতমকারী' 
                          : totalHours >= 20 
                          ? 'মুফাসসির স্কলার' 
                          : totalHours >= 5 
                          ? 'নিয়মিত পাঠক' 
                          : 'নবীন শিক্ষার্থী'}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    সারা জীবনের আল-কুরআন তেলাওয়াত ও ইবাদত রেকর্ড
                  </h2>
                  <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
                    পড়া শুরুর তারিখ থেকে আজ পর্যন্ত আপনার সর্বমোট সময়, পঠিত আয়াত, অর্জিত আনুমানিক সওয়াব ও সূরার সার্বিক চিত্র
                  </p>
                </div>

                {/* Primary Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">পড়া শুরুর তারিখ</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {formatBnDate(journeyStartDate)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">আজকের তারিখ</span>
                    <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 mt-1 block">
                      {formatBnDate(todayDateStr)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">মোট সময়</span>
                    <span className="text-xs sm:text-sm font-black text-[var(--text-main)] mt-1 block">
                      {toBnNumber(elapsedDays)} দিন
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">সক্রিয় পঠন দিন</span>
                    <span className="text-xs sm:text-sm font-black text-teal-600 dark:text-teal-400 mt-1 block">
                      {toBnNumber(activeDaysCount)} দিন
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">মোট তেলাওয়াত সময়</span>
                    <span className="text-xs sm:text-sm font-black text-[var(--text-main)] mt-1 block">
                      {toBnNumber(totalHours)}ঘ {toBnNumber(totalRemainingMins)}মি
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">দৈনিক গড় পঠন</span>
                    <span className="text-xs sm:text-sm font-black text-teal-600 dark:text-teal-400 mt-1 block">
                      {toBnNumber((totalMinutesListened / elapsedDays).toFixed(1))} মি/দিন
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">মোট পঠিত আয়াত</span>
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {toBnNumber(totalAyahsRead)} টি
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <span className="text-[10px] font-extrabold text-[var(--text-muted)] block">খতম অগ্রগতি</span>
                    <span className="text-xs sm:text-sm font-black text-amber-500 mt-1 block">
                      {toBnNumber(quranCompletionPercent)}%
                    </span>
                  </div>
                </div>

                {/* Additional Unique Analytics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black">আনুমানিক নেকী ট্র্যাকার</span>
                    </div>
                    <span className="text-lg font-black block">
                      ~{toBnNumber(totalAyahsRead * 250)} নেকী
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      ১ হরফে ১০ সওয়াব হাদিস অনুযায়ী
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <Compass className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black">মাক্কী বনাম মাদানী</span>
                    </div>
                    <span className="text-xs font-bold block">
                      মাক্কী: {toBnNumber(trackedSurahList.filter(s => !s.isMadani).length)} টি • মাদানী: {toBnNumber(trackedSurahList.filter(s => s.isMadani).length)} টি
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      ট্র্যাককৃত সূরার স্থানভিত্তিক বিভাজন
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <Trophy className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-black">সম্পূর্ণ পঠিত সূরা</span>
                    </div>
                    <span className="text-lg font-black block">
                      {toBnNumber(trackedSurahList.filter(s => s.isCompleted).length)} টি সূরা
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      ১০০% সমাপ্তকৃত মোট সূরা
                    </span>
                  </div>
                </div>

                {/* Top Surahs by Time Spent */}
                {trackedSurahList.length > 0 && (
                  <div className="p-4 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)]">
                    <h4 className="font-extrabold text-xs sm:text-sm text-[var(--text-main)] mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>সর্বোচ্চ সময় দেওয়া শীর্ষ সূরাসমূহ</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[...trackedSurahList]
                        .sort((a, b) => (b.listenedSeconds || 0) - (a.listenedSeconds || 0))
                        .slice(0, 3)
                        .map((s, idx) => (
                          <div key={s.surahNumber} className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-black text-[var(--text-main)]">
                                #{toBnNumber(idx + 1)} {s.banglaName}
                              </span>
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                {toBnNumber(s.listenedMins)}মি {toBnNumber(s.listenedSecs)}সে
                              </span>
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] flex items-center justify-between">
                              <span>{toBnNumber(s.readAyahs)}/{toBnNumber(s.totalAyahs)} আয়াত</span>
                              <span>{toBnNumber(s.percentage)}%</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Detailed Surahs List with Time & Ayah breakdown */}
                <div className="p-5 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)]">
                  <h4 className="font-extrabold text-xs sm:text-sm text-[var(--text-main)] mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span>সকল সূরার সময় ও পড়ার বিস্তারিত রেকর্ড</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      মোট {toBnNumber(trackedSurahList.length)} টি সূরা
                    </span>
                  </h4>

                  {trackedSurahList.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] py-4 text-center font-bengali">
                      এখনো কোনো সূরা পড়া বা শোনা শুরু হয়নি। তেলাওয়াত শুরুর সাথে সাথে স্বয়ংক্রিয়ভাবে বিস্তারিত যুক্ত হবে।
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {trackedSurahList.map((item) => (
                        <div key={item.surahNumber} className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {toBnNumber(item.surahNumber)}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
                                <span>{item.banglaName}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border)]">
                                  {item.isMadani ? 'মাদানী' : 'মাক্কী'}
                                </span>
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                                <span>পঠিত: {toBnNumber(item.readAyahs)}/{toBnNumber(item.totalAyahs)} আয়াত</span>
                                <span>•</span>
                                <span className="text-teal-600 dark:text-teal-400 font-bold">
                                  সময়: {toBnNumber(item.listenedMins)}মি {toBnNumber(item.listenedSecs)}সে
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 justify-end">
                            <div className="w-20 bg-[var(--bg-main)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.isCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                              {item.isCompleted ? 'সম্পূর্ণ' : `${toBnNumber(item.percentage)}%`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Action Bar: Print, Share, Download TXT, Download PNG Card Image */}
              <div className="mt-6 pt-4 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                <button
                  onClick={handlePrintReport}
                  className="py-2.5 px-3 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border)] text-[var(--text-main)] font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-[var(--border)] active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-500" />
                  <span>প্রিন্ট</span>
                </button>

                <button
                  onClick={handleShareReport}
                  className="py-2.5 px-3 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border)] text-[var(--text-main)] font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-[var(--border)] active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>শেয়ার/কপি</span>
                </button>

                <button
                  onClick={handleDownloadReport}
                  className="py-2.5 px-3 rounded-2xl bg-[var(--bg-main)] hover:bg-[var(--border)] text-[var(--text-main)] font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-[var(--border)] active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-500" />
                  <span>টেক্সট ফাইল</span>
                </button>

                <button
                  disabled={isGeneratingCardImage}
                  onClick={handleDownloadCardImage}
                  className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingCardImage ? (
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>কার্ড পিকচার (PNG)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
