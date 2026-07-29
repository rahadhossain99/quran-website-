import { useEffect, useState } from 'react';
import { useAppStore } from '../Store';
import { SurahInfo } from '../types';
import { fetchAllSurahs } from '../api';
import { SurahCard } from '../components/SurahCard';
import { Bookmark, Inbox } from 'lucide-react';
import { motion } from 'motion/react';

export const BookmarksView = () => {
  const { favorites } = useAppStore();
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSurahs().then(data => {
      setSurahs(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const favSurahs = surahs.filter(s => favorites.includes(s.number));

  return (
    <div className="pb-32 px-4 pt-6 max-w-3xl mx-auto font-bengali">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-surface)] rounded-[2rem] p-8 mb-8 text-center border border-[var(--border)] shadow-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)] opacity-5 to-transparent pointer-events-none" />
        <div className="w-20 h-20 mx-auto bg-[var(--accent-soft)] rounded-full flex items-center justify-center mb-4 relative z-10 border border-[var(--accent)] border-opacity-20">
          <Bookmark className="w-10 h-10 text-[var(--accent)] fill-current drop-shadow-sm" />
        </div>
        <h2 className="text-3xl font-bold font-sans text-[var(--text-main)] relative z-10 tracking-tight">বুকমার্ক সমূহ</h2>
        <p className="text-[var(--text-muted)] font-semibold mt-2 relative z-10">আপনার পছন্দের সংরক্ষিত সূরাগুলো</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--primary-soft)] border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
      ) : favSurahs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-8">
          {favSurahs.map((surah, index) => (
            <SurahCard key={surah.number} surah={surah} isFavorite={true} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-24 h-24 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-[var(--border)]">
             <Inbox className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-main)] mb-2">কোনো বুকমার্ক নেই</h3>
          <p className="text-sm font-semibold text-[var(--text-muted)]">সূরা পড়ার সময় স্টারে ক্লিক করে সেভ করুন</p>
        </div>
      )}
    </div>
  );
};

