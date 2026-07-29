import { useAppStore } from '../Store';
import { Home, Bookmark, Settings, CircleDashed, Sparkles, CalendarCheck, BookOpen } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab, currentViewSurah } = useAppStore();

  if (currentViewSurah !== null) return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'হোম' },
    { id: 'salah-tracker', icon: CalendarCheck, label: 'সালাত ট্র্যাকার' },
    { id: 'salah-guide', icon: BookOpen, label: 'সালাত শিক্ষা' },
    { id: 'duas', icon: Sparkles, label: 'দোয়া' },
    { id: 'bookmarks', icon: Bookmark, label: 'বুকমার্ক' },
    { id: 'settings', icon: Settings, label: 'সেটিংস' },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-4xl glass-panel border-t border-[var(--border)] z-40 pb-safe md:hidden">
      <div className="flex justify-around items-center h-20 px-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center min-w-[56px] flex-1 justify-center transition-all ${
                isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div
                className={`w-11 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                  isActive ? 'bg-[var(--primary-soft)] scale-[1.05] shadow-sm' : 'bg-transparent'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 ${isActive ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[9px] font-extrabold tracking-tight font-bengali text-center leading-none truncate w-full px-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

