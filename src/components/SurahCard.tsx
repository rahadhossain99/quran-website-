import React from 'react';
import { SurahInfo } from '../types';
import { useAppStore } from '../Store';
import { motion } from 'motion/react';
import { Star, ChevronRight, Hash } from 'lucide-react';
import { getBanglaSurahData } from '../utils/banglaSurahNames';

interface SurahCardProps {
  surah: SurahInfo;
  isFavorite: boolean;
  index: number;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, isFavorite, index }) => {
  const { toggleFavorite, setCurrentViewSurah, playingSurah, isPlaying } = useAppStore();

  const handleCardClick = () => {
    setCurrentViewSurah(surah.number);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(surah.number);
  };

  const isCurrentlyPlaying = playingSurah?.number === surah.number;
  const bSurah = getBanglaSurahData(surah.number);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10px' }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 22, stiffness: 350 }}
      onClick={handleCardClick}
      className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all duration-300 cursor-pointer group flex items-center justify-between relative overflow-hidden ${
        isCurrentlyPlaying 
          ? 'bg-gradient-to-r from-[var(--primary-soft)] via-[var(--bg-surface)] to-[var(--bg-surface)] border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10 ring-2 ring-[var(--primary)]/30' 
          : 'bg-[var(--bg-surface)] border-[var(--border)] shadow-xs hover:border-[var(--primary)]/60 hover:shadow-md'
      }`}
    >
      {/* Background Accent Mesh */}
      <div className={`absolute top-0 right-0 w-28 h-28 rounded-bl-full transition-transform duration-700 pointer-events-none ${
        isCurrentlyPlaying ? 'bg-[var(--primary)] opacity-10 scale-150' : 'bg-[var(--primary)] opacity-[0.03] group-hover:scale-150'
      }`} />
      
      <div className="flex items-center space-x-3.5 sm:space-x-4 relative z-10 w-[70%] sm:w-[72%]">
        {/* 8-Pointed Islamic Geometric Number Badge */}
        <div className={`relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center font-black text-xs sm:text-sm transition-all ${
          isCurrentlyPlaying 
            ? 'text-[var(--primary)] scale-105' 
            : 'text-[var(--text-main)] group-hover:text-[var(--primary)]'
        }`}>
          <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full text-[var(--primary)] opacity-20 group-hover:opacity-40 transition-opacity">
            <rect x="7" y="7" width="26" height="26" rx="4" transform="rotate(45 20 20)" fill="currentColor" />
            <rect x="7" y="7" width="26" height="26" rx="4" fill="currentColor" />
          </svg>
          {isCurrentlyPlaying && isPlaying ? (
            <div className="flex items-center space-x-0.5 z-10">
              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-[var(--primary)] rounded-full" />
              <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-0.5 bg-[var(--primary)] rounded-full" />
              <motion.div animate={{ height: [5, 10, 5] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-0.5 bg-[var(--primary)] rounded-full" />
            </div>
          ) : (
            <span className="relative z-10 font-bold font-sans tracking-tight">{surah.number}</span>
          )}
        </div>

        <div className="overflow-hidden flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={`font-black text-base md:text-lg font-bengali truncate leading-tight transition-colors ${
              isCurrentlyPlaying ? 'text-[var(--primary)]' : 'text-[var(--text-main)] group-hover:text-[var(--primary)]'
            }`}>{bSurah.banglaName}</h3>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 truncate font-bengali">
            {bSurah.banglaPronunciation} • <span className="opacity-80">{bSurah.banglaMeaning}</span>
          </p>
          <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1.5 font-sans flex items-center gap-1.5 flex-wrap">
            <span className="bg-[var(--bg-main)] px-2 py-0.5 rounded-md border border-[var(--border)] font-bengali font-semibold">
              {surah.revelationType === "Meccan" || surah.revelationType === "মাক্কী" ? "মাক্কী" : "মাদানী"}
            </span>
            <span className="text-[var(--primary)] font-black font-bengali">{surah.numberOfAyahs}টি আয়াত</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 sm:space-x-4 relative z-10">
        <div className="text-right">
          <p className={`text-2xl sm:text-3xl font-arabic transition-all duration-500 leading-none mb-1 ${
            isCurrentlyPlaying ? 'text-[var(--primary)] scale-105' : 'text-[var(--text-main)] group-hover:text-[var(--primary)]'
          }`}>{surah.name}</p>
          <div className="flex justify-end pr-0.5">
             <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
               isCurrentlyPlaying ? 'text-[var(--primary)] opacity-100 translate-x-0' : 'text-[var(--primary)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
             }`} />
          </div>
        </div>
        <button 
          onClick={handleFavToggle}
          title={isFavorite ? 'বুকমার্ক থেকে সরান' : 'বুকমার্কে যোগ করুন'}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isFavorite ? 'bg-[var(--accent-soft)]' : 'bg-transparent hover:bg-[var(--bg-main)]'}`}
        >
          <Star className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${isFavorite ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-[var(--text-muted)] opacity-30 hover:opacity-100'}`} />
        </button>
      </div>
    </motion.div>
  );
};
