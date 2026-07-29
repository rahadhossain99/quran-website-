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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={handleCardClick}
      className={`p-4.5 md:p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer group flex items-center justify-between relative overflow-hidden ${
        isCurrentlyPlaying 
          ? 'bg-gradient-to-r from-[var(--primary-soft)] via-[var(--bg-surface)] to-[var(--bg-surface)] border-[var(--primary)] shadow-md shadow-[var(--primary)]/10 ring-2 ring-[var(--primary)]/30 ring-offset-2 ring-offset-[var(--bg-main)]' 
          : 'bg-[var(--bg-surface)] border-[var(--border)] shadow-sm hover:border-[var(--primary)]/60 hover:shadow-md'
      }`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full transition-transform duration-700 ${
        isCurrentlyPlaying ? 'bg-[var(--primary)] opacity-10 scale-150' : 'bg-[var(--primary)] opacity-[0.02] group-hover:scale-150'
      }`} />
      
      <div className="flex items-center space-x-4 relative z-10 w-[72%]">
        <div className={`relative flex-shrink-0 w-12 h-12 md:w-13 md:h-13 rounded-2xl flex items-center justify-center font-black text-base md:text-lg transition-all border ${
          isCurrentlyPlaying 
            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/30 scale-105' 
            : 'bg-[var(--bg-main)] text-[var(--text-main)] group-hover:bg-[var(--primary)] group-hover:text-white shadow-inner border-[var(--border)]'
        }`}>
          {isCurrentlyPlaying && isPlaying ? (
            <div className="flex items-center space-x-1">
              <motion.div animate={{ height: [4, 14, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
              <motion.div animate={{ height: [8, 18, 8] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1 bg-white rounded-full" />
              <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-white rounded-full" />
            </div>
          ) : (
            <span className="relative z-10 font-sans tracking-tight">{surah.number}</span>
          )}
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center space-x-2.5">
            <h3 className={`font-black text-base md:text-lg font-bengali truncate leading-tight transition-colors ${
              isCurrentlyPlaying ? 'text-[var(--primary)]' : 'text-[var(--text-main)] group-hover:text-[var(--primary)]'
            }`}>{bSurah.banglaName}</h3>
          </div>
          <p className="text-[11px] md:text-xs text-[var(--text-muted)] font-medium mt-0.5 truncate font-bengali">
            {bSurah.banglaPronunciation} • <span className="opacity-90">{bSurah.banglaMeaning}</span>
          </p>
          <div className="text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] mt-1.5 font-sans flex items-center gap-1.5 flex-wrap">
            <span className="bg-[var(--bg-main)] px-2 py-0.5 rounded-md border border-[var(--border)] font-bengali font-semibold">
              {surah.revelationType === "Meccan" || surah.revelationType === "মাক্কী" ? "মাক্কী" : "মাদানী"}
            </span>
            <span className="text-[var(--primary)] font-extrabold font-bengali">{surah.numberOfAyahs}টি আয়াত</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 relative z-10">
        <div className="text-right">
          <p className={`text-3xl font-arabic transition-all duration-700 leading-none mb-1 ${
            isCurrentlyPlaying ? 'text-[var(--primary)] scale-110' : 'text-[var(--text-main)] opacity-90 group-hover:text-[var(--primary)] group-hover:scale-105'
          }`}>{surah.name}</p>
          <div className="flex justify-end pr-1">
             <ChevronRight className={`w-4 h-4 transition-all duration-500 ${
               isCurrentlyPlaying ? 'text-[var(--primary)] opacity-100 translate-x-0' : 'text-[var(--primary)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
             }`} />
          </div>
        </div>
        <button 
          onClick={handleFavToggle}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isFavorite ? 'bg-[var(--accent-soft)]' : (isCurrentlyPlaying ? 'hover:bg-[var(--primary)] hover:bg-opacity-10' : 'bg-transparent hover:bg-[var(--bg-main)]')}`}
        >
          <Star className={`w-5 h-5 transition-all ${isFavorite ? 'fill-[var(--accent)] text-[var(--accent)]' : (isCurrentlyPlaying ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] opacity-30 hover:opacity-100')}`} />
        </button>
      </div>
    </motion.div>
  );
};
