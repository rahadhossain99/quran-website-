import { useAppStore } from '../Store';
import { Home, Bookmark, Settings, Sparkles, CalendarCheck, BookOpen, Headphones, TrendingUp } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab, currentViewSurah, setIsCleanMode } = useAppStore();

  if (currentViewSurah !== null) return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'হোম', action: () => setActiveTab('home') },
    { id: 'progress', icon: TrendingUp, label: 'অগ্রগতি', action: () => setActiveTab('progress') },
    { id: 'salah-tracker', icon: CalendarCheck, label: 'সালাত ট্র্যাকার', action: () => setActiveTab('salah-tracker') },
    { id: 'clean-mode', icon: Headphones, label: 'ক্লিন মোড', action: () => setIsCleanMode(true), isSpecial: true },
    { id: 'duas', icon: Sparkles, label: 'দোয়া', action: () => setActiveTab('duas') },
    { id: 'bookmarks', icon: Bookmark, label: 'বুকমার্ক', action: () => setActiveTab('bookmarks') },
    { id: 'settings', icon: Settings, label: 'সেটিংস', action: () => setActiveTab('settings') },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-4xl glass-panel border-t border-[var(--border)] z-40 pb-safe md:hidden shadow-lg">
      <div className="flex justify-around items-center h-20 px-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center min-w-[52px] flex-1 justify-center transition-all ${
                item.isSpecial
                  ? 'text-emerald-600 font-extrabold'
                  : isActive 
                    ? 'text-[var(--primary)] font-bold' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                  item.isSpecial
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30 scale-105'
                    : isActive 
                      ? 'bg-[var(--primary-soft)] scale-[1.05] shadow-xs' 
                      : 'bg-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive && !item.isSpecial ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[9px] font-extrabold tracking-tight font-bengali text-center leading-none truncate w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

