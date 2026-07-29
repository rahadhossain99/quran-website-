import React, { useState } from 'react';
import { useAppStore, SalahLog } from '../Store';
import { 
  Calendar as CalendarIcon, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Flame, 
  Award, 
  CheckCircle, 
  HelpCircle,
  Lightbulb, 
  Clock, 
  BookOpen,
  Plus,
  Trash2,
  Sunrise,
  Sun,
  SunDim,
  Sunset,
  Moon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const PRAYER_NAMES = {
  fajr: { bn: 'ফজর', icon: Sunrise, color: 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/20' },
  dhuhr: { bn: 'যোহর', icon: Sun, color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20' },
  asr: { bn: 'আসর', icon: SunDim, color: 'text-orange-400 bg-orange-400/10 dark:bg-orange-400/20' },
  maghrib: { bn: 'মাগরিব', icon: Sunset, color: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20' },
  isha: { bn: 'এশা', icon: Moon, color: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20' },
  tahajjud: { bn: 'তাহাজ্জুদ', icon: Sparkles, color: 'text-fuchsia-500 bg-fuchsia-500/10 dark:bg-fuchsia-500/20', sunnah: true },
  ishraq: { bn: 'ইশরাক/চাশত', icon: Sun, color: 'text-teal-500 bg-teal-500/10 dark:bg-teal-500/20', sunnah: true }
} as const;

const PRAYER_HADITHS = [
  { text: "যে ব্যক্তি ফজরের সালাত আদায় করল, সে আল্লাহর জিম্মায় (নিরাপত্তায়) চলে গেল।", source: "— সহীহ মুসলিম" },
  { text: "বান্দা সিজদারত অবস্থায় তার রবের সবচেয়ে বেশি নিকটবর্তী হয়। কাজেই সিজদায় তোমরা বেশি বেশি দোআ করো।", source: "— সহীহ মুসলিম" },
  { text: "সালাত হলো ধর্মের খুঁটি। যে ব্যক্তি সালাত কায়েম করল, সে ধর্ম কায়েম করল।", source: "— আল-হাদীস" },
  { text: "নিশ্চয়ই সালাত মানুষকে অশ্লীল ও মন্দ কাজ থেকে বিরত রাখে।", source: "— আল-কুরআন, সূরা আল-আনকাবুত (৪৫)" },
  { text: "কেয়ামতের দিন বান্দার আমলনামার মধ্যে সর্বপ্রথমে সালাতেরই হিসাব নেওয়া হবে।", source: "— সুনানে আবু দাউদ" }
];

export const SalahTrackerView = () => {
  const { salahLogs, toggleSalahLog, setActiveTab } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = (d.getMonth() + 1).toString().padStart(2, '0');
    const dy = d.getDate().toString().padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  });

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Navigation handlers for Month Calendar
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Convert Gregorian digits to Bengali
  const toBnNumber = (num: number | string) => {
    const symbols = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
    return num.toString().split('').map(c => symbols[c as keyof typeof symbols] || c).join('');
  };

  const getMonthNameBn = (m: number) => {
    const list = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    return list[m];
  };

  // Build current month calendar grid array
  const calendarDays = React.useMemo(() => {
    const daysInMo = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIdx = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    
    const days = [];
    // Spacers for month offset
    for (let i = 0; i < firstDayIdx; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMo; day++) {
      const formatDay = day.toString().padStart(2, '0');
      const formatMonth = (currentMonth + 1).toString().padStart(2, '0');
      const dateStr = `${currentYear}-${formatMonth}-${formatDay}`;
      days.push({ day, dateStr });
    }
    return days;
  }, [currentMonth, currentYear]);

  // Read current prayer status for the selected date
  const selectedLog = salahLogs[selectedDate] || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    tahajjud: false,
    ishraq: false
  };

  // Toggle log function
  const handleToggle = (prayerId: keyof SalahLog) => {
    toggleSalahLog(selectedDate, prayerId);
  };

  // Statistics calculation for the last 15 days
  const chartData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yr = d.getFullYear();
      const mo = (d.getMonth() + 1).toString().padStart(2, '0');
      const dy = d.getDate().toString().padStart(2, '0');
      const dateStr = `${yr}-${mo}-${dy}`;
      
      const log = salahLogs[dateStr] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
      let count = 0;
      if (log.fajr) count++;
      if (log.dhuhr) count++;
      if (log.asr) count++;
      if (log.maghrib) count++;
      if (log.isha) count++;
      
      const dayBn = toBnNumber(d.getDate());
      const monthBn = getMonthNameBn(d.getMonth()).slice(0, 3);
      data.push({
        date: dateStr,
        label: `${dayBn} ${monthBn}`,
        নামাজ: count
      });
    }
    return data;
  }, [salahLogs]);

  // Overall Statistics summary
  const stats = React.useMemo(() => {
    let totalAllPrayers = 0;
    let daysWithAllFive = 0;
    let currentStreak = 0;
    
    // Sort all dates to find the continuous streak
    const today = new Date();
    let streakOn = true;
    let checkDate = new Date(today);
    
    for (const logKey in salahLogs) {
      const log = salahLogs[logKey];
      if (log) {
        if (log.fajr) totalAllPrayers++;
        if (log.dhuhr) totalAllPrayers++;
        if (log.asr) totalAllPrayers++;
        if (log.maghrib) totalAllPrayers++;
        if (log.isha) totalAllPrayers++;
        if (log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) {
          daysWithAllFive++;
        }
      }
    }

    // Determine current streak of days with standard 5 prayers logged fully
    while (streakOn) {
      const yr = checkDate.getFullYear();
      const mo = (checkDate.getMonth() + 1).toString().padStart(2, '0');
      const dy = checkDate.getDate().toString().padStart(2, '0');
      const dStr = `${yr}-${mo}-${dy}`;
      const log = salahLogs[dStr];
      
      if (log && log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today is not logged fully but yesterday was, we don't break yet to check if they completed yesterday's 
        if (dStr === `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`) {
          checkDate.setDate(checkDate.getDate() - 1);
          // Let's check yesterday next
          const ystYr = checkDate.getFullYear();
          const ystMo = (checkDate.getMonth() + 1).toString().padStart(2, '0');
          const ystDy = checkDate.getDate().toString().padStart(2, '0');
          const ystLog = salahLogs[`${ystYr}-${ystMo}-${ystDy}`];
          if (ystLog && ystLog.fajr && ystLog.dhuhr && ystLog.asr && ystLog.maghrib && ystLog.isha) {
            // Yesterday completed, continue
          } else {
            streakOn = false;
          }
        } else {
          streakOn = false;
        }
      }
      
      // Infinite loop guard
      if (currentStreak > 365) break;
    }

    return {
      totalAllPrayers,
      daysWithAllFive,
      currentStreak,
      rate: daysWithAllFive > 0 ? Math.round((daysWithAllFive / Math.max(1, Object.keys(salahLogs).length)) * 100) : 0
    };
  }, [salahLogs]);

  // Random Inspiring Hadith/Tip
  const randomTip = React.useMemo(() => {
    const idx = new Date(selectedDate).getDate() % PRAYER_HADITHS.length;
    return PRAYER_HADITHS[idx];
  }, [selectedDate]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full select-none" id="salah-tracker-screen">
      {/* Title Header with custom Material 3 accents */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 w-max px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/10 mb-2">
            <Flame className="w-3.5 h-3.5 fill-current text-orange-500 animate-pulse mr-1" />
            <span>আধ্যাত্মিক ড্যাশবোর্ড ও নামাজ ট্র্যাকার</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight font-bengali">সালাত ট্র্যাকার ও এনালাইটিক্স</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">Track your 5 daily prayers, build streaks, and get complete visual logs of your consistency.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Salah Guide Link Button inside Salah Tracker */}
          <button
            onClick={() => setActiveTab('salah-guide')}
            className="bg-[var(--bg-surface)] border border-[var(--primary)] border-opacity-30 hover:border-opacity-100 hover:bg-[var(--primary-soft)] rounded-2xl px-4 py-2.5 flex items-center space-x-2.5 transition-all shadow-sm active:scale-95 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-emerald-400 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-left font-bengali">
              <p className="text-[9px] uppercase font-bold text-[var(--primary)] tracking-wider leading-none">নামাজ নিয়ম ও দোয়া</p>
              <p className="text-xs font-black text-[var(--text-main)] leading-none mt-1">সালাত শিক্ষা ➔</p>
            </div>
          </button>

          {/* Streak Pill */}
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl p-[2px] shadow-md hover:shadow-lg transition-all active:scale-98">
            <div className="bg-white dark:bg-slate-900 rounded-[14px] px-3.5 py-2 flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
              <div>
                <p className="text-[8px] uppercase font-black text-[var(--text-muted)] tracking-widest leading-none">সালাত স্ট্রিক</p>
                <p className="text-sm font-extrabold text-[var(--text-main)] leading-none mt-0.5 font-bengali">
                  {toBnNumber(stats.currentStreak)} দিন
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        
        {/* Left Column - Monthly Calendar & Log selector (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-5 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-xl pointer-events-none" />
          
          {/* Calendar Header with navigation */}
          <div className="flex items-center justify-between mb-5 px-1 relative z-10">
            <div className="flex items-center space-x-2 font-bengali">
              <CalendarIcon className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-extrabold text-base text-[var(--text-main)]">
                {getMonthNameBn(currentMonth)} {toBnNumber(currentYear)}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border)]">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Bengali Day Names */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-3">
            {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'].map((d, idx) => (
              <span key={idx} className="text-[10px] font-extrabold text-[var(--text-muted)] font-bengali py-1 bg-[var(--bg-main)]/40 rounded-lg">
                {d}
              </span>
            ))}
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center relative z-10">
            {calendarDays.map((item, idx) => {
              if (item === null) {
                return <div key={`empty-${idx}`} className="h-10 opacity-0" />;
              }
              const isSelected = selectedDate === item.dateStr;
              const hasLog = salahLogs[item.dateStr];
              
              // Standard prayers count for coloring
              let count = 0;
              if (hasLog) {
                if (hasLog.fajr) count++;
                if (hasLog.dhuhr) count++;
                if (hasLog.asr) count++;
                if (hasLog.maghrib) count++;
                if (hasLog.isha) count++;
              }

              // Determine visual background based on prayer count
              let bgClass = 'bg-[var(--bg-main)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]';
              let textClass = 'text-[var(--text-main)]';
              let borderClass = 'border-transparent';
              
              if (isSelected) {
                bgClass = 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary-soft)] hover:bg-[var(--primary)] hover:text-white';
                textClass = 'text-white font-extrabold';
                borderClass = 'ring-2 ring-[var(--primary)] ring-offset-2 dark:ring-offset-slate-900';
              } else if (count === 5) {
                bgClass = 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 dark:bg-emerald-950/40 font-extrabold hover:bg-emerald-500/25';
              } else if (count > 0) {
                bgClass = 'bg-amber-500/10 text-amber-850 dark:text-amber-400 dark:bg-amber-950/20 font-bold hover:bg-amber-500/20';
              }

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`h-11 rounded-xl flex flex-col justify-center items-center relative transition-all duration-300 transform cursor-pointer border ${borderClass} ${bgClass} ${textClass}`}
                >
                  <span className="text-xs font-bold leading-none">{toBnNumber(item.day)}</span>
                  {count > 0 && !isSelected && (
                    <div className="flex gap-[2px] mt-1 shrink-0">
                      {Array.from({ length: Math.min(5, count) }).map((_, dIdx) => (
                        <div key={dIdx} className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick info color key legend */}
          <div className="flex flex-wrap items-center justify-between border-t border-[var(--border)] border-dashed mt-5 pt-4 text-[10px] text-[var(--text-muted)] font-black font-bengali gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/20" />
              <span>৫ ওয়াক্ত সম্পূর্ণ</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20" />
              <span>১-৪ ওয়াক্ত</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded bg-[var(--bg-main)] border border-[var(--border)]" />
              <span>অসম্পূর্ণ / পড়েননি</span>
            </div>
          </div>
        </div>

        {/* Right Column - Checklist for Selected Day (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-5 shadow-sm relative flex flex-col justify-between min-h-[440px]">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--primary)]/2 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5 mb-4 relative z-10">
              <div>
                <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest font-sans">সালাত তালিকা</p>
                <h3 className="text-sm font-extrabold text-[var(--text-main)] mt-0.5 font-bengali">
                  {(() => {
                    const parts = selectedDate.split('-');
                    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                    const dayLabels = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
                    return `${toBnNumber(parts[2])} ${getMonthNameBn(dateObj.getMonth())} (${dayLabels[dateObj.getDay()]})`;
                  })()}
                </h3>
              </div>
              <div className="bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-black font-bengali px-2.5 py-1 rounded-full border border-[var(--primary)] border-opacity-15 select-none animate-pulse">
                সঠিক দিনটি চাপুন
              </div>
            </div>

            {/* Prayer Checks Container */}
            <div className="space-y-2.5 relative z-10">
              {(Object.keys(PRAYER_NAMES) as Array<keyof typeof PRAYER_NAMES>).map((prayerKey) => {
                const info = PRAYER_NAMES[prayerKey];
                const isChecked = selectedLog[prayerKey] || false;
                
                return (
                  <motion.div
                    key={prayerKey}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleToggle(prayerKey)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-500/25 dark:border-emerald-500/35 text-[var(--text-main)]'
                        : 'bg-[var(--bg-main)]/35 border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Prayer Emoji/Icon Accent */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${info.color} border border-black/5 dark:border-white/5`}>
                        {React.createElement(info.icon, { className: "w-4.5 h-4.5 stroke-[2.2]" })}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-xs font-bold leading-none font-bengali ${isChecked ? 'text-emerald-950 dark:text-emerald-100 font-extrabold' : 'text-[var(--text-main)] font-semibold'}`}>
                            {info.bn}
                          </span>
                          {'sunnah' in info && (
                            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 px-1.5 py-0.2 rounded-full text-[8px] font-bold tracking-tight">নফল/সুন্নাত</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-none">
                          {isChecked ? 'সালাত সম্পন্ন হয়েছে ✓' : 'নামাজ পড়ার পর চিহ্নিত করুন'}
                        </p>
                      </div>
                    </div>

                    {/* Checkbox Trigger Circle */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all border ${
                      isChecked 
                        ? 'bg-emerald-500 border-transparent text-white scale-110 shadow-sm shadow-emerald-500/10' 
                        : 'bg-white dark:bg-slate-800 border-[var(--border)] group-hover:border-[var(--primary)]'
                    }`}>
                      {isChecked && <Check className="w-4 h-4 stroke-[3.5]" />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Inspiring Message section at bottom of side block */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/2 p-3.5 rounded-3xl border border-amber-500/15 dark:border-amber-500/25 mt-5 leading-normal">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-xs font-extrabold font-bengali mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
              <span>সালাতের আধ্যাত্মিক গুরুত্ব</span>
            </div>
            <p className="text-[11px] font-bold text-[var(--text-main)] italic leading-relaxed font-bengali">
              "{randomTip.text}"
            </p>
            <p className="text-[9px] text-[var(--text-muted)] font-bold text-right mt-1 font-sans">
              {randomTip.source}
            </p>
          </div>

        </div>

      </div>

      {/* "ড্রাগ টা দেখাবে" (the Visual completion graphs and analytics section) */}
      <h2 className="text-lg font-extrabold text-[var(--text-main)] mb-4 font-bengali flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <span>সালাত তিলাওয়াত ও নামাজ লগ গ্রাফ (Analytic Trends)</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        
        {/* Statistics highlights dashboard tiles */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3.5">
          
          <div className="bg-[var(--bg-surface)] rounded-3xl p-4 border border-[var(--border)] shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 w-12 h-12 bg-emerald-500/5 rounded-tl-full" />
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">রুম নামাজ সম্পূর্ণতা</p>
            <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-bengali">
              {toBnNumber(stats.daysWithAllFive)} দিন
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-1 font-bengali">এই মাসে ৫ ওয়াক্ত পুরো নামাজ সফল কোয়ালিফাই করেছেন।</p>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-3xl p-4 border border-[var(--border)] shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 w-12 h-12 bg-amber-500/5 rounded-tl-full" />
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">মোট আদায়কৃত সালাত</p>
            <h4 className="text-2xl font-black text-amber-500 mt-1 font-bengali">
              {toBnNumber(stats.totalAllPrayers)} ওয়াক্ত
            </h4>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-1 font-bengali">সকল ওয়াক্ত মিলিয়ে মোট যত আমল সম্পূর্ণ লগ হয়েছে।</p>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-3xl p-4 border border-[var(--border)] border-opacity-90 shadow-sm relative overflow-hidden group col-span-2 md:col-span-1">
            <div className="absolute right-0 bottom-0 w-12 h-12 bg-blue-500/5 rounded-tl-full" />
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">চলতি মাসের পারফর্ম্যান্স রেট</p>
            <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-sans">
              {toBnNumber(stats.rate)}%
            </h4>
            <div className="w-full bg-[var(--bg-main)] h-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-1000" 
                style={{ width: `${stats.rate}%` }} 
              />
            </div>
          </div>

        </div>

        {/* Visual Graph - Recharts Area Chart showing prayer count over last 15 days (8 cols) */}
        <div className="md:col-span-8 bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] p-5 md:p-6 shadow-sm overflow-hidden min-h-[300px]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest font-sans">দৈনিক নামাজ লড়িয়াল</p>
              <h4 className="font-extrabold text-xs text-[var(--text-main)] mt-0.5 font-bengali">গত ১৫ দিনের সালাত আদায়ের গ্রাফ বিশ্লেষণ</h4>
            </div>
            
            <div className="flex items-center space-x-1.5 text-[9px] text-[var(--text-muted)] font-black bg-[var(--bg-main)] border border-[var(--border)] px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 animate-pulse" />
              <span>ওয়াক্ত ৩-৫ আদর্শ স্তর</span>
            </div>
          </div>

          <div className="h-56 w-full font-sans text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrayers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35}/>
                    <stop offset="50%" stopColor="var(--primary)" stopOpacity={0.12}/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" opacity={0.05} stroke="var(--text-muted)" />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  axisLine={false}
                  stroke="var(--text-muted)"
                  style={{ fontSize: '9px', fontWeight: 'bold' }}
                />
                <YAxis 
                  type="number"
                  domain={[0, 5]} 
                  tickCount={6}
                  tickLine={false} 
                  axisLine={false}
                  stroke="var(--text-muted)"
                  style={{ fontSize: '9px', fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border)',
                    borderRadius: '1.25rem',
                    color: 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                  }}
                  itemStyle={{ color: 'var(--primary)' }}
                  labelStyle={{ color: 'var(--text-muted)', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="নামাজ" 
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                  fillOpacity={1} 
                  fill="url(#colorPrayers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
