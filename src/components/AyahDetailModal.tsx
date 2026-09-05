import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Copy, Check, Share2, Play, Pause, BookOpen, Sparkles, 
  ExternalLink, Volume2, Bookmark, CheckCircle2, Loader2, AlertCircle 
} from 'lucide-react';

interface AyahDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  bengaliText: string;
  transliterationText?: string;
  audioUrl?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onOpenShare?: () => void;
}

interface TafsirData {
  translation: string;
  footnotes: string;
}

// In-memory cache for fast instant reopening
const tafsirCache = new Map<string, TafsirData>();

// Helper to safely format and render Tafsir text without raw HTML tags like <b> or </b>
const FormattedTafsir: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split by bold tags to render them nicely
  const sections = content.split(/(<b>.*?<\/b>)/gis);

  return (
    <div className="space-y-3.5 text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-bengali">
      {sections.map((part, idx) => {
        const isBoldMatch = part.match(/^<b>(.*?)<\/b>$/is);
        if (isBoldMatch) {
          const innerText = isBoldMatch[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
          if (!innerText) return null;
          return (
            <div 
              key={idx} 
              className="font-extrabold text-[var(--primary)] text-base sm:text-lg pt-2 pb-1 border-b border-[var(--border)]/60 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{innerText}</span>
            </div>
          );
        }

        // Clean any remaining raw HTML tags
        const cleanedText = part
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/?[^>]+(>|$)/g, '')
          .trim();

        if (!cleanedText) return null;

        // Split into paragraphs
        const paragraphs = cleanedText.split(/\n\s*\n/);

        return (
          <React.Fragment key={idx}>
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Detect Hadith / Book citations like [বুখারী ৫৩, মুসলিম ১৯০৭]
              const withFormattedCitations = trimmed.split(/(\[[^\]]+\])/g).map((segment, cIdx) => {
                if (segment.startsWith('[') && segment.endsWith(']')) {
                  return (
                    <span 
                      key={cIdx} 
                      className="inline-block px-1.5 py-0.5 mx-1 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold font-sans"
                    >
                      {segment}
                    </span>
                  );
                }
                return segment;
              });

              return (
                <p key={pIdx} className="opacity-95 leading-[1.8] text-justify font-normal">
                  {withFormattedCitations}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const AyahDetailModal: React.FC<AyahDetailModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayahNumber,
  arabicText,
  bengaliText,
  transliterationText,
  audioUrl,
  isPlaying = false,
  onTogglePlay,
  onOpenShare
}) => {
  const [copied, setCopied] = useState(false);
  const [tafsir, setTafsir] = useState<TafsirData | null>(null);
  const [loadingTafsir, setLoadingTafsir] = useState(false);
  const [tafsirError, setTafsirError] = useState(false);
  const [activeTab, setActiveTab] = useState<'tafsir' | 'details'>('tafsir');

  // Handle hardware / browser back button for modal
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modal: 'ayah-detail' }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isOpen, onClose]);

  // Fetch Dr. Abu Bakr Zakaria Tafsir & Footnotes from QuranEnc
  useEffect(() => {
    if (!isOpen || !surahNumber || !ayahNumber) return;

    const cacheKey = `${surahNumber}_${ayahNumber}`;
    if (tafsirCache.has(cacheKey)) {
      setTafsir(tafsirCache.get(cacheKey)!);
      setLoadingTafsir(false);
      setTafsirError(false);
      return;
    }

    setLoadingTafsir(true);
    setTafsirError(false);

    const controller = new AbortController();
    fetch(`https://quranenc.com/api/v1/translation/aya/bengali_zakaria/${surahNumber}/${ayahNumber}`, {
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => {
        if (data && data.result) {
          const loadedData: TafsirData = {
            translation: data.result.translation || bengaliText,
            footnotes: data.result.footnotes || ''
          };
          tafsirCache.set(cacheKey, loadedData);
          setTafsir(loadedData);
        } else {
          setTafsir({
            translation: bengaliText,
            footnotes: ''
          });
        }
        setLoadingTafsir(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.warn('Tafsir fetch warning:', err);
          setTafsirError(true);
          setLoadingTafsir(false);
          // Graceful fallback to existing translation
          setTafsir({
            translation: bengaliText,
            footnotes: ''
          });
        }
      });

    return () => controller.abort();
  }, [isOpen, surahNumber, ayahNumber, bengaliText]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const tafsirNote = tafsir?.footnotes ? `\n\nতাফসির ও প্রাসঙ্গিক নোট:\n${tafsir.footnotes}` : '';
    const textToCopy = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\n${arabicText}\n\nউচ্চারণ: ${transliterationText || ''}\n\nবাংলা অনুবাদ: ${tafsir?.translation || bengaliText}${tafsirNote}\n\n— সূরা ${surahName}, আয়াত ${ayahNumber}\n(আল-কুরআনুল কারীম)`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-bengali">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window: Smooth Bottom Sheet on Mobile, Centered on Desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
          className="relative w-full sm:max-w-2xl bg-[var(--bg-surface)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[85vh] sm:my-auto"
        >
          {/* Mobile Sheet Drag Indicator Bar */}
          <div className="w-full pt-2.5 pb-1 flex justify-center sm:hidden bg-[var(--bg-surface)]">
            <div className="w-12 h-1.5 rounded-full bg-[var(--border)]" />
          </div>

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-[var(--primary)]/10 via-transparent to-transparent flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shadow-md">
                {ayahNumber}
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)] flex items-center gap-1.5 font-sans">
                  {surahName}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                    আয়াত {ayahNumber}
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  অনলাইন থেকে বিস্তারিত তরজমা ও প্রামাণ্য তাফসির
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title="সম্পূর্ণ আয়াত ও তাফসির কপি করুন"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
              {onOpenShare && (
                <button
                  onClick={onOpenShare}
                  className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  title="আয়াত কার্ড শেয়ার করুন"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Bar (Audio, Share, Copy) */}
          <div className="px-5 py-2.5 bg-[var(--bg-main)]/60 border-b border-[var(--border)] flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center space-x-2">
              {onTogglePlay && (
                <button
                  onClick={onTogglePlay}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'তিলাওয়াত থামান' : 'এই আয়াত শুনুন'}</span>
                </button>
              )}
              <span className="text-[11px] text-[var(--text-muted)]">
                তাফসীরকারক: ড. আবু বকর মুহাম্মাদ যাকারিয়া
              </span>
            </div>

            {copied && (
              <span className="text-emerald-500 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> কপি সম্পন্ন!
              </span>
            )}
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1 pb-8">
            {/* Arabic Script */}
            <div className="bg-[var(--bg-main)] p-6 rounded-3xl border border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-2 left-3 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-sans opacity-60">
                আরবি মতন
              </div>
              <p
                className="font-arabic text-[var(--text-main)] text-right leading-[2.2] pt-3 text-2xl sm:text-3xl selection:bg-amber-500/30"
                dir="rtl"
              >
                {arabicText}
                <span className="text-[var(--primary)] mx-2 font-sans inline-flex items-center text-lg">
                  ۝
                </span>
              </p>
            </div>

            {/* Pronunciation */}
            {transliterationText && (
              <div className="bg-[var(--bg-main)]/70 p-4 rounded-2xl border border-[var(--border)]">
                <h4 className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider mb-1 font-sans">
                  বাংলা উচ্চারণ
                </h4>
                <p className="text-[var(--text-muted)] font-medium text-sm sm:text-base leading-relaxed">
                  {transliterationText}
                </p>
              </div>
            )}

            {/* Translation Box */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 shadow-xs">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-1.5 font-sans">
                <BookOpen className="w-4 h-4" />
                বাংলা তরজমা ও অনুবাদ
              </h4>
              <p className="text-[var(--text-main)] font-semibold text-base sm:text-lg leading-relaxed">
                {tafsir?.translation || bengaliText}
              </p>
            </div>

            {/* Tafsir & Footnotes Commentary */}
            <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <h4 className="text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  প্রামাণ্য তাফসির ও প্রাসঙ্গিক হাদিসের ব্যাখ্যা
                </h4>
                {loadingTafsir && (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--primary)] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    অনলাইন থেকে লোড হচ্ছে...
                  </span>
                )}
              </div>

              {loadingTafsir ? (
                <div className="py-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto opacity-70" />
                  <p className="text-xs text-[var(--text-muted)]">
                    ড. আবু বকর মুহাম্মাদ যাকারিয়ার প্রামাণ্য তাফসির সংগ্রহ করা হচ্ছে...
                  </p>
                </div>
              ) : tafsir?.footnotes ? (
                <FormattedTafsir content={tafsir.footnotes} />
              ) : (
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] text-center text-xs text-[var(--text-muted)]">
                  {tafsirError ? (
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <span>অনলাইন তাফসির লোড করতে সাময়িক বিলম্ব হচ্ছে। তবে মূল বিশুদ্ধ বাংলা অনুবাদ উপরে প্রদর্শিত আছে।</span>
                    </div>
                  ) : (
                    <span>এই আয়াতের জন্য অতিরিক্ত টীকা বা দীর্ঘ তাফসিরের প্রয়োজন নেই; মূল অনুবাদটি স্বয়ংসম্পূর্ণ।</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)] flex justify-between items-center flex-shrink-0">
            <span className="text-[11px] text-[var(--text-muted)]">
              উৎস: কুরআনএনসাইক্লোপিডিয়া (কিং ফাহাদ কুরআন কমপ্লেক্স অনুমোদিত)
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--border)] text-[var(--text-main)] text-xs font-bold transition-all border border-[var(--border)] cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
