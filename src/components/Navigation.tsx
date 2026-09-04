import { useAppStore } from '../Store';
import { Home, Bookmark, Settings, Sparkles, CalendarCheck, BookOpen, Headphones, TrendingUp } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab, currentViewSurah, setIsCleanMode } = useAppStore();

  if (currentViewSurah !== null) return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'হোম', action: () => setActiveTab('home'), href: '#/home' },
    { id: 'progress', icon: TrendingUp, label: 'অগ্রগতি', action: () => setActiveTab('progress'), href: '#/progress' },
    { id: 'salah-tracker', icon: CalendarCheck, label: 'সালাত ট্র্যাকার', action: () => setActiveTab('salah-tracker'), href: '#/salah-tracker' },
    { id: 'clean-mode', icon: Headphones, label: 'ক্লিন মোড', action: () => setIsCleanMode(true), isSpecial: true, href: '#/clean-mode' },
    { id: 'duas', icon: Sparkles, label: 'দোয়া', action: () => setActiveTab('duas'), href: '#/duas' },
    { id: 'bookmarks', icon: Bookmark, label: 'বুকমার্ক', action: () => setActiveTab('bookmarks'), href: '#/bookmarks' },
    { id: 'settings', icon: Settings, label: 'সেটিংস', action: () => setActiveTab('settings'), href: '#/settings' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-4xl glass-panel border-t border-[var(--border)] z-40 pb-safe md:hidden shadow-lg">
      <div className="flex justify-around items-center h-20 px-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                item.action();
              }}
              className={`flex flex-col items-center min-w-[52px] flex-1 justify-center transition-all cursor-pointer ${
                item.isSpecial
                  ? 'text-amber-700 dark:text-amber-400 font-extrabold'
                  : isActive 
                    ? 'text-[var(--primary)] font-bold' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                  item.isSpecial
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/30 scale-105'
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
            </a>
          );
        })}
      </div>
    </nav>
  );
};

