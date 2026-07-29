import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, Filter, ChevronDown, ChevronUp, Loader, Copy, Check, Heart, Compass, BookOpen, Share2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../Store';

export interface RemoteDua {
  id: string;
  title: string;
  category: string;
  arabic: string;
  pronunciation: string;
  translation: string;
  reference: string;
}

export const DuasView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDuaId, setExpandedDuaId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const { arabicFontSize, bengaliFontSize } = useAppStore();

  const [duas, setDuas] = useState<RemoteDua[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favoriteDuas, setFavoriteDuas] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('favorite_duas') || '[]');
  });

  const toggleAudio = (id: string, text: string, lang: string = 'ar-SA', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে স্পিচ অডিও সাপোর্ট করে না।');
      return;
    }

    if (playingAudioId === id) {
      window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);

    setPlayingAudioId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareDua = (dua: RemoteDua, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `${dua.title}\n\n${dua.arabic}\n\nউচ্চারণ: ${dua.pronunciation}\nঅর্থ: ${dua.translation}\n\nসূত্র: ${dua.reference || 'হিসনুল মুসলিম'}`;
    if (navigator.share) {
      navigator.share({
        title: dua.title,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleFavoriteDua = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedFavorites = [...favoriteDuas];
    if (updatedFavorites.includes(id)) {
      updatedFavorites = updatedFavorites.filter(favId => favId !== id);
    } else {
      updatedFavorites.push(id);
    }
    setFavoriteDuas(updatedFavorites);
    localStorage.setItem('favorite_duas', JSON.stringify(updatedFavorites));
  };

  useEffect(() => {
    const loadDuas = async () => {
      try {
        setLoading(true);
        
        // Load both local high-quality curated data files
        const responses = await Promise.allSettled([
          fetch('/duas_data.json'),
          fetch('/more_duas_data.json')
        ]);
        
        let mergedDuas: RemoteDua[] = [];
        const uniqueCategories = new Set<string>();
        
        // Parse results from local files
        for (const res of responses) {
          if (res.status === 'fulfilled' && res.value.ok) {
            try {
              const data = await res.value.json();
              if (Array.isArray(data)) {
                data.forEach((d: any) => {
                  if (d.category) {
                    uniqueCategories.add(d.category);
                  }
                  mergedDuas.push({
                    id: d.id || Math.random().toString(),
                    title: d.title || d.category,
                    category: d.category || 'দৈনন্দিন জীবন',
                    arabic: d.arabic || '',
                    pronunciation: d.pronunciation || '',
                    translation: d.translation || '',
                    reference: d.reference || ''
                  });
                });
              }
            } catch (err) {
              console.warn('Error parsing local dua chunk:', err);
            }
          }
        }

        // If local files failed or were empty, try fetching from the online Hisnul Muslim backup
        if (mergedDuas.length === 0) {
          console.log('No local duas loaded, falling back to online Hisnul-Muslim backup...');
          const onlineBackupUrl = 'https://raw.githubusercontent.com/Deen-Developers/Hisnul-Muslim-JSON/main/data/bn.json';
          const response = await fetch(onlineBackupUrl);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              data.forEach((chapter: any, index: number) => {
                const categoryName = chapter.title || `Category ${index + 1}`;
                uniqueCategories.add(categoryName);
                if (Array.isArray(chapter.duas)) {
                  chapter.duas.forEach((dua: any, duaIndex: number) => {
                    mergedDuas.push({
                      id: `dua-${index}-${duaIndex}`,
                      category: categoryName,
                      title: dua.title || categoryName,
                      arabic: dua.arabic || '',
                      pronunciation: dua.transliteration_bn || dua.transliteration || '',
                      translation: dua.translation_bn || dua.translation || '',
                      reference: dua.reference || ''
                    });
                  });
                }
              });
            }
          }
        }
        
        if (mergedDuas.length === 0) {
          throw new Error('দোয়া গুলো লোড করা সম্ভব হয়নি। দয়া করে আপনার ইন্টারনেট সংযোগ চেক করুন।');
        }

        setDuas(mergedDuas);
        setCategories(Array.from(uniqueCategories));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading duas');
      } finally {
        setLoading(false);
      }
    };

    loadDuas();
  }, []);

  const filteredDuas = useMemo(() => {
    return duas.filter(dua => {
      const title = dua.title || '';
      const translation = dua.translation || '';
      const pronunciation = dua.pronunciation || '';
      const matchesSearch = 
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        translation.includes(searchTerm) ||
        pronunciation.includes(searchTerm);
      
      const matchesCategory = selectedCategory 
        ? (selectedCategory === "favorites" ? favoriteDuas.includes(dua.id) : dua.category === selectedCategory) 
        : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, duas, favoriteDuas]);

  return (
    <div className="pb-32 px-4 pt-4 md:pt-6 max-w-3xl mx-auto font-bengali">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] font-sans">দৈনন্দিন দোয়া</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm ml-13 font-semibold">কুরআন ও সুন্নাহ থেকে নির্বাচিত নিত্য প্রয়োজনীয় দোয়া সমূহ</p>
      </motion.div>

      {/* Search Input */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-6"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[var(--text-muted)]" />
        </div>
        <input
          type="text"
          className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-main)] rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--text-muted)] font-semibold shadow-sm"
          placeholder="কোন দোয়া খুঁজছেন?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Category Pills */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex overflow-x-auto custom-scrollbar pb-3 mb-4 -mx-4 px-4 space-x-2 snap-x"
      >
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all border snap-start ${
            selectedCategory === null 
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md translate-y-[-1px]' 
              : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--primary-soft)]'
          }`}
        >
          সকল দোয়া
        </button>
        <button
          onClick={() => setSelectedCategory("favorites")}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all border snap-start flex items-center space-x-1.5 ${
            selectedCategory === "favorites"
              ? 'bg-rose-500 text-white border-rose-500 shadow-md translate-y-[-1px]' 
              : 'bg-[var(--bg-surface)] text-rose-500 border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${selectedCategory === "favorites" ? "fill-white" : "fill-rose-500"}`} />
          <span>প্রিয় দোয়া ({favoriteDuas.length})</span>
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all border snap-start ${
              selectedCategory === category
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md translate-y-[-1px]' 
                : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)] hover:bg-[var(--primary-soft)]'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Duas List */}
      <div className="space-y-4">
        {loading && (
           <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] space-y-4">
              <Loader className="w-8 h-8 animate-spin text-[var(--primary)]" />
              <p className="font-semibold animate-pulse">দোয়া গুলো লোড হচ্ছে...</p>
           </div>
        )}

        {error && !loading && (
           <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-surface)] border border-red-200 rounded-3xl text-red-500 shadow-sm">
             <Filter className="w-10 h-10 mb-4 opacity-50" />
             <p className="font-bold text-lg">{error}</p>
             <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[var(--primary)] text-white font-bold rounded-xl shadow hover:opacity-90">পুনরায় চেষ্টা করুন</button>
           </div>
        )}

        <AnimatePresence mode="popLayout">
          {!loading && !error && filteredDuas.length > 0 ? (
            filteredDuas.map((dua, index) => {
              const isExpanded = expandedDuaId === dua.id;
              const isFav = favoriteDuas.includes(dua.id);
              
              return (
                <motion.div
                  key={dua.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: typeof index === 'number' && index < 10 ? index * 0.05 : 0 }}
                  className={`rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'bg-[var(--bg-surface)] border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-10 shadow-lg' 
                      : 'bg-[var(--bg-surface)] border-[var(--border)] shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:shadow-md'
                  }`}
                >
                  <div 
                    className="p-5 flex items-start justify-between cursor-pointer select-none"
                    onClick={() => setExpandedDuaId(isExpanded ? null : dua.id)}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[var(--primary)] text-white font-sans shadow-sm">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] uppercase tracking-wider">
                          {dua.category}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-[var(--text-main)] text-base md:text-lg leading-snug font-bengali">{dua.title}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">
                      {/* Audio Play Button */}
                      <button
                        onClick={(e) => toggleAudio(dua.id, dua.arabic, 'ar-SA', e)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          playingAudioId === dua.id 
                            ? 'bg-[var(--primary)] text-white shadow-sm animate-pulse' 
                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]'
                        }`}
                        title={playingAudioId === dua.id ? "অডিও থামান" : "আরবি উচ্চারণ শুনুন"}
                      >
                        {playingAudioId === dua.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavoriteDua(dua.id, e)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isFav ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-rose-500'
                        }`}
                        title={isFav ? "প্রিয় তালিকা থেকে সরান" : "প্রিয় তালিকায় যোগ করুন"}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={(e) => handleShareDua(dua, e)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-all"
                        title="শেয়ার করুন"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const combinedText = `${dua.title}\n\n${dua.arabic}\n\nউচ্চারণ: ${dua.pronunciation}\nঅর্থ: ${dua.translation}\n\nসূত্র: ${dua.reference || 'হিসনুল মুসলিম'}`;
                          navigator.clipboard.writeText(combinedText);
                          setCopiedId(dua.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          copiedId === dua.id ? 'bg-emerald-500 text-white shadow-sm' : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--primary)]'
                        }`}
                        title="কপি করুন"
                      >
                        {copiedId === dua.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* Dropdown Indicator */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isExpanded ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'
                      }`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="border-t border-[var(--border)]"
                      >
                        <div className="p-6 flex flex-col items-center bg-gradient-to-b from-[var(--bg-main)] to-[var(--bg-surface)]">
                          {/* Arabic beautiful panel */}
                          <div className="mb-6 w-full bg-[var(--primary-soft)] bg-opacity-20 border-l-4 border-[var(--primary)] rounded-r-2xl p-5 shadow-inner text-center relative overflow-hidden">
                            <div className="absolute right-2 top-2 text-[10px] bg-[var(--primary)] text-white font-black px-1.5 py-0.5 rounded-md opacity-20 select-none">
                              العربية
                            </div>
                            <p 
                              className="font-arabic font-bold text-center !leading-loose break-words py-2 pr-2"
                              style={{ 
                                fontSize: `${arabicFontSize + 2}px`, 
                                color: 'var(--text-main)',
                                textShadow: '0 1px 1px rgba(0,0,0,0.01)'
                              }}
                              dir="rtl"
                            >
                              {dua.arabic}
                            </p>
                          </div>
                          
                          <div className="w-full space-y-4">
                            {/* Pronunciation block */}
                            {dua.pronunciation && (
                              <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border)] shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative">
                                <div className="absolute right-4 top-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">
                                  উচ্চারণ
                                </div>
                                <p 
                                  className="font-bengali font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed pr-10"
                                  style={{ fontSize: `${bengaliFontSize * 1.05}px` }}
                                >
                                  {dua.pronunciation}
                                </p>
                              </div>
                            )}

                            {/* Translation block */}
                            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative">
                              <div className="absolute right-4 top-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full">
                                অর্থ
                              </div>
                              <p 
                                className="font-bengali font-semibold text-[var(--text-main)] leading-relaxed opacity-95 pr-10"
                                style={{ fontSize: `${bengaliFontSize}px` }}
                              >
                                {dua.translation}
                              </p>
                            </div>
                            
                            {/* Reference line */}
                            {dua.reference && (
                              <div className="mt-4 pt-3 border-t border-[var(--border)] border-dashed flex justify-between items-center text-xs">
                                <span className="text-[var(--text-muted)] font-bold">উৎস / রেফারেন্স</span>
                                <span className="text-[var(--primary)] font-black bg-[var(--primary-soft)] px-2.5 py-0.5 rounded-full">
                                  {dua.reference}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : !loading && !error ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-16 px-4 bg-[var(--bg-surface)] rounded-3xl border border-dashed border-[var(--border)]"
            >
              <div className="w-16 h-16 mx-auto bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-4 text-[var(--text-muted)] shadow-inner">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="font-bold text-[var(--text-main)] text-xl mb-2">কোনো দোয়া পাওয়া যায়নি</h3>
              <p className="text-[var(--text-muted)] font-semibold text-sm">"{(searchTerm || selectedCategory)}" দিয়ে অনুসন্ধান করে কিছু মেলেনি। অন্য শব্দ বা ক্যাটাগরি ব্যবহার করে দেখুন।</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
