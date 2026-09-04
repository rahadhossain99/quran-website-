import { useAppStore } from '../Store';
import { 
  Home, Bookmark, Settings, CircleDashed, Sparkles, Clock, Palette, 
  BookOpen, Volume2, MapPin, CalendarCheck, Headphones, Sparkle,
  PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { PWAInstallBanner } from './PWAInstallBanner';

type Tab = 'home' | 'bookmarks' | 'tasbih' | 'duas' | 'settings' | 'salah-tracker' | 'salah-guide' | 'progress';
type AppTheme = 'light' | 'dark' | 'emerald' | 'luxury' | 'ocean' | 'rose' | 'sunset' | 'midnight';

export const Sidebar = ({ 
  className, 
  isMobileDrawer = false, 
  onCloseMobile 
}: { 
  className?: string; 
  isMobileDrawer?: boolean; 
  onCloseMobile?: () => void; 
}) => {
  const { 
    activeTab, setActiveTab, currentViewSurah, setCurrentViewSurah,
    theme, setTheme, location, nextPrayer, isPlaying, playingSurah,
    setIsCleanMode, isSidebarCollapsed, setIsSidebarCollapsed
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
    { id: 'progress', icon: TrendingUp, label: 'অগ্রগতি', desc: 'তেলাওয়াত ও পড়ার পারফর্ম্যান্স' },
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
    if (isMobileDrawer && onCloseMobile) {
      onCloseMobile();
    }
  };

  const isCollapsedEffective = isMobileDrawer ? false : isSidebarCollapsed;

  return (
    <motion.aside 
      animate={{ width: isMobileDrawer ? '100%' : isSidebarCollapsed ? 80 : 320 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`h-screen sticky top-0 bg-[var(--bg-surface)] border-r border-[var(--border)] flex-col justify-between ${
        isCollapsedEffective ? 'p-3' : 'p-5'
      } z-30 flex-shrink-0 ${isMobileDrawer ? 'flex w-full' : 'hidden md:flex'} overflow-y-auto overflow-x-hidden ${className || ''}`}
    >
      {/* Visual background accents */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--primary)] to-transparent opacity-[0.02] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[80px] opacity-[0.03] pointer-events-none" />

      <div className="flex flex-col space-y-6 relative z-10 w-full">
        {/* Brand Header & Toggle Collapse / Slide Button */}
        <div className="flex items-center justify-between gap-2">
          {!isCollapsedEffective ? (
            <div className="flex items-center space-x-3 cursor-pointer overflow-hidden min-w-0 group" onClick={() => handleTabClick('home')}>
              <motion.div 
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 20, ease: "linear" }}
                onClick={(e) => {
                  if (!isMobileDrawer) {
                    e.stopPropagation();
                    setIsSidebarCollapsed(!isSidebarCollapsed);
                  }
                }}
                title={isMobileDrawer ? "হোম পেজে যান" : "সাইডবার গুটিয়ে নিন/প্রসারিত করুন"}
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-md relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
              >
                <div className="absolute inset-[2px] bg-[var(--bg-surface)] rounded-[12px] flex items-center justify-center p-1 group-hover:bg-[var(--primary-soft)] transition-colors">
                  <img 
                    src="/logo.png" 
                    alt="লোগো" 
                    width="24" 
                    height="24" 
                    loading="lazy" 
                    decoding="async" 
                    className="w-6 h-6 object-contain aspect-square" 
                  />
                </div>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold font-sans tracking-tight text-[var(--text-main)] truncate">আল-কুরআনুল কারীম</h2>
                <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-[var(--primary)] font-sans truncate">ডিজিটাল সংস্করণ</p>
              </div>
            </div>
          ) : (
            /* When collapsed: Clicking Quran Icon slides out / expands the sidebar! */
            <div 
              onClick={() => {
                setIsSidebarCollapsed(false);
                handleTabClick('home');
              }}
              title="সাইডবার মেনু প্রসারিত করুন (Slide Out)"
              className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-md cursor-pointer relative overflow-hidden shrink-0 hover:scale-110 active:scale-95 transition-all group"
            >
              <div className="absolute inset-[2px] bg-[var(--bg-surface)] rounded-[12px] flex items-center justify-center p-1.5 group-hover:bg-[var(--primary-soft)] transition-colors">
                <img 
                  src="/logo.png" 
                  alt="লোগো" 
                  width="28" 
                  height="28" 
                  loading="lazy" 
                  decoding="async" 
                  className="w-7 h-7 object-contain aspect-square" 
                />
              </div>
            </div>
          )}

          {!isMobileDrawer ? (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? 'সাইডবার প্রসারিত করুন' : 'সাইডবার গুটিয়ে নিন'}
              className="p-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--primary-soft)] border border-[var(--border)] transition-all shrink-0 active:scale-95 mx-auto cursor-pointer"
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5 text-[var(--primary)]" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          ) : (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-[var(--border)] transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5 text-rose-500" />
            </button>
          )}
        </div>

        {/* Live Clock & Next Prayer Header Card (only expanded) */}
        {!isCollapsedEffective && (
          <div className="bg-[var(--bg-main)] rounded-2xl p-4 border border-[var(--border)] border-opacity-60 relative overflow-hidden shadow-inner group">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[9px] font-bold text-[var(--text-muted)] tracking-wider uppercase font-sans">কন্টিনেন্টাল সময়</p>
                <h2 className="text-xl font-bold text-[var(--text-main)] font-sans tracking-tight mt-0.5">{time || '--:--'}</h2>
              </div>
              {location && (
                <div className="flex items-center text-[11px] bg-[var(--primary-soft)] px-2 py-0.5 rounded-full text-[var(--primary)] font-bold border border-[var(--primary)] border-opacity-15 shrink-0 select-none">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="font-sans leading-none">{location.city}</span>
                </div>
              )}
            </div>

            {nextPrayer ? (
              <div className="border-t border-[var(--border)] border-dashed pt-2 mt-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-[var(--text-muted)] flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-[var(--primary)] opacity-80" />
                    {nextPrayer.isCurrent ? 'চলমান:' : 'পরবর্তী:'}
                  </span>
                  <span className="font-bold text-[var(--text-main)] font-sans">
                    {nextPrayer.name} • {nextPrayer.time}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Clean Mode Dedicated Banner Button */}
        <button
          onClick={() => {
            setIsCleanMode(true);
            if (isMobileDrawer && onCloseMobile) onCloseMobile();
          }}
          title="ক্লিন মোড ও ফোকাস"
          className={`rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-zinc-900 border border-emerald-500/40 text-white flex items-center justify-between group hover:scale-[1.02] active:scale-95 transition-all shadow-md ${
            isCollapsedEffective ? 'p-3 justify-center' : 'p-3.5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 flex items-center justify-center font-bold shadow-sm group-hover:rotate-12 transition-transform shrink-0">
              <Headphones className="w-5 h-5 fill-current" />
            </div>
            {!isCollapsedEffective && (
              <div className="text-left font-bengali">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">ক্লিন মোড</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/30">
                    ফোকাস
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/80 font-medium">বিজ্ঞাপনমুক্ত প্রশান্তির পরিবেশ</p>
              </div>
            )}
          </div>
          {!isCollapsedEffective && (
            <Sparkle className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          )}
        </button>

        {/* Navigation Tabs */}
        <div className="flex flex-col space-y-1 w-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.id && currentViewSurah === null;
            return (
              <a
                key={item.id}
                href={`/${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick(item.id);
                }}
                title={isCollapsedEffective ? `${item.label} - ${item.desc}` : undefined}
                className={`w-full flex items-center rounded-2xl transition-all duration-300 relative group font-bengali text-left cursor-pointer ${
                  isCollapsedEffective ? 'p-3 justify-center' : 'px-3.5 py-3'
                } ${
                  isActive 
                    ? 'text-[var(--primary)] bg-[var(--primary-soft)] font-black shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar-pill"
                    className="absolute left-0 w-1.5 h-7 bg-[var(--primary)] rounded-r-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 transition-all duration-300 flex-shrink-0 ${
                  isCollapsedEffective ? '' : 'mr-3'
                } ${
                  isActive ? 'scale-110 text-[var(--primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                }`} />
                {!isCollapsedEffective && (
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] tracking-wide leading-none block truncate">{item.label}</span>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5 tracking-normal font-medium leading-none font-sans opacity-70 group-hover:opacity-100 transition-all truncate">{item.desc}</p>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* PWA App Install & Footer Settings */}
      <div className="flex flex-col space-y-3 pt-3 border-t border-[var(--border)] relative z-10 w-full">
        {!isCollapsedEffective && (
          <div className="w-full">
            <PWAInstallBanner variant="button" className="w-full justify-center py-2.5" />
          </div>
        )}

        {!isCollapsedEffective ? (
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-sans flex items-center">
              <Palette className="w-3.5 h-3.5 mr-1.5 text-[var(--primary)]" />
              দ্রুত থিম পরিবর্তন
            </p>
            <div className="grid grid-cols-4 gap-1.5 bg-[var(--bg-main)] p-1.5 rounded-xl border border-[var(--border)] border-opacity-70">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  style={{ backgroundColor: t.id === 'light' ? '#ebf2ff' : t.id === 'dark' ? '#1e293b' : t.bg }}
                  className={`h-7 w-full rounded-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border ${
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
        ) : (
          <button
            onClick={() => {
              const themeOrder: AppTheme[] = ['emerald', 'dark', 'light', 'luxury', 'ocean', 'sunset'];
              const nextIndex = (themeOrder.indexOf(theme) + 1) % themeOrder.length;
              setTheme(themeOrder[nextIndex]);
            }}
            title="থিম পরিবর্তন করতে ট্যাপ করুন"
            className="w-10 h-10 mx-auto rounded-xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] hover:scale-105 transition-transform"
          >
            <Palette className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
