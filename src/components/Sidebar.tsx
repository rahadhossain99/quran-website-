import { useAppStore } from '../Store';
import { Home, Bookmark, Settings, CircleDashed, Sparkles, Clock, Palette, BookOpen, Volume2, MapPin, CalendarCheck, Headphones, Sparkle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

type Tab = 'home' | 'bookmarks' | 'tasbih' | 'duas' | 'settings' | 'salah-tracker' | 'salah-guide';
type AppTheme = 'light' | 'dark' | 'emerald' | 'luxury' | 'ocean' | 'rose' | 'sunset' | 'midnight';

export const Sidebar = ({ className }: { className?: string }) => {
  const { 
    activeTab, setActiveTab, currentViewSurah, setCurrentViewSurah,
    theme, setTheme, location, nextPrayer, isPlaying, playingSurah,
    setIsCleanMode
  } = useAppStore();

  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const bnTime = new Date().toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setTime(bnTime);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'home', icon: Home, label: 'হোম', desc: 'আজকের কন্ট্রোল ও সূরা' },
    { id: 'salah-tracker', icon: CalendarCheck, label: 'সালাত ট্র্যাকার', desc: 'দৈনিক নামাজ জিপিএস ট্র্যাকিং ও গ্রাফ' },
    { id: 'salah-guide', icon: BookOpen, label: 'সালাত শিক্ষা', desc: 'সালাতের নিয়ম ও প্রয়োজনীয় দোয়া' },
    { id: 'tasbih', icon: CircleDashed, label: 'তাসবিহ', desc: 'ডিজিটাল জিকির কাউন্টার' },
    { id: 'duas', icon: Sparkles, label: 'দৈনন্দিন দোয়া', desc: 'হিসনুল মুসলিম সংকলন' },
    { id: 'bookmarks', icon: Bookmark, label: 'বুকমার্কস', desc: 'পছন্দের সংরক্ষিত সূরা' },
    { id: 'settings', icon: Settings, label: 'অ্যাপ সেটিংস', desc: 'থিম ও ফন্ট কনফিগারেশন' },
  ] as const;

  const themes: { id: AppTheme; label: string; bg: string }[] = [
    { id: 'emerald', label: 'সবুজ', bg: '#059669' },
    { id: 'luxury', label: 'স্বর্ণ', bg: '#d4af37' },
    { id: 'dark', label: 'ডার্ক', bg: '#0f172a' },
    { id: 'ocean', label: 'নীল', bg: '#0284c7' },
    { id: 'sunset', label: 'সানসেট', bg: '#6366f1' },
    { id: 'midnight', label: 'মিডনাইট', bg: '#818cf8' },
    { id: 'light', label: 'লাইট', bg: '#2563eb' },
    { id: 'rose', label: 'গোলাপী', bg: '#e11d48' }
  ];

  const handleTabClick = (tabId: Tab) => {
    if (currentViewSurah !== null) {
      setCurrentViewSurah(null);
    }
    setActiveTab(tabId);
  };

  return (
    <aside className={`w-80 h-screen sticky top-0 bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col justify-between p-6 z-50 flex-shrink-0 relative hidden md:flex ${className || ''}`}>
      {/* Visual background accents */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--primary)] to-transparent opacity-[0.02] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[80px] opacity-[0.03] pointer-events-none" />

      <div className="flex flex-col space-y-8 relative z-10 w-full">
        {/* Brand Header */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => handleTabClick('home')}>
          <motion.div 
            animate={{ 
              rotate: isPlaying ? 360 : 0
            }}
            transition={{ 
              repeat: isPlaying ? Infinity : 0, 
              duration: 20, 
              ease: "linear" 
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute inset-[2px] bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[var(--primary)]" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-[var(--text-main)]">আল-কুরআনুল কারিম</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--primary)] font-sans">Premium Desktop App</p>
          </div>
        </div>

        {/* Live Clock & Next Prayer Header Card */}
        <div className="bg-[var(--bg-main)] rounded-[2rem] p-5 border border-[var(--border)] border-opacity-60 relative overflow-hidden shadow-inner group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[9px] font-bold text-[var(--text-muted)] tracking-wider uppercase font-sans">কন্টিনেন্টাল সময়</p>
              <h2 className="text-2xl font-bold text-[var(--text-main)] font-sans tracking-tight mt-1">{time || '--:--'}</h2>
            </div>
            {location && (
              <div className="flex items-center text-xs bg-[var(--primary-soft)] px-2.5 py-1 rounded-full text-[var(--primary)] font-bold border border-[var(--primary)] border-opacity-15 shrink-0 select-none">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="font-sans leading-none">{location.city}</span>
              </div>
            )}
          </div>

          {nextPrayer ? (
            <div className="border-t border-[var(--border)] border-dashed pt-3 mt-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-[var(--text-muted)] flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-[var(--primary)] opacity-80" />
                  {nextPrayer.isCurrent ? 'চলমান ওয়াক্ত:' : 'পরবর্তী ওয়াক্ত:'}
                </span>
                <span className="font-bold text-[var(--text-main)] font-sans">
                  {nextPrayer.name} • {nextPrayer.time}
                </span>
              </div>
              {!nextPrayer.isCurrent && (
                <div className="text-[10px] text-[var(--primary)] font-black tracking-wide text-right mt-1 font-sans">
                  বাকী {nextPrayer.remaining}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-[var(--text-muted)] text-center font-bold">Prayer times sync active...</div>
          )}
        </div>

        {/* Active Audio State Panel */}
        <AnimatePresence>
          {playingSurah && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              onClick={() => {
                // Open playing surah in reader view
                setCurrentViewSurah(playingSurah.number);
              }}
              className="bg-gradient-to-br from-[var(--primary-soft)] to-[var(--bg-surface)] border border-[var(--primary)] border-opacity-20 rounded-3xl p-4 flex items-center space-x-3 cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center relative shadow-md">
                {isPlaying ? (
                  <div className="flex items-end justify-center space-x-0.5 h-4">
                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-white rounded-full" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 bg-white rounded-full" />
                    <motion.div animate={{ height: [5, 10, 5] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-0.5 bg-white rounded-full" />
                  </div>
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest font-sans">অডিও তেলাওয়াত</p>
                <h4 className="font-bold text-sm text-[var(--text-main)] truncate font-sans">{playingSurah.englishName}</h4>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Mode Dedicated Sanctuary Banner Button */}
        <button
          onClick={() => setIsCleanMode(true)}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-zinc-900 border border-emerald-500/40 text-white flex items-center justify-between group hover:scale-[1.02] active:scale-95 transition-all shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 flex items-center justify-center font-bold shadow-sm group-hover:rotate-12 transition-transform">
              <Headphones className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left font-bengali">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">ক্লিন মোড</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/30">
                  ফোকাস
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-medium">বিজ্ঞাপনমুক্ত প্রশান্তির পরিবেশ</p>
            </div>
          </div>
          <Sparkle className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
        </button>

        {/* Navigation Tabs */}
        <div className="flex flex-col space-y-1 w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id && currentViewSurah === null;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative group font-bengali text-left ${
                  isActive 
                    ? 'text-[var(--primary)] bg-[var(--primary-soft)] font-black shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar-pill"
                    className="absolute left-0 w-1.5 h-8 bg-[var(--primary)] rounded-r-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 mr-3.5 transition-all duration-300 flex-shrink-0 ${
                  isActive ? 'scale-110 text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                }`} />
                <div className="flex-1">
                  <span className="text-[14px] tracking-wide leading-none">{item.label}</span>
                  <p className="text-[9px] text-[var(--text-muted)] mt-1 tracking-normal font-medium leading-none font-sans opacity-70 group-hover:opacity-100 transition-all">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Settings & Theme Fast Changer */}
      <div className="flex flex-col space-y-4 pt-6 mt-6 border-t border-[var(--border)] relative z-10 w-full">
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5 font-sans flex items-center">
            <Palette className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
            দ্রুত থিম নির্বাচন
          </p>
          <div className="grid grid-cols-4 gap-1.5 bg-[var(--bg-main)] p-2 rounded-2xl border border-[var(--border)] border-opacity-70">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                style={{ backgroundColor: t.id === 'light' ? '#ebf2ff' : t.id === 'dark' ? '#1e293b' : t.bg }}
                className={`h-8 w-full rounded-lg transition-transform hover:scale-110 active:scale-95 flex items-center justify-center border ${
                  theme === t.id 
                    ? 'border-white ring-2 ring-[var(--primary)] scale-105 shadow-md' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {theme === t.id && (
                  <div className={`w-2 h-2 rounded-full ${t.id === 'light' ? 'bg-[#2563eb]' : 'bg-white'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Small Attribution line */}
        <div className="text-center">
          <p className="text-[9px] text-[var(--text-muted)] font-bold tracking-widest uppercase opacity-40 font-sans">© REMIX QURAN 2026</p>
        </div>
      </div>
    </aside>
  );
};
