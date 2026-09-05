import { useAppStore } from '../Store';
import { Home, Bookmark, CalendarCheck, Headphones, Menu } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab, currentViewSurah, setIsCleanMode, setIsMobileMenuOpen } = useAppStore();

  if (currentViewSurah !== null) return null;

  // 5 core navigation items as requested: uncluttered, clean, spacious
  // All other features (Hadith, Zakat, Progress, Duas, Tasbih, Settings) are in the Menu drawer
  const isMenuTabActive = ['hadith', 'zakat', 'progress', 'salah-guide', 'tasbih', 'duas', 'settings'].includes(activeTab);

  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'হোম', 
      action: () => setActiveTab('home'), 
      href: '/home',
      isActive: activeTab === 'home'
    },
    { 
      id: 'salah-tracker', 
      icon: CalendarCheck, 
      label: 'সালাত', 
      action: () => setActiveTab('salah-tracker'), 
      href: '/salah-tracker',
      isActive: activeTab === 'salah-tracker'
    },
    { 
      id: 'clean-mode', 
      icon: Headphones, 
      label: 'ক্লিন মোড', 
      action: () => setIsCleanMode(true), 
      isSpecial: true, 
      href: '/clean-mode',
      isActive: false
    },
    { 
      id: 'bookmarks', 
      icon: Bookmark, 
      label: 'বুকমার্ক', 
      action: () => setActiveTab('bookmarks'), 
      href: '/bookmarks',
      isActive: activeTab === 'bookmarks'
    },
    { 
      id: 'menu', 
      icon: Menu, 
      label: 'মেনুবার', 
      action: () => setIsMobileMenuOpen(true), 
      href: '#menu',
      isActive: isMenuTabActive
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-lg glass-panel border-t border-[var(--border)] z-40 pb-safe md:hidden shadow-lg backdrop-blur-md bg-[var(--bg-surface)]/90">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center flex-1 justify-center py-1 transition-all cursor-pointer ${
                item.isSpecial
                  ? 'text-amber-700 dark:text-amber-400 font-extrabold'
                  : item.isActive 
                    ? 'text-[var(--primary)] font-bold' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div
                className={`w-10 h-7 rounded-full flex items-center justify-center mb-0.5 transition-all duration-300 ${
                  item.isSpecial
                    ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/30 scale-105'
                    : item.isActive 
                      ? 'bg-[var(--primary-soft)] scale-[1.05]' 
                      : 'bg-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.isActive && !item.isSpecial ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className="text-[11px] font-extrabold tracking-tight font-bengali text-center leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


